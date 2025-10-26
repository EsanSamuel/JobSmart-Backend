import Redis from "ioredis";
import logger from "../utils/logger";

const redis = new Redis();

redis.on("connect", () => {
  logger.info("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  logger.error({ err }, "❌ Redis connection failed");
});

export default redis;
