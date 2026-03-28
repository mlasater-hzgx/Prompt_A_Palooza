import { Router } from 'express';
import { userRoutes } from './users.routes';
import { configRoutes } from './config.routes';
import { notificationRoutes } from './notifications.routes';
import { incidentRoutes } from './incidents.routes';
import { investigationRoutes } from './investigations.routes';
import { rootCauseRoutes } from './root-cause.routes';
import { contributingFactorRoutes } from './contributing-factors.routes';
import { capaRoutes } from './capas.routes';
import { injuredPersonRoutes } from './injured-persons.routes';
import { witnessStatementRoutes } from './witness-statements.routes';
import { recurrenceRoutes } from './recurrence.routes';
import { oshaRoutes } from './osha.routes';
import { dashboardRoutes } from './dashboard.routes';
import { analyticsRoutes } from './analytics.routes';
import { reportRoutes } from './reports.routes';
import { auditLogRoutes } from './audit-log.routes';

const router = Router();

// Operational routes
router.use('/incidents', incidentRoutes);
router.use('/investigations', investigationRoutes);
router.use('/capas', capaRoutes);

// User management
router.use('/users', userRoutes);

// Configuration
router.use('/config', configRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// Root-cause analysis (five-why & fishbone)
router.use('/root-cause', rootCauseRoutes);

// Contributing factors
router.use('/', contributingFactorRoutes);

// Injured persons
router.use('/injured-persons', injuredPersonRoutes);

// Witness statements
router.use('/witness-statements', witnessStatementRoutes);

// Recurrence
router.use('/recurrence', recurrenceRoutes);

// OSHA
router.use('/osha', oshaRoutes);

// Dashboard & Analytics
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);

// Reports (OSHA 300/300A/301)
router.use('/reports', reportRoutes);

// Audit Log (Admin only)
router.use('/audit-logs', auditLogRoutes);

// API root
router.get('/', (_req, res) => {
  res.json({ message: 'Incident Investigation API v1.0' });
});

export { router as routes };
