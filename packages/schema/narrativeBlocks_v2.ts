import { z } from 'zod';

/**
 * Narrative Blocks Schema v2.0
 * Structured narrative modeling output from Assessment Agent
 * Includes thematic hubs, flagship narrative, positioning, identity thread
 */

// ============================================================
// NARRATIVE BLOCKS v2
// ============================================================

export const narrativeBlocksSchema_v2 = z.object({
  /**
   * Three thematic hubs extracted from student profile
   * Each hub represents a core dimension of the student's narrative
   * Example: ["STEM Research Leadership", "Community Health Advocacy", "Cultural Bridge-Building"]
   */
  thematicHubs: z.tuple([z.string(), z.string(), z.string()]),

  /**
   * Flagship narrative arc that ties all thematic hubs together
   * This is the student's "admissions story" - the central thread
   * Example: "A future physician-scientist leveraging computational biology to democratize healthcare access in underserved communities"
   */
  flagshipNarrative: z.string(),

  /**
   * Admissions positioning statement
   * How the student should be positioned to admissions officers
   * Example: "Interdisciplinary innovator with exceptional depth in biomedical research and proven commitment to health equity"
   */
  positioning: z.string(),

  /**
   * Identity thread - core identity claim
   * Example: "Compassionate scientist and community health advocate"
   */
  identityThread: z.string(),

  /**
   * Narrative risks - areas where the student's narrative may be weak or unclear
   * Example: ["Lacks clear connection between STEM pursuits and humanities interests", "Leadership roles are fragmented across too many domains"]
   */
  risks: z.array(z.string()),

  /**
   * Narrative opportunities - areas where the student can strengthen their story
   * Example: ["Summer research could provide flagship project for flagship narrative", "Essay opportunity to connect cultural background to STEM identity"]
   */
  opportunities: z.array(z.string()),
});

export type NarrativeBlocks_v2 = z.infer<typeof narrativeBlocksSchema_v2>;
