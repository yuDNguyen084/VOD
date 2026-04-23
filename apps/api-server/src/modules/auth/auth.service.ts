import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AuthRepository } from './auth.repository';
import { AppError } from '../../common/utils/AppError';

export class AuthService {
  
  private static generateTokens(user: any) {
    const payload = { sub: user.id, role: user.role, email: user.email };
    
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
  }

  static async register(data: any) {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await AuthRepository.create({ email: data.email, passwordHash: hashed, role: 'CREATOR' });
    return { message: 'Register successfully', userId: user.id };
  }

  static async login(email: string, pass: string) {
    const user = await AuthRepository.findByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.passwordHash))) throw new AppError(401, 'Invalid email or password');
    
    const tokens = this.generateTokens(user);
    
    // Hash Refresh Token trước khi lưu vào DB (Giống như hash password)
    const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);
    await AuthRepository.updateRefreshToken(user.id, hashedRt);

    return tokens;
  }

  static async refreshTokens(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      
      const user = await AuthRepository.findById(decoded.sub);
      if (!user || !user.refreshToken) throw new AppError(401, 'Access denied');

      const rtMatches = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!rtMatches) throw new AppError(401, 'Invalid token');

      const tokens = this.generateTokens(user);
      
      const hashedRt = await bcrypt.hash(tokens.refreshToken, 10);
      await AuthRepository.updateRefreshToken(user.id, hashedRt);

      return tokens;
    } catch (e) {
      throw new AppError(401, 'Refresh Token is invalid or has expired');
    }
  }

  static async logout(userId: string) {
    await AuthRepository.updateRefreshToken(userId, null);
    return { success: true, message: 'Logged out successfully' };
  }
}