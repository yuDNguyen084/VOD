package processors

import (
	"context"
	"fmt"
	"log"
	"os/exec"
	"path/filepath"
)

func RunFFmpeg(ctx context.Context, inputPath string, outputDir string) error {
	log.Printf("[FFMPEG] Starting HLS transcoding for: %s", inputPath)

	// Tạo playlist file (master.m3u8)
	playlistPath := filepath.Join(outputDir, "master.m3u8")
	segmentPattern := filepath.Join(outputDir, "segment_%03d.ts")

	// Lệnh FFmpeg để chuyển đổi sang HLS (720p ví dụ)
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", inputPath, // File đầu vào
		"-c:v", "libx264", // Chuẩn nén video H.264
		"-c:a", "aac", // Chuẩn nén audio AAC
		"-f", "hls", // Format HLS
		"-hls_time", "10", // Cắt mỗi đoạn video dài 10 giây
		"-hls_playlist_type", "vod", // Định dạng Video On Demand
		"-hls_segment_filename", segmentPattern, // Tên file các đoạn cắt
		"-y",         // Ghi đè nếu file đã tồn tại
		playlistPath, // File playlist đầu ra
	)

	// Lấy toàn bộ log từ stderr của FFmpeg để dễ debug
	output, err := cmd.CombinedOutput()
	if err != nil {
		// Lưu ý: Nếu input là dummy file, lệnh này chắc chắn sẽ lỗi.
		// Trả về kèm console output để admin xem được trong Dashboard.
		return fmt.Errorf("FFmpeg error: %v | Details: %s", err, string(output))
	}

	log.Println("[FFMPEG] Transcoding successful!")
	return nil
}
