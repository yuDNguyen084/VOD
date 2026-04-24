import { prisma } from '../../database';
import { JobStatus } from '@prisma/client';

export class AdminRepository {
  static getActiveJobsCount = () => prisma.mediaJob.count({ where: { status: JobStatus.RUNNING } });
  
  static getVideoByJobId = async (jobId: string) => {
    const job = await prisma.mediaJob.findUnique({
      where: { id: jobId },
      include: { video: true }
    });
    return job?.video;
  };
}