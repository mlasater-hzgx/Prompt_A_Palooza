import { Role, Division } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role;
        division: Division | null;
      };
    }
  }
}

export {};
