import { Router } from 'express';
import { VideoController } from './video.controller';
import { authorize } from '../../common/middlewares/auth.middleware';
import { cache } from '../../common/middlewares/cache.middleware';
import { validate } from '../../common/middlewares/validate.middleware';
import { videoSchemas } from '../../common/validations/video.schema';
import { Role } from '../../common/constants/role';

const router = Router();
router.get('/', authorize(), cache(60), VideoController.getVideos);
router.post('/upload', authorize([Role.CREATOR]), validate(videoSchemas.upload), VideoController.requestUpload);
router.post('/:id/confirm', authorize([Role.CREATOR]), VideoController.confirm);
router.delete('/:id', authorize([Role.CREATOR, Role.ADMIN]), VideoController.delete);
export default router;