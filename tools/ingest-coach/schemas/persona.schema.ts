import { z } from "zod";

const personaItem = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  evidence: z.array(z.string()),
  tags: z.array(z.string())
});

export const personaBundleSchema = z.object({
  personaTraits: z.array(personaItem),
  voiceCharacteristics: z.array(personaItem),
  signaturePhrases: z.array(personaItem),
  eqMicroPatterns: z.array(personaItem),
  studentAdaptationBehaviors: z.array(personaItem),
  exampleSnippets: z.array(z.string())
});

export type PersonaItem = z.infer<typeof personaItem>;
export type PersonaBundle = z.infer<typeof personaBundleSchema>;
