import {
  Interview,
  Job,
  Prisma,
  Resume,
  User,
} from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";
import { getPresignedUrl } from "../libs/aws";
import { CVParser } from "../libs/pdf-parser";
import { AnalyzeMatch } from "../ai/gemini";
import { MatchJobQueue } from "../queue/matchjob.queue";
import {
  matchResumeEvents,
  MatchResumeQueue,
} from "../queue/matchresume.queue";
import { QueueEvents } from "bullmq";
import { bullRedis } from "../config/bullmq-redis";
import { cosineSimilarity } from "../utils/cosineSimilarity";
import { classicNameResolver } from "typescript";
import RedisService from "./redis.service";
import crypto from "crypto";

const jobRepository = new Repository<Job & { Resume: Resume[] }>(prisma?.job);
const userRepository = new Repository<
  User & { Resume: Resume[] } & { embedding: { values: number[] } }
>(prisma?.user);
const resumeRepository = new Repository<Resume & { user: User }[]>(
  prisma?.resume
);
const interviewRepository = new Repository<Interview>(prisma.interview);
const redisService = new RedisService();

export class JobService {
  async createJob(data: any, authId: string) {
    try {
      const user = await userRepository.findById(
        authId,
        undefined,
        "accountRole"
      );
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
    jobType?: string;
    location?: string;
    title?: string;
    date?: Date;
    company?: string;
    orderBy?: "asc" | "desc";
  }) {
    try {
      const paramsString = JSON.stringify(params || {});
      const key = crypto.createHash("md5").update(paramsString).digest("hex");
      const cachedKey = `jobs:${key}`;
      const cachedJobs = await redisService.get(cachedKey);
      /*if (cachedJobs) {
        return cachedJobs as Job[];
      }*/
      const jobs = await jobRepository.findAll(undefined, "job", params);

      for (const job of jobs) {
        if (job.maxApplicants === job.Resume.length) {
          await jobRepository.update(job.id, {
            isClosed: true,
          } satisfies Prisma.JobUpdateInput);
        }
      }
      if (jobs) {
        await redisService.set(cachedKey, jobs, 600);
        return jobs as Job[];
      }
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async getCompanyJobs(
    userId: string,
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      jobType?: string;
      location?: string;
      title?: string;
      date?: Date;
      company?: string;
      orderBy?: "asc" | "desc";
    }
  ) {
    try {
      const paramsString = JSON.stringify(params || {});
      const key = crypto.createHash("md5").update(paramsString).digest("hex");
      const cachedKey = `companyJobs:${key}`;
      const cachedJobs = await redisService.get(cachedKey);
      /*if (cachedJobs) {
        return cachedJobs as Job[];
      }*/
      const jobs = await jobRepository.findAll(userId, "recruiterJob", params);
      if (jobs) {
        await redisService.set(cachedKey, jobs, 600);
        return jobs as Job[];
      }
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async getJob(id: string) {
    try {
      const key = `job:${id}`;
      const cachedJob = await redisService.get(key);
      if (cachedJob) {
        return cachedJob as Job;
      }
      const job = await jobRepository.findById(id, undefined, "job");
      if (job) {
        return job as Job;
      }
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async closeJob(jobId: string) {
    try {
      const close = await jobRepository.update(jobId, {
        isClosed: true,
      } satisfies Prisma.JobUpdateInput);
      if (close) {
        return close;
      }
    } catch (error) {
      logger.info("Error closing job" + error);
    }
  }

  async updateJob(id: string, data: any) {
    try {
      const job = await jobRepository.update(id, data);
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
              id: authId,
            },
          },
          job: {
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
      const key = `Resume:${jobId}`;
      /*const cachedResumes = await redisService.get(key);
      if (cachedResumes) {
        return cachedResumes;
      }*/
      const resumes = await resumeRepository.findAll(jobId, "submittedResume");

      if (!resumes || resumes.length === 0) {
        logger.info("No resume found!");
        return [];
      }

      const resume = await MatchResumeQueue.add("match_resume", {
        jobId,
        resumes,
      });

      const result = (await resume.waitUntilFinished(
        matchResumeEvents
      )) as Resume[];
      await MatchResumeQueue.close();

      const filterResumeByAIscore = result
        .filter((resume) => resume.matchPercentage !== null)
        .sort(
          (a: Resume, b: Resume) =>
            (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
        ) as any;
      logger.info(filterResumeByAIscore);

      const resultsWithMatchPercentage = result.filter(
        (resume) => resume.matchPercentage !== null
      );
      const BestFits = resultsWithMatchPercentage.filter(
        (resume) => (resume?.matchPercentage ?? 0) >= 80
      );
      const PotentialFits = resultsWithMatchPercentage.filter(
        (resume) =>
          (resume?.matchPercentage ?? 0) >= 50 &&
          (resume?.matchPercentage ?? 0) <= 79
      );
      const UnlikelyFits = resultsWithMatchPercentage.filter(
        (resume) => (resume?.matchPercentage ?? 0) < 50
      );

      await redisService.set(
        key,
        {
          result,
          filterResumeByAIscore,
          PotentialFits,
          BestFits,
          UnlikelyFits,
        },
        600
      );

      return {
        result,
        filterResumeByAIscore,
        PotentialFits,
        BestFits,
        UnlikelyFits,
      };
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async AIjobRecommendation(userId: string) {
    try {
      const user = await userRepository.findById(userId, undefined, "user");
      const jobs = await jobRepository.findAll(undefined, "job");

      if (!user?.Resume || user?.Resume?.length === 0) {
        logger.error("User Resume hasn't been uploaded");
        return;
      }
      const userResume = user?.Resume.filter(
        (resume) => resume.embedding !== null && resume.jobId === null
      );
      const resumeEmbedding = userResume?.[0]?.embedding ?? [0];

      const rankedJobs = jobs
        .filter(
          (job) => Array.isArray(job.embedding) && job.embedding.length > 0
        )
        .map((job) => {
          const score = cosineSimilarity(
            resumeEmbedding,
            job.embedding as number[]
          );
          return { ...job, matchScore: Math.round(score * 100) };
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10);

      const filterJobs = rankedJobs.filter((job) => job.matchScore >= 70);

      logger.info(
        `Top recommendations for ${userId}: ${filterJobs.length} found`
      );

      filterJobs.forEach((job, index) => {
        logger.info(
          `${index + 1}. ${job.title} at ${job.company} - ${job.matchScore}%`
        );
      });

      return filterJobs;
    } catch (error) {
      logger.info("Error creating job" + error);
    }
  }

  async addApplicantsToShortList(resumeId: string) {
    try {
      const data = {
        status: "ShortListed",
      } satisfies Prisma.ResumeUpdateInput;
      const status = await resumeRepository.update(resumeId, data);
      if (status) {
        return status;
      }
    } catch (error) {
      logger.info("Error adding applicant to shortlist" + error);
    }
  }

  async acceptApplicants(resumeId: string) {
    try {
      const data = {
        status: "Accepted",
      } satisfies Prisma.ResumeUpdateInput;
      const status = await resumeRepository.update(resumeId, data);
      if (status) {
        return status;
      }
    } catch (error) {
      logger.info("Error accepting applicant" + error);
    }
  }

  async interviewApplicant(
    jobId: string,
    userId: string,
    resumeId: string,
    interviewUrl: string,
    interViewDate: Date
  ) {
    try {
      const data = {
        job: {
          connect: {
            id: jobId,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        resume: {
          connect: {
            id: resumeId,
          },
        },
        interviewUrl,
        interViewDate,
      } satisfies Prisma.InterviewCreateInput;
      const interview = await interviewRepository.create(data);
      if (interview) {
        return interview;
      }
    } catch (error) {
      logger.info("Error accepting applicant" + error);
    }
  }
}
