import { Router } from 'express';
import * as ctrl from '../controllers/capas.controller';
import { validate } from '../middleware/validate';
import { pagination } from '../middleware/pagination';
import { requireRole } from '../middleware/rbac';
import {
  createCapaSchema,
  updateCapaSchema,
  verifyCapaSchema,
  completeCapaSchema,
  capaQuerySchema,
} from '../validators/capas.validator';

const router = Router();

const mutationRoles = requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');

// List CAPAs
router.get('/', pagination(), validate(capaQuerySchema, 'query'), ctrl.listCapas);

// Overdue CAPAs
router.get('/overdue', ctrl.getOverdueCapas);

// CAPA stats
router.get('/stats', ctrl.getCapaStats);

// CAPA detail
router.get('/:id', ctrl.getCapa);

// Create CAPA for an incident
router.post(
  '/incidents/:incidentId',
  mutationRoles,
  validate(createCapaSchema),
  ctrl.createCapa
);

// Update CAPA
router.put('/:id', mutationRoles, validate(updateCapaSchema), ctrl.updateCapa);

// Start CAPA
router.post('/:id/start', mutationRoles, ctrl.startCapa);

// Complete CAPA
router.post('/:id/complete', mutationRoles, validate(completeCapaSchema), ctrl.completeCapa);

// Verify CAPA
router.post('/:id/verify', mutationRoles, validate(verifyCapaSchema), ctrl.verifyCapa);

export { router as capaRoutes };
