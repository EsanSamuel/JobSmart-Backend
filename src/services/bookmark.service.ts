import { Bookmark } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";

const bookmarkRepository = new Repository<Bookmark>(prisma?.bookmark);

export class BookmarkService {
  async addJobToBookmark(data: any, jobId: string, userId: string) {
    try {
      const isBookmarked = await bookmarkRepository.findFirst(
        jobId,
        userId,
        "bookmark"
      );
      if (isBookmarked) {
        logger.info("This job has been bookmarked");
        return;
      }
      const bookmark = await bookmarkRepository.create(data);
      if (bookmark) {
        logger.info(bookmark);
        return bookmark as Bookmark;
      }
    } catch (error) {
      logger.info("Something went wrong with adding job to bookmark!");
    }
  }

  async getUserBookmarks(userId: string) {
    try {
      const bookmarks = await bookmarkRepository.findAll(userId, "bookmark");
      if (bookmarks) {
        return bookmarks as Bookmark[];
      }
    } catch (error) {
      logger.info("Something went wrong with fetching user bookmarks!");
    }
  }

  async getBookmarkedJobs(jobId: string) {
    try {
      const bookmarks = await bookmarkRepository.findAll(
        jobId,
        "bookmarkedJobs"
      );
      if (bookmarks) {
        return bookmarks as Bookmark[];
      }
    } catch (error) {
      logger.info("Something went wrong with fetching user bookmarks!");
    }
  }

  async getBookmark(id: string) {
    try {
      const bookmark = await bookmarkRepository.findById(id, "bookmark");
      if (bookmark) {
        return bookmark as Bookmark;
      }
    } catch (error) {
      logger.info("Something went wrong with fetching bookmark!");
    }
  }

  async deleteBookmark(id: string) {
    await bookmarkRepository.delete(id);
    try {
    } catch (error) {
      logger.info("Something went wrong with deleting bookmark!");
    }
  }
}
