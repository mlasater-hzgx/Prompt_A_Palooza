import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import * as oshaReports from '../services/osha-reports.service';
import { sendSuccess, sendError } from '../utils/response';
import { requireRole } from '../middleware/rbac';

const router = Router();

router.get('/osha-300', requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await oshaReports.generateOsha300(year);
    sendSuccess(res, data);
  } catch (err) { next(err); }
});

router.get('/osha-300a', requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const data = await oshaReports.generateOsha300A(year);
    sendSuccess(res, data);
  } catch (err) { next(err); }
});

router.get('/osha-301/:incidentId', requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await oshaReports.generateOsha301(String(req.params.incidentId));
    if (!data) return sendError(res, 'Incident not found', 404);
    sendSuccess(res, data);
  } catch (err) { next(err); }
});

export { router as reportRoutes };
