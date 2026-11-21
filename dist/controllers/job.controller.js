"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const logger_1 = __importDefault(require("../utils/logger"));
const job_service_1 = require("../services/job.service");
const authorizeRole_1 = require("../middleware/authorizeRole");
const gemini_1 = require("../ai/gemini");
const jobService = new job_service_1.JobService();
class JobController {
    static async createJob(req, res) {
        try {
            const { title, maxApplicants, description, skills, location, jobType, salaryRange, authId, requirements, responsibilities, benefits, } = req.body;
            //await isRecruiter(authId as string);
            const embedContent = (await (0, gemini_1.getEmbedding)(`${title} ${description} ${skills.join(" ")}`)) ||
                undefined;
            const data = {
                title,
                description,
                maxApplicants,
                skills,
                location,
                jobType,
                salaryRange,
                requirements,
                responsibilities,
                benefits,
                embedding: embedContent,
                createdBy: {
                    connect: {
                        id: authId,
                    },
                },
            };
            const job = await jobService.createJob(data, authId);
            logger_1.default.info(job);
            if (job) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Job created successfully", job));
            }
            else {
                res
                    .status(500)
                    .json(new response_1.ApiError(500, "Something went wrong with listing job!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getJobs(req, res) {
        const params = req.query;
        const { filter, skip, take, orderBy, jobType, location, title, date, company, } = params;
        try {
            const jobs = await jobService.getJobs({
                filter: filter,
                jobType: jobType,
                location: location,
                title: title,
                date: date,
                company: company,
                skip: Number(skip) || undefined,
                take: Number(take) || undefined,
                orderBy: orderBy,
            });
            if (jobs) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Jobs fetched successfully", jobs));
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
    static async getCompanyJobs(req, res) {
        const userId = req.params.id;
        const params = req.query;
        const { filter, skip, take, orderBy, jobType, location, title, date, company, } = params;
        try {
            const jobs = await jobService.getCompanyJobs(userId, {
                filter: filter,
                jobType: jobType,
                location: location,
                title: title,
                date: date,
                company: company,
                skip: Number(skip) || undefined,
                take: Number(take) || undefined,
                orderBy: orderBy,
            });
            if (jobs) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Jobs fetched successfully", jobs));
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
    static async getJob(req, res) {
        const jobId = req.params.id;
        try {
            const job = await jobService.getJob(jobId);
            if (job) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Job fetched successfully", job));
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
    static async closeJob(req, res) {
        try {
            const jobId = req.params.id;
            const job = await jobService.closeJob(jobId);
            if (job) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Job closed successfully", job));
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
    static async deleteJob(req, res) {
        try {
            const jobId = req.params.id;
            const job = await jobService.deleteJob(jobId);
            res
                .status(200)
                .json(new response_1.ApiSuccess(200, "Job deleted successfully", job));
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async updateJob(req, res) {
        try {
            const jobId = req.params.id;
            const params = req.query;
            const { userId } = params;
            await (0, authorizeRole_1.isRecruiter)(userId, jobId);
            const { title, company, description, skills, location, jobType, salaryRange, } = req.body;
            const data = {
                title,
                company,
                description,
                skills,
                location,
                jobType,
                salaryRange,
            };
            const job = await jobService.updateJob(jobId, data);
            logger_1.default.info(job);
            if (job) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Job created successfully", job));
            }
            else {
                res
                    .status(500)
                    .json(new response_1.ApiError(500, "Something went wrong with listing job!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async submitResume(req, res) {
        try {
            const { authId, jobId } = req.body;
            const files = req.files;
            if (files.CV?.[0]) {
                const resume = await jobService.submitResume(authId, jobId, files.CV[0]);
                logger_1.default.info(resume);
                if (resume) {
                    res
                        .status(201)
                        .json(new response_1.ApiSuccess(201, "Resume uploaded successfully", resume));
                }
                else {
                    res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
                }
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getSubmittedResume(req, res) {
        const jobId = req.params.id;
        try {
            const resume = await jobService.getSubmittedResume(jobId);
            if (resume) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Submitted resumes fetched successfully", resume));
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
    static async getAIrecoomendation(req, res) {
        const userId = req.params.id;
        try {
            const jobs = await jobService.AIjobRecommendation(userId);
            if (jobs) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "AI Jobs recommendation", jobs));
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
    static async addShortlistedApplicants(req, res) {
        const resumeId = req.params.id;
        try {
            const status = await jobService.addApplicantsToShortList(resumeId);
            if (status) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Applicant added to shortlist", status));
            }
            else {
                res
                    .status(500)
                    .json(new response_1.ApiError(500, "Something went wrong with adding applicant to shortlist!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async acceptApplicant(req, res) {
        const resumeId = req.params.id;
        try {
            const status = await jobService.acceptApplicants(resumeId);
            if (status) {
                res.status(200).json(new response_1.ApiSuccess(200, "Applicant accepted", status));
            }
            else {
                res
                    .status(500)
                    .json(new response_1.ApiError(500, "Something went wrong with adding applicant to shortlist!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async interviewApplicant(req, res) {
        const { jobId, resumeId, userId, interviewUrl, interViewDate } = req.body;
        try {
            const status = await jobService.interviewApplicant(jobId, userId, resumeId, interviewUrl, interViewDate);
            if (status) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Applicant called for interview", status));
            }
            else {
                res
                    .status(500)
                    .json(new response_1.ApiError(500, "Something went wrong with adding applicant to shortlist!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
}
exports.default = JobController;
