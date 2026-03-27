import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../utils/logger';

const MUTATING_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Map route patterns to entity types
function getEntityType(path: string): string | null {
  if (path.includes('/incidents')) return 'Incident';
  if (path.includes('/investigations')) return 'Investigation';
  if (path.includes('/capas') || path.includes('/capa')) return 'Capa';
  if (path.includes('/injured-persons')) return 'InjuredPerson';
  if (path.includes('/witness-statements')) return 'WitnessStatement';
  if (path.includes('/five-why')) return 'FiveWhyAnalysis';
  if (path.includes('/fishbone')) return 'FishboneFactor';
  if (path.includes('/contributing-factors')) return 'ContributingFactor';
  if (path.includes('/recurrence')) return 'RecurrenceLink';
  if (path.includes('/users')) return 'User';
  if (path.includes('/config')) return 'Config';
  return null;
}

function getAction(method: string): string {
  switch (method) {
    case 'POST': return 'CREATED';
    case 'PUT': return 'UPDATED';
    case 'PATCH': return 'STATUS_CHANGED';
    case 'DELETE': return 'DELETED';
    default: return 'UNKNOWN';
  }
}

export function auditLogMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!MUTATING_METHODS.includes(req.method)) {
    return next();
  }

  const entityType = getEntityType(req.path);
  if (!entityType) {
    return next();
  }

  // Capture the original json method to intercept the response
  const originalJson = res.json.bind(res);

  res.json = function (body: unknown) {
    // Log after response is sent
    setImmediate(async () => {
      try {
        const userId = req.user?.id;
        if (!userId) return;

        const responseBody = body as { success?: boolean; data?: { id?: string; incidentId?: string } };
        const entityId = String(responseBody?.data?.id ?? req.params.id ?? req.params.incidentId ?? '');
        const incidentIdVal = responseBody?.data?.incidentId ?? (typeof req.params.incidentId === 'string' ? req.params.incidentId : undefined);

        if (entityId) {
          await prisma.auditLog.create({
            data: {
              entityType,
              entityId,
              action: getAction(req.method),
              changes: req.method === 'DELETE' ? undefined : JSON.parse(JSON.stringify(req.body ?? null)),
              userId,
              incidentId: incidentIdVal ?? null,
            },
          });
        }
      } catch (err) {
        logger.error(err, 'Failed to create audit log');
      }
    });

    return originalJson(body);
  } as typeof res.json;

  next();
}
