import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import authRoutes from '../modules/auth/auth.routes';
import videoRoutes from '../modules/video/video.routes';
import internalRoutes from '../modules/worker/worker.routes';
import userRoutes from '../modules/user/user.routes';
import adminRoutes from '../modules/admin/admin.routes';
import analyticsRoutes from '../modules/analytics/analytics.routes';
import creatorRoutes from '../modules/creator/creator.routes';

const router = Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.use('/auth', authLimiter, authRoutes);
router.use('/videos', videoRoutes);
router.use('/internal', internalRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/creator', creatorRoutes);

export default router;