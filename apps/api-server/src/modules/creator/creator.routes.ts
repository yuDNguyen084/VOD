import { Router } from 'express';
import { CreatorController } from './creator.controller';
import { authorize } from '../../common/middlewares/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authorize([Role.CREATOR, Role.ADMIN]));

router.get('/dashboard', CreatorController.getDashboard);

export default router;