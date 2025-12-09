import { Multer } from "multer";
import { Job, Match, Prisma, Resume, User } from "../generated/prisma/client";
import { getPresignedUrl } from "../libs/aws";
import { Repository } from "../repository/base/repository";
import logger from "../utils/logger";
import { CVParser } from "../libs/pdf-parser";
import { AnalyzeMatch } from "../ai/gemini";
import { matchJobEvents, MatchJobQueue } from "../queue/matchjob.queue";
import { QueueEvents } from "bullmq";
import { bullRedis } from "../config/bullmq-redis";
import prisma from "../config/prisma"

const jobRepository = new Repository<Job>(prisma?.job);
const userRepository = new Repository<User & { Resume: Resume[] }>(
  prisma?.user
);
const matchRepository = new Repository<Match>(prisma?.match);

export class JobMatchService {
  async match(
    jobId: string,
    userId: string,
    cvFile: Express.Multer.File,
    resumeId?: string
  ) {
    try {
      const CVurl = await getPresignedUrl(cvFile);
      if (!resumeId) {
        const match = await MatchJobQueue.add(
          "match_job",
          {
            jobId,
            userId,
            CVurl,
          },
          {
            attempts: 5,
            backoff: {
              type: "exponential",
              delay: 10000,
            },
          }
        );

        const result = await match.waitUntilFinished(matchJobEvents);
        await MatchJobQueue.close();
        return result;
      } else if (resumeId) {
        const match = await MatchJobQueue.add(
          "match_job",
          {
            jobId,
            userId,
            CVurl,
            resumeId,
          },
          {
            attempts: 5,
            backoff: {
              type: "exponential",
              delay: 10000,
            },
          }
        );

        const result = await match.waitUntilFinished(matchJobEvents);
        await MatchJobQueue.close();
        return result;
      }
    } catch (error) {
      logger.error("Something went wrong with matching job" + error);
    }
  }

  async getMatch(userId: string) {
    try {
      const match = await matchRepository.findAll(userId, "matched");
      if (match) {
        return match;
      }
    } catch (error) {
      logger.error("Something went wrong with matching job" + error);
    }
  }
}
