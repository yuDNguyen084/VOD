import { prisma } from '../../database';
import { VideoRepository } from './video.repository';
import { StorageService } from '../../common/services/storage.service';
import { QueueService } from '../../common/services/queue.service';
import { getPrismaQuery } from '../../common/utils/apiFeatures';
import { AppError } from '../../common/utils/AppError';
import { Role, VideoStatus } from '@prisma/client';


export class VideoService {
  static async list(query: any) {
    const pq = getPrismaQuery(query, ['title']);
    const [data, total] = await Promise.all([VideoRepository.findMany(pq), VideoRepository.count(pq.where)]);
    return { data, total };
  }
  static async requestUpload(creatorId: string, title: string, filename: string) {
    const key = `raw/${Date.now()}-${filename}`;
    const url = await StorageService.getPresignedPutUrl(key);
    const video = await VideoRepository.create({ creatorId, title, rawKey: key, status: VideoStatus.PENDING });
    return { videoId: video.id, uploadUrl: url };
  }
  static async confirmUpload(videoId: string) {
    const [video, job] = await prisma.$transaction([
      prisma.video.update({ where: { id: videoId }, data: { status: VideoStatus.UPLOADED } }),
      prisma.mediaJob.create({ data: { videoId } })
    ]);
    await QueueService.pushJob({ jobId: job.id, videoId: video.id, rawKey: video.rawKey });
    return job;
  }
  static async delete(videoId: string, userId: string, userRole: string) {
    const video = await VideoRepository.findById(videoId);
    if (!video) throw new AppError(404, 'Video not found');
    if (video.creatorId !== userId && userRole !== Role.ADMIN) throw new AppError(403, 'Forbidden');
    await VideoRepository.softDelete(videoId);
    if (video.rawKey) await StorageService.deleteAsset(video.rawKey).catch(() => {});
    return { success: true, message: 'Deleted' };
  }
}