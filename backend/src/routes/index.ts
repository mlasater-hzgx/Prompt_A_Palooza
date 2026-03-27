import { Router } from 'express';
import { userRoutes } from './users.routes';
import { configRoutes } from './config.routes';
import { notificationRoutes } from './notifications.routes';

const router = Router();

// Operational routes (to be added in Phase 2)
// router.use('/incidents', incidentRoutes);
// router.use('/investigations', investigationRoutes);
// router.use('/capas', capaRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/recurrence', recurrenceRoutes);
// router.use('/reports', reportRoutes);

// User management
router.use('/users', userRoutes);

// Configuration
router.use('/config', configRoutes);

// Notifications
router.use('/notifications', notificationRoutes);

// API root
router.get('/', (_req, res) => {
  res.json({ message: 'Incident Investigation API v1.0' });
});

export { router as routes };
