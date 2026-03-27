import { Router } from 'express';
import * as ctrl from '../controllers/investigations.controller';
import { validate } from '../middleware/validate';
import { pagination } from '../middleware/pagination';
import { requireRole } from '../middleware/rbac';
import {
  createInvestigationSchema,
  updateInvestigationSchema,
  reviewSchema,
  investigationQuerySchema,
} from '../validators/investigations.validator';

const router = Router();

const mutationRoles = ['SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'] as const;

// List investigations (paginated + filtered)
router.get(
  '/',
  pagination(),
  validate(investigationQuerySchema, 'query'),
  ctrl.listInvestigations,
);

// Get investigation detail
router.get('/:id', ctrl.getInvestigation);

// Create investigation for an incident
router.post(
  '/incidents/:incidentId',
  requireRole(...mutationRoles),
  validate(createInvestigationSchema),
  ctrl.createInvestigation,
);

// Update investigation
router.put(
  '/:id',
  requireRole(...mutationRoles),
  validate(updateInvestigationSchema),
  ctrl.updateInvestigation,
);

// Submit review (approve / return)
router.patch(
  '/:id/review',
  requireRole('SAFETY_MANAGER', 'ADMINISTRATOR'),
  validate(reviewSchema),
  ctrl.submitReview,
);

export { router as investigationRoutes };
