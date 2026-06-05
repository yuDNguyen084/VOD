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
import { AdminSubscriber } from './modules/admin/admin.subscriber';
import { WorkerSubscriber } from './modules/worker/worker.subscriber';

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

  // Ensure S3 bucket exists
  await StorageService.ensureBucketExists().catch((err) =>
    logger.warn(`⚠️  Could not ensure S3 bucket exists: ${err.message}`)
  );

  // Set S3 bucket CORS policy so browsers can PUT directly via presigned URLs
  await StorageService.ensureS3Cors().catch((err) =>
    logger.warn(`⚠️  Could not set S3 CORS policy: ${err.message}`)
  );

  // Set S3 bucket policy to allow public reads for the HLS videos
  await StorageService.ensureS3Policy().catch((err) =>
    logger.warn(`⚠️  Could not set S3 Bucket Policy: ${err.message}`)
  );

  server.listen(PORT, () => logger.info(`🚀 Server started on port ${PORT}`));

  // Initialize domain-specific Subscribers
  await AdminSubscriber.init(io);
  await WorkerSubscriber.init(io);

  process.on('SIGINT', async () => {
    logger.info('Gracefully shutting down...');
    server.close(async () => {
      await AdminSubscriber.cleanup();
      await WorkerSubscriber.cleanup();
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    });
  });
})();