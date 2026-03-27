import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { prisma } from '../config/database';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';
import { devAuthMiddleware } from './rbac';

// Simple JWT decode (header.payload.signature) without full verification for dev
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = Buffer.from(parts[1], 'base64url').toString('utf8');
    return JSON.parse(payload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // In development without Azure AD configured, use dev auth
  if (config.nodeEnv === 'development' && !config.azureAd.tenantId) {
    return devAuthMiddleware(req, res, next);
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.substring(7);

  try {
    // In production, this should use passport-azure-ad BearerStrategy
    // For now, decode the JWT and look up the user
    const payload = decodeJwtPayload(token);
    if (!payload) {
      return next(new UnauthorizedError('Invalid token'));
    }

    const azureAdId = (payload.oid ?? payload.sub) as string;
    const email = (payload.preferred_username ?? payload.email ?? payload.upn) as string;
    const name = (payload.name ?? email) as string;

    if (!azureAdId) {
      return next(new UnauthorizedError('Token missing user identifier'));
    }

    // Upsert user on first login
    let user = await prisma.user.findUnique({ where: { azureAdId } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          azureAdId,
          email: email ?? `${azureAdId}@herzog.com`,
          name: name ?? 'Unknown User',
          role: 'FIELD_REPORTER', // Default role, admin upgrades later
        },
      });
      logger.info({ userId: user.id, email: user.email }, 'New user created from Azure AD');
    }

    if (!user.isActive) {
      return next(new UnauthorizedError('User account is deactivated'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      division: user.division,
    };

    next();
  } catch (err) {
    logger.error(err, 'Auth middleware error');
    next(new UnauthorizedError('Authentication failed'));
  }
}
