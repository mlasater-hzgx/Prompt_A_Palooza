import { Router } from 'express';
import * as ctrl from '../controllers/dashboard.controller';

const router = Router();

router.get('/executive', ctrl.getExecutiveDashboard);
router.get('/division/:divisionId', ctrl.getDivisionDashboard);
router.get('/project/:projectNumber', ctrl.getProjectDashboard);

export { router as dashboardRoutes };
