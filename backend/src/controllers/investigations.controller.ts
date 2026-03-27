import { Request, Response, NextFunction } from 'express';
import * as investigationsService from '../services/investigations.service';
import { sendSuccess, sendPaginated, buildPaginationMeta } from '../utils/response';

// ---------------------------------------------------------------------------
// Investigation CRUD
// ---------------------------------------------------------------------------

export async function listInvestigations(req: Request, res: Response, next: NextFunction) {
  try {
    const { investigations, count } = await investigationsService.listInvestigations(
      req.query as Record<string, string>,
      req.pagination.skip,
      req.pagination.take,
    );
    sendPaginated(res, investigations, buildPaginationMeta(req.pagination.page, req.pagination.pageSize, count));
  } catch (err) { next(err); }
}

export async function getInvestigation(req: Request, res: Response, next: NextFunction) {
  try {
    const investigation = await investigationsService.getInvestigationById(String(req.params.id));
    sendSuccess(res, investigation);
  } catch (err) { next(err); }
}

export async function createInvestigation(req: Request, res: Response, next: NextFunction) {
  try {
    const investigation = await investigationsService.createInvestigation(
      String(req.params.incidentId),
      req.body,
    );
    sendSuccess(res, investigation, 201);
  } catch (err) { next(err); }
}

export async function updateInvestigation(req: Request, res: Response, next: NextFunction) {
  try {
    const investigation = await investigationsService.updateInvestigation(
      String(req.params.id),
      req.body,
    );
    sendSuccess(res, investigation);
  } catch (err) { next(err); }
}

export async function submitReview(req: Request, res: Response, next: NextFunction) {
  try {
    const investigation = await investigationsService.submitReview(
      String(req.params.id),
      req.user!.id,
      req.body.reviewAction,
      req.body.reviewComments,
    );
    sendSuccess(res, investigation);
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// Five-Why Analysis
// ---------------------------------------------------------------------------

export async function addFiveWhy(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await investigationsService.addFiveWhy(
      String(req.params.investigationId),
      req.body,
    );
    sendSuccess(res, entry, 201);
  } catch (err) { next(err); }
}

export async function updateFiveWhy(req: Request, res: Response, next: NextFunction) {
  try {
    const entry = await investigationsService.updateFiveWhy(String(req.params.id), req.body);
    sendSuccess(res, entry);
  } catch (err) { next(err); }
}

export async function deleteFiveWhy(req: Request, res: Response, next: NextFunction) {
  try {
    await investigationsService.deleteFiveWhy(String(req.params.id));
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// Fishbone Factors
// ---------------------------------------------------------------------------

export async function addFishboneFactor(req: Request, res: Response, next: NextFunction) {
  try {
    const factor = await investigationsService.addFishboneFactor(
      String(req.params.investigationId),
      req.body,
    );
    sendSuccess(res, factor, 201);
  } catch (err) { next(err); }
}

export async function updateFishboneFactor(req: Request, res: Response, next: NextFunction) {
  try {
    const factor = await investigationsService.updateFishboneFactor(String(req.params.id), req.body);
    sendSuccess(res, factor);
  } catch (err) { next(err); }
}

export async function deleteFishboneFactor(req: Request, res: Response, next: NextFunction) {
  try {
    await investigationsService.deleteFishboneFactor(String(req.params.id));
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}

// ---------------------------------------------------------------------------
// Contributing Factors
// ---------------------------------------------------------------------------

export async function addContributingFactor(req: Request, res: Response, next: NextFunction) {
  try {
    const factor = await investigationsService.addContributingFactor(
      String(req.params.incidentId),
      req.body,
    );
    sendSuccess(res, factor, 201);
  } catch (err) { next(err); }
}

export async function updateContributingFactor(req: Request, res: Response, next: NextFunction) {
  try {
    const factor = await investigationsService.updateContributingFactor(String(req.params.id), req.body);
    sendSuccess(res, factor);
  } catch (err) { next(err); }
}

export async function deleteContributingFactor(req: Request, res: Response, next: NextFunction) {
  try {
    await investigationsService.deleteContributingFactor(String(req.params.id));
    sendSuccess(res, null, 204);
  } catch (err) { next(err); }
}
