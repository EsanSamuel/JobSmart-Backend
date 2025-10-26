import { Queue, QueueEvents } from "bullmq";
import { bullRedis } from "../config/bullmq-redis";

export const MatchJobQueue = new Queue("match_job", {
  connection: bullRedis,
});

export const matchJobEvents = new QueueEvents("match_job", {
  connection: bullRedis,
});
