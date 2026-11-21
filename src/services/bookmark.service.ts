import { Bookmark } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";

const bookmarkRepository = new Repository<Bookmark>(prisma?.bookmark);

export class BookmarkService {
  async addJobToBookmark(data: any, jobId: string, userId: string) {
    try {
      const isBookmarked = await prisma.bookmark.findFirst({
        where: { jobId, userId },
        include: { job: true },
      });
      if (isBookmarked) return isBookmarked;
      const bookmark = await bookmarkRepository.create(data);
      return bookmark as Bookmark;
    } catch (error) {
      logger.error({ err: error }, "Unable to add job bookmark");
      throw error;
    }
  }

  async getUserBookmarks(userId: string) {
    try {
      const bookmarks = await bookmarkRepository.findAll(userId, "bookmark");
      return (bookmarks ?? []) as Bookmark[];
    } catch (error) {
      logger.error({ err: error }, "Unable to fetch user bookmarks");
      throw error;
    }
  }

  async getBookmarkedJobs(jobId: string) {
    try {
      const bookmarks = await bookmarkRepository.findAll(
        jobId,
        "bookmarkedJobs"
      );
      return (bookmarks ?? []) as Bookmark[];
    } catch (error) {
      logger.error({ err: error }, "Unable to fetch bookmarks for job");
      throw error;
    }
  }

  async getBookmark(id: string) {
    try {
      const bookmark = await bookmarkRepository.findById(id, "bookmark");
      if (bookmark) {
        return bookmark as Bookmark;
      }
    } catch (error) {
      logger.error("Something went wrong with fetching bookmark!");
    }
  }

  async deleteBookmark(id: string) {
    try {
      return await bookmarkRepository.delete(id);
    } catch (error) {
      logger.error({ err: error }, "Unable to delete bookmark");
      throw error;
    }
  }
}
