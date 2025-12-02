import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function createPresignedPutUrl({ bucket, childId, filename, contentType, expiresIn = 120 }) {
  const ext = filename.includes('.') ? filename.split('.').pop() : '';
  const key = `kidshub/${process.env.NODE_ENV || 'prod'}/children/${childId}/photos/${randomUUID()}${ext ? '.'+ext : ''}`;
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType, ACL: "private" });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn });
  return { uploadUrl, key };
}

export async function headObject({ bucket, key }) {
  const cmd = new HeadObjectCommand({ Bucket: bucket, Key: key });
  return s3.send(cmd);
}

export async function getPresignedGetUrl({ bucket, key, expiresIn = 300 }) {
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(s3, cmd, { expiresIn });
}
