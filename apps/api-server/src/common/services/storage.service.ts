import { PutObjectCommand, DeleteObjectCommand, PutBucketCorsCommand, HeadBucketCommand, CreateBucketCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../s3';

export class StorageService {
  static async ensureBucketExists() {
    const bucketName = process.env.S3_BUCKET_NAME!;
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        console.log(`🪣 Bucket ${bucketName} not found. Creating...`);
        await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`🪣 Bucket ${bucketName} created successfully.`);
      } else {
        throw error;
      }
    }
  }

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

  static async ensureS3Policy() {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${process.env.S3_BUCKET_NAME}/*`]
        }
      ]
    };
    
    const { PutBucketPolicyCommand } = await import('@aws-sdk/client-s3');
    await s3Client.send(new PutBucketPolicyCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Policy: JSON.stringify(policy)
    }));
  }

  static async getPresignedPutUrl(key: string) {
    return getSignedUrl(s3Client, new PutObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }), { expiresIn: 3600 });
  }

  static async deleteAsset(key: string) {
    return s3Client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: key }));
  }
}