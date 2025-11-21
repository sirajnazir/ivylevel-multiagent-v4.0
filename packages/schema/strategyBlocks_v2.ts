import { z } from 'zod';

/**
 * Strategy Blocks Schema v2.0
 * Structured strategy output from Assessment Agent
 * Includes 12-month plan, summer planning scenarios, and awards targets
 */

// ============================================================
// ONE-MONTH PLAN STRUCTURE
// ============================================================

export const oneMonthPlanSchema = z.object({
  month: z.string(),
  priorities: z.array(z.string()),
  risks: z.array(z.string()),
  tasks: z.array(z.string()),
});

// ============================================================
// SUMMER SCENARIO STRUCTURE
// ============================================================

export const summerScenarioSchema = z.object({
  scenario: z.enum(['baseline', 'stretch', 'moonshot']),
  focusAreas: z.array(z.string()),
  commitments: z.array(z.string()),
  risks: z.array(z.string()),
});

// ============================================================
// AWARD TARGET STRUCTURE
// ============================================================

export const awardTargetSchema = z.object({
  name: z.string(),
  tier: z.enum(['school', 'local', 'state', 'national', 'international']),
  likelihood: z.enum(['low', 'medium', 'high']),
  rationale: z.string(),
});

// ============================================================
// FULL STRATEGY BLOCKS v2
// ============================================================

export const strategyBlocksSchema_v2 = z.object({
  twelveMonthPlan: z.array(oneMonthPlanSchema).length(12),
  summerPlanning: z.array(summerScenarioSchema).length(3),
  awardsTargets: z.array(awardTargetSchema),
});

export type StrategyBlocks_v2 = z.infer<typeof strategyBlocksSchema_v2>;
