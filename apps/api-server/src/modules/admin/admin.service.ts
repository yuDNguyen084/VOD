import { AdminRepository } from './admin.repository';
import { redis } from '../../redis';

export class AdminService {
  static async getPipelineStatus() {
    const queueLength = await redis.llen('vod_transcoding_queue');
    const activeJobs = await AdminRepository.getActiveJobsCount();
    return { queueLength, activeJobs };
  }

  static async setFFmpegConfig(configData: any) {
    await redis.set('ffmpeg_config', JSON.stringify(configData));
    return { success: true, message: "FFmpeg configuration updated" };
  }

  static async handleJobAction(jobId: string, action: string) {
    if (action === 'RESTART') {
      // Find the video associated with this job
      const video = await AdminRepository.getVideoByJobId(jobId);
      if (video) {
        // Push back to queue
        const { QueueService } = require('../../common/services/queue.service');
        await QueueService.addTranscodingJob({
          jobId,
          videoId: video.id,
          rawS3Key: video.rawKey,
          hlsS3Key: `hls/${video.id}/master.m3u8`
        });
      }
    }

    // Publish action to redis for the worker to hear
    await redis.publish(`admin:action:job:${jobId}`, action);
    
    return { success: true, message: `Action ${action} triggered` };
  }
}