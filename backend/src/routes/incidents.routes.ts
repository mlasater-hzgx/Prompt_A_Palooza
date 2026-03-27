import { Router } from 'express';
import * as ctrl from '../controllers/incidents.controller';
import { validate } from '../middleware/validate';
import { pagination } from '../middleware/pagination';
import { requireRole, requireAnyRole } from '../middleware/rbac';
import { medicalDataFilter } from '../middleware/medical-data-filter';
import {
  createIncidentSchema,
  updateIncidentSchema,
  completeDetailsSchema,
  statusTransitionSchema,
  incidentQuerySchema,
} from '../validators/incidents.validator';

const router = Router();

// GET / - List incidents (all authenticated roles)
router.get(
  '/',
  requireAnyRole(),
  pagination(),
  validate(incidentQuerySchema, 'query'),
  ctrl.listIncidents,
);

// POST / - Create incident (field reporters and above)
router.post(
  '/',
  requireRole('FIELD_REPORTER', 'SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'),
  validate(createIncidentSchema),
  ctrl.createIncident,
);

// GET /:id - Get incident detail (all roles, with medical data filtering)
router.get(
  '/:id',
  requireAnyRole(),
  medicalDataFilter,
  ctrl.getIncident,
);

// PUT /:id - Update incident (coordinators and above)
router.put(
  '/:id',
  requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'),
  validate(updateIncidentSchema),
  ctrl.updateIncident,
);

// POST /:id/complete-details - Complete incident details (coordinators and above)
router.post(
  '/:id/complete-details',
  requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'),
  validate(completeDetailsSchema),
  ctrl.completeDetails,
);

// PATCH /:id/status - Transition incident status (coordinators and above)
router.patch(
  '/:id/status',
  requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'),
  validate(statusTransitionSchema),
  ctrl.transitionStatus,
);

// GET /:id/timeline - Get incident audit timeline (all roles)
router.get(
  '/:id/timeline',
  requireAnyRole(),
  ctrl.getTimeline,
);

// GET /:id/statements - Get witness statements (all roles)
router.get(
  '/:id/statements',
  requireAnyRole(),
  ctrl.getStatements,
);

export { router as incidentRoutes };
