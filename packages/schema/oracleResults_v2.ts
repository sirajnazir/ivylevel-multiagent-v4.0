import { z } from 'zod';

/**
 * Oracle Results Schema v2.0
 * Aggregates outputs from APS oracles (Aptitude, Passion, Service)
 * Breaking change from v1 (empty object) to v2 (structured results)
 */

// ============================================================
// INDIVIDUAL ORACLE RESULT STRUCTURE
// ============================================================

export const oracleResultSchema = z.object({
  score: z.number().min(0).max(100),
  evidence: z.array(z.string()),
  rationale: z.string(),
});

// ============================================================
// FULL ORACLE RESULTS v2
// ============================================================

export const oracleResultsSchema_v2 = z.object({
  aptitude: oracleResultSchema,
  passion: oracleResultSchema,
  service: oracleResultSchema,
  // Future integrations from legacy v3 oracles
  ivyScore: z.number().optional(),
  weakSpots: z.array(z.string()).optional(),
});

export type OracleResults_v2 = z.infer<typeof oracleResultsSchema_v2>;

// ============================================================
// SUB-TYPES FOR CONVENIENCE
// ============================================================

export type OracleResult = z.infer<typeof oracleResultSchema>;
