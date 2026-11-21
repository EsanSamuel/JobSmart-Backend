"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matchJobEvents = exports.MatchJobQueue = void 0;
const bullmq_1 = require("bullmq");
const bullmq_redis_1 = require("../config/bullmq-redis");
exports.MatchJobQueue = new bullmq_1.Queue("match_job", {
    connection: bullmq_redis_1.bullRedis,
});
exports.matchJobEvents = new bullmq_1.QueueEvents("match_job", {
    connection: bullmq_redis_1.bullRedis,
});
