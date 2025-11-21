/**
 * eqConsistency.ts
 *
 * EQConsistency_v1 - Voice similarity checker
 *
 * Checks if the assistant's message "sounds like Jenny" by comparing
 * against Jenny's voice embedding profile.
 *
 * Uses cosine similarity between:
 * - Assistant message embedding
 * - Jenny's canonical voice embedding
 *
 * Score 0-100 (higher = more similar to Jenny)
 */

import type { TelemetryEvent, EQSimilarityDetails, TelemetryFlag } from './types';

/**
 * Jenny's Canonical Voice Embedding (Mock)
 *
 * In production, this would be loaded from:
 * - Pinecone vector DB
 * - Pre-computed embeddings from Jenny's voice samples
 * - Personacoin/EQ chip embeddings
 *
 * For now, we use a mock high-dimensional vector.
 */
let JENNY_VOICE_EMBEDDING: number[] | null = null;

/**
 * Set Jenny Voice Embedding
 *
 * Sets the canonical Jenny voice embedding for comparison.
 * Call this during initialization with pre-computed embedding.
 *
 * @param embedding - Jenny's voice embedding vector
 */
export function setJennyVoiceEmbedding(embedding: number[]): void {
  JENNY_VOICE_EMBEDDING = embedding;
  console.log('[EQConsistency] Jenny voice embedding set:', embedding.length, 'dimensions');
}

/**
 * Get Jenny Voice Embedding
 *
 * Returns Jenny's canonical voice embedding.
 * If not set, returns a mock embedding.
 *
 * @returns Jenny's voice embedding vector
 */
export function getJennyVoiceEmbedding(): number[] {
  if (JENNY_VOICE_EMBEDDING) {
    return JENNY_VOICE_EMBEDDING;
  }

  // Mock embedding: 1536-dimensional vector (OpenAI ada-002 dimension)
  // In production, load from vector DB
  console.warn('[EQConsistency] Using mock Jenny embedding (not production-ready)');
  return Array(1536).fill(0).map(() => Math.random() * 0.1 + 0.5);
}

/**
 * Embed Text (Mock)
 *
 * In production, this would call:
 * - OpenAI embeddings API
 * - Anthropic embeddings
 * - Custom embedding model
 *
 * For now, we use a simple heuristic-based mock.
 *
 * @param text - Text to embed
 * @returns Embedding vector
 */
export async function embedText(text: string): Promise<number[]> {
  // In production:
  // const response = await openai.embeddings.create({
  //   model: 'text-embedding-ada-002',
  //   input: text
  // });
  // return response.data[0].embedding;

  // Mock implementation: heuristic-based pseudo-embedding
  return mockEmbedText(text);
}

/**
 * Mock Embed Text
 *
 * Simple heuristic-based pseudo-embedding for testing.
 * Captures basic text features:
 * - Length
 * - Question marks
 * - Exclamation points
 * - Warmth markers ("you", "we", "let's")
 * - Directive markers ("should", "must", "need to")
 * - Jenny-specific phrases
 *
 * @param text - Text to embed
 * @returns Mock embedding vector (1536 dimensions)
 */
function mockEmbedText(text: string): number[] {
  const embedding = Array(1536).fill(0);

  // Feature 0-10: Basic text stats
  embedding[0] = text.length / 1000;  // Normalized length
  embedding[1] = (text.match(/\?/g) || []).length / 10;  // Question density
  embedding[2] = (text.match(/!/g) || []).length / 10;  // Exclamation density
  embedding[3] = (text.match(/\./g) || []).length / 20;  // Period density

  // Feature 10-20: Warmth markers (Jenny-like)
  const warmthMarkers = ['you', 'we', "let's", 'your', 'our'];
  embedding[10] = warmthMarkers.reduce((sum, marker) =>
    sum + (text.toLowerCase().match(new RegExp(marker, 'g')) || []).length, 0) / 20;

  // Feature 20-30: Directive markers (Un-Jenny-like)
  const directiveMarkers = ['should', 'must', 'need to', 'have to', 'required'];
  embedding[20] = directiveMarkers.reduce((sum, marker) =>
    sum + (text.toLowerCase().match(new RegExp(marker, 'g')) || []).length, 0) / 20;

  // Feature 30-40: Jenny-specific phrases
  const jennyPhrases = [
    "i hear you",
    "makes sense",
    "let's figure this out",
    "you're carrying",
    "your nervous system",
    "permission to",
    "slow this down"
  ];
  embedding[30] = jennyPhrases.reduce((sum, phrase) =>
    sum + (text.toLowerCase().includes(phrase) ? 1 : 0), 0) / jennyPhrases.length;

  // Feature 40-50: Formal/robotic markers (Un-Jenny-like)
  const roboticMarkers = [
    'i understand',
    'i apologize',
    'certainly',
    'furthermore',
    'regarding',
    'please note'
  ];
  embedding[40] = roboticMarkers.reduce((sum, phrase) =>
    sum + (text.toLowerCase().includes(phrase) ? 1 : 0), 0) / roboticMarkers.length;

  // Fill rest with random noise
  for (let i = 50; i < 1536; i++) {
    embedding[i] = Math.random() * 0.1;
  }

  return embedding;
}

