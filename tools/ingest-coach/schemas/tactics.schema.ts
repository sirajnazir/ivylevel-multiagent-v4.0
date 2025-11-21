import { z } from "zod";

export const tacticSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  trigger: z.string(),
  action: z.string(),
  outcome: z.string(),
  example_usage: z.string(),
  notes: z.string().optional()
});

export const tacticsArraySchema = z.array(tacticSchema);

export type TacticChip = z.infer<typeof tacticSchema>;
export type TacticsChipArray = z.infer<typeof tacticsArraySchema>;
