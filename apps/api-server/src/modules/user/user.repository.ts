import { prisma } from '../../database';

const userPublicSelect = {
  id: true,
  email: true,
  role: true,
  username: true,
  bio: true,
  avatarUrl: true,
  createdAt: true,
};

export class UserRepository {
  static findById = (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: userPublicSelect,
    });

  static findByUsername = (username: string) =>
    prisma.user.findUnique({
      where: { username },
      select: userPublicSelect,
    });

  static searchByUsername = (query: string, page: number, limit: number) =>
    prisma.user.findMany({
      where: { username: { contains: query, mode: 'insensitive' } },
      select: userPublicSelect,
      skip: (page - 1) * limit,
      take: limit,
    });

  static countByUsername = (query: string) =>
    prisma.user.count({
      where: { username: { contains: query, mode: 'insensitive' } },
    });

  static update = (id: string, data: any) =>
    prisma.user.update({
      where: { id },
      data,
      select: userPublicSelect,
    });

  static findUserVideos = (userId: string, page: number, limit: number) =>
    prisma.video.findMany({
      where: { creatorId: userId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        hlsUrl: true,
        status: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          }
        }
      },
    });

  static countUserVideos = (userId: string) =>
    prisma.video.count({ where: { creatorId: userId, deletedAt: null } });
}