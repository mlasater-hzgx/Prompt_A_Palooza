import { Router } from 'express';

const router = Router();

// Routes will be added as they are implemented
// router.use('/incidents', incidentRoutes);
// router.use('/investigations', investigationRoutes);
// router.use('/capas', capaRoutes);
// router.use('/dashboard', dashboardRoutes);
// router.use('/analytics', analyticsRoutes);
// router.use('/config', configRoutes);
// router.use('/users', userRoutes);
// router.use('/recurrence', recurrenceRoutes);
// router.use('/reports', reportRoutes);

// Placeholder root
router.get('/', (_req, res) => {
  res.json({ message: 'Incident Investigation API v1.0' });
});

export { router as routes };
