import { CreatorRepository } from './creator.repository';

export class CreatorService {
  static async getDashboardData(creatorId: string) {
    const [stats, recentVideos] = await Promise.all([
      CreatorRepository.getStatsByStatus(creatorId),
      CreatorRepository.getRecentVideos(creatorId)
    ]);

    let totalVideos = 0;
    stats.forEach(stat => {
      totalVideos += stat._count;
    });

    return {
      overview: {
        totalVideos,
        statusBreakdown: stats
      },
      recentActivity: recentVideos
    };
  }
}