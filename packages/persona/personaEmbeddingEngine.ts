/**
 * persona/personaEmbeddingEngine.ts
 *
 * Main Persona Embedding Engine - Component 40
 * Manages persona embeddings, retrieval, and conditioning for agent responses.
 */

import type {
  PersonaChunk,
  EmbeddingVector,
  CompositePersonaVector,
  PersonaRetrievalContext,
  RetrievedPersonaChunk,
  PersonaConditioningContext,
  PersonaEmbeddingConfig,
  ChannelWeights,
  EmbeddingIndex,
} from './types';
import { PersonaChunkProcessor } from './chunkProcessor';
import { EmbeddingService } from './embeddingService';
import { DriftDetector } from './driftDetector';

/**
 * Default channel weights (Jenny's profile)
 */
export const DEFAULT_CHANNEL_WEIGHTS: ChannelWeights = {
  language: 0.35,  // Highest - Jenny's distinctive voice
  eq: 0.30,        // High - EQ is core to her coaching
  strategy: 0.20,  // Medium - tactical precision matters
  pattern: 0.10,   // Lower - emerges through other channels
  archetype: 0.05, // Lowest - but still important for tailoring
  safety: 0.05,    // Lowest weight but critical for filtering
};

/**
 * Persona Embedding Engine
 * Central engine for persona-based agent conditioning
 */
export class PersonaEmbeddingEngine {
  private config: PersonaEmbeddingConfig;
  private chunkProcessor: PersonaChunkProcessor;
  private embeddingService: EmbeddingService;
  private driftDetector: DriftDetector | null = null;

  // Persona data
  private chunks: PersonaChunk[] = [];
  private embeddings: EmbeddingVector[] = [];
  private compositeVector: CompositePersonaVector | null = null;

  // Index by channel for fast retrieval
  private embeddingsByChannel: Map<string, EmbeddingVector[]> = new Map();

  constructor(config: PersonaEmbeddingConfig) {
    this.config = config;
    this.chunkProcessor = new PersonaChunkProcessor();
    this.embeddingService = new EmbeddingService(
      config.embeddingModel,
      config.vectorDimension
    );
  }

  /**
   * Initialize persona from data files
   */
  async initialize(rawData: {
    coreLanguage: string;
    eqPatterns: string;
    heuristics: any;
    coachingPatterns: any;
    archetypeMappings: any;
    negativeExamples: string;
    goldenThread: string;
  }): Promise<void> {
    // Process data into chunks
    this.chunks = this.chunkProcessor.processAll({
      coreLanguage: '',
      eqPatterns: '',
      heuristics: '',
      coachingPatterns: '',
      archetypeMappings: '',
      negativeExamples: '',
      goldenThread: '',
    }, rawData);

    // Generate embeddings
    this.embeddings = await this.embeddingService.embedChunks(this.chunks);

    // Index by channel
    this.indexByChannel();

    // Generate composite vector
    this.compositeVector = this.embeddingService.generateCompositeVector(
      this.embeddingsByChannel,
      this.config.channelWeights
    );

    // Initialize drift detector
    this.driftDetector = new DriftDetector(
      this.compositeVector,
      this.embeddingService,
      this.config.driftThreshold
    );
  }

  /**
   * Retrieve top persona chunks for context
   */
  async retrieveForContext(context: PersonaRetrievalContext): Promise<RetrievedPersonaChunk[]> {
    const topK = context.topK || 5;

    // Build query vector from context
    const queryVector = await this.buildQueryVector(context);

    // Find top K similar chunks
    const topChunks = this.embeddingService.findTopK(queryVector, this.embeddings, topK);

    // Convert to retrieved chunks
    return topChunks.map(({ embedding, similarity }) => {
      const chunk = this.chunks.find(c => c.id === this.getChunkIdFromEmbedding(embedding));

      return {
        chunk: chunk!,
        embedding,
        similarity,
        reason: this.explainRetrieval(embedding, context),
      };
    });
  }

  /**
   * Build conditioning context for agent
   */
  async buildConditioningContext(
    context: PersonaRetrievalContext,
    additionalLayers?: {
      rhythmLayer?: any;
      eqLayer?: any;
      archetypeLayer?: any;
    }
  ): Promise<PersonaConditioningContext> {
    const personaChunks = await this.retrieveForContext(context);

    return {
      personaChunks,
      rhythmLayer: additionalLayers?.rhythmLayer,
      eqLayer: additionalLayers?.eqLayer,
      archetypeLayer: additionalLayers?.archetypeLayer,
      compositeVector: this.compositeVector!,
    };
  }

  /**
   * Check for persona drift in output
   */
  async checkDrift(output: string) {
    if (!this.driftDetector) {
      throw new Error('Drift detector not initialized');
    }

    return await this.driftDetector.detectDrift(output);
  }

