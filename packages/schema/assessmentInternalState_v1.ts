import { z } from 'zod';

export const assessmentInternalStateSchema_v1 = z.object({
  step: z.enum(['init', 'extract', 'oracles', 'narrative', 'strategy', 'output']).optional(),
  extractedProfile: z.any().optional(),
  oracleResults: z.any().optional(),
  narrativeBlocks: z.any().optional(),
  strategyBlocks: z.any().optional(),
});

export type AssessmentInternalState_v1 = z.infer<typeof assessmentInternalStateSchema_v1>;
