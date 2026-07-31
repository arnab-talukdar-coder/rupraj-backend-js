const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = new Redis(redisUrl, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    if (times > 3) {
      // After 3 attempts, stop retrying so frequently
      return null; // Stop retrying
    }
    return delay;
  },
  reconnectOnError(err) {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  }
});

let isLoggedError = false;

redisClient.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    if (!isLoggedError) {
      console.warn('⚠️ Redis connection refused. Caching will be disabled.');
      console.warn('To enable caching, please start a Redis server at:', redisUrl);
      isLoggedError = true;
    }
  } else {
    console.error('Redis Client Error:', err);
  }
});

redisClient.on('connect', () => {
  console.log('Successfully connected to Redis');
  isLoggedError = false;
});

module.exports = redisClient;

