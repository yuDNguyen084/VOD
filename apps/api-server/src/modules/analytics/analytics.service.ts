import { AnalyticsRepository } from './analytics.repository';

export class AnalyticsService {
  static async getStorageStats() {
    const stats = await AnalyticsRepository.getStorageGroupedByStatus();
    return { storageReport: stats, quotaUsage: "Calculated from S3/MinIO" };
  }

  static async getSystemLogs() {
    return { message: "System is operating normally", errorCount: 0 };
  }
}