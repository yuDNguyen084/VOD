import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './modules/auth/auth.routes';
import videoRoutes from './modules/video/video.routes';
import workerRoutes from './modules/worker/worker.routes';
import { errorHandler } from './common/middlewares/error.middleware';

const app = express();
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Gom routes
app.use('/api/v1/auth', rateLimit({ windowMs: 15*60*1000, max: 20 }), authRoutes);
app.use('/api/v1/videos', videoRoutes);
app.use('/api/v1/worker', workerRoutes);

app.use(errorHandler);

export default app;