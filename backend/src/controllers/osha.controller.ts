import { Request, Response, NextFunction } from 'express';
import * as oshaService from '../services/osha.service';
import { sendSuccess } from '../utils/response';

export async function calculateOshaRecordability(req: Request, res: Response, next: NextFunction) {
  try {
    const determination = await oshaService.calculateOshaRecordability(
      String(req.params.incidentId)
    );
    sendSuccess(res, determination);
  } catch (err) { next(err); }
}

export async function overrideOsha(req: Request, res: Response, next: NextFunction) {
  try {
    const { oshaOverrideValue, oshaOverrideJustification } = req.body as {
      oshaOverrideValue: boolean;
      oshaOverrideJustification: string;
    };
    const result = await oshaService.overrideOsha(
      String(req.params.incidentId),
      oshaOverrideValue,
      oshaOverrideJustification,
      req.user!.id
    );
    sendSuccess(res, result);
  } catch (err) { next(err); }
}
