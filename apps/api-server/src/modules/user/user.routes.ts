import { Router } from 'express';
import { UserController } from './user.controller';
import { authorize } from '../../common/middlewares/auth.middleware';

const router = Router();

/** Protected routes - MUST come before dynamic :identifier routes */
router.get('/profile', authorize(), UserController.getProfile);
router.put('/profile', authorize(), UserController.updateProfile);

/** Public routes */
router.get('/search', UserController.searchUsers);
router.get('/:identifier/videos', UserController.getUserVideos);
router.get('/:identifier', UserController.getPublicProfile);

export default router;