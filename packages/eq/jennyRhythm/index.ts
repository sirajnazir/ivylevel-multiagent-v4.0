/**
 * jennyRhythm/index.ts
 *
 * Main export file for Jenny's Sentence-Rhythm Model.
 * Provides unified interface to all rhythm components.
 */

// Core classes
export { JennyClauseGenerator } from "./clauseGenerator";
export { JennyRhythmEngine, buildQuickArc, buildAutoArc } from "./rhythmEngine";
export { JennyRewriter, quickRewrite, lightRewrite } from "./rewriter";

// Types
export type {
  EmotionalState,
  RhythmPacing,
  ArchetypeLabel,
  ClauseOptions,
  RhythmPattern,
  SentenceArc,
  RewriteOptions,
  RhythmDNA,
  ThoughtUnit,
} from "./types";
