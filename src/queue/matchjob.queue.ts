import { Queue, QueueEvents } from "bullmq";
import { bullRedis } from "../config/bullmq-redis";
import { removeOldQueueJobs } from "./redis-cleanup";

export const MatchJobQueue = new Queue("match_job", {
  connection: bullRedis,
  defaultJobOptions: {
    removeOnComplete: { age: 60 * 60, count: 100 },
    removeOnFail: { age: 24 * 60 * 60, count: 100 },
  },
});

export const matchJobEvents = new QueueEvents("match_job", {
  connection: bullRedis,
});

export const matchJobQueueCleanup = Promise.all([
  removeOldQueueJobs("match_job", "completed", 60 * 60 * 1000),
  removeOldQueueJobs("match_job", "failed", 24 * 60 * 60 * 1000),
]).catch((error) => {
  // Queue cleanup is best-effort; enqueueing and processing can continue.
  console.error("Unable to clean old match jobs", error);
});
