import { z } from 'zod';

export const oshaOverrideSchema = z.object({
  oshaOverrideValue: z.boolean(),
  oshaOverrideJustification: z.string().min(1, 'Justification is required'),
});
