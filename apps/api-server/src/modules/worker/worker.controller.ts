import { Request, Response } from 'express';
import { WorkerRepository } from './worker.repository';
import { catchAsync } from '../../common/utils/catchAsync';

export class WorkerController {
  static updateProgress = catchAsync(async (req: Request, res: Response) => {
    await WorkerRepository.updateProgress(req.params.id, req.body);
    res.json({ success: true });
  });
}