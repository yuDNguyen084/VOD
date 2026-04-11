import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class AuthController {
  static register = catchAsync(async (req: Request, res: Response) => res.status(201).json(await AuthService.register(req.body)));
  
  static login = catchAsync(async (req: Request, res: Response) => res.json(await AuthService.login(req.body.email, req.body.password)));
  
  static refresh = catchAsync(async (req: Request, res: Response) => res.json(await AuthService.refreshTokens(req.body.refreshToken)));
  
  static logout = catchAsync(async (req: Request, res: Response) => res.json(await AuthService.logout(req.user!.sub)));
}