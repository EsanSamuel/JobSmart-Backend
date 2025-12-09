import IORedis from "ioredis";
import logger from "../utils/logger";

export const bullRedis = new IORedis({
  host: "redis-11633.c241.us-east-1-4.ec2.cloud.redislabs.com",
  port: 11633,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
});

bullRedis.on("connect", () => {
  logger.info("BullMq Redis connected successfully!");
});
