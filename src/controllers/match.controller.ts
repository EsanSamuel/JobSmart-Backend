import express from "express";
import { ApiError, ApiSuccess } from "../utils/response";
import { JobMatchService } from "../services/match.service";
import logger from "../utils/logger";
import { MatchJobQueue } from "../queue/matchjob.queue";

const matchService = new JobMatchService();

export class MatchController {
  static async MatchJob(req: express.Request, res: express.Response) {
    try {
      const jobId = req.params.id;
      const { authId, resumeId } = req.body;
      const file = req.files as {
        CV?: Express.Multer.File[];
      };

      if (file.CV?.[0]) {
        if (!resumeId) {
         const match = await matchService.match(jobId, authId, file.CV?.[0]);

          if (match) {
            res.status(201).json(new ApiSuccess(201, "Job Matched", match));
          } else {
            res
              .status(500)
              .json(
                new ApiError(
                  500,
                  "Something went wrong with matching Job!,",
                  []
                )
              );
          }

        } else if (resumeId) {
          const match = await matchService.match(jobId, authId, file.CV?.[0],resumeId);

          if (match) {
            res.status(201).json(new ApiSuccess(201, "Job Matched", match));
          } else {
            res
              .status(500)
              .json(
                new ApiError(
                  500,
                  "Something went wrong with matching Job!,",
                  []
                )
              );
          }
        }
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }
}
