import { Role } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        sub: string;
        email: string;
        role: Role;
      };
    }
  }
}