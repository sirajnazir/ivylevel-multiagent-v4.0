/**
 * index.ts
 *
 * Main exports for Persona Canonicalization Pipeline (Component 41)
 */

// Main orchestrator
export { runPipeline, DEFAULT_CONFIG } from './run';

// Stage functions
export { normalizeRawText, normalizeLLM, NORMALIZATION_PROMPT } from './stages/normalize';
export { extractPersonaConcepts, extractConceptsLLM, EXTRACTION_PROMPT } from './stages/extractConcepts';
export {
  canonicalizeConcepts,
  validateBlock,
  mergeDuplicateBlocks,
  sortBlocks,
  getBlockStats,
} from './stages/canonicalize';
export { chunkPersonaBlocks, getChunkStats } from './stages/chunk';

// Utilities
export {
  writeJSON,
  readJSON,
  estimateTokens,
  generateId,
  cleanWhitespace,
  safeJsonParse,
  extractJson,
  log,
} from './util';

// Types
export type {
  PersonaChannel,
  PersonaConcept,
  ExtractedConcepts,
  CanonicalPersonaBlock,
  EmbeddingChunk,
  StageResult,
  PipelineConfig,
} from './types';
