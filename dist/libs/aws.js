"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPresignedUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("../utils/logger"));
const s3client_1 = require("../config/s3client");
const getPresignedUrl = async (file) => {
    try {
        if (!file.originalname || !file.mimetype || !file.size) {
            logger_1.default.error("File data is required!");
            return null;
        }
        const uniqueKey = `${(0, uuid_1.v4)()}=${file.originalname}`;
        const command = new client_s3_1.PutObjectCommand({
            Key: uniqueKey,
            ContentLength: file.size,
            ContentType: file.mimetype,
            Bucket: process.env.S3_BUCKET_NAME,
        });
        logger_1.default.info("Generating presignedUrl...");
        const presignedUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3client_1.s3, command, {
            expiresIn: 3600,
        });
        logger_1.default.info(`Presigned Url generated: ${presignedUrl}`);
        const permanentUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;
        logger_1.default.info(`File uploaded permanently: ${permanentUrl}`);
        const fileBuffer = file.buffer;
        await axios_1.default.put(presignedUrl, fileBuffer, {
            headers: {
                "Content-Type": file.mimetype,
            },
        });
        return permanentUrl;
    }
    catch (error) {
        logger_1.default.error(error);
        return [];
    }
};
exports.getPresignedUrl = getPresignedUrl;
