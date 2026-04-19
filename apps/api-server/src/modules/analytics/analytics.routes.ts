import { Router } from 'express';
import { AnalyticsController } from './analytics.controller';
import { authorize } from '../../common/middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authorize([Role.ADMIN]));

router.get('/storage', AnalyticsController.getStorageStats);
router.get('/logs', AnalyticsController.getSystemLogs);

export default router;