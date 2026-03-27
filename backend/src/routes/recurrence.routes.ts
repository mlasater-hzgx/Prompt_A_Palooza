import { Router } from 'express';
import * as ctrl from '../controllers/recurrence.controller';
import { validate } from '../middleware/validate';
import { requireRole } from '../middleware/rbac';
import { manualLinkSchema } from '../validators/recurrence.validator';

const router = Router();

const mutationRoles = requireRole('SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR');

// Run recurrence detection for an incident
router.post('/incidents/:incidentId/detect', mutationRoles, ctrl.detectRecurrence);

// List all recurrence links
router.get('/links', ctrl.listAllLinks);

// Get recurrence links for an incident
router.get('/incidents/:incidentId/links', ctrl.getRecurrenceForIncident);

// Get cluster patterns
router.get('/clusters', ctrl.getClusters);

// Create manual link
router.post('/link', mutationRoles, validate(manualLinkSchema), ctrl.createManualLink);

// Dismiss a link
router.delete('/:id', mutationRoles, ctrl.dismissLink);

export { router as recurrenceRoutes };
