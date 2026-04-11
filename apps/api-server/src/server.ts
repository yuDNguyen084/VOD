import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { QueueService } from './common/services/queue.service';
import { prisma } from './database';
import { redis } from './redis';
import { logger } from './common/utils/logger';

const PORT = process.env.PORT || 4000;

(async () => {
  await QueueService.init();
  const server = app.listen(PORT, () => logger.info(`🚀 Server started on port ${PORT}`));

  process.on('SIGINT', async () => {
    logger.info('Gracefully shutting down...');
    server.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      process.exit(0);
    });
  });
})();