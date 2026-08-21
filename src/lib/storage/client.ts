/**
 * Blob Storage Client (S3 / Cloudflare R2 compatible)
 */
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '@/lib/config';

const env = config();

// Ensure the S3 client is a singleton during dev
const globalForS3 = global as unknown as { s3Client: S3Client };

export const s3Client =
  globalForS3.s3Client ||
  new S3Client({
    region: env.S3_REGION || 'auto', // 'auto' is used by Cloudflare R2
    endpoint: env.S3_ENDPOINT,
    credentials: {
      // Dummy credentials for dev if not using real S3
      accessKeyId: env.S3_ACCESS_KEY_ID || 'dev-access',
      secretAccessKey: env.S3_SECRET_ACCESS_KEY || 'dev-secret',
    },
    // Force path style for S3-compatible APIs like MinIO or R2
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  });

if (process.env.NODE_ENV !== 'production') globalForS3.s3Client = s3Client;

const BUCKET = env.S3_BUCKET || 'wemotion-dev';

export async function uploadBuffer(key: string, buffer: Buffer, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  
  await s3Client.send(command);
  // Return the public URL if configured, or a relative asset path
  if (env.S3_PUBLIC_BASE_URL) {
    return `${env.S3_PUBLIC_BASE_URL}/${key}`;
  }
  return `s3://${BUCKET}/${key}`;
}

export async function getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
}

export async function deleteObject(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  await s3Client.send(command);
}
