import { Worker, Job } from "bullmq";
import { Multer } from "multer";
import {
  Job as Jobs,
  Match,
  Prisma,
  Resume,
  User,
} from "../generated/prisma/client";
import { getPresignedUrl } from "../libs/aws";
import { Repository } from "../repository/base/repository";
import logger from "../utils/logger";
import { CVParser } from "../libs/pdf-parser";
import { AnalyzeMatch } from "../ai/gemini";
import { bullRedis } from "../config/bullmq-redis";
import prisma from "../config/prisma";

const jobRepository = new Repository<Jobs>(prisma?.job);
const userRepository = new Repository<User & { Resume: Resume[] }>(
  prisma?.user
);
const matchRepository = new Repository<Match>(prisma?.match);

interface MatchJobInterface {
  jobId: string;
  userId: string;
  CVurl: string;
  resumeId?: string;
}

export const matchJobWorker = new Worker<MatchJobInterface>(
  "match_job",
  async (job: Job<MatchJobInterface>) => {
    const { jobId, userId, CVurl, resumeId } = job.data;
    const pdfWithUUID = CVurl.split("/").pop();
    const pdfName = pdfWithUUID?.split("=")[1];

    try {
      if (!resumeId) {
        const existingMatchInDB = await matchRepository.findFirst(
          jobId,
          userId,
          "matched",
          pdfName
        );
        if (existingMatchInDB) {
          return existingMatchInDB;
        }
        const job = await jobRepository.findById(jobId, undefined, "job");
        const parseCVurlText = await CVParser(CVurl as string);
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

        const analyzeMatch = await AnalyzeMatch(prompt);

        if (!analyzeMatch || analyzeMatch.includes("quota")) {
          logger.error(
            "Gemini API failed or quota exceeded, skipping DB insert"
          );
          return null;
        }
        const cleaned = analyzeMatch?.replace(/```json|```/g, "").trim();
        const parsedResponse = JSON.parse(cleaned as string);

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
        } satisfies Prisma.MatchCreateInput;

        const saveMatchingToDB = await matchRepository.create(data);
        return saveMatchingToDB;
      } else if (resumeId) {
        const existingMatchInDB = await matchRepository.findFirst(
          jobId,
          userId,
          "matched",
          pdfName
        );
        if (existingMatchInDB) {
          return existingMatchInDB;
        }
        const user = await userRepository.findById(userId, undefined, "user");
        const userResume = user?.Resume.filter(
          (resume) => resume.jobId === null
        );

        const parsedText = userResume?.[0]?.parsedText;
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

        const analyzeMatch = await AnalyzeMatch(prompt);

        if (!analyzeMatch || analyzeMatch.includes("quota")) {
          logger.error(
            "Gemini API failed or quota exceeded, skipping DB insert"
          );
          return null;
        }
        const cleaned = analyzeMatch?.replace(/```json|```/g, "").trim();
        const parsedResponse = JSON.parse(cleaned as string);

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
        } satisfies Prisma.MatchCreateInput;

        const saveMatchingToDB = await matchRepository.create(data);
        return saveMatchingToDB;
      }
    } catch (error) {
      logger.error("Something went wrong with matching job" + error);
    }
  },
  { connection: bullRedis, concurrency: 5, autorun: false }
);
