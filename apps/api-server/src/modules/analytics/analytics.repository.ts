import { prisma } from '../../database';

export class AnalyticsRepository {
  static getStorageGroupedByStatus = () => prisma.video.groupBy({
    by: ['status'],
    _count: true
  });
}