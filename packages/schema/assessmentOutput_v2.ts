import { z } from 'zod';
import { extractedProfileSchema_v2 } from './extractedProfile_v2';
import { oracleResultsSchema_v2 } from './oracleResults_v2';
import { narrativeBlocksSchema_v2 } from './narrativeBlocks_v2';
import { strategyBlocksSchema_v2 } from './strategyBlocks_v2';

/**
 * Assessment Output Schema v2.0
 * Complete output from Assessment Agent pipeline
 * Includes profile, oracles, narrative, strategy, and metadata
 */

export const assessmentOutputSchema_v2 = z.object({
  profile: extractedProfileSchema_v2,
  oracles: oracleResultsSchema_v2,
  narrative: narrativeBlocksSchema_v2,
  strategy: strategyBlocksSchema_v2,
  metadata: z.object({
    modelVersion: z.string(),
    generatedAt: z.string(),
    agentVersion: z.string(),
  }),
});

export type AssessmentOutput_v2 = z.infer<typeof assessmentOutputSchema_v2>;
