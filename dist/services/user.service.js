"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const repository_1 = require("../repository/base/repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const aws_1 = require("../libs/aws");
const pdf_parser_1 = require("../libs/pdf-parser");
const gemini_1 = require("../ai/gemini");
const redis_service_1 = __importDefault(require("./redis.service"));
const userRepository = new repository_1.Repository(prisma_1.default?.user);
const resumeRepository = new repository_1.Repository(prisma_1.default?.resume);
const redisService = new redis_service_1.default();
class UserService {
    async createUser(data) {
        try {
            const user = await userRepository.create(data);
            logger_1.default.info(user);
            if (user) {
                return user;
            }
            else {
                logger_1.default.info("Error creating user");
            }
        }
        catch (error) {
            logger_1.default.error("Error creating user" + error);
        }
    }
    async getUser(userId) {
        try {
            const user = await userRepository.findById(userId, undefined, "user");
            if (user) {
                console.log(user);
                return user;
            }
        }
        catch (error) {
            logger_1.default.error("Error fetching user" + error);
        }
    }
    async getUsers(params) {
        try {
            await redisService.flushdb();
            const accounts = await userRepository.findAll(undefined, "user", params);
            const users = accounts.filter((account) => account.role === "USER");
            if (users) {
                return users;
            }
        }
        catch (error) {
            logger_1.default.error("Error fetching user" + error);
        }
    }
    async getCompanies(params) {
        try {
            const accounts = await userRepository.findAll(undefined, "user", params);
            const companies = accounts.filter((account) => account.role === "COMPANY");
            if (companies) {
                return companies;
            }
        }
        catch (error) {
            logger_1.default.error("Error fetching user" + error);
        }
    }
    async appliedJobs(userId) {
        try {
            const applied = await resumeRepository.findAll(userId, "appliedJobs");
            if (applied) {
                return applied;
            }
        }
        catch (error) {
            logger_1.default.error("Error fetching user" + error);
        }
    }
    async updateProfileImage(userId, file) {
        try {
            const fileUrl = await (0, aws_1.getPresignedUrl)(file);
            const data = {
                profileImage: fileUrl,
            };
            const profile = await userRepository.update(userId, data);
            return profile;
        }
        catch (error) {
            logger_1.default.error("Error updating user profileimage" + error);
        }
    }
    async updateProfile(userId, skills) {
        try {
            const user = await userRepository.findById(userId, "user");
            const parsedText = user?.Resume?.[0]?.parsedText;
            const embedContent = (await (0, gemini_1.getEmbedding)(`${parsedText} ${skills}`)) || undefined;
            const data = {
                skills,
            };
            const profile = await userRepository.update(user?.id, data);
            logger_1.default.info(profile);
            if (profile) {
                const data = {
                    embedding: embedContent,
                };
                const updateResumeEmbedding = await resumeRepository.update(user?.Resume?.[0]?.id, data);
                console.log(updateResumeEmbedding);
                return profile;
            }
            else {
                logger_1.default.error("Error updating user profile");
            }
        }
        catch (error) {
            logger_1.default.error("Error updating user profile" + error);
        }
    }
    async uploadResume(authId, file) {
        try {
            const hasUserUploaded = await resumeRepository.findFirst(authId, undefined, "resume");
            if (hasUserUploaded) {
                logger_1.default.info("This user has already uploaded a resume");
                return;
            }
            const url = await (0, aws_1.getPresignedUrl)(file);
            const parsedText = await (0, pdf_parser_1.CVParser)(url);
            const user = await userRepository.findById(authId, undefined, "user");
            const userSkills = user?.skills;
            const embedContent = (await (0, gemini_1.getEmbedding)(`${parsedText} ${userSkills}`)) || undefined;
            const data = {
                fileUrl: url,
                parsedText,
                embedding: embedContent,
                user: {
                    connect: {
                        id: authId,
                    },
                },
            };
            const resume = await resumeRepository.create(data);
            if (resume) {
                return resume;
            }
        }
        catch (error) {
            logger_1.default.error("Error uploading resume" + error);
        }
    }
}
exports.UserService = UserService;
