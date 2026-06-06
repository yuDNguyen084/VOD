import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import routes from './routes';
import { errorHandler } from './common/middlewares/error.middleware';

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(compression());
app.use(express.json());

// Main App API Routes
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;