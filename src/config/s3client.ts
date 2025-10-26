import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: "auto",
  endpoint: "https://t3.storage.dev",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});
