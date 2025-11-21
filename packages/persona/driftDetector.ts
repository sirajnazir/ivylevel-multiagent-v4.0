/**
 * persona/driftDetector.ts
 *
 * Detects when agent responses drift from Jenny's persona.
 * Uses cosine similarity to compare output embedding to Jenny's composite vector.
 */

import type {
  CompositePersonaVector,
  DriftDetectionResult,
  EmbeddingVector,
} from './types';
import { EmbeddingService } from './embeddingService';

/**
 * Drift Detector
 * Monitors agent outputs to ensure persona consistency
 */
export class DriftDetector {
  private embeddingService: EmbeddingService;
  private jennyComposite: CompositePersonaVector;
  private driftThreshold: number;

  constructor(
    jennyComposite: CompositePersonaVector,
    embeddingService: EmbeddingService,
    driftThreshold: number = 0.78
  ) {
    this.jennyComposite = jennyComposite;
    this.embeddingService = embeddingService;
    this.driftThreshold = driftThreshold;
  }

  /**
   * Detect if output has drifted from Jenny's persona
   */
  async detectDrift(output: string): Promise<DriftDetectionResult> {
    // Generate embedding for output
    const outputEmbedding = await this.embedText(output);

    // Compute similarity to Jenny composite
    const similarity = this.embeddingService.cosineSimilarity(
      outputEmbedding,
      this.jennyComposite.vector
    );

    const hasDrift = similarity < this.driftThreshold;

    // Compute per-channel drift
    const channelDrift = await this.computeChannelDrift(output);

    // Generate suggestions if drift detected
    const suggestions = hasDrift ? this.generateDriftSuggestions(channelDrift) : [];

    return {
      similarity,
      hasDrift,
      threshold: this.driftThreshold,
      suggestions,
      channelDrift,
    };
  }

  /**
   * Compute drift per channel
   */
  private async computeChannelDrift(output: string): Promise<{
    language: number;
    eq: number;
    strategy: number;
    pattern: number;
    archetype: number;
    safety: number;
  }> {
    const outputEmbedding = await this.embedText(output);

    return {
      language: this.embeddingService.cosineSimilarity(
        outputEmbedding,
        this.jennyComposite.channelVectors.language
      ),
      eq: this.embeddingService.cosineSimilarity(
        outputEmbedding,
        this.jennyComposite.channelVectors.eq
      ),
      strategy: this.embeddingService.cosineSimilarity(
        outputEmbedding,
        this.jennyComposite.channelVectors.strategy
      ),
      pattern: this.embeddingService.cosineSimilarity(
        outputEmbedding,
        this.jennyComposite.channelVectors.pattern
      ),
      archetype: this.embeddingService.cosineSimilarity(
        outputEmbedding,
        this.jennyComposite.channelVectors.archetype
      ),
      safety: this.embeddingService.cosineSimilarity(
        outputEmbedding,
        this.jennyComposite.channelVectors.safety
      ),
    };
  }

  /**
   * Generate suggestions for fixing drift
   */
  private generateDriftSuggestions(channelDrift: Record<string, number>): string[] {
    const suggestions: string[] = [];

    // Find channels with lowest similarity
    const sortedChannels = Object.entries(channelDrift).sort((a, b) => a[1] - b[1]);

    for (const [channel, similarity] of sortedChannels.slice(0, 3)) {
      if (similarity < 0.7) {
        suggestions.push(this.getChannelSuggestion(channel as any));
      }
    }

    return suggestions;
  }

  /**
   * Get suggestion for specific channel
   */
  private getChannelSuggestion(channel: 'language' | 'eq' | 'strategy' | 'pattern' | 'archetype' | 'safety'): string {
    const channelSuggestions = {
      language: 'Apply Jenny Vocabulary Substitution Engine - replace generic AI language with Jenny idioms',
      eq: 'Increase emotional validation - add nervous system language and grounding phrases',
      strategy: 'Apply coaching heuristics - start with validation before strategy, use one clean move principle',
      pattern: 'Add pattern recognition - surface underlying patterns instead of solving surface symptoms',
      archetype: 'Adjust for student archetype - tailor language and approach to archetype needs',
      safety: 'Review safety boundaries - check for toxic positivity, false urgency, or emotional dismissal',
    };

    return channelSuggestions[channel];
  }

  /**
   * Embed text (uses embedding service)
   */
  private async embedText(text: string): Promise<number[]> {
    const mockChunk = {
      id: 'temp',
      text,
      channel: 'language' as const,
      weight: 1.0,
    };

    const embedding = await this.embeddingService.embedChunk(mockChunk);
    return embedding.vector;
  }

  /**
   * Check multiple outputs in batch
   */
  async detectDriftBatch(outputs: string[]): Promise<DriftDetectionResult[]> {
    const results: DriftDetectionResult[] = [];

    for (const output of outputs) {
      results.push(await this.detectDrift(output));
    }

    return results;
  }

  /**
   * Get drift statistics for session
   */
  getDriftStats(results: DriftDetectionResult[]): {
    totalOutputs: number;
    driftCount: number;
    driftRate: number;
    avgSimilarity: number;
    channelIssues: Record<string, number>;
  } {
    const driftCount = results.filter(r => r.hasDrift).length;
    const avgSimilarity = results.reduce((sum, r) => sum + r.similarity, 0) / results.length;

    // Count channel issues
    const channelIssues: Record<string, number> = {
      language: 0,
      eq: 0,
      strategy: 0,
      pattern: 0,
      archetype: 0,
      safety: 0,
    };

    for (const result of results) {
      if (result.channelDrift) {
        for (const [channel, similarity] of Object.entries(result.channelDrift)) {
          if (similarity < 0.7) {
            channelIssues[channel]++;
          }
        }
      }
    }

    return {
      totalOutputs: results.length,
      driftCount,
      driftRate: driftCount / results.length,
      avgSimilarity,
      channelIssues,
    };
  }

  /**
   * Update drift threshold
   */
  setThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Threshold must be between 0 and 1');
    }
    this.driftThreshold = threshold;
  }

  /**
   * Get current threshold
   */
  getThreshold(): number {
    return this.driftThreshold;
  }

  /**
   * Update Jenny composite vector (e.g., after persona evolution)
   */
  updateComposite(newComposite: CompositePersonaVector): void {
    this.jennyComposite = newComposite;
  }
}
