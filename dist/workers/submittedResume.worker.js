"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchResumeWorker = void 0;
const bullmq_1 = require("bullmq");
const repository_1 = require("../repository/base/repository");
const logger_1 = __importDefault(require("../utils/logger"));
const gemini_1 = require("../ai/gemini");
const bullmq_redis_1 = require("../config/bullmq-redis");
const prisma_1 = __importDefault(require("../config/prisma"));
const jobRepository = new repository_1.Repository(prisma_1.default?.job);
const userRepository = new repository_1.Repository(prisma_1.default?.user);
const matchRepository = new repository_1.Repository(prisma_1.default?.match);
const resumeRepository = new repository_1.Repository(prisma_1.default?.resume);
exports.matchResumeWorker = new bullmq_1.Worker("match_resume", async (jobs) => {
    const { jobId, resumes } = jobs.data;
    for (const resume of resumes) {
        if (resume.matchPercentage && resume.matchedSkills?.length > 0) {
            logger_1.default.info(`Skipping ${resume.userId} — already has match data (${resume.matchPercentage}%)`);
            continue;
        }
        const parsedText = resume.parsedText;
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
            continue;
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
            summary,
        };
        await resumeRepository.update(resume.id, data);
    }
    const updatedResumes = await resumeRepository.findAll(jobId, "submittedResume");
    return updatedResumes;
}, { connection: bullmq_redis_1.bullRedis, concurrency: 5 });
exports.matchResumeWorker.on("active", (resume) => {
    console.log(`🚀 Processing resume ${resume.id}`);
});
exports.matchResumeWorker.on("completed", (resume, result) => {
    console.log(`✅ Resume ${resume.id} completed with result:`, result);
});
exports.matchResumeWorker.on("failed", (resume, err) => {
    console.error(`❌ Job ${resume?.id} failed:`, err);
});
