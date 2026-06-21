import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis };

export const valkey =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = valkey;

export default valkey;
