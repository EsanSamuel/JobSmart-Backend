import { Queue, QueueEvents } from "bullmq";
import { bullRedis } from "../config/bullmq-redis";

export const MatchResumeQueue = new Queue("match_resume", {
  connection: bullRedis,
});
export const matchResumeEvents = new QueueEvents("match_resume", {
  connection: bullRedis,
});
