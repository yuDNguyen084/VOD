import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class AnalyticsController {
  static getStorageStats = catchAsync(async (req: Request, res: Response) => {
    res.json(await AnalyticsService.getStorageStats());
  });

  static getSystemLogs = catchAsync(async (req: Request, res: Response) => {
    res.json(await AnalyticsService.getSystemLogs());
  });
}