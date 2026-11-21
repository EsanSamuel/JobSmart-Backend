"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchJobWorker = void 0;
const bullmq_1 = require("bullmq");
const repository_1 = require("../repository/base/repository");
const logger_1 = __importDefault(require("../utils/logger"));
const pdf_parser_1 = require("../libs/pdf-parser");
const gemini_1 = require("../ai/gemini");
const bullmq_redis_1 = require("../config/bullmq-redis");
const prisma_1 = __importDefault(require("../config/prisma"));
const jobRepository = new repository_1.Repository(prisma_1.default?.job);
const userRepository = new repository_1.Repository(prisma_1.default?.user);
const matchRepository = new repository_1.Repository(prisma_1.default?.match);
exports.matchJobWorker = new bullmq_1.Worker("match_job", async (job) => {
    const { jobId, userId, CVurl, resumeId } = job.data;
    const pdfWithUUID = CVurl.split("/").pop();
    const pdfName = pdfWithUUID?.split("=")[1];
    logger_1.default.info(pdfName);
    try {
        if (!resumeId) {
            const existingMatchInDB = await matchRepository.findFirst(jobId, userId, "matched", pdfName);
            if (existingMatchInDB) {
                logger_1.default.info("Match already exist for this user and this job, returning from DB....");
                //logger.info(existingMatchInDB);
                return existingMatchInDB;
            }
            const job = await jobRepository.findById(jobId, undefined, "job");
            const parseCVurlText = await (0, pdf_parser_1.CVParser)(CVurl);
            const prompt = `
              You are an expert career analyst and recruiter.
    
              I will give you two pieces of text:
    
              1. The job description (JD)
              2. A candidate’s CV/resume
    
              Your task:
              - Analyze the candidate’s CV against the job description.
              - Identify which skills or qualifications match.
              - Identify which skills or qualifications are missing.
              - Estimate a match percentage (0–100%) based on how well the candidate fits the role.
              - Be objective and explain your reasoning briefly.
    
              Return the result in the following JSON format:
    
              {
              "match_percentage": <number>,
              "matched_skills": [<list of skills that match>],
              "missing_skills": [<list of skills not found in CV but in JD>],
              "summary": "<brief text summary of why this candidate is or isn’t a strong fit>"
              }
    
              Here is the data:
    
              Job Description:
              """
              ${job?.description}
              """
    
              Candidate CV:
              """
              ${parseCVurlText}
              """
              `;
            const analyzeMatch = await (0, gemini_1.AnalyzeMatch)(prompt);
            if (!analyzeMatch || analyzeMatch.includes("quota")) {
                logger_1.default.error("Gemini API failed or quota exceeded, skipping DB insert");
                return null;
            }
            const cleaned = analyzeMatch?.replace(/```json|```/g, "").trim();
            const parsedResponse = JSON.parse(cleaned);
            logger_1.default.info(parsedResponse);
            const matched_percentage = parsedResponse.match_percentage;
            const matched_skills = parsedResponse.matched_skills;
            const missing_skills = parsedResponse.missing_skills;
            const summary = parsedResponse.summary;
            const data = {
                matchPercentage: matched_percentage,
                matchedSkills: matched_skills,
                missingSkills: missing_skills,
                fileUrl: pdfName,
                summary,
                job: {
                    connect: {
                        id: job?.id,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
            };
            const saveMatchingToDB = await matchRepository.create(data);
            logger_1.default.info(saveMatchingToDB);
            return saveMatchingToDB;
        }
        else if (resumeId) {
            const existingMatchInDB = await matchRepository.findFirst(jobId, userId, "matched", pdfName);
            if (existingMatchInDB) {
                logger_1.default.info("Match already exist for this user and this job, returning from DB....");
                logger_1.default.info(existingMatchInDB);
                return existingMatchInDB;
            }
            const user = await userRepository.findById(userId, undefined, "user");
            const userResume = user?.Resume.filter((resume) => resume.jobId === null);
            const parsedText = userResume?.[0]?.parsedText;
            logger_1.default.info(parsedText);
            const job = await jobRepository.findById(jobId, undefined, "job");
            const prompt = `
              You are an expert career analyst and recruiter.
    
              I will give you two pieces of text:
    
              1. The job description (JD)
              2. A candidate’s CV/resume
    
              Your task:
              - Analyze the candidate’s CV against the job description.
              - Identify which skills or qualifications match.
              - Identify which skills or qualifications are missing.
              - Estimate a match percentage (0–100%) based on how well the candidate fits the role.
              - Be objective and explain your reasoning briefly.
    
              Return the result in the following JSON format:
    
              {
              "match_percentage": <number>,
              "matched_skills": [<list of skills that match>],
              "missing_skills": [<list of skills not found in CV but in JD>],
              "summary": "<brief text summary of why this candidate is or isn’t a strong fit>"
              }
    
              Here is the data:
    
              Job Description:
              """
              ${job?.description}
              """
    
              Candidate CV:
              """
              ${parsedText}
              """
              `;
            const analyzeMatch = await (0, gemini_1.AnalyzeMatch)(prompt);
            if (!analyzeMatch || analyzeMatch.includes("quota")) {
                logger_1.default.error("Gemini API failed or quota exceeded, skipping DB insert");
                return null;
            }
            const cleaned = analyzeMatch?.replace(/```json|```/g, "").trim();
            const parsedResponse = JSON.parse(cleaned);
            logger_1.default.info(parsedResponse);
            const matched_percentage = parsedResponse.match_percentage;
            const matched_skills = parsedResponse.matched_skills;
            const missing_skills = parsedResponse.missing_skills;
            const summary = parsedResponse.summary;
            const data = {
                matchPercentage: matched_percentage,
                matchedSkills: matched_skills,
                missingSkills: missing_skills,
                fileUrl: pdfName,
                summary,
                job: {
                    connect: {
                        id: job?.id,
                    },
                },
                user: {
                    connect: {
                        id: userId,
                    },
                },
            };
            const saveMatchingToDB = await matchRepository.create(data);
            logger_1.default.info(saveMatchingToDB);
            return saveMatchingToDB;
        }
    }
    catch (error) {
        logger_1.default.error("Something went wrong with matching job" + error);
    }
}, { connection: bullmq_redis_1.bullRedis, concurrency: 5 });
exports.matchJobWorker.on("active", (job) => {
    console.log(`🚀 Processing job ${job.id}`);
});
exports.matchJobWorker.on("completed", (job, result) => {
    console.log(`✅ Job ${job.id} completed with result:`, result);
});
exports.matchJobWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
});
