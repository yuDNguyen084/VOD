import { prisma } from '../../database';
export class AuthRepository {
  static findByEmail = (email: string) => prisma.user.findUnique({ where: { email } });
  static findById = (id: string) => prisma.user.findUnique({ where: { id } });
  static create = (data: any) => prisma.user.create({ data });
  
  static updateRefreshToken = (id: string, token: string | null) => 
    prisma.user.update({ where: { id }, data: { refreshToken: token } });
}