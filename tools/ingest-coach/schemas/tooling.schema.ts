import { z } from "zod";

export const toolChipSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  description: z.string(),
  when_used: z.string(),
  how_used: z.string(),
  benefit: z.string(),
  example_usage: z.string(),
  student_fit: z.string(),
  tags: z.array(z.string())
});

export const toolingArraySchema = z.array(toolChipSchema);

export type ToolChip = z.infer<typeof toolChipSchema>;
export type ToolingChipArray = z.infer<typeof toolingArraySchema>;
