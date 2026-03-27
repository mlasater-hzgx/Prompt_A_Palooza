import cron from 'node-cron';
import { logger } from '../utils/logger';
import { checkOverdueInvestigations, checkOverdueCapas, checkVerificationReminders, checkClientNotificationDeadlines } from '../services/escalation.service';

export function startJobs() {
  logger.info('Starting scheduled jobs');

  // Check overdue investigations and CAPAs every 30 minutes
  cron.schedule('*/30 * * * *', async () => {
    try {
      const overdueInvestigations = await checkOverdueInvestigations();
      const overdueCapas = await checkOverdueCapas();
      logger.info({ overdueInvestigations, overdueCapas }, 'Overdue check completed');
    } catch (err) {
      logger.error(err, 'Overdue check failed');
    }
  });

  // Check verification reminders daily at 8am
  cron.schedule('0 8 * * *', async () => {
    try {
      const reminders = await checkVerificationReminders();
      logger.info({ reminders }, 'Verification reminder check completed');
    } catch (err) {
      logger.error(err, 'Verification reminder check failed');
    }
  });

  // Check client notification deadlines every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    try {
      const notified = await checkClientNotificationDeadlines();
      if (notified > 0) {
        logger.info({ notified }, 'Client notification deadline check completed');
      }
    } catch (err) {
      logger.error(err, 'Client notification deadline check failed');
    }
  });

  logger.info('All scheduled jobs registered');
}
