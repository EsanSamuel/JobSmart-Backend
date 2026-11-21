import { bullRedis } from "../config/bullmq-redis";

const CLEANUP_BATCH_SIZE = 500;

export async function removeOldQueueJobs(
  queueName: string,
  status: "completed" | "failed",
  retentionMs: number
) {
  const queuePrefix = `bull:${queueName}:`;
  const statusKey = `${queuePrefix}${status}`;
  const cutoff = Date.now() - retentionMs;

  while (true) {
    const jobIds = await bullRedis.zrangebyscore(
      statusKey,
      "-inf",
      cutoff,
      "LIMIT",
      0,
      CLEANUP_BATCH_SIZE
    );
    if (jobIds.length === 0) return;

    const jobKeys = jobIds.flatMap((jobId) => [
      `${queuePrefix}${jobId}`,
      `${queuePrefix}${jobId}:logs`,
    ]);

    // Direct deletes can free space even when Redis refuses BullMQ's Lua scripts.
    await bullRedis.unlink(...jobKeys);
    await bullRedis.zrem(statusKey, ...jobIds);
  }
}
