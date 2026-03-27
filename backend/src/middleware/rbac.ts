import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Role '${req.user.role}' does not have access to this resource`));
    }

    next();
  };
}

export function requireAnyRole() {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }
    next();
  };
}

// For development: bypass auth and set a mock user (loads admin from DB)
let cachedDevUser: Express.Request['user'] | null = null;

export async function devAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    if (!cachedDevUser) {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMINISTRATOR' } });
      if (admin) {
        cachedDevUser = { id: admin.id, email: admin.email, name: admin.name, role: admin.role, division: admin.division };
      }
    }
    if (cachedDevUser) {
      req.user = cachedDevUser;
    } else {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'dev@herzog.com',
        name: 'Dev User',
        role: 'ADMINISTRATOR' as Role,
        division: 'HCC' as never,
      };
    }
  }
  next();
}
