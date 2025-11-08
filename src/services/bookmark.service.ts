import { Bookmark } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";
import RedisService from "./redis.service";

const bookmarkRepository = new Repository<Bookmark>(prisma?.bookmark);
const redisService = new RedisService();

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
      logger.error("Something went wrong with adding job to bookmark!");
    }
  }

  async getUserBookmarks(userId: string) {
    try {
      const key = `userBookmarks:${userId}`;
      const cachedUserBookmarks = await redisService.get(key);
      if (cachedUserBookmarks) {
        return cachedUserBookmarks;
      }
      const bookmarks = await bookmarkRepository.findAll(userId, "bookmark");
      if (bookmarks) {
        await redisService.set(key, bookmarks, 600);
        return bookmarks as Bookmark[];
      }
    } catch (error) {
      logger.error("Something went wrong with fetching user bookmarks!");
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
      logger.error("Something went wrong with fetching user bookmarks!");
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
    await bookmarkRepository.delete(id);
    try {
    } catch (error) {
      logger.error("Something went wrong with deleting bookmark!");
    }
  }
}
