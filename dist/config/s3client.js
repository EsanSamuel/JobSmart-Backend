"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
exports.s3 = new client_s3_1.S3Client({
    region: "auto",
    endpoint: "https://t3.storage.dev",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
});
