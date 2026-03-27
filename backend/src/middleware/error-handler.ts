import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ValidationError) {
    const errors = Object.entries(err.errors).flatMap(([field, messages]) =>
      messages.map((message) => ({ field, message }))
    );
    return sendError(res, 'Validation failed', 400, errors);
  }

  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error(err, 'Non-operational error');
    }
    return sendError(res, err.message, err.statusCode);
  }

  // Prisma known errors
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as unknown as { code: string; meta?: { target?: string[] } };
    if (prismaErr.code === 'P2002') {
      const target = prismaErr.meta?.target?.join(', ') ?? 'field';
      return sendError(res, `A record with this ${target} already exists`, 409);
    }
    if (prismaErr.code === 'P2025') {
      return sendError(res, 'Record not found', 404);
    }
  }

  logger.error(err, 'Unhandled error');
  return sendError(res, 'Internal server error', 500);
}
