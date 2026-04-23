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

func hasAudio(ctx context.Context, inputPath string) bool {
	cmd := exec.CommandContext(ctx, "ffprobe",
		"-v", "error",
		"-select_streams", "a:0",
		"-show_entries", "stream=codec_type",
		"-of", "default=noprint_wrappers=1:nokey=1",
		inputPath,
	)
	out, err := cmd.Output()
	if err != nil {
		return false
	}
	return strings.TrimSpace(string(out)) != ""
}

func RunFFmpeg(ctx context.Context, inputPath string, outputDir string, onLog func(string)) error {
	log.Printf("[FFMPEG] Starting HLS transcoding for: %s", inputPath)

	hasAudioStream := hasAudio(ctx, inputPath)
	log.Printf("[FFMPEG] Audio stream detected: %v", hasAudioStream)

	args := []string{
		"-i", inputPath,
		"-filter_complex",
		"[0:v]split=4[v1][v2][v3][v4];" +
			"[v1]scale=1920:1080[v1out];" +
			"[v2]scale=1280:720[v2out];" +
			"[v3]scale=854:480[v3out];" +
			"[v4]scale=640:360[v4out]",
	}

	if hasAudioStream {
		args = append(args,
			"-map", "[v1out]", "-map", "0:a:0",
			"-map", "[v2out]", "-map", "0:a:0",
			"-map", "[v3out]", "-map", "0:a:0",
			"-map", "[v4out]", "-map", "0:a:0",
		)
	} else {
		args = append(args,
			"-map", "[v1out]",
			"-map", "[v2out]",
			"-map", "[v3out]",
			"-map", "[v4out]",
		)
	}

	args = append(args,
		"-c:v", "libx264", "-preset", "fast",
		"-threads", "2",
		"-g", "48", "-keyint_min", "48", "-sc_threshold", "0",
		"-b:v:0", "5000k",
		"-b:v:1", "2800k",
		"-b:v:2", "1400k",
		"-b:v:3", "800k",
	)

	if hasAudioStream {
		args = append(args,
			"-c:a", "aac",
			"-b:a:0", "192k",
			"-b:a:1", "128k",
			"-b:a:2", "128k",
			"-b:a:3", "96k",
		)
	}

	args = append(args,
		"-f", "hls",
		"-hls_time", "6",
		"-hls_playlist_type", "vod",
		"-hls_flags", "independent_segments",
		"-hls_segment_type", "mpegts",
		"-hls_segment_filename", filepath.Join(outputDir, "v%v_segment_%03d.ts"),
		"-master_pl_name", "master.m3u8",
	)

	if hasAudioStream {
		args = append(args, "-var_stream_map", "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3")
	} else {
		args = append(args, "-var_stream_map", "v:0 v:1 v:2 v:3")
	}

	args = append(args, "-y", filepath.Join(outputDir, "v%v_playlist.m3u8"))

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)

	// Capture stderr in real-time for logging
	stderr, err := cmd.StderrPipe()
	if err != nil {
		return fmt.Errorf("could not create stderr pipe: %v", err)
	}

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start ffmpeg command: %v", err)
	}

	scanner := bufio.NewScanner(stderr)
	for scanner.Scan() {
		line := scanner.Text()
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
