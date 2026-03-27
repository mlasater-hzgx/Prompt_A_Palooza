import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { pinoHttp } from 'pino-http';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error-handler';
import { rateLimiter } from './config/rate-limit';
import { authMiddleware } from './middleware/auth';
import { auditLogMiddleware } from './middleware/audit-log';
import { scopeMiddleware } from './middleware/project-scope';
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

  // Auth (all /api routes)
  app.use('/api', authMiddleware);

  // Project/division scoping
  app.use('/api', scopeMiddleware);

  // Audit logging (mutating requests)
  app.use('/api', auditLogMiddleware);

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
