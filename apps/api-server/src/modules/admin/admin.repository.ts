import { prisma } from '../../database';
import { JobStatus } from '@prisma/client';

export class AdminRepository {
  static getActiveJobs = () => prisma.mediaJob.findMany({ where: { status: JobStatus.RUNNING } });
}