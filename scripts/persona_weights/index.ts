/**
 * index.ts
 *
 * Main exports for Component 42 - Persona Weight Tuner + Drift Correction
 */

// Main tuner
export {
  runPersonaTuner,
  detectDrift,
  batchProcessOutputs,
  getPersonaDriftStats,
  checkDriftOnly,
  DEFAULT_CONFIG,
} from './run_tuner';

// Utilities
export {
  loadCanonicalPersonaEmbedding,
  loadPersonaWeights,
  savePersonaWeights,
  loadCanonicalBlocks,
  getSignatureElements,
} from './util/loadPersona';

export {
  computeCosineSimilarity,
  computeCosineDistance,
  computeEuclideanDistance,
  normalizeVector,
  weightedAverage,
  findNearest,
  batchComputeSimilarities,
} from './util/similarity';

export {
  rewriteToPersonaStyle,
  rewriteWithLLM,
  batchRewrite,
  getRewriteSuggestions,
} from './util/personaRewrite';

export {
  saveDriftEvent,
  loadDriftEvents,
  getDriftStats,
  clearDriftLog,
  exportDriftLog,
  getDriftEventsByTimeRange,
  getWorstDriftEvents,
} from './util/driftLogger';

// Types
export type {
  DriftLevel,
  DriftThresholds,
  PersonaProfile,
  ChannelWeights,
  AdaptiveTuning,
  EvolutionEvent,
  PersonaWeights,
  DriftDetectionResult,
  DriftEvent,
  RewriteOptions,
  TunerConfig,
} from './types';
