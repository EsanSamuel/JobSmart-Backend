import { Queue, QueueEvents } from "bullmq";
import { bullRedis } from "../config/bullmq-redis";
import { removeOldQueueJobs } from "./redis-cleanup";

export const MatchResumeQueue = new Queue("match_resume", {
  connection: bullRedis,
  defaultJobOptions: {
    removeOnComplete: { age: 60 * 60, count: 100 },
    removeOnFail: { age: 24 * 60 * 60, count: 100 },
  },
});
export const matchResumeEvents = new QueueEvents("match_resume", {
  connection: bullRedis,
});

export const matchResumeQueueCleanup = Promise.all([
  removeOldQueueJobs("match_resume", "completed", 60 * 60 * 1000),
  removeOldQueueJobs("match_resume", "failed", 24 * 60 * 60 * 1000),
]).catch((error) => {
  // Queue cleanup is best-effort; enqueueing and processing can continue.
  console.error("Unable to clean old resume jobs", error);
});
