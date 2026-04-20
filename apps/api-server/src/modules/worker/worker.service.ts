import { WorkerRepository } from './worker.repository';
import { JobStatus, VideoStatus } from '@prisma/client';

export class WorkerService {
  static async handleProgressUpdate(jobId: string, data: any) {
    const { progress, workerId, videoId, hlsUrl } = data;

    const updatedJob = await WorkerRepository.updateJob(jobId, {
      progress,
      workerId,
      status: progress === 100 ? JobStatus.SUCCESS : JobStatus.RUNNING
    });

    if (progress === 100 && hlsUrl) {
      await WorkerRepository.updateVideoStatus(videoId, VideoStatus.READY, hlsUrl);
    }

    return updatedJob;
  }
}