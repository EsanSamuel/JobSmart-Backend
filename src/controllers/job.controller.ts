import express from "express";
import { ApiError, ApiSuccess } from "../utils/response";
import { Prisma } from "../generated/prisma/client";
import { UserService } from "../services/user.service";
import logger from "../utils/logger";
import { JobService } from "../services/job.service";

const jobService = new JobService();

class JobController {
  static async createJob(req: express.Request, res: express.Response) {
    try {
      const {
        title,
        company,
        description,
        skills,
        location,
        jobType,
        salaryRange,
        authId,
      } = req.body;

      const data = {
        title,
        company,
        description,
        skills,
        location,
        jobType,
        salaryRange,
        createdBy: {
          connect: {
            authId,
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
    const { filter, skip, take, orderBy } = params;
    try {
      const jobs = await jobService.getJobs({
        filter: filter,
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
}

export default JobController;
