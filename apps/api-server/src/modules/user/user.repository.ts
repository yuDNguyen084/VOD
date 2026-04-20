import { prisma } from '../../database';

export class UserRepository {
  static findById = (id: string) => prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, role: true, createdAt: true }
  });

  static update = (id: string, data: any) => prisma.user.update({
    where: { id },
    data
  });
}