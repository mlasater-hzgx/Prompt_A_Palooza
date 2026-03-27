import { Router } from 'express';
import * as ctrl from '../controllers/users.controller';
import { validate } from '../middleware/validate';
import { pagination } from '../middleware/pagination';
import { requireRole } from '../middleware/rbac';
import { updateUserSchema, userQuerySchema } from '../validators/users.validator';

const router = Router();

router.get('/me', ctrl.getMe);
router.get('/', requireRole('ADMINISTRATOR'), pagination(), validate(userQuerySchema, 'query'), ctrl.listUsers);
router.post('/', requireRole('ADMINISTRATOR'), ctrl.createUser);
router.get('/:id', requireRole('ADMINISTRATOR'), ctrl.getUser);
router.put('/:id', requireRole('ADMINISTRATOR'), validate(updateUserSchema), ctrl.updateUser);
router.post('/:id/deactivate', requireRole('ADMINISTRATOR'), ctrl.deactivateUser);

export { router as userRoutes };
