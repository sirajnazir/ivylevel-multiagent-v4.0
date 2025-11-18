import { z } from 'zod';

export const assessmentInputSchema_v1 = z.object({
  studentId: z.string(),
  transcriptText: z.string(),
  rawMessages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  contextDocuments: z.array(z.string()),
  existingStudentProfile: z.object({}).nullable(),
});

export type AssessmentInput_v1 = z.infer<typeof assessmentInputSchema_v1>;
