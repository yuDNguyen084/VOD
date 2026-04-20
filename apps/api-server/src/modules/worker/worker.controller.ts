import { Request, Response } from 'express';
import { WorkerService } from './worker.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class WorkerController {
  static updateProgress = catchAsync(async (req: Request, res: Response) => {

    await WorkerRepository.updateProgress(req.params.id as string, req.body);
    res.json({ success: true });
    
  });
}