import express from "express";
import BookmarkController from "../../controllers/bookmark.controller";

const bookmarkRouter = express.Router();

bookmarkRouter.post("/", BookmarkController.addBookmark);
bookmarkRouter.delete("/:id", BookmarkController.deleteBookmark);
bookmarkRouter.get("/user/:id", BookmarkController.getUserBookmarks);
bookmarkRouter.get("/job/:id", BookmarkController.getBookmarkedJob);

export default bookmarkRouter;
