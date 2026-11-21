"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../utils/logger"));
const redis_1 = __importDefault(require("../config/redis"));
class RedisService {
    async set(key, value, ttl) {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        if (ttl) {
            await redis_1.default.setex(key, ttl, stringValue);
            logger_1.default.info(`${key} has been stored in redis`);
        }
        else {
            await redis_1.default.set(key, stringValue);
            logger_1.default.info(`${key} has been stored in redis`);
        }
    }
    async get(key) {
        const data = await redis_1.default.get(key);
        if (data === null)
            return null;
        const stringData = data.toString();
        try {
            return JSON.parse(stringData);
        }
        catch {
            return stringData;
        }
    }
    async del(key) {
        if (!key)
            return;
        await redis_1.default.del(key);
        logger_1.default.info(`${key} has been deleted from redis`);
    }
    async exist(key) {
        return (await redis_1.default.exists(key)) === 1;
    }
    async flushdb() {
        await redis_1.default.flushdb();
        logger_1.default.info("Redis DB has been clear!");
    }
    async delByPattern(pattern) {
        const stream = redis_1.default.scanStream({
            match: pattern,
            count: 100,
        });
        return new Promise((resolve, reject) => {
            stream.on("data", async (keys) => {
                if (keys.length > 0) {
                    await redis_1.default.del(...keys);
                    logger_1.default.info(`Deleted ${keys.length} cache keys for pattern: ${pattern}`);
                }
            });
            stream.on("end", () => {
                logger_1.default.info(`Finished deleting all keys for pattern: ${pattern}`);
                resolve();
            });
            stream.on("error", (err) => {
                logger_1.default.error(`Error while deleting pattern ${pattern}:` + err);
                reject(err);
            });
        });
    }
}
exports.default = RedisService;
