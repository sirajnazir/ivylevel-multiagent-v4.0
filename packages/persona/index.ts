/**
 * persona/index.ts
 *
 * Main exports for Component 40 - Jenny Persona Embedding Model
 */

// Types
export type {
  EmbeddingChannel,
  EmbeddingVector,
  PersonaChunk,
  CompositePersonaVector,
  ChannelWeights,
  PersonaRetrievalContext,
  RetrievedPersonaChunk,
  DriftDetectionResult,
  PersonaConditioningContext,
  PersonaEmbeddingConfig,
  PersonaDataSources,
  EmbeddingIndex,
} from './types';

// Core classes
export { PersonaChunkProcessor } from './chunkProcessor';
export { EmbeddingService } from './embeddingService';
export { DriftDetector } from './driftDetector';
export {
  PersonaEmbeddingEngine,
  DEFAULT_CHANNEL_WEIGHTS,
  createDefaultConfig,
} from './personaEmbeddingEngine';
