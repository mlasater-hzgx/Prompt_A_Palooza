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

// For development: bypass auth and allow user switching via X-Dev-User-Id header
let defaultDevUser: Express.Request['user'] | null = null;

export async function devAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    // Check for dev user switching header
    const devUserId = req.headers['x-dev-user-id'] as string | undefined;

    if (devUserId) {
      const switchedUser = await prisma.user.findUnique({ where: { id: devUserId } });
      if (switchedUser) {
        req.user = { id: switchedUser.id, email: switchedUser.email, name: switchedUser.name, role: switchedUser.role, division: switchedUser.division };
        return next();
      }
    }

    // Default to admin user
    if (!defaultDevUser) {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMINISTRATOR' } });
      if (admin) {
        defaultDevUser = { id: admin.id, email: admin.email, name: admin.name, role: admin.role, division: admin.division };
      }
    }
    if (defaultDevUser) {
      req.user = defaultDevUser;
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
