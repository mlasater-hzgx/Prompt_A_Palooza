import { z } from 'zod';

export const createProjectSchema = z.object({
  projectNumber: z.string().min(1),
  name: z.string().min(1),
  division: z.enum(['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP']),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  division: z.enum(['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP']).optional(),
  isActive: z.boolean().optional(),
});

export const hoursWorkedSchema = z.object({
  division: z.enum(['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP']).nullable(),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  hours: z.number().min(0),
});

export const systemConfigSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  description: z.string().optional(),
});

export const createFactorTypeSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['HUMAN_FACTORS', 'EQUIPMENT_TOOLS', 'ENVIRONMENTAL', 'PROCEDURAL', 'MANAGEMENT_ORGANIZATIONAL']),
  description: z.string().optional(),
});

export const updateFactorTypeSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.enum(['HUMAN_FACTORS', 'EQUIPMENT_TOOLS', 'ENVIRONMENTAL', 'PROCEDURAL', 'MANAGEMENT_ORGANIZATIONAL']).optional(),
  description: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const notificationRuleSchema = z.object({
  railroadClient: z.enum(['BNSF', 'UP', 'CSX', 'NS', 'CN', 'KCS']),
  incidentType: z.enum(['INJURY', 'NEAR_MISS', 'PROPERTY_DAMAGE', 'ENVIRONMENTAL', 'VEHICLE', 'FIRE', 'UTILITY_STRIKE']),
  windowMinutes: z.number().int().min(0),
});
