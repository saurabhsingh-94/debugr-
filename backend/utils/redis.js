import Redis from "ioredis";
import config from "../config/config.js";
import logger from "./logger.js";

let redis;

if (config.redisUrl) {
  try {
    redis = new Redis(config.redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on("connect", () => logger.info("✅ Redis connected successfully"));
    redis.on("error", (err) => logger.error("❌ Redis error: " + err.message));
  } catch (err) {
    logger.error("❌ Redis connection failed: " + err.message);
  }
} else {
  logger.warn("⚠️ REDIS_URL not found. Redis-dependent features will use fallbacks.");
}

export default redis;
