const redisClient = require('./config/redis');

async function flush() {
  try {
    // Wait until connected if not ready yet
    if (redisClient.status !== 'ready') {
      await new Promise(resolve => redisClient.once('ready', resolve));
    }
    const res = await redisClient.flushall();
    console.log('Redis flushall result:', res);
  } catch (error) {
    console.error('Failed to flush Redis:', error);
  } finally {
    redisClient.disconnect();
  }
}

flush();
