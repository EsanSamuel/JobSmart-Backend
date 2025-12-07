import { Job, Prisma, Resume, User } from "../generated/prisma/client";
import { Repository } from "../repository/base/repository";
import prisma from "../config/prisma";
import logger from "../utils/logger";
import { getPresignedUrl } from "../libs/aws";
import { CVParser } from "../libs/pdf-parser";
import { getEmbedding } from "../ai/gemini";
import bcyrpt from "bcryptjs";
import crypto from "crypto";
import { sendResetEmail } from "../libs/sendresetEmail";
import { sendVerificationEmail } from "../libs/sendVerificationEmail";

const userRepository = new Repository<User & { Resume: Resume[] }>(
  prisma?.user
);

export class AuthService {
  async register(
    username: string,
    email: string,
    password: string,
    role: string
  ) {
    try {
      if (!username || !email || !password) {
        throw new Error("No Credentials");
      }
      logger.info(role);
      const uniqueName = email.split("@")[0];

      const userExists = await userRepository.findById(
        undefined,
        email,
        "userExists"
      );

      const hashedPassword = await bcyrpt.hash(password, 10);
      const token = crypto.randomBytes(35).toString("hex");

      if (!userExists) {
        let signInRole = "";
        if (role === "USER") {
          signInRole = "USER";
        } else if (role === "COMPANY") {
          signInRole = "COMPANY";
        }
        const data = {
          username,
          email,
          hashedPassword,
          uniqueName,
          role: signInRole as "USER" | "COMPANY",
          verificationToken: token,
        } satisfies Prisma.UserCreateInput;

        const user = await userRepository.create(data);

        if (user) {
          await sendVerificationEmail(email, token);
        }
        logger.info(user);
        return user;
      }
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async verifyEmail(token: string) {
    try {
      if (!token) {
        throw new Error("No token");
      }

      const userToken = await prisma.user.findFirst({
        where: {
          verificationToken: token,
        },
      });

      const data = {
        emailVerified: new Date(),
        verificationToken: null,
      } satisfies Prisma.UserUpdateInput;

      const user = await userRepository.update(userToken?.id!, data);
      return user;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new Error("No Credentials");
      }

      const user = await userRepository.findById(
        undefined,
        email,
        "userExists"
      );

      if (!user) {
        throw new Error("This User does not exist.");
      }

      const isPasswordCorrect = await bcyrpt.compare(
        password,
        user.hashedPassword!
      );

      if (!isPasswordCorrect) {
        throw new Error("Incorrect Password");
      }

      logger.info(user);
      return user;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async google_oauth(
    username: string,
    email: string,
    image: string,
    role: string
  ) {
    try {
      if (!username || !email) {
        throw new Error("No Credentials");
      }

      const userExists = await userRepository.findById(
        undefined,
        email,
        "userExists"
      );

      if (!userExists) {
        // User doesn't exist - create new user
        const data = {
          username,
          email,
          profileImage: image,
          role: role as "USER" | "COMPANY",
        } satisfies Prisma.UserCreateInput;
        const user = await userRepository.create(data);
        logger.info("New user created:" + user);
        return user;
      } else {
        // User already exists - return existing user
        logger.info("Existing user logging in:" + userExists);
        return userExists;
      }
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async resetPasswordRequest(email: string) {
    try {
      const user = await userRepository.findById(
        undefined,
        email,
        "userExists"
      );
      const token = crypto.randomBytes(35).toString("hex");

      const data = {
        resetToken: token,
        tokenExpires: new Date(Date.now() + 30 * 60 * 1000),
      } satisfies Prisma.UserUpdateInput;

      const userToken = await userRepository.update(user?.id!, data);

      await sendResetEmail(email, token);

      return userToken;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          tokenExpires: { gt: new Date() },
        },
      });

      const hashedPassword = await bcyrpt.hash(newPassword, 10);

      const data = {
        hashedPassword,
        resetToken: null,
      } satisfies Prisma.UserUpdateInput;

      const updatePassword = await userRepository.update(user?.id!, data);

      return updatePassword;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }
}
