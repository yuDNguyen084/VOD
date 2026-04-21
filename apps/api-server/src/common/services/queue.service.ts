import protobuf from 'protobufjs';
import path from 'path';
import { redis } from '../../redis';

export class QueueService {
  private static root: protobuf.Root;

  static async init() { 
    this.root = await protobuf.load(path.resolve(__dirname, '../../../../../packages/shared-types/job.proto')); 
  }

  static async pushJob(data: { jobId: string; videoId: string; rawS3Key: string; hlsS3Key: string }) {
    const JobType = this.root.lookupType('pb.VideoJob');
    const buffer = JobType.encode(JobType.create(data)).finish();
    await redis.lpush('vod_transcoding_queue', Buffer.from(buffer));
  }
}