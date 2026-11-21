"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const bookmark_service_1 = require("../services/bookmark.service");
const bookmarkService = new bookmark_service_1.BookmarkService();
class BookmarkController {
    static async addBookmark(req, res) {
        try {
            const { authId, jobId } = req.body;
            const data = {
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
            };
            const bookmark = await bookmarkService.addJobToBookmark(data, jobId, authId);
            logger_1.default.info(bookmark);
            if (bookmark) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Bookmark created successfully", bookmark));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            logger_1.default.error(error);
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getBookmark(req, res) {
        const id = req.params.id;
        try {
            const bookmark = await bookmarkService.getBookmark(id);
            if (bookmark) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Bookmark fetched successfully", bookmark));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getUserBookmarks(req, res) {
        const userId = req.params.id;
        try {
            const bookmarks = await bookmarkService.getUserBookmarks(userId);
            if (bookmarks) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Bookmarks fetched successfully", bookmarks));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getBookmarkedJob(req, res) {
        const jobId = req.params.id;
        try {
            const bookmarks = await bookmarkService.getBookmarkedJobs(jobId);
            if (bookmarks) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Bookmarks fetched successfully", bookmarks));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async deleteBookmark(req, res) {
        const id = req.params.id;
        try {
            await bookmarkService.deleteBookmark(id);
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
}
exports.default = BookmarkController;
