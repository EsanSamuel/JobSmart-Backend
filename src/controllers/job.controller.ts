import express from "express";
import { ApiError, ApiSuccess } from "../utils/response";
import { Prisma } from "../generated/prisma/client";
import { UserService } from "../services/user.service";
import logger from "../utils/logger";
import { JobService } from "../services/job.service";
import { isRecruiter } from "../middleware/authorizeRole";
import { getEmbedding } from "../ai/gemini";

const jobService = new JobService();

class JobController {
  static async createJob(req: express.Request, res: express.Response) {
    try {
      const {
        title,
        maxApplicants,
        description,
        skills,
        location,
        jobType,
        salaryRange,
        authId,
        requirements,
        responsibilities,
        benefits,
      } = req.body;

      //await isRecruiter(authId as string);
      const embedContent: number[] | undefined | any =
        (await getEmbedding(`${title} ${description} ${skills.join(" ")}`)) ||
        undefined;

      const data = {
        title,
        description,
        maxApplicants,
        skills,
        location,
        jobType,
        salaryRange,
        requirements,
        responsibilities,
        benefits,
        embedding: embedContent,
        createdBy: {
          connect: {
            id: authId,
          },
        },
      } satisfies Prisma.JobCreateInput;

      const job = await jobService.createJob(data, authId);
      logger.info(job);
      if (job) {
        res
          .status(201)
          .json(new ApiSuccess(201, "Job created successfully", job));
      } else {
        res
          .status(500)
          .json(
            new ApiError(500, "Something went wrong with listing job!,", [])
          );
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getJobs(req: express.Request, res: express.Response) {
    const params = req.query;
    const {
      filter,
      skip,
      take,
      orderBy,
      jobType,
      location,
      title,
      date,
      company,
    } = params;
    try {
      const jobs = await jobService.getJobs({
        filter: filter,
        jobType: jobType as string,
        location: location as string,
        title: title as string,
        date: date as any,
        company: company as string,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy as "asc" | "desc",
      });

      if (jobs) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Jobs fetched successfully", jobs));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getCompanyJobs(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    const params = req.query;
    const {
      filter,
      skip,
      take,
      orderBy,
      jobType,
      location,
      title,
      date,
      company,
    } = params;
    try {
      const jobs = await jobService.getCompanyJobs(userId, {
        filter: filter,
        jobType: jobType as string,
        location: location as string,
        title: title as string,
        date: date as any,
        company: company as string,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy as "asc" | "desc",
      });

      if (jobs) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Jobs fetched successfully", jobs));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getJob(req: express.Request, res: express.Response) {
    const jobId = req.params.id;
    try {
      const job = await jobService.getJob(jobId);

      if (job) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Job fetched successfully", job));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async closeJob(req: express.Request, res: express.Response) {
    try {
      const jobId = req.params.id;
      const job = await jobService.closeJob(jobId);
      if (job) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Job closed successfully", job));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async deleteJob(req: express.Request, res: express.Response) {
    try {
      const jobId = req.params.id;
      const job = await jobService.deleteJob(jobId);

      res
        .status(200)
        .json(new ApiSuccess(200, "Job deleted successfully", job));
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async updateJob(req: express.Request, res: express.Response) {
    try {
      const jobId = req.params.id;
      const params = req.query;
      const { userId } = params;
      await isRecruiter(userId as string, jobId);
      const {
        title,
        company,
        description,
        skills,
        location,
        jobType,
        salaryRange,
      } = req.body;

      const data = {
        title,
        company,
        description,
        skills,
        location,
        jobType,
        salaryRange,
      } satisfies Prisma.JobUpdateInput;

      const job = await jobService.updateJob(jobId, data);
      logger.info(job);
      if (job) {
        res
          .status(201)
          .json(new ApiSuccess(201, "Job created successfully", job));
      } else {
        res
          .status(500)
          .json(
            new ApiError(500, "Something went wrong with listing job!,", [])
          );
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async submitResume(req: express.Request, res: express.Response) {
    try {
      const { authId, jobId } = req.body;
      const files = req.files as {
        CV: Express.Multer.File[];
      };

      if (files.CV?.[0]) {
        const resume = await jobService.submitResume(
          authId,
          jobId,
          files.CV[0]
        );
        logger.info(resume);
        if (resume) {
          res
            .status(201)
            .json(new ApiSuccess(201, "Resume uploaded successfully", resume));
        } else {
          res.status(500).json(new ApiError(500, "Something went wrong!,", []));
        }
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getSubmittedResume(req: express.Request, res: express.Response) {
    const jobId = req.params.id;
    try {
      const resume = await jobService.getSubmittedResume(jobId);

      if (resume) {
        res
          .status(200)
          .json(
            new ApiSuccess(
              200,
              "Submitted resumes fetched successfully",
              resume
            )
          );
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getAIrecoomendation(
    req: express.Request,
    res: express.Response
  ) {
    const userId = req.params.id;

    try {
      const jobs = await jobService.AIjobRecommendation(userId);

      if (jobs) {
        res
          .status(200)
          .json(new ApiSuccess(200, "AI Jobs recommendation", jobs));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async addShortlistedApplicants(
    req: express.Request,
    res: express.Response
  ) {
    const resumeId = req.params.id;

    try {
      const status = await jobService.addApplicantsToShortList(resumeId);

      if (status) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Applicant added to shortlist", status));
      } else {
        res
          .status(500)
          .json(
            new ApiError(
              500,
              "Something went wrong with adding applicant to shortlist!,",
              []
            )
          );
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async acceptApplicant(req: express.Request, res: express.Response) {
    const resumeId = req.params.id;

    try {
      const status = await jobService.acceptApplicants(resumeId);

      if (status) {
        res.status(200).json(new ApiSuccess(200, "Applicant accepted", status));
      } else {
        res
          .status(500)
          .json(
            new ApiError(
              500,
              "Something went wrong with adding applicant to shortlist!,",
              []
            )
          );
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async interviewApplicant(req: express.Request, res: express.Response) {
    const { jobId, resumeId, userId, interviewUrl, interViewDate } = req.body;

    try {
      const status = await jobService.interviewApplicant(
        jobId,
        userId,
        resumeId,
        interviewUrl,
        interViewDate
      );

      if (status) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Applicant called for interview", status));
      } else {
        res
          .status(500)
          .json(
            new ApiError(
              500,
              "Something went wrong with adding applicant to shortlist!,",
              []
            )
          );
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }
}

export default JobController;
