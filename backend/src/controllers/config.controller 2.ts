import { Request, Response, NextFunction } from 'express';
import * as configService from '../services/config.service';
import { sendSuccess, sendPaginated, buildPaginationMeta } from '../utils/response';

// Projects
export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { projects, count } = await configService.listProjects(req.pagination.skip, req.pagination.take);
    sendPaginated(res, projects, buildPaginationMeta(req.pagination.page, req.pagination.pageSize, count));
  } catch (err) { next(err); }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await configService.createProject(req.body);
    sendSuccess(res, project, 201);
  } catch (err) { next(err); }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await configService.updateProject(String(req.params.projectNumber), req.body);
    sendSuccess(res, project);
  } catch (err) { next(err); }
}

// Hours Worked
export async function listHoursWorked(req: Request, res: Response, next: NextFunction) {
  try {
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const hours = await configService.listHoursWorked(year);
    sendSuccess(res, hours);
  } catch (err) { next(err); }
}

export async function upsertHoursWorked(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await configService.upsertHoursWorked(req.body);
    sendSuccess(res, result);
  } catch (err) { next(err); }
}

// System Config
export async function getSystemConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const config = await configService.getSystemConfig();
    sendSuccess(res, config);
  } catch (err) { next(err); }
}

export async function upsertSystemConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await configService.upsertSystemConfig(req.body);
    sendSuccess(res, result);
  } catch (err) { next(err); }
}

// Factor Types
export async function listFactorTypes(req: Request, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.activeOnly !== 'false';
    const factors = await configService.listFactorTypes(activeOnly);
    sendSuccess(res, factors);
  } catch (err) { next(err); }
}

export async function createFactorType(req: Request, res: Response, next: NextFunction) {
  try {
    const factor = await configService.createFactorType(req.body);
    sendSuccess(res, factor, 201);
  } catch (err) { next(err); }
}

export async function updateFactorType(req: Request, res: Response, next: NextFunction) {
  try {
    const factor = await configService.updateFactorType(String(req.params.id), req.body);
    sendSuccess(res, factor);
  } catch (err) { next(err); }
}

export async function deleteFactorType(req: Request, res: Response, next: NextFunction) {
  try {
    const factor = await configService.deleteFactorType(String(req.params.id));
    sendSuccess(res, factor);
  } catch (err) { next(err); }
}

// Notification Rules
export async function listNotificationRules(req: Request, res: Response, next: NextFunction) {
  try {
    const rules = await configService.listNotificationRules();
    sendSuccess(res, rules);
  } catch (err) { next(err); }
}

export async function upsertNotificationRule(req: Request, res: Response, next: NextFunction) {
  try {
    const rule = await configService.upsertNotificationRule(req.body);
    sendSuccess(res, rule);
  } catch (err) { next(err); }
}
