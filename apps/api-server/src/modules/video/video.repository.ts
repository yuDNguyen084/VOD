import { prisma } from '../../database';

export class VideoRepository {
  static create = (data: any) => prisma.video.create({ data });
  static update = (id: string, data: any) => prisma.video.update({ where: { id }, data });
  static findMany = (q: any) => prisma.video.findMany({ ...q, where: { ...q.where, deletedAt: null }, include: { job: true } });
  static count = (w: any) => prisma.video.count({ where: { ...w, deletedAt: null } });
  static findById = (id: string) => prisma.video.findFirst({ where: { id, deletedAt: null }, include: { job: true } });
  static softDelete = (id: string) => prisma.video.update({ where: { id }, data: { deletedAt: new Date() } });
  static updateMetadata = (id: string, title: string) => prisma.video.update({ where: { id }, data: { title } });
}