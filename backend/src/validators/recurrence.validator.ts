import { z } from 'zod';

export const manualLinkSchema = z.object({
  incidentId: z.string().uuid(),
  relatedIncidentId: z.string().uuid(),
  similarityType: z.enum([
    'SAME_LOCATION',
    'SAME_TYPE',
    'SAME_ROOT_CAUSE',
    'SAME_EQUIPMENT',
    'SAME_PERSON',
  ]),
  notes: z.string().optional(),
});
