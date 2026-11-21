"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const job_controller_1 = __importDefault(require("../../controllers/job.controller"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = __importDefault(require("../../middleware/authMiddleware"));
const jobRouter = express_1.default.Router();
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
jobRouter.post("/", authMiddleware_1.default, job_controller_1.default.createJob);
jobRouter.get("/", authMiddleware_1.default, job_controller_1.default.getJobs);
jobRouter.post("/submit-resume", authMiddleware_1.default, upload.fields([
    {
        name: "CV",
        maxCount: 1,
    },
]), job_controller_1.default.submitResume);
jobRouter.post("/create-interview", authMiddleware_1.default, job_controller_1.default.interviewApplicant);
jobRouter.get("/:id", job_controller_1.default.getJob);
jobRouter.patch("/:id", authMiddleware_1.default, job_controller_1.default.updateJob);
jobRouter.delete("/:id", authMiddleware_1.default, job_controller_1.default.deleteJob);
jobRouter.get("/resume/:id", job_controller_1.default.getSubmittedResume);
jobRouter.get("/company/:id", job_controller_1.default.getCompanyJobs);
jobRouter.get("/ai-recommedation/:id", job_controller_1.default.getAIrecoomendation);
jobRouter.patch("/close/:id", job_controller_1.default.closeJob);
jobRouter.patch("/shortlist/:id", job_controller_1.default.addShortlistedApplicants);
jobRouter.patch("/accept/:id", job_controller_1.default.acceptApplicant);
exports.default = jobRouter;
