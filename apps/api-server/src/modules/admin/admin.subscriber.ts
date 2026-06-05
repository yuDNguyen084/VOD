import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import { redis } from '../../redis';
import { logger } from '../../common/utils/logger';

export class AdminSubscriber {
  private static client: Redis;

  static async init(io: SocketIOServer) {
    this.client = redis.duplicate();

    // Subscribe to admin-related channels
    await this.client.psubscribe('admin:logs:job:*');
    await this.client.psubscribe('admin:telemetry:job:*');
    await this.client.psubscribe('admin:progress:job:*');

    this.client.on('pmessage', (pattern, channel, message) => {
      const jobId = channel.split(':').pop();

      if (channel.startsWith('admin:logs:job:')) {
        io.emit(`admin:logs:${jobId}`, message);
      } else if (channel.startsWith('admin:telemetry:job:')) {
        try {
          const telemetry = JSON.parse(message);
          io.emit(`admin:telemetry:${jobId}`, telemetry);
        } catch (e) {
          logger.error(`Failed to parse admin telemetry: ${e}`);
        }
      } else if (channel.startsWith('admin:progress:job:')) {
        try {
          const data = JSON.parse(message);
          io.emit(`admin:progress:${jobId}`, data);
        } catch (e) {
          logger.error(`Failed to parse admin progress: ${e}`);
        }
      }
    });

    logger.info('🛰️ AdminSubscriber initialized.');
  }

  static async cleanup() {
    logger.info('🔌 Cleaning up AdminSubscriber...');
    if (this.client) {
      await this.client.quit();
    }
  }
}
