import express from "express";
import { ApiError, ApiSuccess } from "../utils/response";
import { Prisma } from "../generated/prisma/client";
import { BookmarkService } from "../services/bookmark.service";
import logger from "../utils/logger";

const bookmarkService = new BookmarkService();

class BookmarkController {
  static async addBookmark(req: express.Request, res: express.Response) {
    try {
      const { authId, jobId } = req.body;

      const data: any = {
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
      } satisfies Prisma.BookmarkCreateInput;

      const bookmark = await bookmarkService.addJobToBookmark(
        data,
        jobId,
        authId
      );
      res
        .status(201)
        .json(new ApiSuccess(201, "Bookmark created successfully", bookmark));
    } catch (error) {
      logger.error(error);
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getBookmark(req: express.Request, res: express.Response) {
    const id = req.params.id;
    try {
      const bookmark = await bookmarkService.getBookmark(id);
      if (bookmark) {
        res
          .status(200)
          .json(new ApiSuccess(200, "Bookmark fetched successfully", bookmark));
      } else {
        res.status(500).json(new ApiError(500, "Something went wrong!,", []));
      }
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async getUserBookmarks(req: express.Request, res: express.Response) {
    const userId = req.params.id;
    try {
      const bookmarks = await bookmarkService.getUserBookmarks(userId);
      if (bookmarks) {
        res
          .status(200)
          .json(
            new ApiSuccess(200, "Bookmarks fetched successfully", bookmarks)
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

  static async getBookmarkedJob(req: express.Request, res: express.Response) {
    const jobId = req.params.id;
    try {
      const bookmarks = await bookmarkService.getBookmarkedJobs(jobId);
      res
        .status(200)
        .json(new ApiSuccess(200, "Bookmarks fetched successfully", bookmarks));
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }

  static async deleteBookmark(req: express.Request, res: express.Response) {
    const id = req.params.id;
    try {
      await bookmarkService.deleteBookmark(id);
      res
        .status(200)
        .json(new ApiSuccess(200, "Bookmark deleted successfully", null));
    } catch (error) {
      res
        .status(500)
        .json(new ApiError(500, "Something went wrong!,", [error]));
    }
  }
}

export default BookmarkController;
