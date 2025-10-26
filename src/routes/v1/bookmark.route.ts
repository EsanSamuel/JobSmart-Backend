import express from "express";
import BookmarkController from "../../controllers/bookmark.controller";

const bookmarkRouter = express.Router();

bookmarkRouter.post("/", BookmarkController.addBookmark);
bookmarkRouter.get("/:id", BookmarkController.getBookmark);
bookmarkRouter.delete("/:id", BookmarkController.deleteBookmark);
bookmarkRouter.get("/user/:id", BookmarkController.getUserBookmarks);

export default bookmarkRouter;
