/**
 * jennyVocab/types.ts
 *
 * Type definitions for Jenny's Vocabulary & Idiom Model.
 * Defines vocabulary domains, idiom patterns, and word choice contexts.
 */

/**
 * Vocabulary mode - determines which vocabulary domain to use
 */
export type VocabMode = "validate" | "guide" | "reframe" | "identity" | "momentum" | "clarity" | "safety";

/**
 * Archetype labels for vocabulary tailoring
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
 * Emotional state for vocabulary selection
 */
export type EmotionalState = "stable" | "stressed" | "overwhelmed";

/**
 * Context for vocabulary selection
 */
export interface VocabContext {
  archetype: ArchetypeLabel;
  emotionalState: EmotionalState;
  mode: VocabMode;
}

/**
 * Vocabulary domain - a thematic cluster of Jenny phrases
 */
export interface VocabularyDomain {
  name: string;
  description: string;
  phrases: string[];
}

/**
 * Idiom cluster - reusable phrase patterns
 */
export interface IdiomCluster {
  name: string;
  type: "grounding" | "reframe" | "guidance" | "validation" | "future-self";
  phrases: string[];
}

/**
 * Phrase substitution rule
 */
export interface SubstitutionRule {
  neutral: string;        // Generic AI phrase
  jenny: string;          // Jenny-style replacement
  caseSensitive?: boolean;
}

/**
 * Semantic filter rule
 */
export interface FilterRule {
  pattern: string | RegExp;
  reason: string;
  replacement?: string;   // Optional replacement
}

/**
 * Archetype-specific vocabulary mapping
 */
export interface ArchetypeVocabMapping {
  archetype: ArchetypeLabel;
  cluster: string[];      // Key phrases for this archetype
}

/**
 * Vocabulary selection result
 */
export interface VocabSelection {
  phrase: string;
  domain: string;
  mode: VocabMode;
  archetype?: ArchetypeLabel;
}
