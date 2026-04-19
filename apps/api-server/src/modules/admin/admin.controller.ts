import { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class AdminController {
  static getPipelineStatus = catchAsync(async (req: Request, res: Response) => {
    res.json(await AdminService.getPipelineStatus());
  });

  static configFFmpeg = catchAsync(async (req: Request, res: Response) => {
    res.json(await AdminService.setFFmpegConfig(req.body));
  });
}