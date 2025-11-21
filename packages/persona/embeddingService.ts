/**
 * persona/embeddingService.ts
 *
 * Service for generating embeddings for persona chunks.
 * In production, this would call OpenAI's embedding API.
 * For now, we provide a mock implementation with deterministic vectors.
 */

import type {
  PersonaChunk,
  EmbeddingVector,
  CompositePersonaVector,
  ChannelWeights,
} from './types';

/**
 * Embedding Service
 * Generates embedding vectors for persona chunks
 */
export class EmbeddingService {
  private embeddingModel: string;
  private vectorDimension: number;

  constructor(embeddingModel: string = 'text-embedding-3-large', vectorDimension: number = 1536) {
    this.embeddingModel = embeddingModel;
    this.vectorDimension = vectorDimension;
  }

  /**
   * Generate embedding for a single chunk
   *
   * NOTE: In production, this would call OpenAI's embedding API:
   * const response = await openai.embeddings.create({
   *   model: this.embeddingModel,
   *   input: chunk.text,
   * });
   * return response.data[0].embedding;
   *
   * For now, we use a deterministic mock based on text hash.
   */
  async embedChunk(chunk: PersonaChunk): Promise<EmbeddingVector> {
    // Mock embedding: hash text to create deterministic vector
    const vector = this.generateMockEmbedding(chunk.text);

    return {
      vector,
      text: chunk.text,
      channel: chunk.channel,
      weight: chunk.weight,
      metadata: chunk.metadata,
    };
  }

  /**
   * Generate embeddings for multiple chunks
   */
  async embedChunks(chunks: PersonaChunk[]): Promise<EmbeddingVector[]> {
    const embeddings: EmbeddingVector[] = [];

    for (const chunk of chunks) {
      embeddings.push(await this.embedChunk(chunk));
    }

    return embeddings;
  }

  /**
   * Generate composite persona vector from channel embeddings
   */
  generateCompositeVector(
    channelEmbeddings: Map<string, EmbeddingVector[]>,
    weights: ChannelWeights
  ): CompositePersonaVector {
    // Average embeddings per channel
    const channelVectors: any = {};

    for (const [channel, embeddings] of channelEmbeddings.entries()) {
      if (embeddings.length === 0) {
        channelVectors[channel] = this.zeroVector();
      } else {
        channelVectors[channel] = this.averageVectors(embeddings.map(e => e.vector));
      }
    }

    // Compute weighted combination
    const vector = this.weightedCombination(channelVectors, weights);

    return {
      vector,
      channelVectors,
      weights,
      timestamp: Date.now(),
    };
  }

  /**
   * Compute cosine similarity between two vectors
   */
  cosineSimilarity(v1: number[], v2: number[]): number {
    if (v1.length !== v2.length) {
      throw new Error('Vectors must have same dimension');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < v1.length; i++) {
      dotProduct += v1[i] * v2[i];
      norm1 += v1[i] * v1[i];
      norm2 += v2[i] * v2[i];
    }

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (norm1 * norm2);
  }

  /**
   * Find top K most similar embeddings to query
   */
  findTopK(
    queryVector: number[],
    candidates: EmbeddingVector[],
    k: number = 5
  ): Array<{ embedding: EmbeddingVector; similarity: number }> {
    const similarities = candidates.map(candidate => ({
      embedding: candidate,
      similarity: this.cosineSimilarity(queryVector, candidate.vector),
    }));

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, k);
  }

  /**
   * Generate mock embedding vector (deterministic based on text)
   * In production, this would be replaced with actual OpenAI API call
   */
  private generateMockEmbedding(text: string): number[] {
    const vector: number[] = [];

    // Use simple hash function to create deterministic vector
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }

    // Seed random number generator with hash
    let seed = Math.abs(hash);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Generate vector with seeded random numbers
    for (let i = 0; i < this.vectorDimension; i++) {
      vector.push(random() * 2 - 1); // Random between -1 and 1
    }

    // Normalize to unit vector
    return this.normalizeVector(vector);
  }

  /**
   * Normalize vector to unit length
   */
  private normalizeVector(vector: number[]): number[] {
    let norm = 0;
    for (const val of vector) {
      norm += val * val;
    }
    norm = Math.sqrt(norm);

    if (norm === 0) {
      return vector;
    }

    return vector.map(val => val / norm);
  }

  /**
   * Average multiple vectors
   */
  private averageVectors(vectors: number[][]): number[] {
    if (vectors.length === 0) {
      return this.zeroVector();
    }

    const sum = new Array(this.vectorDimension).fill(0);

    for (const vector of vectors) {
      for (let i = 0; i < vector.length; i++) {
        sum[i] += vector[i];
      }
    }

    return sum.map(val => val / vectors.length);
  }

  /**
   * Weighted combination of channel vectors
   */
  private weightedCombination(channelVectors: any, weights: ChannelWeights): number[] {
    const result = new Array(this.vectorDimension).fill(0);

    const channels: Array<keyof ChannelWeights> = ['language', 'eq', 'strategy', 'pattern', 'archetype', 'safety'];

    for (const channel of channels) {
      const weight = weights[channel];
      const vector = channelVectors[channel];

      for (let i = 0; i < this.vectorDimension; i++) {
        result[i] += weight * vector[i];
      }
    }

    return this.normalizeVector(result);
  }

  /**
   * Create zero vector
   */
  private zeroVector(): number[] {
    return new Array(this.vectorDimension).fill(0);
  }

  /**
   * Get embedding model info
   */
  getModelInfo(): { model: string; dimension: number } {
    return {
      model: this.embeddingModel,
      dimension: this.vectorDimension,
    };
  }
}
