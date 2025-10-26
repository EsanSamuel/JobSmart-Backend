import IORedis from "ioredis";
import logger from "../utils/logger";

export const bullRedis = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
  enableOfflineQueue: true,
});

bullRedis.on("connect", () => {
  logger.info("Bullmq redis is connected");
});
