import { Request, Response } from 'express';
import { CreatorService } from './creator.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class CreatorController {
  static getDashboard = catchAsync(async (req: Request, res: Response) => {
    res.json(await CreatorService.getDashboardData(req.user!.sub));
  });
}