/**
 * Cosine Similarity
 *
 * Computes cosine similarity between two vectors.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Cosine similarity (0-1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Run EQ Consistency Check
 *
 * Compares assistant message against Jenny's voice embedding.
 * Returns similarity score 0-100 (higher = more similar).
 *
 * @param event - Telemetry event to check
 * @returns EQ similarity score (0-100)
 */
export async function runEQConsistency(event: TelemetryEvent): Promise<number> {
  // No assistant message = no EQ to check
  if (!event.assistantMessage || event.assistantMessage.trim().length === 0) {
    return 0;
  }

  try {
    // Get Jenny's canonical voice embedding
    const jennyEmbedding = getJennyVoiceEmbedding();

    // Embed assistant message
    const messageEmbedding = await embedText(event.assistantMessage);

    // Compute cosine similarity
    const similarity = cosineSimilarity(messageEmbedding, jennyEmbedding);

    // Convert to 0-100 scale
    const score = Math.floor(similarity * 100);

    return Math.max(0, Math.min(100, score));
  } catch (error) {
    console.error('[EQConsistency] Error computing similarity:', error);
    return 0;
  }
}

/**
 * Get EQ Similarity Details
 *
 * Returns detailed breakdown of EQ similarity computation.
 *
 * @param event - Telemetry event to check
 * @returns Detailed EQ similarity breakdown
 */
export async function getEQSimilarityDetails(event: TelemetryEvent): Promise<EQSimilarityDetails> {
  if (!event.assistantMessage) {
    return {
      cosineSimilarity: 0,
      vectorMagnitude: 0,
      jennyVectorMagnitude: 0,
      comparisonMethod: 'mock'
    };
  }

  try {
    const jennyEmbedding = getJennyVoiceEmbedding();
    const messageEmbedding = await embedText(event.assistantMessage);

    const similarity = cosineSimilarity(messageEmbedding, jennyEmbedding);

    // Compute vector magnitudes
    const messageMagnitude = Math.sqrt(
      messageEmbedding.reduce((sum, val) => sum + val * val, 0)
    );
    const jennyMagnitude = Math.sqrt(
      jennyEmbedding.reduce((sum, val) => sum + val * val, 0)
    );

    return {
      cosineSimilarity: similarity,
      vectorMagnitude: messageMagnitude,
      jennyVectorMagnitude: jennyMagnitude,
      comparisonMethod: JENNY_VOICE_EMBEDDING ? 'embedding' : 'mock'
    };
  } catch (error) {
    console.error('[EQConsistency] Error getting details:', error);
    return {
      cosineSimilarity: 0,
      vectorMagnitude: 0,
      jennyVectorMagnitude: 0,
      comparisonMethod: 'mock'
    };
  }
}

/**
 * Get EQ Consistency Flags
 *
 * Returns specific telemetry flags based on EQ similarity.
 *
 * @param score - EQ similarity score
 * @returns Array of telemetry flags
 */
export function getEQConsistencyFlags(score: number): TelemetryFlag[] {
  const flags: TelemetryFlag[] = [];

  if (score < 75) {
    flags.push('low_eq_similarity');
  }

  if (score < 60) {
    flags.push('voice_drift');
  }

  return flags;
}
