import { Router } from 'express';
import * as ctrl from '../controllers/witness-statements.controller';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/rbac';
import {
  createWitnessStatementSchema,
  updateWitnessStatementSchema,
} from '../validators/witness-statements.validator';

const router = Router();

const mutationRoles = requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');

// Create witness statement for an incident
router.post(
  '/incidents/:incidentId/witness-statements',
  mutationRoles,
  validate(createWitnessStatementSchema),
  ctrl.createWitnessStatement
);

// Update witness statement
router.put('/:id', mutationRoles, validate(updateWitnessStatementSchema), ctrl.updateWitnessStatement);

// Delete witness statement
router.delete('/:id', mutationRoles, ctrl.deleteWitnessStatement);

export { router as witnessStatementRoutes };
