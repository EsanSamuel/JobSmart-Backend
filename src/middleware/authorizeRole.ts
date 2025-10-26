import { Job, User } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";

const userRepository = new Repository<User>(prisma?.user);
const jobRepository = new Repository<Job>(prisma?.job);

export const isRecruiter = async (userId: string, jobId?: string) => {
  const user = await userRepository.findById(userId, "user");
  const job = await jobRepository.findById(jobId, "job");
  if (user?.role !== "COMPANY") {
    throw new Error("Only Company recruiter can call this function!");
  } else if (user.role === "COMPANY") {
    logger.info("You are eligible to call this function!");
  }
  // Check if user listed the job
  if (jobId && job) {
    if (job?.createdById === user.id) {
      logger.info(
        "You are eligible to call this function because you listed the job!"
      );
    } else {
      throw new Error("Invalivid authorization: You didn't list this job.!");
    }
  }
};
