/**
 * jennyVocab/index.ts
 *
 * Main export file for Jenny's Vocabulary & Idiom Model.
 * Provides unified interface to all vocabulary components.
 */

// Core classes
export { JennyWordChoiceEngine } from "./wordChoiceEngine";
export { JennyIdiomSelector, ALL_IDIOM_CLUSTERS, GROUNDING_IDIOMS, REFRAME_IDIOMS, GUIDANCE_IDIOMS, VALIDATION_IDIOMS, FUTURE_SELF_IDIOMS } from "./idiomClusters";
export { JennySubstitutionEngine, SUBSTITUTION_RULES, quickSubstitute } from "./substitutionEngine";
export { JennySemanticFilter, FILTER_RULES, quickFilter, validateJennyVoice } from "./semanticFilter";
export { JennyVocabEngine, quickTransform, quickValidate, VocabTransformOptions } from "./jennyVocabEngine";

// Types
export type {
  VocabMode,
  ArchetypeLabel,
  EmotionalState,
  VocabContext,
  VocabularyDomain,
  IdiomCluster,
  SubstitutionRule,
  FilterRule,
  ArchetypeVocabMapping,
  VocabSelection,
} from "./types";
