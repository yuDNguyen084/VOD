import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../../s3';

export class StorageService {
  static async getPresignedPutUrl(key: string) {
    return getSignedUrl(s3Client, new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }), { expiresIn: 3600 });
  }
  static async deleteAsset(key: string) {
    return s3Client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
  }
}