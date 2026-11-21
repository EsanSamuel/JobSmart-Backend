import { Job, User } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";

const userRepository = new Repository<User>(prisma?.user);
const jobRepository = new Repository<Job>(prisma?.job);

export const isRecruiter = async (userId: string, jobId?: string) => {
  const user = await userRepository.findById(userId, undefined, "user");
  const job = await jobRepository.findById(jobId, undefined, "job");
  if (user?.role !== "COMPANY") {
    throw new Error("Only Company recruiter can call this function!");
  }
  // Check if user listed the job
  if (jobId && job && job.createdById !== user.id) {
    throw new Error("Invalivid authorization: You didn't list this job.!");
  }
};
