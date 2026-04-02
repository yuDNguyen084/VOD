package consumers

import (
	"context"
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"time"

	"media-worker/src/processors"
	s3service "media-worker/src/s3-service"

	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/redis/go-redis/v9"
)

// BƯỚC 1: ĐỊNH NGHĨA CẤU TRÚC DỮ LIỆU VÀ CẤU HÌNH
// ---------------------------------------------------------

// Job payload mô phỏng cấu trúc JSON (hoặc Protobuf) lưu trong Redis
type VideoJob struct {
	JobID    string `json:"job_id"`
	VideoID  string `json:"video_id"`
	RawS3Key string `json:"raw_s3_key"`
	HlsS3Key string `json:"hls_s3_key"`
}

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
}

// Hàm khởi tạo Worker
func NewMediaWorker(rdb *redis.Client, s3 *s3.Client) *MediaWorker {
	return &MediaWorker{
		redis:     rdb,
		s3Client:  s3,
		semaphore: make(chan struct{}, MaxConcurrentJobs),
	}
}

// BƯỚC 4: HÀM ĐIỀU PHỐI (ORCHESTRATOR) CHO 1 JOB
// ---------------------------------------------------------

func (w *MediaWorker) processSingleJob(job *VideoJob) {
	// 4.1: Chiếm 1 slot trong Worker Pool để chạy. Nếu Pool đầy (đã có 2 jobs chạy), nó sẽ đợi ở đây.
	w.semaphore <- struct{}{}
	defer func() { <-w.semaphore }() // Xong việc thì nhả slot ra

	log.Printf("\n>>> STARTING JOB: %s <<<", job.JobID)

	// Set timeout 1 tiếng cho an toàn (Tránh Worker bị treo vĩnh viễn)
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Hour)
	defer cancel()

	// Tạo đường dẫn file tạm
	localInput := filepath.Join(TempDir, job.VideoID+".mp4")
	localOutputDir := filepath.Join(TempDir, job.VideoID+"_hls")
	os.MkdirAll(localOutputDir, 0755) // Tạo folder output

	// LUỒNG CHÍNH CỦA WORKER
	// 1. Tải file từ S3
	if err := s3service.DownloadRawVideo(ctx, w.s3Client, job.RawS3Key, localInput); err != nil {
		log.Printf("[JOB ERROR %s] Failed to download file: %v", job.JobID, err)
		return
	}

	// 2. Chạy FFmpeg
	err := processors.RunFFmpeg(ctx, localInput, localOutputDir)
	if err != nil {
		log.Printf("[JOB ERROR %s] Transcode failed. Skipping upload.", job.JobID)
		// Thực tế: Trong dự án sẽ gọi Node.js API hoặc update Redis để báo lỗi (Trạng thái: FAILED)
	} else {
		// 3. Nếu thành công, tải toàn bộ kết quả (.m3u8, .ts) lên lại S3
		if uploadErr := s3service.UploadHLSFiles(ctx, w.s3Client, localOutputDir, job.HlsS3Key); uploadErr != nil {
			log.Printf("[JOB ERROR %s] Failed to upload to S3: %v", job.JobID, uploadErr)
			return
		}
		// Thực tế: Cập nhật Redis/Database báo thành công (Trạng thái: SUCCESS)
		log.Printf("[COMPLETED] Job %s has successfully completed the entire flow!", job.JobID)
	}

	// 4. DỌN DẸP RÁC (RẤT QUAN TRỌNG ĐỂ KHÔNG ĐẦY Ổ CỨNG EC2)
	log.Printf("[CLEANUP] Deleting temporary files for Job %s...", job.JobID)
	os.Remove(localInput)
	os.RemoveAll(localOutputDir)
}

// BƯỚC 5: LẮNG NGHE HÀNG ĐỢI TỪ REDIS (MAIN LOOP)
// ---------------------------------------------------------

func (w *MediaWorker) StartListening() {
	log.Println("🚀 Go Media Worker is running and listening to Redis Queue...")

	for {
		// Dùng BLPOP: Block (chặn) và chờ đến khi có dữ liệu mới trong Redis Queue.
		// Timeout = 0 nghĩa là chờ vô thời hạn.
		res, err := w.redis.BLPop(context.Background(), 0, RedisQueueName).Result()
		if err != nil {
			log.Printf("[REDIS ERROR] Redis connection error: %v", err)
			time.Sleep(5 * time.Second) // Đợi 5s rồi thử lại nếu Redis sập
			continue
		}

		// res[0] là tên Queue, res[1] là dữ liệu thực sự (chuỗi JSON)
		payload := res[1]

		var job VideoJob
		if err := json.Unmarshal([]byte(payload), &job); err != nil {
			log.Printf("[DATA ERROR] Failed to parse JSON from Redis: %v", err)
			continue
		}

		// Nhận được Job -> Đẩy nó sang 1 Goroutine (Thread) khác để xử lý bất đồng bộ
		go w.processSingleJob(&job)
	}
}
