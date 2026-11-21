"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const response_1 = require("../utils/response");
const match_service_1 = require("../services/match.service");
const logger_1 = __importDefault(require("../utils/logger"));
const matchService = new match_service_1.JobMatchService();
class MatchController {
    static async MatchJob(req, res) {
        try {
            const jobId = req.params.id;
            const { authId, resumeId } = req.body;
            const file = req.files;
            logger_1.default.info(resumeId);
            if (file.CV?.[0]) {
                if (!resumeId) {
                    const match = await matchService.match(jobId, authId, file.CV?.[0]);
                    if (match) {
                        res.status(201).json(new response_1.ApiSuccess(201, "Job Matched", match));
                    }
                    else {
                        res
                            .status(500)
                            .json(new response_1.ApiError(500, "Something went wrong with matching Job!,", []));
                    }
                }
                else if (resumeId) {
                    const match = await matchService.match(jobId, authId, file.CV?.[0], resumeId);
                    if (match) {
                        res.status(201).json(new response_1.ApiSuccess(201, "Job Matched", match));
                    }
                    else {
                        res
                            .status(500)
                            .json(new response_1.ApiError(500, "Something went wrong with matching Job!,", []));
                    }
                }
            }
        }
        catch (error) {
            res
                .status(500)
                .json(new response_1.ApiError(500, "Something went wrong!,", [error]));
        }
    }
    static async getUserMatches(req, res) {
        const userId = req.params.id;
        try {
            const user = await matchService.getMatch(userId);
            if (user) {
                res
                    .status(200)
                    .json(new response_1.ApiSuccess(200, "User matches fetched successfully", user));
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
exports.MatchController = MatchController;
