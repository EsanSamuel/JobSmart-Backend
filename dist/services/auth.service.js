"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const repository_1 = require("../repository/base/repository");
const prisma_1 = __importDefault(require("../config/prisma"));
const logger_1 = __importDefault(require("../utils/logger"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const sendresetEmail_1 = require("../libs/sendresetEmail");
const sendVerificationEmail_1 = require("../libs/sendVerificationEmail");
const userRepository = new repository_1.Repository(prisma_1.default?.user);
class AuthService {
    async register(username, email, password, role) {
        try {
            if (!username || !email || !password) {
                throw new Error("No Credentials");
            }
            logger_1.default.info(role);
            const uniqueName = email.split("@")[0];
            const userExists = await userRepository.findById(undefined, email, "userExists");
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const token = crypto_1.default.randomBytes(35).toString("hex");
            if (!userExists) {
                let signInRole = "";
                if (role === "USER") {
                    signInRole = "USER";
                }
                else if (role === "COMPANY") {
                    signInRole = "COMPANY";
                }
                const data = {
                    username,
                    email,
                    hashedPassword,
                    uniqueName,
                    role: signInRole,
                    verificationToken: token,
                };
                const user = await userRepository.create(data);
                if (user) {
                    await (0, sendVerificationEmail_1.sendVerificationEmail)(email, token);
                }
                logger_1.default.info(user);
                return user;
            }
        }
        catch (error) {
            logger_1.default.error(error);
            return null;
        }
    }
    async verifyEmail(token) {
        try {
            if (!token) {
                throw new Error("No token");
            }
            const userToken = await prisma_1.default.user.findFirst({
                where: {
                    verificationToken: token,
                },
            });
            logger_1.default.info("User Token:" + userToken);
            const data = {
                emailVerified: new Date(),
                verificationToken: null,
            };
            const user = await userRepository.update(userToken?.id, data);
            return user;
        }
        catch (error) {
            logger_1.default.error(error);
            return null;
        }
    }
    async verifyAllEmails() {
        try {
            const users = await userRepository.findAll(undefined, "user");
            const data = {
                emailVerified: new Date(),
                verificationToken: null,
            };
            let results = [];
            for (const user of users) {
                const verified = await userRepository.update(user?.id, data);
                logger_1.default.info(verified);
                results.push(verified);
            }
            return results;
        }
        catch (error) {
            logger_1.default.error(error);
            return null;
        }
    }
    async login(email, password) {
        try {
            if (!email || !password) {
                throw new Error("No Credentials");
            }
            const user = await userRepository.findById(undefined, email, "userExists");
            if (!user?.emailVerified) {
                throw new Error("Email is not verified!");
            }
            if (!user) {
                throw new Error("This User does not exist.");
            }
            const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.hashedPassword);
            if (!isPasswordCorrect) {
                throw new Error("Incorrect Password");
            }
            logger_1.default.info(user);
            return user;
        }
        catch (error) {
            logger_1.default.error(error);
            return null;
        }
    }
    async google_oauth(username, email, image, role) {
        try {
            if (!username || !email) {
                throw new Error("No Credentials");
            }
            const userExists = await userRepository.findById(undefined, email, "userExists");
            if (!userExists) {
                // User doesn't exist - create new user
                const data = {
                    username,
                    email,
                    profileImage: image,
                    role: role,
                };
                const user = await userRepository.create(data);
                logger_1.default.info("New user created:" + user);
                return user;
            }
            else {
                // User already exists - return existing user
                logger_1.default.info("Existing user logging in:" + userExists);
                return userExists;
            }
        }
        catch (error) {
            logger_1.default.error(error);
            return null;
        }
    }
    async resetPasswordRequest(email) {
        try {
            const user = await userRepository.findById(undefined, email, "userExists");
            const token = crypto_1.default.randomBytes(35).toString("hex");
            const data = {
                resetToken: token,
                tokenExpires: new Date(Date.now() + 30 * 60 * 1000),
            };
            const userToken = await userRepository.update(user?.id, data);
            await (0, sendresetEmail_1.sendResetEmail)(email, token);
            return userToken;
        }
        catch (error) {
            logger_1.default.error(error);
            return null;
        }
    }
    async resetPassword(token, newPassword) {
        try {
            const user = await prisma_1.default.user.findFirst({
                where: {
                    resetToken: token,
                    tokenExpires: { gt: new Date() },
                },
            });
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
            const data = {
                hashedPassword,
                resetToken: null,
            };
            const updatePassword = await userRepository.update(user?.id, data);
            return updatePassword;
        }
        catch (error) {
            logger_1.default.error(error);
            return null;
        }
    }
}
exports.AuthService = AuthService;
