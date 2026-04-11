import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '../../common/middlewares/validate.middleware';
import { authorize } from '../../common/middlewares/auth.middleware';
import { authSchemas } from '../../common/validations/auth.schema';

const router = Router();

router.post('/register', validate(authSchemas.register), AuthController.register);
router.post('/login', validate(authSchemas.login), AuthController.login);

router.post('/refresh', validate(authSchemas.refresh), AuthController.refresh);

router.post('/logout', authorize(), AuthController.logout);

export default router;