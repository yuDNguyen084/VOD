package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	// Load các biến môi trường từ file .env
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Đọc giá trị
	s3BucketName := os.Getenv("S3_BUCKET_NAME")
	uploadPath := os.Getenv("UPLOAD_PATH")

	log.Printf("Starting worker with Bucket: %s, UploadPath: %s", s3BucketName, uploadPath)
}
