import express from "express";
import BookmarkController from "../../controllers/bookmark.controller";

const bookmarkRouter = express.Router();

bookmarkRouter.post("/", BookmarkController.addBookmark);
bookmarkRouter.delete("/:id", BookmarkController.deleteBookmark);
// Keep compatibility with the frontend's existing POST-based remove action.
bookmarkRouter.post("/:id", BookmarkController.deleteBookmark);
bookmarkRouter.get("/user/:id", BookmarkController.getUserBookmarks);
bookmarkRouter.get("/job/:id", BookmarkController.getBookmarkedJob);

export default bookmarkRouter;
