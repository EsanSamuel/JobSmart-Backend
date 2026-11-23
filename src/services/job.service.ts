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
import {
  matchResumeEvents,
  MatchResumeQueue,
} from "../queue/matchresume.queue";
import { cosineSimilarity } from "../utils/cosineSimilarity";

const jobRepository = new Repository<Job & { Resume: Resume[] }>(prisma?.job);
const userRepository = new Repository<
  User & { Resume: Resume[] } & { embedding: { values: number[] } }
>(prisma?.user);
const resumeRepository = new Repository<Resume & { user: User }[]>(
  prisma?.resume
);
const interviewRepository = new Repository<Interview>(prisma.interview);

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
        return job as Job;
      }
    } catch (error) {
      logger.error("Error creating job" + error);
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
      const jobs = await jobRepository.findAll(undefined, "job", params);
      return jobs.map((job) => ({
        ...job,
        isClosed: job.isClosed || job.maxApplicants <= job.Resume.length,
      })) as Job[];
    } catch (error) {
      logger.error({ err: error }, "Failed to fetch jobs");
      throw error;
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
      const jobs = await jobRepository.findAll(userId, "recruiterJob", params);
      if (jobs) {
        return jobs as Job[];
      }
    } catch (error) {
      logger.error("Error creating job" + error);
    }
  }

  async getJob(id: string) {
    try {
      const job = await jobRepository.findById(id, undefined, "job");
      if (job) {
        return job as Job;
      }
    } catch (error) {
      logger.error("Error creating job" + error);
    }
  }

  async deleteJob(jobId: string) {
    try {
      await jobRepository.delete(jobId);
    } catch (error) {
      logger.error("Error closing job" + error);
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
      logger.error("Error closing job" + error);
    }
  }

  async updateJob(id: string, data: any) {
    try {
      const job = await jobRepository.update(id, data);
      if (job) {
        return job as Job;
      }
    } catch (error) {
      logger.error("Error creating job" + error);
    }
  }

  async submitResume(authId: string, jobId: string, file: Express.Multer.File) {
    try {
      const hasUserUploaded = await resumeRepository.findFirst(
        authId,
        jobId,
        "submitResume"
      );
      if (hasUserUploaded) {
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
      logger.error("Error creating job" + error);
    }
  }

  async getSubmittedResume(jobId: string) {
    try {
      const resumes = await resumeRepository.findAll(jobId, "submittedResume");

      if (!resumes || resumes.length === 0) {
        return [];
      }

      const resume = await MatchResumeQueue.add("match_resume", { jobId });

      await resume.waitUntilFinished(matchResumeEvents);
      const result = (await resumeRepository.findAll(
        jobId,
        "submittedResume"
      )) as Resume[];

      const filterResumeByAIscore = result
        .filter((resume) => resume.matchPercentage !== null)
        .sort(
          (a: Resume, b: Resume) =>
            (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0)
        ) as any;

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

      return {
        result,
        filterResumeByAIscore,
        PotentialFits,
        BestFits,
        UnlikelyFits,
      };
    } catch (error) {
      logger.error("Error creating job" + error);
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
      const filterJobs = rankedJobs.filter((job) => job.matchScore >= 60);

      return filterJobs;
    } catch (error) {
      logger.error("Error creating job" + error);
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
      logger.error("Error adding applicant to shortlist" + error);
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
      logger.error("Error accepting applicant" + error);
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
      logger.error("Error accepting applicant" + error);
    }
  }
}
