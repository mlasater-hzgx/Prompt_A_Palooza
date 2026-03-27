import { Router } from 'express';
import * as ctrl from '../controllers/notifications.controller';

const router = Router();

router.get('/', ctrl.getNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.patch('/:id/read', ctrl.markRead);
router.post('/mark-all-read', ctrl.markAllRead);

export { router as notificationRoutes };
