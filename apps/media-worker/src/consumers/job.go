package consumers

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"sync"
	"time"

	"media-worker/src/pb"
	"media-worker/src/processors"
	s3service "media-worker/src/s3-service"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/redis/go-redis/v9"
	"google.golang.org/protobuf/proto"
)

// BƯỚC 1: ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU VÀ CẤU HÌNH
// ---------------------------------------------------------

const (
	MaxConcurrentJobs = 2 // Chỉ cho phép nén tối đa 2 video cùng lúc để tránh sập CPU server
	RedisQueueName    = "vod_transcoding_queue"
	TempDir           = "./tmp_workspace" // Thư mục tạm chứa video khi nén
)

// Cấu trúc chính của Worker
type MediaWorker struct {
	redis     *redis.Client
	s3Client  *s3.Client
	semaphore chan struct{} // Dùng để giới hạn số lượng công việc song song
	wg        sync.WaitGroup
}

// Hàm khởi tạo Worker
func NewMediaWorker(rdb *redis.Client, s3Client *s3.Client) *MediaWorker {
	return &MediaWorker{
		redis:     rdb,
		s3Client:  s3Client,
		semaphore: make(chan struct{}, MaxConcurrentJobs),
	}
}

// Hàm bổ trợ gửi Resource Consumption từng Job lên Redis
func (w *MediaWorker) trackJobTelemetry(ctx context.Context, jobID string) {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			var m runtime.MemStats
			runtime.ReadMemStats(&m)
			usageMsg := fmt.Sprintf("{\"jobId\": \"%s\", \"cpuUsage\": \"Active\", \"ramUsageMB\": %d}", jobID, m.Alloc/1024/1024)
			w.redis.Publish(ctx, fmt.Sprintf("admin:telemetry:job:%s", jobID), usageMsg)
		}
	}
}

// BƯỚC 4: HÀM ĐIỀU PHỐI (ORCHESTRATOR) CHO 1 JOB
// ---------------------------------------------------------

func (w *MediaWorker) processSingleJob(globalCtx context.Context, job *pb.VideoJob) {
	defer w.wg.Done()
	// 4.1: Chiếm 1 slot trong Worker Pool để chạy. Nếu Pool đầy (đã có 2 jobs chạy), nó sẽ đợi ở đây.
	select {
	case w.semaphore <- struct{}{}:
		defer func() { <-w.semaphore }() // Xong việc thì nhả slot ra
	case <-globalCtx.Done():
		log.Printf("Worker context cancelled, skipping job %s", job.JobId)
		return
	}

	log.Printf("\n>>> STARTING JOB: %s <<<", job.JobId)

	// Set timeout 1 tiếng cho an toàn (Tránh Worker bị treo vĩnh viễn)
	ctx, cancel := context.WithTimeout(globalCtx, 1*time.Hour)
	defer cancel()

	// Track Resource Consumption for this JOB
	go w.trackJobTelemetry(ctx, job.JobId)

	// Tạo đường dẫn file tạm
	localInput := filepath.Join(TempDir, job.VideoId+".mp4")
	localOutputDir := filepath.Join(TempDir, job.VideoId+"_hls")
	os.MkdirAll(localOutputDir, 0755) // Tạo folder output

	logChan := fmt.Sprintf("admin:logs:job:%s", job.JobId)

	// LUỒNG CHÍNH CỦA WORKER
	// 1. Tải file từ S3
	w.redis.Publish(ctx, logChan, "Downloading file from S3...")
	if err := s3service.DownloadRawVideo(ctx, w.s3Client, job.RawS3Key, localInput); err != nil {
		errMsg := fmt.Sprintf("[JOB ERROR %s] Failed to download file: %v", job.JobId, err)
		log.Println(errMsg)
		w.redis.Publish(ctx, logChan, errMsg)
		return
	}

	// 2. Chạy FFmpeg
	w.redis.Publish(ctx, logChan, "Starting FFmpeg Transcoding...")
	err := processors.RunFFmpeg(ctx, localInput, localOutputDir, func(logLine string) {
		// Log streaming in real-time
		w.redis.Publish(ctx, logChan, logLine)
	})

	if err != nil {
		errMsg := fmt.Sprintf("[JOB ERROR %s] Transcode failed: %v", job.JobId, err)
		log.Println(errMsg)
		w.redis.Publish(ctx, logChan, errMsg)
		// Thực tế: Trong dự án sẽ gọi Node.js API hoặc update Redis để báo lỗi (Trạng thái: FAILED)
	} else {
		// 3. Nếu thành công, tải toàn bộ kết quả (.m3u8, .ts) lên lại S3
		w.redis.Publish(ctx, logChan, "Uploading HLS Segments to S3...")
		if uploadErr := s3service.UploadHLSFiles(ctx, w.s3Client, localOutputDir, job.HlsS3Key); uploadErr != nil {
			log.Printf("[JOB ERROR %s] Failed to upload to S3: %v", job.JobId, uploadErr)
			return
		}
		// Thực tế: Cập nhật Redis/Database báo thành công (Trạng thái: SUCCESS)
		successMsg := fmt.Sprintf("[COMPLETED] Job %s has successfully completed the entire flow!", job.JobId)
		log.Println(successMsg)
		w.redis.Publish(ctx, logChan, successMsg)
	}

	// 4. DỌN DẸP RÁC (RẤT QUAN TRỌNG ĐỂ KHÔNG ĐẦY Ổ CỨNG EC2)
	log.Printf("[CLEANUP] Deleting temporary files for Job %s...", job.JobId)
	os.Remove(localInput)
	os.RemoveAll(localOutputDir)
}

// BƯỚC 5: LẮNG NGHE HÀNG ĐỢI TỪ REDIS (MAIN LOOP)
// ---------------------------------------------------------

func (w *MediaWorker) StartListening(ctx context.Context) {
	log.Println("🚀 Go Media Worker is running and listening to Redis Queue...")

	for {
		select {
		case <-ctx.Done():
			log.Println("Graceful shutdown triggered, stopping Redis listening...")
			w.wg.Wait()
			log.Println("All ongoing jobs completed.")
			return
		default:
			// Dùng BLPOP: Block (chặn) và chờ đến khi có dữ liệu mới trong Redis Queue.
			// Set Timeout ở đây bằng 2s thay vì 0 để có thể check `ctx.Done()` liên tục
			res, err := w.redis.BLPop(ctx, 2*time.Second, RedisQueueName).Result()
			if err != nil {
				if err == redis.Nil || err == context.Canceled || err == context.DeadlineExceeded {
					continue
				}
				log.Printf("[REDIS ERROR] Redis connection error: %v", err)
				time.Sleep(5 * time.Second) // Đợi 5s rồi thử lại nếu Redis sập
				continue
			}

			// res[0] là tên Queue, res[1] là dữ liệu thực sự (chuỗi Protobuf)
			payload := res[1]

			var job pb.VideoJob
			if err := proto.Unmarshal([]byte(payload), &job); err != nil {
				log.Printf("[DATA ERROR] Failed to parse Protobuf from Redis: %v", err)
				continue
			}

			w.wg.Add(1)
			// Nhận được Job -> Đẩy nó sang 1 Goroutine (Thread) khác để xử lý bất đồng bộ
			go w.processSingleJob(ctx, &job)
		}
	}
}
