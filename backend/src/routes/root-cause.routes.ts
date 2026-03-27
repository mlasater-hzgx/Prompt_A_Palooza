import { Router } from 'express';
import * as ctrl from '../controllers/investigations.controller';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/rbac';
import { fiveWhySchema, fishboneSchema } from '../validators/investigations.validator';

const router = Router();

const mutationRoles = ['SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'] as const;

// ---------------------------------------------------------------------------
// Five-Why Analysis
// ---------------------------------------------------------------------------

router.post(
  '/investigations/:investigationId/five-why',
  requireRole(...mutationRoles),
  validate(fiveWhySchema),
  ctrl.addFiveWhy,
);

router.put(
  '/five-why/:id',
  requireRole(...mutationRoles),
  validate(fiveWhySchema),
  ctrl.updateFiveWhy,
);

router.delete(
  '/five-why/:id',
  requireRole(...mutationRoles),
  ctrl.deleteFiveWhy,
);

// ---------------------------------------------------------------------------
// Fishbone Factors
// ---------------------------------------------------------------------------

router.post(
  '/investigations/:investigationId/fishbone',
  requireRole(...mutationRoles),
  validate(fishboneSchema),
  ctrl.addFishboneFactor,
);

router.put(
  '/fishbone/:id',
  requireRole(...mutationRoles),
  validate(fishboneSchema),
  ctrl.updateFishboneFactor,
);

router.delete(
  '/fishbone/:id',
  requireRole(...mutationRoles),
  ctrl.deleteFishboneFactor,
);

export { router as rootCauseRoutes };
