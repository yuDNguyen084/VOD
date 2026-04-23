import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { QueueService } from './common/services/queue.service';
import { StorageService } from './common/services/storage.service';
import { prisma } from './database';
import { redis } from './redis';
import { logger } from './common/utils/logger';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

// Export io so services can use it (or attach to app)
export const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

io.on('connection', (socket) => {
  logger.info(`🔌 Client connected: ${socket.id}`);
  
  socket.on('joinUserRoom', (userId: string) => {
    socket.join(`user-${userId}`);
    logger.info(`Client ${socket.id} joined user-${userId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`🔌 Client disconnected: ${socket.id}`);
  });
});

(async () => {
  await QueueService.init();

  // Set S3 bucket CORS policy so browsers can PUT directly via presigned URLs
  await StorageService.ensureS3Cors().catch((err) =>
    logger.warn(`⚠️  Could not set S3 CORS policy: ${err.message}`)
  );

  server.listen(PORT, () => logger.info(`🚀 Server started on port ${PORT}`));

  // Redis Pub/Sub for worker status
  const subscriber = redis.duplicate();
  
  await subscriber.subscribe('worker:job:status');
  subscriber.on('message', async (channel, message) => {
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

            // Notify client via websocket
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

  process.on('SIGINT', async () => {
    logger.info('Gracefully shutting down...');
    server.close(async () => {
      await subscriber.quit();
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    });
  });
})();