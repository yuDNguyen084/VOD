import { UserRepository } from './user.repository';
import { AppError } from '../../common/utils/AppError';

export class UserService {
  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  static async updateProfile(userId: string, updateData: any) {
    return UserRepository.update(userId, updateData);
  }
}