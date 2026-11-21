"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_1 = require("../utils/response");
const user_service_1 = require("../services/user.service");
const logger_1 = __importDefault(require("../utils/logger"));
const auth_service_1 = require("../services/auth.service");
const userService = new user_service_1.UserService();
const authService = new auth_service_1.AuthService();
class UserController {
    static async createUser(req, res) {
        try {
            const { username, email, password, role } = req.body;
            const user = await authService.register(username, email, password, role);
            logger_1.default.info(user);
            if (user) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "User created successfully", user));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await authService.login(email, password);
            logger_1.default.info(user);
            if (user) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "User login successfully", user));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async google_oauth(req, res) {
        try {
            const { username, email, image, role } = req.body;
            const user = await authService.google_oauth(username, email, image, role);
            logger_1.default.info(user);
            if (user) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "User login successfully", user));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async reset_password_request(req, res) {
        try {
            const { email } = req.body;
            const request = await authService.resetPasswordRequest(email);
            logger_1.default.info(request);
            if (request) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Request successfully", request));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async verifyEmail(req, res) {
        try {
            const { token } = req.body;
            const request = await authService.verifyEmail(token);
            logger_1.default.info(request);
            if (request) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Verification successfully", request));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async verifyAllEmails(req, res) {
        try {
            const request = await authService.verifyAllEmails();
            logger_1.default.info(request);
            if (request) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "All users verification successfully", request));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async reset_password(req, res) {
        try {
            const { token, password } = req.body;
            const request = await authService.resetPassword(token, password);
            logger_1.default.info(request);
            if (request) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Password changed successfully!", request));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getUser(req, res) {
        const userId = req.params.id;
        try {
            const user = await userService.getUser(userId);
            if (user) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "User fetched successfully", user));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getUsers(req, res) {
        const params = req.query;
        const { filter, skip, take, orderBy } = params;
        try {
            const users = await userService.getUsers({
                filter: filter,
                skip: Number(skip) || undefined,
                take: Number(take) || undefined,
                orderBy: orderBy,
            });
            if (users) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "User fetched successfully", users));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getCompanies(req, res) {
        const params = req.query;
        const { filter, skip, take, orderBy } = params;
        try {
            const companies = await userService.getCompanies({
                filter: filter,
                skip: Number(skip) || undefined,
                take: Number(take) || undefined,
                orderBy: orderBy,
            });
            if (companies) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "Companies fetched successfully", companies));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async updateUser(req, res) {
        try {
            const authId = req.params.id;
            const { skills } = req.body;
            const user = await userService.updateProfile(authId, skills);
            logger_1.default.info(user);
            if (user) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "User created successfully", user));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async uploadResume(req, res) {
        try {
            const { authId } = req.body;
            const files = req.files;
            if (files.CV?.[0]) {
                const resume = await userService.uploadResume(authId, files.CV[0]);
                logger_1.default.info(resume);
                if (resume) {
                    res
                        .status(201)
                        .json(new response_1.ApiSuccess(201, "Resume uploaded successfully", resume));
                }
                else {
                    res
                        .status(200)
                        .json(new response_1.ApiSuccess(200, "This user has already uploaded a resume!,", []));
                }
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async uploadProfileImage(req, res) {
        try {
            const { userId } = req.body;
            const files = req.files;
            if (files.file?.[0]) {
                const profile = await userService.updateProfileImage(userId, files.file[0]);
                logger_1.default.info(profile);
                if (profile) {
                    res
                        .status(201)
                        .json(new response_1.ApiSuccess(201, "Profile picture uploaded successfully", profile));
                }
                else {
                    res
                        .status(500)
                        .json(new response_1.ApiError(500, "Something went wrong!,", []));
                }
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async appliedJobs(req, res) {
        try {
            const authId = req.params.id;
            const resume = await userService.appliedJobs(authId);
            logger_1.default.info(resume);
            if (resume) {
                res
                    .status(201)
                    .json(new response_1.ApiSuccess(201, "Resume uploaded successfully", resume));
            }
            else {
                res.status(500).json(new response_1.ApiError(500, "Something went wrong!,", []));
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
}
exports.default = UserController;
