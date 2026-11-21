"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bullRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("../utils/logger"));
exports.bullRedis = new ioredis_1.default({
    host: "redis-11633.c241.us-east-1-4.ec2.cloud.redislabs.com",
    port: 11633,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
});
exports.bullRedis.on("connect", () => {
    logger_1.default.info("BullMq Redis connected successfully!");
});
