/**
 * sessionTelemetry.ts
 *
 * SessionTelemetry - Main telemetry aggregator
 *
 * Coordinates all 4 quality inspectors:
 * 1. DataLint_v1 - Structural cleanliness
 * 2. EQConsistency_v1 - Voice similarity
 * 3. RAGQuality_v1 - Retrieval relevance
 * 4. SessionProgress_v1 - Completion tracking
 *
 * Produces numerical scores (0-100) and quality flags.
 */

import type {
  TelemetryEvent,
  TelemetryResult,
  TelemetryThresholds,
  TelemetryFlag,
  TelemetryHistory,
  TelemetrySummary
} from './types';
import { DEFAULT_THRESHOLDS } from './types';
import { runDataLint, getCleanlinessDetails, getCleanlinessFlags } from './dataLint';
import { runEQConsistency, getEQSimilarityDetails, getEQConsistencyFlags } from './eqConsistency';
import { runRAGQuality, getRAGRelevanceDetails, getRAGQualityFlags } from './ragQuality';
import { computeProgressScore, getProgressDetails, getProgressFlags } from './sessionProgress';

/**
 * Session Telemetry
 *
 * Main telemetry aggregator class.
 * Evaluates quality of each assessment turn.
 */
export class SessionTelemetry {
  private thresholds: TelemetryThresholds;
  private history: TelemetryResult[];
  private sessionId: string;

  constructor(
    sessionId: string = 'default',
    thresholds: Partial<TelemetryThresholds> = {}
  ) {
    this.sessionId = sessionId;
    this.thresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
    this.history = [];

    console.log('[SessionTelemetry] Initialized for session:', sessionId);
    console.log('  - Thresholds:', this.thresholds);
  }

  /**
   * Evaluate Telemetry Event
   *
   * Runs all 4 quality inspectors and aggregates results.
   *
   * @param event - Telemetry event to evaluate
   * @returns Telemetry result with scores and flags
   */
  public async evaluate(event: TelemetryEvent): Promise<TelemetryResult> {
    console.log(`[SessionTelemetry] Evaluating event for session ${event.sessionId}, stage ${event.stage}`);

    // Run all 4 inspectors
    const cleanliness = runDataLint(event);
    const eqSimilarity = await runEQConsistency(event);
    const ragRelevance = runRAGQuality(event);
    const progress = computeProgressScore(event);

    // Collect flags from all inspectors
    const flags = this.collectFlags(event, cleanliness, eqSimilarity, ragRelevance, progress);

    // Get detailed breakdowns
    const cleanlinessDetails = getCleanlinessDetails(event);
    const eqSimilarityDetails = await getEQSimilarityDetails(event);
    const ragRelevanceDetails = getRAGRelevanceDetails(event);
    const progressDetails = getProgressDetails(event);

    const result: TelemetryResult = {
      cleanliness,
      eqSimilarity,
      ragRelevance,
      progress,
      flags,
      details: {
        cleanliness: cleanlinessDetails,
        eqSimilarity: eqSimilarityDetails,
        ragRelevance: ragRelevanceDetails,
        progress: progressDetails
      },
      evaluatedAt: new Date().toISOString()
    };

    // Store in history
    this.history.push(result);

    // Log quality issues
    if (flags.length > 0) {
      console.log('⚠️ [SessionTelemetry] Quality issues detected:', flags);
      console.log('  - Cleanliness:', cleanliness);
      console.log('  - EQ Similarity:', eqSimilarity);
      console.log('  - RAG Relevance:', ragRelevance);
      console.log('  - Progress:', progress);
    } else {
      console.log('✅ [SessionTelemetry] All quality checks passed');
    }

    return result;
  }

  /**
   * Collect Flags
   *
   * Aggregates flags from all inspectors based on thresholds.
   *
   * @param event - Telemetry event
   * @param cleanliness - Cleanliness score
   * @param eqSimilarity - EQ similarity score
   * @param ragRelevance - RAG relevance score
   * @param progress - Progress score
   * @returns Array of telemetry flags
   */
  private collectFlags(
    event: TelemetryEvent,
    cleanliness: number,
    eqSimilarity: number,
    ragRelevance: number,
    progress: number
  ): TelemetryFlag[] {
    const flags: TelemetryFlag[] = [];

    // Threshold-based flags
    if (cleanliness < this.thresholds.cleanliness) {
      flags.push('low_cleanliness');
    }

    if (eqSimilarity < this.thresholds.eqSimilarity) {
      flags.push('low_eq_similarity');
    }

    if (ragRelevance < this.thresholds.ragRelevance && event.ragChunks && event.ragChunks.length > 0) {
      flags.push('low_rag_relevance');
    }

    if (progress < this.thresholds.progress) {
      flags.push('slow_progress');
    }

    // Collect specific flags from inspectors
    const cleanlinessFlags = getCleanlinessFlags(event, cleanliness);
    const eqFlags = getEQConsistencyFlags(eqSimilarity);
    const ragFlags = getRAGQualityFlags(event, ragRelevance);
    const progressFlags = getProgressFlags(event, progress);

    // Merge all flags (deduplicate)
    const allFlags = [
      ...flags,
      ...cleanlinessFlags,
      ...eqFlags,
      ...ragFlags,
      ...progressFlags
    ];

    return Array.from(new Set(allFlags));
  }

