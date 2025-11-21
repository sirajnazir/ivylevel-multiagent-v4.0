/**
 * persona/types.ts
 *
 * Type definitions for Component 40 - Jenny Persona Embedding Model
 * Defines embedding channels, composite vectors, and drift detection.
 */

/**
 * Embedding channel types - the 6 core persona dimensions
 */
export type EmbeddingChannel =
  | "language"      // Language & idiom patterns
  | "eq"            // Emotional intelligence patterns
  | "strategy"      // Coaching strategy patterns
  | "pattern"       // Pattern recognition signatures
  | "archetype"     // Archetype interaction patterns
  | "safety";       // Boundaries & anti-patterns

/**
 * Embedding vector - represents a single embedded concept
 */
export interface EmbeddingVector {
  vector: number[];           // The actual embedding (e.g., 1536 dimensions)
  text: string;               // Original text that was embedded
  channel: EmbeddingChannel;  // Which channel this belongs to
  weight: number;             // Importance weight (0-1)
  metadata?: Record<string, any>;
}

/**
 * Persona chunk - atomic persona concept ready for embedding
 */
export interface PersonaChunk {
  id: string;
  text: string;
  channel: EmbeddingChannel;
  weight: number;
  category?: string;          // Sub-category within channel
  tags?: string[];
  metadata?: Record<string, any>;
}

/**
 * Composite persona vector - weighted combination of all channels
 */
export interface CompositePersonaVector {
  vector: number[];           // Combined vector
  channelVectors: {           // Individual channel contributions
    language: number[];
    eq: number[];
    strategy: number[];
    pattern: number[];
    archetype: number[];
    safety: number[];
  };
  weights: {                  // Channel weights used
    language: number;
    eq: number;
    strategy: number;
    pattern: number;
    archetype: number;
    safety: number;
  };
  timestamp: number;
}

/**
 * Channel weights for composite vector generation
 */
export interface ChannelWeights {
  language: number;   // Default: 0.35
  eq: number;         // Default: 0.30
  strategy: number;   // Default: 0.20
  pattern: number;    // Default: 0.10
  archetype: number;  // Default: 0.05
  safety: number;     // Default: 0.05 (but critical for filtering)
}

/**
 * Persona retrieval context - what we're trying to match
 */
export interface PersonaRetrievalContext {
  archetype?: string;
  emotionalState?: string;
  coachingMove?: string;
  sessionStage?: string;
  userMessage?: string;
  topK?: number;              // How many chunks to retrieve (default: 5)
}

/**
 * Retrieved persona chunks with similarity scores
 */
export interface RetrievedPersonaChunk {
  chunk: PersonaChunk;
  embedding: EmbeddingVector;
  similarity: number;         // Cosine similarity score
  reason?: string;            // Why this was retrieved
}

/**
 * Drift detection result
 */
export interface DriftDetectionResult {
  similarity: number;         // Cosine similarity to Jenny composite
  hasDrift: boolean;          // Is similarity < threshold?
  threshold: number;          // Threshold used (default: 0.78)
  suggestions: string[];      // How to fix drift
  channelDrift?: {            // Per-channel drift scores
    language: number;
    eq: number;
    strategy: number;
    pattern: number;
    archetype: number;
    safety: number;
  };
}

/**
 * Persona conditioning context - fed to LLM for consistency
 */
export interface PersonaConditioningContext {
  personaChunks: RetrievedPersonaChunk[];  // Top retrieved chunks
  rhythmLayer?: any;                        // From Component 38
  eqLayer?: any;                            // From EQ engines
  archetypeLayer?: any;                     // From archetype system
  compositeVector?: CompositePersonaVector; // Full composite for drift check
}

/**
 * Persona embedding configuration
 */
export interface PersonaEmbeddingConfig {
  personaName: string;        // e.g., "jenny"
  dataDir: string;            // Path to persona data
  embeddingModel: string;     // e.g., "text-embedding-3-large"
  vectorDimension: number;    // Embedding dimensions (e.g., 1536)
  chunkSize: number;          // Token size per chunk (150-250)
  channelWeights: ChannelWeights;
  driftThreshold: number;     // Default: 0.78
}

/**
 * Persona data sources
 */
export interface PersonaDataSources {
  coreLanguage: string;       // Path to core_language.md
  eqPatterns: string;         // Path to eq_patterns.md
  heuristics: string;         // Path to heuristics.json
  coachingPatterns: string;   // Path to coaching_patterns.json
  archetypeMappings: string;  // Path to archetype_mappings.json
  negativeExamples: string;   // Path to negative_examples.md
  goldenThread: string;       // Path to golden_thread.md
}

/**
 * Embedding index entry - for persistence
 */
export interface EmbeddingIndexEntry {
  chunkId: string;
  channel: EmbeddingChannel;
  text: string;
  vector: number[];
  weight: number;
  metadata: Record<string, any>;
}

/**
 * Embedding index - persisted collection of embeddings
 */
export interface EmbeddingIndex {
  version: string;
  personaName: string;
  embeddingModel: string;
  vectorDimension: number;
  createdAt: number;
  entries: EmbeddingIndexEntry[];
  compositeVector: CompositePersonaVector;
}
