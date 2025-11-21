/**
 * index.ts
 *
 * Main exports for Component 47 - Assessment Session Tracker + Data Cleanliness Monitor
 */

// Main telemetry class
export { SessionTelemetry } from './sessionTelemetry';

// Individual inspectors
export {
  runDataLint,
  getCleanlinessDetails,
  getCleanlinessFlags
} from './dataLint';

export {
  runEQConsistency,
  getEQSimilarityDetails,
  getEQConsistencyFlags,
  setJennyVoiceEmbedding,
  getJennyVoiceEmbedding,
  cosineSimilarity
} from './eqConsistency';

export {
  runRAGQuality,
  getRAGRelevanceDetails,
  getRAGQualityFlags,
  analyzeRAGDistribution
} from './ragQuality';

export {
  computeProgressScore,
  getProgressDetails,
  getProgressFlags,
  computeTurnEfficiency,
  detectStalling,
  computeExpectedProgress,
  analyzeProgressVelocity
} from './sessionProgress';

// Types
export type {
  TelemetryEvent,
  TelemetryResult,
  TelemetryFlag,
  TelemetryThresholds,
  TelemetryHistory,
  TelemetrySummary,
  CleanlinessDetails,
  EQSimilarityDetails,
  RAGRelevanceDetails,
  ProgressDetails
} from './types';

export { DEFAULT_THRESHOLDS } from './types';
