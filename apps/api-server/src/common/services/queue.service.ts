import protobuf from 'protobufjs';
import path from 'path';
import { redis } from '../../redis';

export class QueueService {
  private static root: protobuf.Root;
  static async init() { this.root = await protobuf.load(path.resolve(__dirname, '../../../../../packages/shared-types/job.proto')); }
  static async pushJob(data: any) {
    const JobType = this.root.lookupType('job.MediaJobData');
    await redis.lpush('video_tasks', Buffer.from(JobType.encode(JobType.create(data)).finish()));
  }
}