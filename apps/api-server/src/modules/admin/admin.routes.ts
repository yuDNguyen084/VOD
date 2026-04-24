import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authorize } from '../../common/middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authorize([Role.ADMIN]));

router.get('/pipeline/status', AdminController.getPipelineStatus);
router.post('/ffmpeg/config', AdminController.configFFmpeg);
router.post('/jobs/:jobId/action', AdminController.handleJobAction);

export default router;