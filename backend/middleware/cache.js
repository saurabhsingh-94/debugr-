import redis from "../utils/redis.js";
import logger from "../utils/logger.js";

/**
 * Redis Caching Middleware
 * @param {number} duration - Cache duration in seconds
 */
const cache = (duration) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not connected or method is not GET
    if (!redis || req.method !== "GET") {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;
    
    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        logger.info(`⚡ Cache Hit: ${key}`);
        return res.json(JSON.parse(cachedResponse));
      }

      // If no cache, wrap res.json to store the response
      res.sendResponse = res.json;
      res.json = (body) => {
        if (res.statusCode === 200) {
          redis.set(key, JSON.stringify(body), "EX", duration)
            .catch(err => logger.error("❌ Redis set cache error: " + err.message));
        }
        res.sendResponse(body);
      };
      
      next();
    } catch (err) {
      logger.error("❌ Cache middleware error: " + err.message);
      next();
    }
  };
};

export default cache;
