import { Request, Response, NextFunction } from 'express';
import * as notifService from '../services/notification.service';
import { sendSuccess } from '../utils/response';

export async function getNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const unreadOnly = req.query.unreadOnly === 'true';
    const notifications = await notifService.getNotificationsForUser(req.user!.id, unreadOnly);
    sendSuccess(res, notifications);
  } catch (err) { next(err); }
}

export async function getUnreadCount(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await notifService.getUnreadCount(req.user!.id);
    sendSuccess(res, { count });
  } catch (err) { next(err); }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    const notification = await notifService.markNotificationRead(String(req.params.id), req.user!.id);
    sendSuccess(res, notification);
  } catch (err) { next(err); }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notifService.markAllNotificationsRead(req.user!.id);
    sendSuccess(res, { message: 'All notifications marked as read' });
  } catch (err) { next(err); }
}
