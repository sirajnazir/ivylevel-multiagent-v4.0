import { z } from "zod";

export const frameworkChipSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  steps: z.array(z.string()),
  decision_rules: z.array(z.string()),
  intended_outcome: z.string(),
  example_usage: z.string(),
  student_fit: z.string(),
  dependencies: z.array(z.string()),
  tags: z.array(z.string())
});

export const frameworkArraySchema = z.array(frameworkChipSchema);

export type FrameworkChip = z.infer<typeof frameworkChipSchema>;
export type FrameworkChipArray = z.infer<typeof frameworkArraySchema>;
