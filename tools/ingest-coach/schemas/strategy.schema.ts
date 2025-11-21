import { z } from "zod";

const strategyItem = z.object({
  id: z.string(),
  name: z.string(),
  steps: z.array(z.string()),
  conditions: z.array(z.string()).optional(),
  evidence: z.array(z.string()),
  tags: z.array(z.string())
});

export const strategyBundleSchema = z.object({
  frameworks: z.array(strategyItem),
  tacticalSequences: z.array(strategyItem),
  playbooks: z.array(strategyItem),
  decisionHeuristics: z.array(strategyItem),
  studentTypeAdaptations: z.array(strategyItem),
  examples: z.array(z.string())
});

export type StrategyItem = z.infer<typeof strategyItem>;
export type StrategyBundle = z.infer<typeof strategyBundleSchema>;
