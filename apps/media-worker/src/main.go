package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"runtime"
	"syscall"
	"time"

	"media-worker/src/consumers"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func main() {
	// Load các biến môi trường từ file .env
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file, continuing with OS env vars")
	}

	// Đọc giá trị
	s3BucketName := os.Getenv("S3_BUCKET_NAME")
	uploadPath := os.Getenv("UPLOAD_PATH")
	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	log.Printf("Starting worker with Bucket: %s, UploadPath: %s", s3BucketName, uploadPath)

	rdb := redis.NewClient(&redis.Options{
		Addr: redisAddr,
	})

	// Thử kết nối redis
	ctxPing, cancelPing := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancelPing()
	if err := rdb.Ping(ctxPing).Err(); err != nil {
		log.Printf("Warning: Failed to connect to Redis: %v", err)
	} else {
		log.Println("Successfully connected to Redis")
	}

	// Khởi tạo S3 Client
	awsCfg, err := config.LoadDefaultConfig(context.Background())
	if err != nil {
		log.Fatalf("unable to load AWS SDK config: %v", err)
	}
	s3Client := s3.NewFromConfig(awsCfg)

	// Stage 1 & Stage 2: Graceful Shutdown, System Telemetry, Worker Pool in Consumer
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Capture OS signals for graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)

	// Stage 2: System Telemetry (Heartbeat) - Gửi thông số chung của Worker Server
	go func() {
		ticker := time.NewTicker(2 * time.Second)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				var m runtime.MemStats
				runtime.ReadMemStats(&m)
				telemetryMsg := fmt.Sprintf("Worker Node - CPU: N/A, RAM: %v MB", m.Alloc/1024/1024)
				rdb.Publish(ctx, "admin:telemetry:worker", telemetryMsg)
			}
		}
	}()

	// Khởi tạo Worker thật
	worker := consumers.NewMediaWorker(rdb, s3Client)

	// Chạy Worker lắng nghe Queue
	go worker.StartListening(ctx)

	// Wait for termination signal
	<-sigChan
	log.Println("Received termination signal, initiating graceful shutdown...")
	cancel() // Hủy context -> dừng worker và telemetry

	// Ngủ 1 chút để main loop của worker và các wg trong worker kịp block và shutdown s3/redis
	time.Sleep(1 * time.Second)
	rdb.Close()
	log.Println("Shutdown complete.")
}
