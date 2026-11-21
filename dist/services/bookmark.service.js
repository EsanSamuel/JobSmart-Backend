"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookmarkService = void 0;
const repository_1 = require("../repository/base/repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const redis_service_1 = __importDefault(require("./redis.service"));
const bookmarkRepository = new repository_1.Repository(prisma_1.default?.bookmark);
const redisService = new redis_service_1.default();
class BookmarkService {
    async addJobToBookmark(data, jobId, userId) {
        try {
            const isBookmarked = await bookmarkRepository.findFirst(jobId, userId, "bookmark");
            if (isBookmarked) {
                logger_1.default.info("This job has been bookmarked");
                return;
            }
            const bookmark = await bookmarkRepository.create(data);
            if (bookmark) {
                logger_1.default.info(bookmark);
                return bookmark;
            }
        }
        catch (error) {
            logger_1.default.error("Something went wrong with adding job to bookmark!");
        }
    }
    async getUserBookmarks(userId) {
        try {
            const key = `userBookmarks:${userId}`;
            const cachedUserBookmarks = await redisService.get(key);
            if (cachedUserBookmarks) {
                return cachedUserBookmarks;
            }
            const bookmarks = await bookmarkRepository.findAll(userId, "bookmark");
            if (bookmarks) {
                await redisService.set(key, bookmarks, 600);
                return bookmarks;
            }
        }
        catch (error) {
            logger_1.default.error("Something went wrong with fetching user bookmarks!");
        }
    }
    async getBookmarkedJobs(jobId) {
        try {
            const bookmarks = await bookmarkRepository.findAll(jobId, "bookmarkedJobs");
            if (bookmarks) {
                return bookmarks;
            }
        }
        catch (error) {
            logger_1.default.error("Something went wrong with fetching user bookmarks!");
        }
    }
    async getBookmark(id) {
        try {
            const bookmark = await bookmarkRepository.findById(id, "bookmark");
            if (bookmark) {
                return bookmark;
            }
        }
        catch (error) {
            logger_1.default.error("Something went wrong with fetching bookmark!");
        }
    }
    async deleteBookmark(id) {
        await bookmarkRepository.delete(id);
        try {
        }
        catch (error) {
            logger_1.default.error("Something went wrong with deleting bookmark!");
        }
    }
}
exports.BookmarkService = BookmarkService;
