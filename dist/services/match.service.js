"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobMatchService = void 0;
const aws_1 = require("../libs/aws");
const repository_1 = require("../repository/base/repository");
const logger_1 = __importDefault(require("../utils/logger"));
const matchjob_queue_1 = require("../queue/matchjob.queue");
const prisma_1 = __importDefault(require("../config/prisma"));
const jobRepository = new repository_1.Repository(prisma_1.default?.job);
const userRepository = new repository_1.Repository(prisma_1.default?.user);
const matchRepository = new repository_1.Repository(prisma_1.default?.match);
class JobMatchService {
    async match(jobId, userId, cvFile, resumeId) {
        try {
            const CVurl = await (0, aws_1.getPresignedUrl)(cvFile);
            if (!resumeId) {
                const match = await matchjob_queue_1.MatchJobQueue.add("match_job", {
                    jobId,
                    userId,
                    CVurl,
                }, {
                    attempts: 5,
                    backoff: {
                        type: "exponential",
                        delay: 10000,
                    },
                });
                const result = await match.waitUntilFinished(matchjob_queue_1.matchJobEvents);
                await matchjob_queue_1.MatchJobQueue.close();
                return result;
            }
            else if (resumeId) {
                const match = await matchjob_queue_1.MatchJobQueue.add("match_job", {
                    jobId,
                    userId,
                    CVurl,
                    resumeId,
                }, {
                    attempts: 5,
                    backoff: {
                        type: "exponential",
                        delay: 10000,
                    },
                });
                const result = await match.waitUntilFinished(matchjob_queue_1.matchJobEvents);
                await matchjob_queue_1.MatchJobQueue.close();
                return result;
            }
        }
        catch (error) {
            logger_1.default.error("Something went wrong with matching job" + error);
        }
    }
    async getMatch(userId) {
        try {
            const match = await matchRepository.findAll(userId, "matched");
            if (match) {
                return match;
            }
        }
        catch (error) {
            logger_1.default.error("Something went wrong with matching job" + error);
        }
    }
}
exports.JobMatchService = JobMatchService;
