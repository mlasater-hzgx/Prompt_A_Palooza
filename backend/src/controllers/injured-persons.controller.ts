import { Request, Response, NextFunction } from 'express';
import * as injuredPersonsService from '../services/injured-persons.service';
import { sendSuccess } from '../utils/response';

export async function createInjuredPerson(req: Request, res: Response, next: NextFunction) {
  try {
    const person = await injuredPersonsService.createInjuredPerson(
      String(req.params.incidentId),
      req.body
    );
    sendSuccess(res, person, 201);
  } catch (err) { next(err); }
}

export async function updateInjuredPerson(req: Request, res: Response, next: NextFunction) {
  try {
    const person = await injuredPersonsService.updateInjuredPerson(
      String(req.params.id),
      req.body
    );
    sendSuccess(res, person);
  } catch (err) { next(err); }
}

export async function deleteInjuredPerson(req: Request, res: Response, next: NextFunction) {
  try {
    await injuredPersonsService.deleteInjuredPerson(String(req.params.id));
    sendSuccess(res, { deleted: true });
  } catch (err) { next(err); }
}
