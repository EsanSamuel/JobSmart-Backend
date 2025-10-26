import { Job, Prisma, Resume, User } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";
import { getPresignedUrl } from "../libs/aws";
import { CVParser } from "../libs/pdf-parser";
import { AnalyzeMatch } from "../ai/gemini";
import { MatchJobQueue } from "../queue/matchjob.queue";
import { matchResumeEvents, MatchResumeQueue } from "../queue/matchresume.queue";
import { QueueEvents } from "bullmq";
import { bullRedis } from "../config/bullmq-redis";

const jobRepository = new Repository<Job>(prisma?.job);
const userRepository = new Repository<User>(prisma?.user);
const resumeRepository = new Repository<Resume & { user: User }[]>(
  prisma?.resume
);

export class JobService {
  async createJob(data: any, authId: string) {
    try {
      const user = await userRepository.findById(authId, "accountRole");
      if (user?.role === "COMPANY") {
        const job = await jobRepository.create(data);
        logger.info(job);
        return job as Job;
      } else {
        logger.info("Only companies can list jobs");
      }
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async getJobs(params?: {
    filter?: any;
    skip?: any;
    take?: number;
    orderBy?: "asc" | "desc";
  }) {
    try {
      const jobs = await jobRepository.findAll(undefined, "job", params);
      if (jobs) {
        return jobs as Job[];
      }
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async getJob(id: string) {
    try {
      const job = await jobRepository.findById(id, "job");
      if (job) {
        return job as Job;
      }
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async submitResume(authId: string, jobId: string, file: Express.Multer.File) {
    try {
      const hasUserUploaded = await resumeRepository.findFirst(
        authId,
        jobId,
        "submitResume"
      );
      logger.info(hasUserUploaded);
      if (hasUserUploaded) {
        logger.info("This user has already submitted a resume to this job");
        return;
      }

      if (!hasUserUploaded) {
        const url = await getPresignedUrl(file);
        const parsedText = await CVParser(url as string);

        const data = {
          fileUrl: url as string,
          parsedText,
          user: {
            connect: {
              authId: authId,
            },
          },
          Job: {
            connect: {
              id: jobId,
            },
          },
        } satisfies Prisma.ResumeCreateInput;
        const resume = await resumeRepository.create(data);
        if (resume) {
          return resume;
        }
      }
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async getSubmittedResume(jobId: string) {
    try {
      const resumes = await resumeRepository.findAll(jobId, "submittedResume");

      if (!resumes || resumes.length === 0) {
        logger.info("No resume found!");
        return [];
      }

      const resume = await MatchResumeQueue.add("match_resume", {
        jobId,
        resumes,
      });

      const result = await resume.waitUntilFinished(matchResumeEvents);
      await MatchResumeQueue.close();
      return result;
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }
}
