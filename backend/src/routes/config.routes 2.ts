import { Router } from 'express';
import * as ctrl from '../controllers/config.controller';
import { validate } from '../middleware/validate';
import { pagination } from '../middleware/pagination';
import { requireRole } from '../middleware/rbac';
import {
  createProjectSchema, updateProjectSchema, hoursWorkedSchema,
  systemConfigSchema, createFactorTypeSchema, updateFactorTypeSchema, notificationRuleSchema,
} from '../validators/config.validator';

const router = Router();

// Projects
router.get('/projects', requireRole('ADMINISTRATOR', 'SAFETY_MANAGER'), pagination(), ctrl.listProjects);
router.post('/projects', requireRole('ADMINISTRATOR'), validate(createProjectSchema), ctrl.createProject);
router.put('/projects/:projectNumber', requireRole('ADMINISTRATOR'), validate(updateProjectSchema), ctrl.updateProject);

// Hours Worked
router.get('/hours-worked', requireRole('ADMINISTRATOR', 'SAFETY_MANAGER'), ctrl.listHoursWorked);
router.put('/hours-worked', requireRole('ADMINISTRATOR'), validate(hoursWorkedSchema), ctrl.upsertHoursWorked);

// System Config
router.get('/system', requireRole('ADMINISTRATOR'), ctrl.getSystemConfig);
router.put('/system', requireRole('ADMINISTRATOR'), validate(systemConfigSchema), ctrl.upsertSystemConfig);

// Factor Types
router.get('/factor-types', ctrl.listFactorTypes);
router.post('/factor-types', requireRole('ADMINISTRATOR', 'SAFETY_MANAGER'), validate(createFactorTypeSchema), ctrl.createFactorType);
router.put('/factor-types/:id', requireRole('ADMINISTRATOR', 'SAFETY_MANAGER'), validate(updateFactorTypeSchema), ctrl.updateFactorType);
router.delete('/factor-types/:id', requireRole('ADMINISTRATOR', 'SAFETY_MANAGER'), ctrl.deleteFactorType);

// Notification Rules
router.get('/notification-rules', requireRole('ADMINISTRATOR'), ctrl.listNotificationRules);
router.put('/notification-rules', requireRole('ADMINISTRATOR'), validate(notificationRuleSchema), ctrl.upsertNotificationRule);

export { router as configRoutes };
