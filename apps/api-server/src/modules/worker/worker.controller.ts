import { Request, Response } from 'express';
import { WorkerService } from './worker.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class WorkerController {
  static updateProgress = catchAsync(async (req: Request, res: Response) => {
    const jobId = req.params.id as string; 
    
    const result = await WorkerService.handleProgressUpdate(jobId, req.body);
    res.json({ success: true, data: result });
  });
}