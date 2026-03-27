import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './config/rate-limit';
import { routes } from './routes';

export function createApp() {
  const app = express();

  // Security
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigin, credentials: true }));

  // Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  // Logging
  app.use(pinoHttp({ logger }));

  // Rate limiting
  app.use('/api', rateLimiter);

  // Routes
  app.use('/api', routes);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
