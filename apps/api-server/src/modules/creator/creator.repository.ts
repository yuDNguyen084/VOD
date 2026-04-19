import { prisma } from '../../database';

export class CreatorRepository {
  static getStatsByStatus = (creatorId: string) => prisma.video.groupBy({
    by: ['status'],
    where: { creatorId, deletedAt: null },
    _count: true
  });

  static getRecentVideos = (creatorId: string) => prisma.video.findMany({
    where: { creatorId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { job: true }
  });
}