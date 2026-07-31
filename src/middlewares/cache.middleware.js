const redisClient = require('../config/redis');

/**
 * Generic caching middleware
 * @param {string} keyPrefix - Prefix for the redis key
 * @param {number} duration - Cache duration in seconds (default 1 hour)
 */
const cacheMiddleware = (keyPrefix, duration = 3600) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests or if Redis is not connected
    if (req.method !== 'GET' || redisClient.status !== 'ready') {
      return next();
    }

    // Create a unique key based on prefix and full URL (including query params)
    const key = `${keyPrefix}:${req.originalUrl || req.url}`;

    try {
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        // console.log(`Cache hit for: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      // If no cache, override res.json to store the result before sending
      res.sendResponse = res.json;
      res.json = (data) => {
        if (redisClient.status === 'ready') {
          redisClient.setex(key, duration, JSON.stringify(data));
        }
        res.sendResponse(data);
      };

      next();
    } catch (error) {
      console.error('Cache Middleware Error:', error);
      next(); // Continue without cache if Redis fails
    }
  };
};


/**
 * Clear cache by pattern
 * @param {string} pattern - Pattern to match keys (e.g. "products:*")
 */
const clearCache = async (pattern) => {
  if (redisClient.status !== 'ready') return;
  
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      // console.log(`Cleared cache for pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Clear Cache Error:', error);
  }
};


module.exports = { cacheMiddleware, clearCache };
