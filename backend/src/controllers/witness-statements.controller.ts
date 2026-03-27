import { Request, Response, NextFunction } from 'express';
import * as witnessStatementsService from '../services/witness-statements.service';
import { sendSuccess } from '../utils/response';

export async function createWitnessStatement(req: Request, res: Response, next: NextFunction) {
  try {
    const statement = await witnessStatementsService.createWitnessStatement(
      String(req.params.incidentId),
      req.user!.id,
      req.body
    );
    sendSuccess(res, statement, 201);
  } catch (err) { next(err); }
}

export async function updateWitnessStatement(req: Request, res: Response, next: NextFunction) {
  try {
    const statement = await witnessStatementsService.updateWitnessStatement(
      String(req.params.id),
      req.body
    );
    sendSuccess(res, statement);
  } catch (err) { next(err); }
}

export async function deleteWitnessStatement(req: Request, res: Response, next: NextFunction) {
  try {
    await witnessStatementsService.deleteWitnessStatement(String(req.params.id));
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}
