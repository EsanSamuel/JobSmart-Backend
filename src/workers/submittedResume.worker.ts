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
const resumeRepository = new Repository<Resume & { user: User }[]>(
  prisma?.resume
);

interface MatchResumeInterface {
  jobId: string;
  resumes: Resume[];
}

export const matchResumeWorker = new Worker<MatchResumeInterface>(
  "match_resume",
  async (jobs: Job<MatchResumeInterface>) => {
    const { jobId, resumes } = jobs.data;
    for (const resume of resumes) {
      if (resume.matchPercentage && resume.matchedSkills?.length > 0) {
        logger.info(
          `Skipping ${resume.userId} — already has match data (${resume.matchPercentage}%)`
        );
        continue;
      }
      const parsedText = resume.parsedText;
      logger.info(parsedText);
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
        logger.error("Gemini API failed or quota exceeded, skipping DB insert");
        continue;
      }
      const cleaned = analyzeMatch?.replace(/```json|```/g, "").trim();
      const parsedResponse = JSON.parse(cleaned as string);
      logger.info(parsedResponse);

      const matched_percentage = parsedResponse.match_percentage;
      const matched_skills = parsedResponse.matched_skills;
      const missing_skills = parsedResponse.missing_skills;
      const summary = parsedResponse.summary;

      const data = {
        matchPercentage: matched_percentage,
        matchedSkills: matched_skills,
        missingSkills: missing_skills,
        summary,
      } satisfies Prisma.ResumeUpdateInput;

      await resumeRepository.update(resume.id, data);
    }
    const updatedResumes = await resumeRepository.findAll(
      jobId,
      "submittedResume"
    );
    return updatedResumes as Resume[];
  },
  { connection: bullRedis, concurrency: 5 }
);

matchResumeWorker.on("active", (resume) => {
  console.log(`🚀 Processing resume ${resume.id}`);
});

matchResumeWorker.on("completed", (resume, result) => {
  console.log(`✅ Resume ${resume.id} completed with result:`, result);
});

matchResumeWorker.on("failed", (resume, err) => {
  console.error(`❌ Job ${resume?.id} failed:`, err);
});
