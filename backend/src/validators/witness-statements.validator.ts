import { z } from 'zod';

export const createWitnessStatementSchema = z.object({
  witnessName: z.string().min(1, 'Witness name is required'),
  statementText: z.string().min(1, 'Statement text is required'),
  witnessTitle: z.string().optional(),
  witnessEmployer: z.string().optional(),
  witnessPhone: z.string().optional(),
  statementDate: z.string().optional(),
});

export const updateWitnessStatementSchema = z.object({
  witnessName: z.string().min(1, 'Witness name is required').optional(),
  statementText: z.string().min(1, 'Statement text is required').optional(),
  witnessTitle: z.string().nullable().optional(),
  witnessEmployer: z.string().nullable().optional(),
  witnessPhone: z.string().nullable().optional(),
  statementDate: z.string().nullable().optional(),
});
