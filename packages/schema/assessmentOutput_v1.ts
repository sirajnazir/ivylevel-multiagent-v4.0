import { z } from 'zod';

export const assessmentOutputSchema_v1 = z.object({
  profile: z.object({
    academics: z.object({}),
    activities: z.object({}),
    awards: z.object({}),
    personality: z.object({}),
  }),
  diagnostics: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    academicGaps: z.array(z.string()),
    ECDepthGaps: z.array(z.string()),
  }),
  narrative: z.object({
    themes: z.array(z.string()),
    identityThread: z.string(),
    positioning: z.string(),
  }),
  strategy: z.object({
    '12MonthPlan': z.array(z.string()),
    summerPlanning: z.array(z.string()),
    awardsTargets: z.array(z.string()),
  }),
  metadata: z.object({
    modelVersion: z.string(),
    generatedAt: z.string(),
  }),
});

export type AssessmentOutput_v1 = z.infer<typeof assessmentOutputSchema_v1>;
