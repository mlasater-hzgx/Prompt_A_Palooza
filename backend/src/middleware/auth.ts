import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { devAuthMiddleware } from './rbac';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  // In development without Azure AD configured, use dev auth
  if (config.nodeEnv === 'development' && !config.azureAd.tenantId) {
    return devAuthMiddleware(req, res, next);
  }

  // TODO: Implement Azure AD JWT validation with passport-azure-ad
  // For now, use dev auth as fallback
  return devAuthMiddleware(req, res, next);
}