  /**
   * Get History
   *
   * Returns telemetry history for this session.
   *
   * @returns Array of telemetry results
   */
  public getHistory(): TelemetryResult[] {
    return [...this.history];
  }

  /**
   * Get Summary
   *
   * Returns aggregated statistics for this session.
   *
   * @returns Telemetry summary
   */
  public getSummary(): TelemetrySummary {
    if (this.history.length === 0) {
      return {
        totalTurns: 0,
        averageCleanliness: 0,
        averageEQSimilarity: 0,
        averageRAGRelevance: 0,
        averageProgress: 0,
        totalFlags: 0,
        flagBreakdown: {} as Record<TelemetryFlag, number>,
        overallQuality: 'poor'
      };
    }

    // Calculate averages
    const totalTurns = this.history.length;

    const averageCleanliness =
      this.history.reduce((sum, r) => sum + r.cleanliness, 0) / totalTurns;

    const averageEQSimilarity =
      this.history.reduce((sum, r) => sum + r.eqSimilarity, 0) / totalTurns;

    const averageRAGRelevance =
      this.history.reduce((sum, r) => sum + r.ragRelevance, 0) / totalTurns;

    const averageProgress =
      this.history.reduce((sum, r) => sum + r.progress, 0) / totalTurns;

    // Count flags
    const flagBreakdown: Record<string, number> = {};
    let totalFlags = 0;

    this.history.forEach(result => {
      result.flags.forEach(flag => {
        flagBreakdown[flag] = (flagBreakdown[flag] || 0) + 1;
        totalFlags++;
      });
    });

    // Determine overall quality
    const avgQuality = (averageCleanliness + averageEQSimilarity + averageRAGRelevance + averageProgress) / 4;

    let overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
    if (avgQuality >= 85) overallQuality = 'excellent';
    else if (avgQuality >= 70) overallQuality = 'good';
    else if (avgQuality >= 50) overallQuality = 'fair';
    else overallQuality = 'poor';

    return {
      totalTurns,
      averageCleanliness,
      averageEQSimilarity,
      averageRAGRelevance,
      averageProgress,
      totalFlags,
      flagBreakdown: flagBreakdown as Record<TelemetryFlag, number>,
      overallQuality
    };
  }

  /**
   * Reset History
   *
   * Clears telemetry history.
   */
  public reset(): void {
    this.history = [];
    console.log('[SessionTelemetry] History reset');
  }

  /**
   * Set Thresholds
   *
   * Updates quality thresholds.
   *
   * @param thresholds - New threshold values
   */
  public setThresholds(thresholds: Partial<TelemetryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
    console.log('[SessionTelemetry] Thresholds updated:', this.thresholds);
  }

  /**
   * Get Thresholds
   *
   * Returns current quality thresholds.
   *
   * @returns Current thresholds
   */
  public getThresholds(): TelemetryThresholds {
    return { ...this.thresholds };
  }

  /**
   * Export History
   *
   * Exports telemetry history as structured data.
   *
   * @returns Telemetry history object
   */
  public exportHistory(): TelemetryHistory {
    return {
      sessionId: this.sessionId,
      events: [],  // Events not stored in this implementation
      results: [...this.history],
      summary: this.getSummary()
    };
  }

  /**
   * Detect Trends
   *
   * Analyzes telemetry history for trends (improving/degrading quality).
   *
   * @returns Trend analysis
   */
  public detectTrends(): {
    cleanlinessTrend: 'improving' | 'stable' | 'degrading';
    eqTrend: 'improving' | 'stable' | 'degrading';
    ragTrend: 'improving' | 'stable' | 'degrading';
    progressTrend: 'improving' | 'stable' | 'degrading';
  } {
    if (this.history.length < 3) {
      return {
        cleanlinessTrend: 'stable',
        eqTrend: 'stable',
        ragTrend: 'stable',
        progressTrend: 'stable'
      };
    }

    const analyzeTrend = (scores: number[]): 'improving' | 'stable' | 'degrading' => {
      const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
      const secondHalf = scores.slice(Math.floor(scores.length / 2));

      const firstAvg = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;

      const diff = secondAvg - firstAvg;

      if (diff > 5) return 'improving';
      if (diff < -5) return 'degrading';
      return 'stable';
    };

    return {
      cleanlinessTrend: analyzeTrend(this.history.map(r => r.cleanliness)),
      eqTrend: analyzeTrend(this.history.map(r => r.eqSimilarity)),
      ragTrend: analyzeTrend(this.history.map(r => r.ragRelevance)),
      progressTrend: analyzeTrend(this.history.map(r => r.progress))
    };
  }
}
