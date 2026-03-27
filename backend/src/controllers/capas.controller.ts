import { Request, Response, NextFunction } from 'express';
import * as capasService from '../services/capas.service';
import { sendSuccess, sendPaginated, buildPaginationMeta } from '../utils/response';

export async function listCapas(req: Request, res: Response, next: NextFunction) {
  try {
    const { capas, count } = await capasService.listCapas(
      req.query as Record<string, string>,
      req.pagination.skip,
      req.pagination.take
    );
    sendPaginated(res, capas, buildPaginationMeta(req.pagination.page, req.pagination.pageSize, count));
  } catch (err) { next(err); }
}

export async function getCapa(req: Request, res: Response, next: NextFunction) {
  try {
    const capa = await capasService.getCapaById(String(req.params.id));
    sendSuccess(res, capa);
  } catch (err) { next(err); }
}

export async function createCapa(req: Request, res: Response, next: NextFunction) {
  try {
    const capa = await capasService.createCapa(String(req.params.incidentId), req.body);
    sendSuccess(res, capa, 201);
  } catch (err) { next(err); }
}

export async function updateCapa(req: Request, res: Response, next: NextFunction) {
  try {
    const capa = await capasService.updateCapa(String(req.params.id), req.body);
    sendSuccess(res, capa);
  } catch (err) { next(err); }
}

export async function startCapa(req: Request, res: Response, next: NextFunction) {
  try {
    const capa = await capasService.startCapa(String(req.params.id));
    sendSuccess(res, capa);
  } catch (err) { next(err); }
}

export async function completeCapa(req: Request, res: Response, next: NextFunction) {
  try {
    const { completionNotes, completionEvidence } = req.body as {
      completionNotes?: string;
      completionEvidence?: string[];
    };
    const capa = await capasService.completeCapa(
      String(req.params.id),
      completionNotes,
      completionEvidence
    );
    sendSuccess(res, capa);
  } catch (err) { next(err); }
}

export async function verifyCapa(req: Request, res: Response, next: NextFunction) {
  try {
    const { verificationResult, verificationNotes } = req.body as {
      verificationResult: 'EFFECTIVE' | 'PARTIALLY_EFFECTIVE' | 'INEFFECTIVE';
      verificationNotes?: string;
    };
    const capa = await capasService.verifyCapa(
      String(req.params.id),
      req.user!.id,
      verificationResult,
      verificationNotes
    );
    sendSuccess(res, capa);
  } catch (err) { next(err); }
}

export async function getOverdueCapas(_req: Request, res: Response, next: NextFunction) {
  try {
    const capas = await capasService.getOverdueCapas();
    sendSuccess(res, capas);
  } catch (err) { next(err); }
}

export async function getCapaStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const stats = await capasService.getCapaStats();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
}
