import { prisma } from '../../database';
export class WorkerRepository {
  static updateProgress = (videoId: string, data: any) => prisma.mediaJob.update({ where: { videoId }, data });
}