/**
 * types.ts
 *
 * Type definitions for Persona Canonicalization Pipeline (Component 41)
 */

/**
 * Persona channel types
 */
export type PersonaChannel =
  | 'language'
  | 'eq'
  | 'coaching'
  | 'archetypes'
  | 'safety';

/**
 * Raw persona concept extracted from text
 */
export interface PersonaConcept {
  type?: string;
  rules?: string[];
  examples?: string[];
  context?: string;
  never_do?: string[];
  [key: string]: any;
}

/**
 * Extracted persona concepts by channel
 */
export interface ExtractedConcepts {
  language: PersonaConcept[];
  eq: PersonaConcept[];
  coaching: PersonaConcept[];
  archetypes: PersonaConcept[];
  safety: PersonaConcept[];
}

/**
 * Canonical persona block - standardized format
 */
export interface CanonicalPersonaBlock {
  id: string;                      // jenny.language.001
  channel: PersonaChannel;
  atomic_unit: string;             // identity_reframe, validation_pattern, etc.
  rules: string[];                 // Behavioral rules
  signature_phrases: string[];     // Example phrases
  usage_context: string;           // When/how to use
  example_dialogue?: string[];     // Example conversations
  negation_rules: string[];        // What NOT to do
  metadata?: Record<string, any>;
}

/**
 * Embedding-ready chunk
 */
export interface EmbeddingChunk {
  id: string;                      // jenny.language.001.chunk.0
  channel: PersonaChannel;
  text: string;                    // Chunk content
  block_id?: string;               // Reference to original block
  token_count?: number;
  weight?: number;
}

/**
 * Pipeline stage result
 */
export interface StageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  stage: string;
}

/**
 * Pipeline configuration
 */
export interface PipelineConfig {
  rawDir: string;
  canonicalDir: string;
  chunkDir: string;
  embedDir: string;
  chunkSize: number;              // Target tokens per chunk
  llmModel: string;               // Model for LLM stages
  verbose: boolean;
}
