import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidu4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import { Readable } from "stream";
import logger from "../utils/logger";
import { s3 } from "../config/s3client";

export const getPresignedUrl = async (file: Express.Multer.File) => {
  try {
    if (!file.originalname || !file.mimetype || !file.size) {
      logger.error("File data is required!");
      return null;
    }

    const uniqueKey = `${uuidu4()}=${file.originalname}`;

    const command = new PutObjectCommand({
      Key: uniqueKey,
      ContentLength: file.size,
      ContentType: file.mimetype,
      Bucket: process.env.S3_BUCKET_NAME!,
    });

    logger.info("Generating presignedUrl...");
    const presignedUrl = await getSignedUrl(s3, command, {
      expiresIn: 3600,
    });
    logger.info(`Presigned Url generated: ${presignedUrl}`);

    const permanentUrl = `https://${process.env.S3_BUCKET_NAME}.t3.storage.dev/${uniqueKey}`;
    logger.info(`File uploaded permanently: ${permanentUrl}`);

    const fileBuffer = file.buffer;

    await axios.put(presignedUrl, fileBuffer, {
      headers: {
        "Content-Type": file.mimetype,
      },
    });
    return permanentUrl;
  } catch (error) {
    logger.error(error);
    return [];
  }
};
