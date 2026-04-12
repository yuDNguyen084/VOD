package processors

import (
	"bufio"
	"context"
	"fmt"
	"log"
	"os/exec"
	"path/filepath"
	"strings"
)

func RunFFmpeg(ctx context.Context, inputPath string, outputDir string, onLog func(string)) error {
	log.Printf("[FFMPEG] Starting HLS transcoding for: %s", inputPath)
	// Lệnh FFmpeg để chuyển đổi sang HLS với nhiều độ phân giải
	cmd := exec.CommandContext(ctx, "ffmpeg",
		"-i", inputPath, // File đầu vào
		// Tạo các luồng video (v:0, v:1, v:2, v:3) và audio (a:0, a:1, a:2, a:3)
		"-map", "0:v:0", "-map", "0:a:0",
		"-map", "0:v:0", "-map", "0:a:0",
		"-map", "0:v:0", "-map", "0:a:0",
		"-map", "0:v:0", "-map", "0:a:0",
		// Cấu hình mã hóa chung
		"-c:v", "libx264", "-c:a", "aac",
		"-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
		// Cấu hình từng luồng (Resolution & Bitrate)
		"-s:v:0", "1920x1080", "-b:v:0", "5000k", "-b:a:0", "192k",
		"-s:v:1", "1280x720", "-b:v:1", "2800k", "-b:a:1", "128k",
		"-s:v:2", "854x480", "-b:v:2", "1400k", "-b:a:2", "128k",
		"-s:v:3", "640x360", "-b:v:3", "800k", "-b:a:3", "96k",
		// Cấu hình HLS
		"-f", "hls",
		"-hls_time", "10",
		"-hls_playlist_type", "vod",
		"-hls_flags", "independent_segments",
		"-hls_segment_type", "mpegts",
		"-hls_segment_filename", filepath.Join(outputDir, "v%v_segment_%03d.ts"),
		"-master_pl_name", "master.m3u8",
		"-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3",
		// Output playlist cho từng luồng
		"-y", filepath.Join(outputDir, "v%v_playlist.m3u8"),
	)

	// Lấy luồng stderr của FFmpeg theo thời gian thực
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("could not create stderr pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start ffmpeg command: %v", err)
	}

	// Đọc từng dòng log và đẩy qua Pub/Sub
	scanner := bufio.NewScanner(stderr)
	for scanner.Scan() {
		line := scanner.Text()
		// Lọc các dòng rỗng
		if strings.TrimSpace(line) != "" {
			onLog(line)
		}
	}

	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("FFmpeg error: %v", err)
	}

	onLog("[FFMPEG] Transcoding successful!")
	return nil
}
