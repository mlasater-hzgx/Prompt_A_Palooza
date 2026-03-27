import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';

const PHI_ROLES: Role[] = ['SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'ADMINISTRATOR'];

const PHI_FIELDS = ['name', 'treatmentFacility', 'physician'];

function stripPhiFromObject(obj: Record<string, unknown>): Record<string, unknown> {
  const result = { ...obj };
  for (const field of PHI_FIELDS) {
    if (field in result) {
      result[field] = '[REDACTED]';
    }
  }
  return result;
}

function stripPhiFromResponse(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.map((item) => stripPhiFromResponse(item));
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const stripped = stripPhiFromObject(obj);
    // Also strip from nested injuredPersons
    if (Array.isArray(stripped.injuredPersons)) {
      stripped.injuredPersons = (stripped.injuredPersons as Record<string, unknown>[]).map(stripPhiFromObject);
    }
    return stripped;
  }
  return data;
}

export function medicalDataFilter(req: Request, res: Response, next: NextFunction) {
  if (!req.user || PHI_ROLES.includes(req.user.role)) {
    return next();
  }

  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    const typedBody = body as { success?: boolean; data?: unknown };
    if (typedBody?.data) {
      typedBody.data = stripPhiFromResponse(typedBody.data);
    }
    return originalJson(typedBody);
  } as typeof res.json;

  next();
}
