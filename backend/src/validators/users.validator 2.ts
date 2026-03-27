import { z } from 'zod';

export const updateUserSchema = z.object({
  role: z.enum(['FIELD_REPORTER', 'SAFETY_COORDINATOR', 'SAFETY_MANAGER', 'PROJECT_MANAGER', 'DIVISION_MANAGER', 'EXECUTIVE', 'ADMINISTRATOR']).optional(),
  division: z.enum(['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP']).nullable().optional(),
  isActive: z.boolean().optional(),
});

export const userQuerySchema = z.object({
  role: z.string().optional(),
  division: z.string().optional(),
  isActive: z.string().transform(v => v === 'true').optional(),
  search: z.string().optional(),
});
