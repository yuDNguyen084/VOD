import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import { redis } from '../../redis';
import { prisma } from '../../database';
import { logger } from '../../common/utils/logger';

export class WorkerSubscriber {
  private static client: Redis;

  static async init(io: SocketIOServer) {
    this.client = redis.duplicate();

    // Subscribe to worker job status channel
    await this.client.subscribe('worker:job:status');

    this.client.on('message', async (channel, message) => {
      if (channel === 'worker:job:status') {
        try {
          const data = JSON.parse(message);
          logger.info(`Received worker status update: ${message}`);

          const { videoId, status } = data;

          if (videoId && status) {
            const processedStatus = status === 'COMPLETED' ? 'READY' : 'FAILED';
            const video = await prisma.video.findUnique({ where: { id: videoId } });

            if (video) {
              const hlsUrl = status === 'COMPLETED'
                ? `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/hls/${video.id}/master.m3u8`
                : null;

              await prisma.video.update({
                where: { id: videoId },
                data: {
                  status: processedStatus,
                  ...(hlsUrl ? { hlsUrl } : {})
                }
              });

              // Notify creator client via WebSocket
              io.to(`user-${video.creatorId}`).emit(
                status === 'COMPLETED' ? 'video-processing-complete' : 'video-processing-failed',
                { videoId: video.id, title: video.title, status: processedStatus }
              );
            }
          }
        } catch (err) {
          logger.error(`Failed to process worker status: ${err}`);
        }
      }
    });

    logger.info('🛰️ WorkerSubscriber initialized.');
  }

  static async cleanup() {
    logger.info('🔌 Cleaning up WorkerSubscriber...');
    if (this.client) {
      await this.client.quit();
    }
  }
}
