import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';

// Attaches project numbers to req for filtering
declare global {
  namespace Express {
    interface Request {
      scopedProjectNumbers?: string[];
      scopedDivision?: string;
    }
  }
}

export async function scopeMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next();

  if (req.user.role === ('PROJECT_MANAGER' as Role)) {
    // Get projects assigned to this PM
    const userProjects = await prisma.userProject.findMany({
      where: { userId: req.user.id },
      select: { projectNumber: true },
    });
    req.scopedProjectNumbers = userProjects.map((up) => up.projectNumber);
  }

  if (req.user.role === ('DIVISION_MANAGER' as Role) && req.user.division) {
    req.scopedDivision = req.user.division;
  }

  next();
}
