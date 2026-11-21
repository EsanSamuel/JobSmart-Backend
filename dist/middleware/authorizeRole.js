"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRecruiter = void 0;
const repository_1 = require("../repository/base/repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const userRepository = new repository_1.Repository(prisma_1.default?.user);
const jobRepository = new repository_1.Repository(prisma_1.default?.job);
const isRecruiter = async (userId, jobId) => {
    const user = await userRepository.findById(userId, undefined, "user");
    const job = await jobRepository.findById(jobId, undefined, "job");
    if (user?.role !== "COMPANY") {
        throw new Error("Only Company recruiter can call this function!");
    }
    else if (user.role === "COMPANY") {
        logger_1.default.info("You are eligible to call this function!");
    }
    // Check if user listed the job
    if (jobId && job) {
        if (job?.createdById === user.id) {
            logger_1.default.info("You are eligible to call this function because you listed the job!");
        }
        else {
            throw new Error("Invalivid authorization: You didn't list this job.!");
        }
    }
};
exports.isRecruiter = isRecruiter;
