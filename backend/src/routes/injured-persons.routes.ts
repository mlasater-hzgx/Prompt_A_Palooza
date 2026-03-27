import { Router } from 'express';
import * as ctrl from '../controllers/injured-persons.controller';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/rbac';
import { medicalDataFilter } from '../middleware/medical-data-filter';
import {
  createInjuredPersonSchema,
  updateInjuredPersonSchema,
} from '../validators/injured-persons.validator';

const router = Router();

const mutationRoles = requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');

// Apply medical data filter to all routes in this router
router.use(medicalDataFilter);

// Create injured person for an incident
router.post(
  '/incidents/:incidentId/injured-persons',
  mutationRoles,
  validate(createInjuredPersonSchema),
  ctrl.createInjuredPerson
);

// Update injured person
router.put('/:id', mutationRoles, validate(updateInjuredPersonSchema), ctrl.updateInjuredPerson);

// Delete injured person
router.delete('/:id', mutationRoles, ctrl.deleteInjuredPerson);

export { router as injuredPersonRoutes };
