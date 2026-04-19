import { prisma } from '../../database';
import { JobStatus, VideoStatus } from '@prisma/client';

export class WorkerRepository {
  static updateJob = (jobId: string, data: any) => 
    prisma.mediaJob.update({ where: { id: jobId }, data });

  static updateVideoStatus = (videoId: string, status: VideoStatus, hlsUrl?: string) =>
    prisma.video.update({ where: { id: videoId }, data: { status, hlsUrl } });
}