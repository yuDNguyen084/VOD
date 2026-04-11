import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

export const authorize = (roles: string[] = []) => (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError(401, 'Unauthorized'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) return next(new AppError(403, 'Forbidden'));
    next();
  } catch (err) { next(new AppError(401, 'Invalid Token')); }
};