import { z } from 'zod';

export const createCapaSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  actionType: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  category: z.enum([
    'TRAINING',
    'PROCEDURE_CHANGE',
    'ENGINEERING_CONTROL',
    'PPE',
    'EQUIPMENT_MODIFICATION',
    'DISCIPLINARY',
    'POLICY_CHANGE',
    'OTHER',
  ]),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  assignedToId: z.string().uuid().optional(),
});

export const updateCapaSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  actionType: z.enum(['CORRECTIVE', 'PREVENTIVE']).optional(),
  category: z
    .enum([
      'TRAINING',
      'PROCEDURE_CHANGE',
      'ENGINEERING_CONTROL',
      'PPE',
      'EQUIPMENT_MODIFICATION',
      'DISCIPLINARY',
      'POLICY_CHANGE',
      'OTHER',
    ])
    .optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  assignedToId: z.string().uuid().optional(),
});

export const verifyCapaSchema = z.object({
  verificationResult: z.enum(['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'INEFFECTIVE']),
  verificationNotes: z.string().optional(),
});

export const completeCapaSchema = z.object({
  completionNotes: z.string().optional(),
  completionEvidence: z.array(z.string()).optional(),
});

export const capaQuerySchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
  overdue: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
  incidentId: z.string().uuid().optional(),
});
