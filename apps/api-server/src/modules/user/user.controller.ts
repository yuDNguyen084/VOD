import { Request, Response } from 'express';
import { UserService } from './user.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class UserController {
  static getProfile = catchAsync(async (req: Request, res: Response) => {
    res.json(await UserService.getProfile(req.user!.sub));
  });

  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    res.json(await UserService.updateProfile(req.user!.sub, req.body));
  });
}