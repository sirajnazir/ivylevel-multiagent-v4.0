import { z } from "zod";

/**
 * Coach Data Ingestion Manifest Schema
 * Tracks all ingestion runs, curated files, and extracted patterns
 */

export const ingestionRunSchema = z.object({
  runId: z.string(),
  timestamp: z.string(),
  sourceFiles: z.array(z.string()),
  curatedFiles: z.array(z.string()),
  eqPatternFiles: z.array(z.string()).optional(),
  frameworkFiles: z.array(z.string()).optional(),
  tacticsFiles: z.array(z.string()).optional(),
  toolingFiles: z.array(z.string()).optional(),
  templateScriptFiles: z.array(z.string()).optional(),
  personaFiles: z.array(z.string()).optional(),
  strategyFiles: z.array(z.string()).optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  errors: z.array(z.string()).optional()
});

export const manifestSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  ingestionRuns: z.array(ingestionRunSchema),
  totalSourceFiles: z.number(),
  totalEqPatterns: z.number().optional(),
  totalFrameworks: z.number().optional(),
  totalTactics: z.number().optional(),
  totalTooling: z.number().optional(),
  totalTemplateScripts: z.number().optional(),
  totalPersonas: z.number().optional(),
  totalStrategies: z.number().optional()
});

export type IngestionRun = z.infer<typeof ingestionRunSchema>;
export type Manifest = z.infer<typeof manifestSchema>;
