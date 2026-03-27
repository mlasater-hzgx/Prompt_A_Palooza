import { z } from 'zod';

// ---------------------------------------------------------------------------
// Enums (mirrored from Prisma for Zod validation)
// ---------------------------------------------------------------------------

const InvestigationStatusEnum = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'PENDING_REVIEW',
  'COMPLETE',
]);

const RootCauseMethodEnum = z.enum(['FIVE_WHY', 'FISHBONE', 'BOTH']);

const ReviewActionEnum = z.enum(['APPROVED', 'RETURNED']);

const FishboneCategoryEnum = z.enum([
  'PEOPLE',
  'PROCESS',
  'EQUIPMENT',
  'MATERIALS',
  'ENVIRONMENT',
  'MANAGEMENT',
]);

// ---------------------------------------------------------------------------
// Investigation schemas
// ---------------------------------------------------------------------------

export const createInvestigationSchema = z.object({
  leadInvestigatorId: z.string().uuid().optional(),
  investigationTeam: z.array(z.string()).optional(),
  rootCauseMethod: RootCauseMethodEnum.optional(),
});

export const updateInvestigationSchema = z.object({
  leadInvestigatorId: z.string().uuid().nullable().optional(),
  investigationTeam: z.array(z.string()).optional(),
  investigationSummary: z.string().optional(),
  rootCauseMethod: RootCauseMethodEnum.nullable().optional(),
  rootCauseSummary: z.string().optional(),
  recommendations: z.string().optional(),
  status: InvestigationStatusEnum.optional(),
});

export const reviewSchema = z.object({
  reviewAction: ReviewActionEnum,
  reviewComments: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Root-cause analysis schemas
// ---------------------------------------------------------------------------

export const fiveWhySchema = z.object({
  sequence: z.number().int().min(1).max(7),
  question: z.string().min(1),
  answer: z.string().min(1),
  evidence: z.string().optional(),
});

export const fishboneSchema = z.object({
  category: FishboneCategoryEnum,
  description: z.string().min(1),
  isContributing: z.boolean().optional(),
  evidence: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

// ---------------------------------------------------------------------------
// Contributing factor schema
// ---------------------------------------------------------------------------

export const contributingFactorSchema = z.object({
  factorTypeId: z.string().uuid(),
  description: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Query schema (for GET /investigations list)
// ---------------------------------------------------------------------------

export const investigationQuerySchema = z.object({
  status: z.string().optional(),
  leadInvestigatorId: z.string().optional(),
  overdue: z
    .string()
    .transform((v) => v === 'true')
    .optional(),
});
