"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookmark_controller_1 = __importDefault(require("../../controllers/bookmark.controller"));
const bookmarkRouter = express_1.default.Router();
bookmarkRouter.post("/", bookmark_controller_1.default.addBookmark);
bookmarkRouter.delete("/:id", bookmark_controller_1.default.deleteBookmark);
bookmarkRouter.get("/user/:id", bookmark_controller_1.default.getUserBookmarks);
bookmarkRouter.get("/job/:id", bookmark_controller_1.default.getBookmarkedJob);
exports.default = bookmarkRouter;
