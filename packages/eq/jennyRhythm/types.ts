/**
 * jennyRhythm/types.ts
 *
 * Type definitions for Jenny's Sentence-Rhythm Model.
 * Defines emotional states, pacing, archetypes, and rhythm patterns.
 */

/**
 * Emotional state of the student (derived from EQ runtime)
 */
export type EmotionalState = "stable" | "stressed" | "overwhelmed";

/**
 * Pacing directive for rhythm generation
 */
export type RhythmPacing = "slow" | "medium" | "fast";

/**
 * Archetype labels for rhythm adaptation
 */
export type ArchetypeLabel =
  | "HighAchiever"
  | "AnxiousPerfectionist"
  | "UnfocusedExplorer"
  | "ReluctantPragmatist"
  | "OverscheduledOverachiever"
  | "QuietDeepThinker"
  | "Unknown";

/**
 * Clause generation options
 */
export interface ClauseOptions {
  emotionalState: EmotionalState;
  pacing: RhythmPacing;
  archetype: ArchetypeLabel;
}

/**
 * Rhythm pattern types
 */
export type RhythmPattern =
  | "validation-direction"      // acknowledge → aim
  | "validation-direction-encouragement"  // acknowledge → aim → act
  | "grounding-clarity"          // emotion → structure
  | "empathy-action";            // feeling → doing

/**
 * Sentence arc structure
 */
export interface SentenceArc {
  validation?: string;           // Emotional resonance clause
  direction?: string;            // Action/clarity clause
  encouragement?: string;        // Optional closing support
  pattern: RhythmPattern;
}

/**
 * Rhythm rewrite options
 */
export interface RewriteOptions {
  tone: any;                     // ToneDirective from toneModulationEngine
  emotionalState: EmotionalState;
  pacing: RhythmPacing;
  archetype: ArchetypeLabel;
  preserveLength?: boolean;      // Try to maintain similar length to input
  maxSentences?: number;         // Cap number of sentences in output
}

/**
 * Jenny's Rhythm DNA - the core pacing pillars
 */
export interface RhythmDNA {
  pacingPillars: {
    shortPunch: string[];        // Opening clauses
    mediumExpansion: string[];   // Middle elaboration
    softLanding: string[];       // Closing validation
  };
  emotionalCadence: string[];    // "gentle → grounding → actionable → validating"
  breathMarkers: string[];       // "Okay,", "So,", "Here's the thing,"
}

/**
 * Thought unit - a single coherent idea to be rewritten
 */
export interface ThoughtUnit {
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
  requiresValidation: boolean;
  requiresDirection: boolean;
}
