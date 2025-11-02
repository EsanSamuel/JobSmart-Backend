import { Job, Prisma, Resume, User } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";
import { getPresignedUrl } from "../libs/aws";
import { CVParser } from "../libs/pdf-parser";
import { getEmbedding } from "../ai/gemini";

const userRepository = new Repository<User & { Resume: Resume[] }>(
  prisma?.user
);
const resumeRepository = new Repository<Resume>(prisma?.resume);

export class UserService {
  async createUser(data: any) {
    try {
      const user = await userRepository.create(data);
      logger.info(user);
      if (user) {
        return user as User;
      } else {
        logger.info("Error creating user");
      }
    } catch (error) {
      logger.info("Error creating user" + error);
    }
  }

  async getUser(userId: string) {
    try {
      const user = await userRepository.findById(userId, undefined, "user");
      if (user) {
        console.log(user);
        return user as User;
      }
    } catch (error) {
      logger.info("Error fetching user" + error);
    }
  }

  async getUsers(params?: {
    filter?: any;
    skip?: any;
    take?: number;
    orderBy?: "asc" | "desc";
  }) {
    try {
      const accounts = await userRepository.findAll(undefined, "user", params);

      const users = accounts.filter((account) => account.role === "USER");
      if (users) {
        return users as User[];
      }
    } catch (error) {
      logger.info("Error fetching user" + error);
    }
  }

  async getCompanies(params?: {
    filter?: any;
    skip?: any;
    take?: number;
    orderBy?: "asc" | "desc";
  }) {
    try {
      const accounts = await userRepository.findAll(undefined, "user", params);

      const companies = accounts.filter(
        (account) => account.role === "COMPANY"
      );
      if (companies) {
        return companies as User[];
      }
    } catch (error) {
      logger.info("Error fetching user" + error);
    }
  }

  async appliedJobs(userId: string) {
    try {
      const applied = await resumeRepository.findAll(userId, "appliedJobs");

      if (applied) {
        return applied as Resume[];
      }
    } catch (error) {
      logger.info("Error fetching user" + error);
    }
  }

  async updateProfile(userId: string, skills: string[]) {
    try {
      const user = await userRepository.findById(userId, "user");
      const parsedText = user?.Resume?.[0]?.parsedText;

      const embedContent: number[] | undefined | any =
        (await getEmbedding(`${parsedText} ${skills}`)) || undefined;

      const data: any = {
        skills,
      } satisfies Prisma.UserUpdateInput;

      const profile = await userRepository.update(user?.id as string, data);
      logger.info(profile);
      if (profile) {
        const data = {
          embedding: embedContent,
        } satisfies Prisma.ResumeUpdateInput;
        const updateResumeEmbedding = await resumeRepository.update(
          user?.Resume?.[0]?.id as string,
          data
        );
        console.log(updateResumeEmbedding);
        return profile as User;
      } else {
        logger.info("Error updating user profile");
      }
    } catch (error) {
      logger.info("Error updating user profile" + error);
    }
  }

  async uploadResume(authId: string, file: Express.Multer.File) {
    try {
      const hasUserUploaded = await resumeRepository.findFirst(
        authId,
        undefined,
        "resume"
      );
      if (hasUserUploaded) {
        logger.info("This user has already uploaded a resume");
        return;
      }

      const url = await getPresignedUrl(file);
      const parsedText = await CVParser(url as string);
      const user = await userRepository.findById(authId, undefined, "user");
      const userSkills = user?.skills;

      const embedContent: number[] | undefined | any =
        (await getEmbedding(`${parsedText} ${userSkills}`)) || undefined;

      const data = {
        fileUrl: url as string,
        parsedText,
        embedding: embedContent,
        user: {
          connect: {
            id: authId,
          },
        },
      } satisfies Prisma.ResumeCreateInput;
      const resume = await resumeRepository.create(data);
      if (resume) {
        return resume as Resume;
      }
    } catch (error) {
      logger.info("Error uploading resume" + error);
    }
  }
}
