import { z } from 'zod';

export const createInjuredPersonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  employeeId: z.string().optional(),
  jobTitle: z.string().optional(),
  division: z
    .enum(['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP'])
    .optional(),
  yearsExperience: z.number().min(0).optional(),
  injuryType: z
    .enum([
      'LACERATION',
      'FRACTURE',
      'STRAIN_SPRAIN',
      'CONTUSION',
      'BURN',
      'AMPUTATION',
      'RESPIRATORY',
      'HEARING',
      'EYE',
      'OTHER',
    ])
    .optional(),
  bodyPart: z
    .enum([
      'HEAD',
      'EYES',
      'NECK',
      'SHOULDER',
      'ARM',
      'HAND',
      'FINGER',
      'BACK',
      'CHEST',
      'ABDOMEN',
      'HIP',
      'LEG',
      'KNEE',
      'FOOT',
      'TOE',
      'MULTIPLE',
    ])
    .optional(),
  side: z.enum(['LEFT', 'RIGHT', 'BOTH', 'NA']).optional(),
  treatmentType: z
    .enum(['NONE', 'FIRST_AID', 'ER_VISIT', 'HOSPITALIZATION', 'ONGOING_TREATMENT'])
    .optional(),
  treatmentFacility: z.string().optional(),
  physician: z.string().optional(),
  returnedToWork: z.boolean().optional(),
  returnDate: z.string().optional(),
  isSubcontractor: z.boolean().optional(),
  subcontractorCompany: z.string().optional(),
});

export const updateInjuredPersonSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  employeeId: z.string().optional(),
  jobTitle: z.string().optional(),
  division: z
    .enum(['HCC', 'HRSI', 'HSI', 'HTI', 'HTSI', 'HERZOG_ENERGY', 'GREEN_GROUP'])
    .nullable()
    .optional(),
  yearsExperience: z.number().min(0).nullable().optional(),
  injuryType: z
    .enum([
      'LACERATION',
      'FRACTURE',
      'STRAIN_SPRAIN',
      'CONTUSION',
      'BURN',
      'AMPUTATION',
      'RESPIRATORY',
      'HEARING',
      'EYE',
      'OTHER',
    ])
    .nullable()
    .optional(),
  bodyPart: z
    .enum([
      'HEAD',
      'EYES',
      'NECK',
      'SHOULDER',
      'ARM',
      'HAND',
      'FINGER',
      'BACK',
      'CHEST',
      'ABDOMEN',
      'HIP',
      'LEG',
      'KNEE',
      'FOOT',
      'TOE',
      'MULTIPLE',
    ])
    .nullable()
    .optional(),
  side: z.enum(['LEFT', 'RIGHT', 'BOTH', 'NA']).nullable().optional(),
  treatmentType: z
    .enum(['NONE', 'FIRST_AID', 'ER_VISIT', 'HOSPITALIZATION', 'ONGOING_TREATMENT'])
    .nullable()
    .optional(),
  treatmentFacility: z.string().nullable().optional(),
  physician: z.string().nullable().optional(),
  returnedToWork: z.boolean().nullable().optional(),
  returnDate: z.string().nullable().optional(),
  isSubcontractor: z.boolean().optional(),
  subcontractorCompany: z.string().nullable().optional(),
});
