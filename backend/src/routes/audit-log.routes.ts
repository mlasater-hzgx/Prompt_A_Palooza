import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendPaginated, buildPaginationMeta } from '../utils/response';
import { requireRole } from '../middleware/rbac';
import { pagination } from '../middleware/pagination';

const router = Router();

router.get(
  '/',
  requireRole('ADMINISTRATOR'),
  pagination(50),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skip, take, page, pageSize } = req.pagination;

      const entityType = req.query.entityType as string | undefined;
      const action = req.query.action as string | undefined;
      const userId = req.query.userId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const where: Record<string, unknown> = {};
      if (entityType) where.entityType = entityType;
      if (action) where.action = action;
      if (userId) where.userId = userId;
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) (where.createdAt as Record<string, unknown>).gte = new Date(startDate);
        if (endDate) (where.createdAt as Record<string, unknown>).lte = new Date(endDate);
      }

      const [logs, count] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
            incident: { select: { id: true, incidentNumber: true, title: true } },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take,
        }),
        prisma.auditLog.count({ where }),
      ]);

      sendPaginated(res, logs, buildPaginationMeta(page, pageSize, count));
    } catch (err) {
      next(err);
    }
  },
);

// Get distinct entity types for filter dropdown
router.get(
  '/entity-types',
  requireRole('ADMINISTRATOR'),
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const types = await prisma.auditLog.findMany({
        select: { entityType: true },
        distinct: ['entityType'],
        orderBy: { entityType: 'asc' },
      });
      sendSuccess(res, types.map((t) => t.entityType));
    } catch (err) {
      next(err);
    }
  },
);

export { router as auditLogRoutes };
