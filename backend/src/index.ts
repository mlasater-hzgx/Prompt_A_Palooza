import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { prisma } from './config/database';

async function main() {
  const app = createApp();

  // Verify database connection
  await prisma.$connect();
  logger.info('Database connected');

  app.listen(config.port, () => {
    logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
  });
}

main().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});
