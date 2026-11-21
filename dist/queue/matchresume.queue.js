"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchResumeEvents = exports.MatchResumeQueue = void 0;
const bullmq_1 = require("bullmq");
const bullmq_redis_1 = require("../config/bullmq-redis");
exports.MatchResumeQueue = new bullmq_1.Queue("match_resume", {
    connection: bullmq_redis_1.bullRedis,
});
exports.matchResumeEvents = new bullmq_1.QueueEvents("match_resume", {
    connection: bullmq_redis_1.bullRedis,
});
