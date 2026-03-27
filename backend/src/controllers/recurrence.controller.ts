import { Request, Response, NextFunction } from 'express';
import * as recurrenceService from '../services/recurrence.service';
import { sendSuccess } from '../utils/response';

export async function listAllLinks(_req: Request, res: Response, next: NextFunction) {
  try {
    const links = await recurrenceService.listAllLinks();
    sendSuccess(res, links);
  } catch (err) { next(err); }
}

export async function detectRecurrence(req: Request, res: Response, next: NextFunction) {
  try {
    const links = await recurrenceService.detectRecurrence(String(req.params.incidentId));
    sendSuccess(res, links);
  } catch (err) { next(err); }
}

export async function getRecurrenceForIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const links = await recurrenceService.getRecurrenceForIncident(String(req.params.incidentId));
    sendSuccess(res, links);
  } catch (err) { next(err); }
}

export async function getClusters(_req: Request, res: Response, next: NextFunction) {
  try {
    const clusters = await recurrenceService.getClusters();
    sendSuccess(res, clusters);
  } catch (err) { next(err); }
}

export async function createManualLink(req: Request, res: Response, next: NextFunction) {
  try {
    const link = await recurrenceService.createManualLink(req.body);
    sendSuccess(res, link, 201);
  } catch (err) { next(err); }
}

export async function dismissLink(req: Request, res: Response, next: NextFunction) {
  try {
    const link = await recurrenceService.dismissLink(String(req.params.id));
    sendSuccess(res, link);
  } catch (err) { next(err); }
}
