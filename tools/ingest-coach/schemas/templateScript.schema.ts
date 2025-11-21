import { z } from "zod";

export const contentItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["template", "script", "scaffold", "rubric"]),
  description: z.string(),
  content: z.string(),
  placeholders: z.array(z.string()),
  example_usage: z.string(),
  tags: z.array(z.string())
});

export const templateScriptBundleSchema = z.object({
  templates: z.array(contentItemSchema),
  scripts: z.array(contentItemSchema),
  scaffolds: z.array(contentItemSchema),
  rubrics: z.array(contentItemSchema)
});

export type ContentItem = z.infer<typeof contentItemSchema>;
export type TemplateScriptBundle = z.infer<typeof templateScriptBundleSchema>;
