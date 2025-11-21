/**
 * ragQuality.ts
 *
 * RAGQuality_v1 - Relevance scoring for retrieved chunks
 *
 * Checks if RAG chunks are:
 * - Actually semantically relevant
 * - Not low-score
 * - Not random irrelevant chips
 *
 * Returns score 0-100 (higher = more relevant)
 */

import type { TelemetryEvent, RAGRelevanceDetails, TelemetryFlag } from './types';

/**
 * Run RAG Quality Check
 *
 * Evaluates quality of retrieved RAG chunks based on:
 * - Average retrieval score
 * - Number of chunks
 * - Score distribution
 *
 * @param event - Telemetry event with RAG chunks
 * @returns RAG relevance score (0-100)
 */
export function runRAGQuality(event: TelemetryEvent): number {
  const chunks = event.ragChunks || [];

  // No chunks = no RAG used = neutral score (not a failure)
  if (chunks.length === 0) {
    return 100;  // Not using RAG is fine
  }

  // Extract scores
  const scores = chunks.map(chunk => chunk.score);

  // Calculate average score
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Calculate min/max
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Base score from average (assuming scores are 0-1)
  let score = Math.floor(avgScore * 100);

  // Penalty for low minimum score (indicates some irrelevant chunks)
  if (minScore < 0.3) {
    score -= 15;
  }

  // Penalty for low chunk count (insufficient context)
  if (chunks.length < 2) {
    score -= 10;
  }

  // Penalty for too many chunks (information overload)
  if (chunks.length > 10) {
    score -= 5;
  }

  // Bonus for tight score distribution (all chunks relevant)
  const scoreRange = maxScore - minScore;
  if (scoreRange < 0.2 && avgScore > 0.6) {
    score += 10;
  }

  // Ensure score stays in valid range
  return Math.max(0, Math.min(100, score));
}

/**
 * Get RAG Relevance Details
 *
 * Returns detailed breakdown of RAG quality checks.
 *
 * @param event - Telemetry event with RAG chunks
 * @returns Detailed RAG relevance breakdown
 */
export function getRAGRelevanceDetails(event: TelemetryEvent): RAGRelevanceDetails {
  const chunks = event.ragChunks || [];

  if (chunks.length === 0) {
    return {
      chunkCount: 0,
      averageScore: 0,
      minScore: 0,
      maxScore: 0,
      irrelevantChunks: 0
    };
  }

  const scores = chunks.map(chunk => chunk.score);

  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);

  // Count chunks with score < 0.4 as irrelevant
  const irrelevantChunks = scores.filter(score => score < 0.4).length;

  return {
    chunkCount: chunks.length,
    averageScore,
    minScore,
    maxScore,
    irrelevantChunks
  };
}

/**
 * Get RAG Quality Flags
 *
 * Returns specific telemetry flags based on RAG quality.
 *
 * @param event - Telemetry event with RAG chunks
 * @param score - RAG relevance score
 * @returns Array of telemetry flags
 */
export function getRAGQualityFlags(event: TelemetryEvent, score: number): TelemetryFlag[] {
  const flags: TelemetryFlag[] = [];
  const details = getRAGRelevanceDetails(event);

  if (score < 60) {
    flags.push('low_rag_relevance');
  }

  if (details.irrelevantChunks > 0) {
    flags.push('irrelevant_rag');
  }

  return flags;
}

/**
 * Analyze RAG Chunk Distribution
 *
 * Returns statistics about RAG chunk score distribution.
 * Useful for debugging and optimization.
 *
 * @param event - Telemetry event with RAG chunks
 * @returns Distribution statistics
 */
export function analyzeRAGDistribution(event: TelemetryEvent): {
  mean: number;
  median: number;
  stdDev: number;
  scoreHistogram: Record<string, number>;
} {
  const chunks = event.ragChunks || [];

  if (chunks.length === 0) {
    return {
      mean: 0,
      median: 0,
      stdDev: 0,
      scoreHistogram: {}
    };
  }

  const scores = chunks.map(chunk => chunk.score);

  // Calculate mean
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  // Calculate median
  const sortedScores = [...scores].sort((a, b) => a - b);
  const median = scores.length % 2 === 0
    ? (sortedScores[scores.length / 2 - 1] + sortedScores[scores.length / 2]) / 2
    : sortedScores[Math.floor(scores.length / 2)];

  // Calculate standard deviation
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // Build histogram (buckets: 0-0.2, 0.2-0.4, 0.4-0.6, 0.6-0.8, 0.8-1.0)
  const scoreHistogram: Record<string, number> = {
    '0.0-0.2': 0,
    '0.2-0.4': 0,
    '0.4-0.6': 0,
    '0.6-0.8': 0,
    '0.8-1.0': 0
  };

  scores.forEach(score => {
    if (score < 0.2) scoreHistogram['0.0-0.2']++;
    else if (score < 0.4) scoreHistogram['0.2-0.4']++;
    else if (score < 0.6) scoreHistogram['0.4-0.6']++;
    else if (score < 0.8) scoreHistogram['0.6-0.8']++;
    else scoreHistogram['0.8-1.0']++;
  });

  return {
    mean,
    median,
    stdDev,
    scoreHistogram
  };
}
