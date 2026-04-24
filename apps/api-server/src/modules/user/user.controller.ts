import { Request, Response } from 'express';
import { UserService } from './user.service';
import { catchAsync } from '../../common/utils/catchAsync';

export class UserController {
  /** GET /users/profile – current user's own profile */
  static getProfile = catchAsync(async (req: Request, res: Response) => {
    res.json(await UserService.getProfile(req.user!.sub));
  });

  /** PUT /users/profile – update own profile (username, bio, avatarUrl) */
  static updateProfile = catchAsync(async (req: Request, res: Response) => {
    res.json(await UserService.updateProfile(req.user!.sub, req.body));
  });

  /** GET /users/:identifier – public profile by userId or username */
  static getPublicProfile = catchAsync(async (req: Request, res: Response) => {
    res.json(await UserService.getPublicProfile(req.params.identifier as string));
  });

  /** GET /users/:id/videos?page=1&limit=8 */
  static getUserVideos = catchAsync(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    res.json(await UserService.getUserVideos(req.params.id as string, page, limit));
  });

  /** GET /users/search?q=username&page=1 */
  static searchUsers = catchAsync(async (req: Request, res: Response) => {
    const q = (req.query.q as string) || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    res.json(await UserService.searchUsers(q, page, limit));
  });
}