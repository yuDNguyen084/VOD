import { PutObjectCommand, DeleteObjectCommand, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../s3';

export class StorageService {
  static async ensureS3Cors() {
    const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(o => o.trim());
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedOrigins: corsOrigins,
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    }));
  }

  static async getPresignedPutUrl(key: string) {
    return getSignedUrl(s3Client, new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }), { expiresIn: 3600 });
  }

  static async deleteAsset(key: string) {
    return s3Client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
  }
}