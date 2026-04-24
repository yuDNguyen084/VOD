import { UserRepository } from './user.repository';
import { AppError } from '../../common/utils/AppError';

export class UserService {
  static async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  static async getPublicProfile(identifier: string) {
    // Try by id first, then by username
    let user = await UserRepository.findById(identifier).catch(() => null);
    if (!user) {
      user = await UserRepository.findByUsername(identifier);
    }
    if (!user) throw new AppError(404, 'User not found');
    return user;
  }

  static async updateProfile(userId: string, updateData: any) {
    // Strip out protected fields
    const { passwordHash, refreshToken, email, role, ...safe } = updateData;
    return UserRepository.update(userId, safe);
  }

  static async getUserVideos(userId: string, page = 1, limit = 8) {
    const [data, total] = await Promise.all([
      UserRepository.findUserVideos(userId, page, limit),
      UserRepository.countUserVideos(userId),
    ]);
    return { data, total, page, limit };
  }

  static async searchUsers(query: string, page = 1, limit = 10) {
    const [data, total] = await Promise.all([
      UserRepository.searchByUsername(query, page, limit),
      UserRepository.countByUsername(query),
    ]);
    return { data, total, page, limit };
  }
}