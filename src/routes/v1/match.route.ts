import express from "express";

import multer from "multer";
import { MatchController } from "../../controllers/match.controller";

const storage = multer.memoryStorage();
const upload = multer({ storage });

const matchRouter = express.Router();

matchRouter.post(
  "/:id",
  upload.fields([
    {
      name: "CV",
      maxCount: 1,
    },
  ]),
  MatchController.MatchJob
);
matchRouter.get("/user/:id", MatchController.getUserMatches);

export default matchRouter;