  /**
   * Get composite persona vector
   */
  getCompositeVector(): CompositePersonaVector {
    if (!this.compositeVector) {
      throw new Error('Composite vector not initialized');
    }
    return this.compositeVector;
  }

  /**
   * Get all chunks for a specific channel
   */
  getChunksByChannel(channel: string): PersonaChunk[] {
    return this.chunks.filter(c => c.channel === channel);
  }

  /**
   * Get chunk statistics
   */
  getStats() {
    return this.chunkProcessor.getChunkStats(this.chunks);
  }

  /**
   * Export embedding index for persistence
   */
  exportIndex(): EmbeddingIndex {
    return {
      version: '1.0',
      personaName: this.config.personaName,
      embeddingModel: this.config.embeddingModel,
      vectorDimension: this.config.vectorDimension,
      createdAt: Date.now(),
      entries: this.embeddings.map((e, idx) => ({
        chunkId: this.chunks[idx].id,
        channel: e.channel,
        text: e.text,
        vector: e.vector,
        weight: e.weight,
        metadata: e.metadata || {},
      })),
      compositeVector: this.compositeVector!,
    };
  }

  /**
   * Import embedding index from persistence
   */
  importIndex(index: EmbeddingIndex): void {
    this.embeddings = index.entries.map(entry => ({
      vector: entry.vector,
      text: entry.text,
      channel: entry.channel,
      weight: entry.weight,
      metadata: entry.metadata,
    }));

    this.compositeVector = index.compositeVector;

    // Rebuild chunks from entries
    this.chunks = index.entries.map(entry => ({
      id: entry.chunkId,
      text: entry.text,
      channel: entry.channel,
      weight: entry.weight,
      metadata: entry.metadata,
    }));

    // Index by channel
    this.indexByChannel();

    // Reinitialize drift detector
    if (this.compositeVector) {
      this.driftDetector = new DriftDetector(
        this.compositeVector,
        this.embeddingService,
        this.config.driftThreshold
      );
    }
  }

  /**
   * Index embeddings by channel for fast retrieval
   */
  private indexByChannel(): void {
    this.embeddingsByChannel.clear();

    for (const embedding of this.embeddings) {
      const channel = embedding.channel;
      if (!this.embeddingsByChannel.has(channel)) {
        this.embeddingsByChannel.set(channel, []);
      }
      this.embeddingsByChannel.get(channel)!.push(embedding);
    }
  }

  /**
   * Build query vector from retrieval context
   */
  private async buildQueryVector(context: PersonaRetrievalContext): Promise<number[]> {
    // Build query text from context components
    const queryParts: string[] = [];

    if (context.archetype) {
      queryParts.push(`Student archetype: ${context.archetype}`);
    }

    if (context.emotionalState) {
      queryParts.push(`Emotional state: ${context.emotionalState}`);
    }

    if (context.coachingMove) {
      queryParts.push(`Coaching move: ${context.coachingMove}`);
    }

    if (context.sessionStage) {
      queryParts.push(`Session stage: ${context.sessionStage}`);
    }

    if (context.userMessage) {
      queryParts.push(`User message: ${context.userMessage}`);
    }

    const queryText = queryParts.join('. ');

    // Embed query text
    const mockChunk: PersonaChunk = {
      id: 'query',
      text: queryText,
      channel: 'language',
      weight: 1.0,
    };

    const embedding = await this.embeddingService.embedChunk(mockChunk);
    return embedding.vector;
  }

  /**
   * Get chunk ID from embedding (match by text)
   */
  private getChunkIdFromEmbedding(embedding: EmbeddingVector): string | undefined {
    const chunk = this.chunks.find(c => c.text === embedding.text);
    return chunk?.id;
  }

  /**
   * Explain why chunk was retrieved
   */
  private explainRetrieval(embedding: EmbeddingVector, context: PersonaRetrievalContext): string {
    const reasons: string[] = [];

    reasons.push(`Matched ${embedding.channel} channel`);

    if (context.archetype && embedding.metadata?.archetype === context.archetype) {
      reasons.push(`Specific to ${context.archetype} archetype`);
    }

    if (context.coachingMove && embedding.metadata?.moveName === context.coachingMove) {
      reasons.push(`Relevant to ${context.coachingMove} coaching move`);
    }

    return reasons.join('; ');
  }

  /**
   * Get embedding service (for testing/debug)
   */
  getEmbeddingService(): EmbeddingService {
    return this.embeddingService;
  }

  /**
   * Get drift detector (for testing/debug)
   */
  getDriftDetector(): DriftDetector | null {
    return this.driftDetector;
  }
}

/**
 * Helper function to create default config
 */
export function createDefaultConfig(personaName: string, dataDir: string): PersonaEmbeddingConfig {
  return {
    personaName,
    dataDir,
    embeddingModel: 'text-embedding-3-large',
    vectorDimension: 1536,
    chunkSize: 250,
    channelWeights: DEFAULT_CHANNEL_WEIGHTS,
    driftThreshold: 0.78,
  };
}
