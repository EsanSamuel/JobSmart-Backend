"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobService = void 0;
const repository_1 = require("../repository/base/repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const aws_1 = require("../libs/aws");
const pdf_parser_1 = require("../libs/pdf-parser");
const matchresume_queue_1 = require("../queue/matchresume.queue");
const cosineSimilarity_1 = require("../utils/cosineSimilarity");
const redis_service_1 = __importDefault(require("./redis.service"));
const crypto_1 = __importDefault(require("crypto"));
const jobRepository = new repository_1.Repository(prisma_1.default?.job);
const userRepository = new repository_1.Repository(prisma_1.default?.user);
const resumeRepository = new repository_1.Repository(prisma_1.default?.resume);
const interviewRepository = new repository_1.Repository(prisma_1.default.interview);
const redisService = new redis_service_1.default();
class JobService {
    async createJob(data, authId) {
        try {
            const user = await userRepository.findById(authId, undefined, "accountRole");
            if (user?.role === "COMPANY") {
                const job = await jobRepository.create(data);
                logger_1.default.info(job);
                return job;
            }
            else {
                logger_1.default.info("Only companies can list jobs");
            }
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async getJobs(params) {
        try {
            const paramsString = JSON.stringify(params || {});
            const key = crypto_1.default.createHash("md5").update(paramsString).digest("hex");
            const cachedKey = `jobs:${key}`;
            const cachedJobs = await redisService.get(cachedKey);
            /*if (cachedJobs) {
              return cachedJobs as Job[];
            }*/
            const jobs = await jobRepository.findAll(undefined, "job", params);
            for (const job of jobs) {
                if (job.maxApplicants === job.Resume.length) {
                    await jobRepository.update(job.id, {
                        isClosed: true,
                    });
                }
            }
            if (jobs) {
                /*await redisService.set(cachedKey, jobs, 600);*/
                return jobs;
            }
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async getCompanyJobs(userId, params) {
        try {
            const paramsString = JSON.stringify(params || {});
            const key = crypto_1.default.createHash("md5").update(paramsString).digest("hex");
            const cachedKey = `companyJobs:${key}`;
            const cachedJobs = await redisService.get(cachedKey);
            /*if (cachedJobs) {
              return cachedJobs as Job[];
            }*/
            const jobs = await jobRepository.findAll(userId, "recruiterJob", params);
            if (jobs) {
                /* await redisService.set(cachedKey, jobs, 600);*/
                return jobs;
            }
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async getJob(id) {
        try {
            const key = `job:${id}`;
            const cachedJob = await redisService.get(key);
            if (cachedJob) {
                return cachedJob;
            }
            const job = await jobRepository.findById(id, undefined, "job");
            if (job) {
                return job;
            }
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async deleteJob(jobId) {
        try {
            await jobRepository.delete(jobId);
        }
        catch (error) {
            logger_1.default.error("Error closing job" + error);
        }
    }
    async closeJob(jobId) {
        try {
            const close = await jobRepository.update(jobId, {
                isClosed: true,
            });
            if (close) {
                return close;
            }
        }
        catch (error) {
            logger_1.default.error("Error closing job" + error);
        }
    }
    async updateJob(id, data) {
        try {
            const job = await jobRepository.update(id, data);
            if (job) {
                return job;
            }
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async submitResume(authId, jobId, file) {
        try {
            const hasUserUploaded = await resumeRepository.findFirst(authId, jobId, "submitResume");
            logger_1.default.info(hasUserUploaded);
            if (hasUserUploaded) {
                logger_1.default.info("This user has already submitted a resume to this job");
                return;
            }
            if (!hasUserUploaded) {
                const url = await (0, aws_1.getPresignedUrl)(file);
                const parsedText = await (0, pdf_parser_1.CVParser)(url);
                const data = {
                    fileUrl: url,
                    parsedText,
                    user: {
                        connect: {
                            id: authId,
                        },
                    },
                    job: {
                        connect: {
                            id: jobId,
                        },
                    },
                };
                const resume = await resumeRepository.create(data);
                if (resume) {
                    return resume;
                }
            }
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async getSubmittedResume(jobId) {
        try {
            const key = `Resume:${jobId}`;
            /*const cachedResumes = await redisService.get(key);
            if (cachedResumes) {
              return cachedResumes;
            }*/
            const resumes = await resumeRepository.findAll(jobId, "submittedResume");
            if (!resumes || resumes.length === 0) {
                logger_1.default.info("No resume found!");
                return [];
            }
            const resume = await matchresume_queue_1.MatchResumeQueue.add("match_resume", {
                jobId,
                resumes,
            });
            const result = (await resume.waitUntilFinished(matchresume_queue_1.matchResumeEvents));
            await matchresume_queue_1.MatchResumeQueue.close();
            const filterResumeByAIscore = result
                .filter((resume) => resume.matchPercentage !== null)
                .sort((a, b) => (b.matchPercentage ?? 0) - (a.matchPercentage ?? 0));
            logger_1.default.info(filterResumeByAIscore);
            const resultsWithMatchPercentage = result.filter((resume) => resume.matchPercentage !== null);
            const BestFits = resultsWithMatchPercentage.filter((resume) => (resume?.matchPercentage ?? 0) >= 80);
            const PotentialFits = resultsWithMatchPercentage.filter((resume) => (resume?.matchPercentage ?? 0) >= 50 &&
                (resume?.matchPercentage ?? 0) <= 79);
            const UnlikelyFits = resultsWithMatchPercentage.filter((resume) => (resume?.matchPercentage ?? 0) < 50);
            await redisService.set(key, {
                result,
                filterResumeByAIscore,
                PotentialFits,
                BestFits,
                UnlikelyFits,
            }, 600);
            return {
                result,
                filterResumeByAIscore,
                PotentialFits,
                BestFits,
                UnlikelyFits,
            };
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async AIjobRecommendation(userId) {
        try {
            const user = await userRepository.findById(userId, undefined, "user");
            const jobs = await jobRepository.findAll(undefined, "job");
            if (!user?.Resume || user?.Resume?.length === 0) {
                logger_1.default.error("User Resume hasn't been uploaded");
                return;
            }
            const userResume = user?.Resume.filter((resume) => resume.embedding !== null && resume.jobId === null);
            const resumeEmbedding = userResume?.[0]?.embedding ?? [0];
            const rankedJobs = jobs
                .filter((job) => Array.isArray(job.embedding) && job.embedding.length > 0)
                .map((job) => {
                const score = (0, cosineSimilarity_1.cosineSimilarity)(resumeEmbedding, job.embedding);
                return { ...job, matchScore: Math.round(score * 100) };
            })
                .sort((a, b) => b.matchScore - a.matchScore)
                .slice(0, 10);
            logger_1.default.info(rankedJobs);
            const filterJobs = rankedJobs.filter((job) => job.matchScore >= 60);
            logger_1.default.info(`Top recommendations for ${userId}: ${filterJobs.length} found`);
            filterJobs.forEach((job, index) => {
                logger_1.default.info(`${index + 1}. ${job.title} at ${job.company} - ${job.matchScore}%`);
            });
            return filterJobs;
        }
        catch (error) {
            logger_1.default.error("Error creating job" + error);
        }
    }
    async addApplicantsToShortList(resumeId) {
        try {
            const data = {
                status: "ShortListed",
            };
            const status = await resumeRepository.update(resumeId, data);
            if (status) {
                return status;
            }
        }
        catch (error) {
            logger_1.default.error("Error adding applicant to shortlist" + error);
        }
    }
    async acceptApplicants(resumeId) {
        try {
            const data = {
                status: "Accepted",
            };
            const status = await resumeRepository.update(resumeId, data);
            if (status) {
                return status;
            }
        }
        catch (error) {
            logger_1.default.error("Error accepting applicant" + error);
        }
    }
    async interviewApplicant(jobId, userId, resumeId, interviewUrl, interViewDate) {
        try {
            const data = {
                job: {
                    connect: {
                        id: jobId,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
                resume: {
                    connect: {
                        id: resumeId,
                    },
                },
                interviewUrl,
                interViewDate,
            };
            const interview = await interviewRepository.create(data);
            if (interview) {
                return interview;
            }
        }
        catch (error) {
            logger_1.default.error("Error accepting applicant" + error);
        }
    }
}
exports.JobService = JobService;
