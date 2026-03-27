import { Router } from 'express';
import * as ctrl from '../controllers/investigations.controller';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/rbac';
import { contributingFactorSchema } from '../validators/investigations.validator';

const router = Router();

const mutationRoles = ['SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'] as const;

// Add contributing factor to an incident
router.post(
  '/incidents/:incidentId/contributing-factors',
  requireRole(...mutationRoles),
  validate(contributingFactorSchema),
  ctrl.addContributingFactor,
);

// Update contributing factor
router.put(
  '/contributing-factors/:id',
  requireRole(...mutationRoles),
  validate(contributingFactorSchema),
  ctrl.updateContributingFactor,
);

// Delete contributing factor
router.delete(
  '/contributing-factors/:id',
  requireRole(...mutationRoles),
  ctrl.deleteContributingFactor,
);

export { router as contributingFactorRoutes };
