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

  static handleJobAction = catchAsync(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const { action } = req.body;
    res.json(await AdminService.handleJobAction(jobId as string, action));
  });
}