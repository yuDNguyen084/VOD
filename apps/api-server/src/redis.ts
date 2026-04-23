import Redis from 'ioredis';
export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    console.warn(`Redis connection retry attempt ${times}...`);
    return Math.min(times * 50, 2000);
  }
});