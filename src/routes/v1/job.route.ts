import express from "express";
import { UserService } from "../../services/user.service";
import JobController from "../../controllers/job.controller";
import multer from "multer";

const jobRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

jobRouter.post("/", JobController.createJob);
jobRouter.get("/", JobController.getJobs);
jobRouter.post(
  "/submit-resume",
  upload.fields([
    {
      name: "CV",
      maxCount: 1,
    },
  ]),
  JobController.submitResume
);
jobRouter.get("/:id", JobController.getJob);
jobRouter.patch("/:id", JobController.updateJob);
jobRouter.get("/resume/:id", JobController.getSubmittedResume);
jobRouter.get("/company/:id", JobController.getCompanyJobs);
jobRouter.get("/ai-recommedation/:id", JobController.getAIrecoomendation);

export default jobRouter;
