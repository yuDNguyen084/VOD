import { logger } from '../utils/logger';
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  const code = err.statusCode || 500;
  logger.error(`[${req.method}] ${req.url} - ${code} - ${err.message}`);
  res.status(code).json({ success: false, message: err.message });
};