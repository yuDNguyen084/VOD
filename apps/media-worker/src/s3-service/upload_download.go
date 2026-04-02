package s3service

import (
	"context"
	"fmt"
	"io"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

func DownloadRawVideo(ctx context.Context, s3Client *s3.Client, s3Key string, localDest string) error {
	log.Printf("[S3] Downloading video %s to %s...", s3Key, localDest)

	bucketName := os.Getenv("S3_BUCKET_NAME")
	if bucketName == "" {
		return fmt.Errorf("S3_BUCKET_NAME environment variable is not set")
	}

	file, err := os.Create(localDest)
	if err != nil {
		return fmt.Errorf("failed to create local file: %v", err)
	}
	defer file.Close()

	output, err := s3Client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(s3Key),
	})
	if err != nil {
		return fmt.Errorf("failed to download file from S3: %v", err)
	}
	defer output.Body.Close()

	_, err = io.Copy(file, output.Body)
	if err != nil {
		return fmt.Errorf("failed to save file from S3 body: %v", err)
	}

	log.Printf("[S3] Download completed: %s", localDest)
	return nil
}

func UploadHLSFiles(ctx context.Context, s3Client *s3.Client, localDir string, s3Prefix string) error {
	log.Printf("[S3] Uploading HLS directory %s to S3 path %s...", localDir, s3Prefix)

	bucketName := os.Getenv("S3_BUCKET_NAME")
	if bucketName == "" {
		return fmt.Errorf("S3_BUCKET_NAME environment variable is not set")
	}

	err := filepath.WalkDir(localDir, func(path string, d fs.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			return nil
		}

		file, err := os.Open(path)
		if err != nil {
			return fmt.Errorf("failed to open file %s: %v", path, err)
		}
		defer file.Close()

		// Calculate S3 Key
		relPath, err := filepath.Rel(localDir, path)
		if err != nil {
			return fmt.Errorf("failed to get relative path: %v", err)
		}
		s3FilePath := filepath.ToSlash(filepath.Join(s3Prefix, relPath))

		// Set content type
		contentType := "application/octet-stream"
		if strings.HasSuffix(path, ".m3u8") {
			contentType = "application/x-mpegURL"
		} else if strings.HasSuffix(path, ".ts") {
			contentType = "video/MP2T"
		}

		log.Printf("[S3] Uploading %s to %s", path, s3FilePath)

		_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:      aws.String(bucketName),
			Key:         aws.String(s3FilePath),
			Body:        file,
			ContentType: aws.String(contentType),
		})

		return err
	})

	if err != nil {
		return fmt.Errorf("failed to upload HLS files: %v", err)
	}

	log.Printf("[S3] HLS directory upload completed!")
	return nil
}
