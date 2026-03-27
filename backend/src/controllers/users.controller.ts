import { Request, Response, NextFunction } from 'express';
import * as usersService from '../services/users.service';
import { sendSuccess, sendPaginated, buildPaginationMeta } from '../utils/response';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { users, count } = await usersService.listUsers(
      req.query as Record<string, string>,
      req.pagination.skip,
      req.pagination.take
    );
    sendPaginated(res, users, buildPaginationMeta(req.pagination.page, req.pagination.pageSize, count));
  } catch (err) { next(err); }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getUserById(String(req.params.id));
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.updateUser(String(req.params.id), req.body);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function deactivateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.deactivateUser(String(req.params.id));
    sendSuccess(res, user);
  } catch (err) { next(err); }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getCurrentUser(req.user!.id);
    sendSuccess(res, user);
  } catch (err) { next(err); }
}
