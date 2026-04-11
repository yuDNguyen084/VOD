import { Request, Response } from 'express';
import { VideoService } from './video.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class VideoController {
  static getVideos = catchAsync(async (req: Request, res: Response) => res.json(await VideoService.list(req.query)));
  static requestUpload = catchAsync(async (req: Request, res: Response) => res.status(201).json(await VideoService.requestUpload(req.user!.sub, req.body.title, req.body.filename)));
  static confirm = catchAsync(async (req: Request, res: Response) => res.json(await VideoService.confirmUpload(req.params.id)));
  static delete = catchAsync(async (req: Request, res: Response) => res.json(await VideoService.delete(req.params.id, req.user!.sub, req.user!.role)));
}