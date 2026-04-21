import { AdminRepository } from './admin.repository';
import { redis } from '../../redis';

export class AdminService {
  static async getPipelineStatus() {
    const queueLength = await redis.llen('vod_transcoding_queue');
    const activeJobs = await AdminRepository.getActiveJobs();
    return { queueLength, activeJobs };
  }

  static async setFFmpegConfig(configData: any) {
    await redis.set('ffmpeg_config', JSON.stringify(configData));
    return { success: true, message: "FFmpeg configuration updated" };
  }
}