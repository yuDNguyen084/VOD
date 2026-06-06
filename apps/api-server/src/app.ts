import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import routes from './routes';
import { errorHandler } from './common/middlewares/error.middleware';

const app = express();
app.use(helmet());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow any origin dynamically (essential for dynamic EC2 IPs and AWS public DNS hosts)
    callback(null, true);
  },
  credentials: true,
}));
app.use(compression());
app.use(express.json());

// Main App API Routes
app.use('/api/v1', routes);

app.use(errorHandler);

export default app;