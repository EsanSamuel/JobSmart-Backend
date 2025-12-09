import Redis from "ioredis";
import logger from "../utils/logger";

const redis = new Redis({
  host: "redis-11633.c241.us-east-1-4.ec2.cloud.redislabs.com",
  port: 11633,
  password: process.env.REDIS_PASSWORD,
});

redis.on("connect", () => {
  logger.info("✅ Redis connected successfully");
});

redis.on("error", (err) => {
  logger.error({ err }, "❌ Redis connection failed");
});

export default redis;
