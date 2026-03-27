import { Router } from 'express';
import * as ctrl from '../controllers/osha.controller';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/rbac';
import { oshaOverrideSchema } from '../validators/osha.validator';

const router = Router();

const overrideRoles = requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');

// Calculate OSHA recordability for an incident
router.post('/incidents/:incidentId/osha/calculate', ctrl.calculateOshaRecordability);

// Override OSHA determination for an incident
router.put(
  '/incidents/:incidentId/osha/override',
  overrideRoles,
  validate(oshaOverrideSchema),
  ctrl.overrideOsha
);

export { router as oshaRoutes };
