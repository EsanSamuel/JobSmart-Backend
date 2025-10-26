import express from "express";
import { ApiError, ApiSuccess } from "../utils/response";
import { Prisma } from "../generated/prisma/client";
import { UserService } from "../services/user.service";
import logger from "../utils/logger";
import { getPresignedUrl } from "../libs/aws";
import { CVParser } from "../libs/pdf-parser";

const userService = new UserService();

class UserController {
  static async createUser(req: express.Request, res: express.Response) {
    try {
      const { username, email, authId, signInType } = req.body;
      const uniqueName = email.split("@")[0];

      const data: any = {
        username,
        email,
        authId,
        uniqueName,
      } satisfies Prisma.UserCreateInput;

      if (signInType === "USER") {
        data.role = "USER";
      } else if (signInType === "COMPANY") {
        data.role = "COMPANY";
      }

      const user = await userService.createUser(data);
      logger.info(user);
      if (user) {
        res
          .status(201)
          .json(new ApiSuccess(201, "User created successfully", user));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getUser(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    try {
      const user = await userService.getUser(userId);
      if (user) {
        res
          .status(200)
          .json(new ApiSuccess(200, "User fetched successfully", user));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getUsers(req: express.Request, res: express.Response) {
    const params = req.query;
    const { filter, skip, take, orderBy } = params;
    try {
      const users = await userService.getUsers({
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy as "asc" | "desc",
      });

      if (users) {
        res
          .status(200)
          .json(new ApiSuccess(200, "User fetched successfully", users));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getCompanies(req: express.Request, res: express.Response) {
    const params = req.query;
    const { filter, skip, take, orderBy } = params;
    try {
      const companies = await userService.getCompanies({
        filter: filter,
        skip: Number(skip) || undefined,
        take: Number(take) || undefined,
        orderBy: orderBy as "asc" | "desc",
      });

      if (companies) {
        res
          .status(200)
          .json(
            new ApiSuccess(200, "Companies fetched successfully", companies)
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

  static async updateUser(req: express.Request, res: express.Response) {
    try {
      const authId = req.params.id;
      const { skills } = req.body;

      const user = await userService.updateProfile(authId, skills);
      logger.info(user);
      if (user) {
        res
          .status(201)
          .json(new ApiSuccess(201, "User created successfully", user));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async uploadResume(req: express.Request, res: express.Response) {
    try {
      const { authId } = req.body;
      const files = req.files as {
        CV: Express.Multer.File[];
      };

      if (files.CV?.[0]) {
        const resume = await userService.uploadResume(authId, files.CV[0]);
        logger.info(resume);
        if (resume) {
          res
            .status(201)
            .json(new ApiSuccess(201, "Resume uploaded successfully", resume));
        } else {
          res
            .status(200)
            .json(
              new ApiSuccess(
                200,
                "This user has already uploaded a resume!,",
                []
              )
            );
        }
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }
}

export default UserController;
