import { Router } from 'express';
import { WorkerController } from './worker.controller';
const router = Router();
router.patch('/jobs/:id', WorkerController.updateProgress);
export default router;