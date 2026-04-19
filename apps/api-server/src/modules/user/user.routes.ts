import { Router } from 'express';
import { UserController } from './user.controller';
import { authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

router.use(authorize());

router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

export default router;