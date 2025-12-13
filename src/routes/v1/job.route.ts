import express from "express";
import { UserService } from "../../services/user.service";
import JobController from "../../controllers/job.controller";
import multer from "multer";
import authMiddleware from "../../middleware/authMiddleware";

const jobRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

jobRouter.post("/", authMiddleware, JobController.createJob);
jobRouter.get("/", authMiddleware, JobController.getJobs);
jobRouter.post(
  "/submit-resume",
  authMiddleware,
  upload.fields([
    {
      name: "CV",
      maxCount: 1,
    },
  ]),
  JobController.submitResume
);
jobRouter.post(
  "/create-interview",
  authMiddleware,
  JobController.interviewApplicant
);
jobRouter.get("/:id", JobController.getJob);
jobRouter.patch("/:id", authMiddleware, JobController.updateJob);
jobRouter.delete("/:id", authMiddleware, JobController.deleteJob);
jobRouter.get("/resume/:id", JobController.getSubmittedResume);
jobRouter.get("/company/:id", JobController.getCompanyJobs);
jobRouter.get("/ai-recommedation/:id", JobController.getAIrecoomendation);
jobRouter.patch("/close/:id", JobController.closeJob);
jobRouter.patch("/shortlist/:id", JobController.addShortlistedApplicants);
jobRouter.patch("/accept/:id", JobController.acceptApplicant);

export default jobRouter;
