/**
 * Chunk Ranker v4.0
 *
 * Combines all adaptive ranking factors into a single unified score.
 *
 * Ranking Factors:
 * 1. Semantic intent match (highest priority)
 * 2. EQ mode alignment
 * 3. Coach style fit (Jenny-ness)
 * 4. Pinecone similarity score (embedding distance)
 *
 * This is where the magic happens - transforming "top 5 nearest neighbors"
 * into "the 5 most contextually relevant, EQ-appropriate, Jenny-authentic chips."
 */

import { ChipMetadata, EQMode, IntentType } from "./ragTypes";
import { applyEQWeight, getEQSignalMatchCount } from "./eqWeighting";
import { coachFit, getJennyStyleMatchCount } from "./coachFitScorer";

/**
 * Rank Chunk
 *
 * Calculates a unified ranking score for a chunk based on:
 * - Semantic intent match
 * - EQ mode alignment
 * - Coach style fit
 * - Pinecone similarity (optional baseline)
 *
 * Score Composition:
 * - Intent match: +1.0 base score
 * - EQ weight multiplier: 0.8x - 1.4x
 * - Coach fit multiplier: 0.8x - 1.3x
 * - Pinecone similarity: 0x - 0.5x (optional boost)
 *
 * @param chip - The chip metadata from Pinecone
 * @param intent - The detected query intent
 * @param eqMode - The requested EQ mode
 * @param pineconeSimilarity - Optional Pinecone similarity score (0-1)
 * @returns Final ranking score
 */
export function rankChunk(
  chip: ChipMetadata,
  intent: IntentType,
  eqMode: EQMode,
  pineconeSimilarity?: number
): number {
  console.log(`[ChunkRanker] Ranking chunk: ${chip.text.substring(0, 50)}...`);
  console.log(`[ChunkRanker] Intent: ${intent}, EQ Mode: ${eqMode}`);

  let score = 0;

  // Factor 1: Semantic Intent Match (Base Score)
  // Perfect match = 1.0, related match = 0.5, no match = 0.2
  if (chip.semanticType === intent) {
    score += 1.0;
    console.log(`[ChunkRanker] Perfect intent match: +1.0 → ${score.toFixed(2)}`);
  } else if (isRelatedIntent(chip.semanticType, intent)) {
    score += 0.5;
    console.log(`[ChunkRanker] Related intent match: +0.5 → ${score.toFixed(2)}`);
  } else {
    score += 0.2;
    console.log(`[ChunkRanker] No intent match: +0.2 → ${score.toFixed(2)}`);
  }

  // Factor 2: EQ Mode Alignment (Multiplier)
  const eqWeight = applyEQWeight(chip, eqMode);
  score *= eqWeight;
  console.log(`[ChunkRanker] After EQ weight (${eqWeight}x): ${score.toFixed(2)}`);

  // Factor 3: Coach Style Fit (Multiplier)
  const coachWeight = coachFit(chip);
  score *= coachWeight;
  console.log(`[ChunkRanker] After coach fit (${coachWeight}x): ${score.toFixed(2)}`);

  // Factor 4: Pinecone Similarity (Optional Boost)
  // Add up to 0.5 bonus based on embedding similarity
  if (pineconeSimilarity !== undefined) {
    const similarityBoost = pineconeSimilarity * 0.5;
    score += similarityBoost;
    console.log(
      `[ChunkRanker] Pinecone similarity boost: +${similarityBoost.toFixed(2)} → ${score.toFixed(2)}`
    );
  }

  console.log(`[ChunkRanker] Final score: ${score.toFixed(2)}`);
  return score;
}

/**
 * Is Related Intent
 *
 * Determines if two semantic types are related enough to provide
 * a partial score boost.
 *
 * Related Intent Pairs:
 * - activities ↔ awards (often overlap)
 * - eq ↔ narrative (both story-focused)
 * - framework ↔ general (framework often applies broadly)
 * - academics ↔ framework (rigor strategies)
 *
 * @param chipType - The chunk's semantic type
 * @param queryIntent - The detected query intent
 * @returns True if related, false otherwise
 */
export function isRelatedIntent(chipType: string, queryIntent: IntentType): boolean {
  const relatedPairs: Record<string, string[]> = {
    activities: ["awards", "framework"],
    awards: ["activities"],
    eq: ["narrative", "framework"],
    narrative: ["eq"],
    framework: ["general", "academics", "eq"],
    academics: ["framework"],
    general: ["framework"]
  };

  const related = relatedPairs[chipType] || [];
  const isRelated = related.includes(queryIntent);

  if (isRelated) {
    console.log(`[ChunkRanker] Related intent: ${chipType} ↔ ${queryIntent}`);
  }

  return isRelated;
}

/**
 * Rank Chunks Batch
 *
 * Ranks multiple chunks and returns them sorted by score.
 *
 * @param chips - Array of chip metadata with Pinecone scores
 * @param intent - The detected query intent
 * @param eqMode - The requested EQ mode
 * @returns Sorted array of ranked chunks with scores
 */
export function rankChunksBatch(
  chips: Array<{ metadata: ChipMetadata; similarity: number }>,
  intent: IntentType,
  eqMode: EQMode
): Array<{ metadata: ChipMetadata; score: number }> {
  console.log(`[ChunkRanker] Ranking batch of ${chips.length} chunks`);

  const rankedChunks = chips.map(chip => ({
    metadata: chip.metadata,
    score: rankChunk(chip.metadata, intent, eqMode, chip.similarity)
  }));

  // Sort by score descending
  rankedChunks.sort((a, b) => b.score - a.score);

  console.log(`[ChunkRanker] Top score: ${rankedChunks[0]?.score.toFixed(2)}`);
  console.log(
    `[ChunkRanker] Bottom score: ${rankedChunks[rankedChunks.length - 1]?.score.toFixed(2)}`
  );

  return rankedChunks;
}

/**
 * Get Score Breakdown
 *
 * Returns a detailed breakdown of how a chunk's score was calculated.
 * Useful for debugging and understanding ranking decisions.
 *
 * @param chip - The chip metadata
 * @param intent - The detected query intent
 * @param eqMode - The requested EQ mode
 * @param pineconeSimilarity - Optional Pinecone similarity score
 * @returns Score breakdown object
 */
export function getScoreBreakdown(
  chip: ChipMetadata,
  intent: IntentType,
  eqMode: EQMode,
  pineconeSimilarity?: number
): {
  intentScore: number;
  eqWeight: number;
  coachWeight: number;
  similarityBoost: number;
  finalScore: number;
} {
  let intentScore = 0.2;
  if (chip.semanticType === intent) {
    intentScore = 1.0;
  } else if (isRelatedIntent(chip.semanticType, intent)) {
    intentScore = 0.5;
  }

  const eqWeight = applyEQWeight(chip, eqMode);
  const coachWeight = coachFit(chip);
  const similarityBoost = pineconeSimilarity ? pineconeSimilarity * 0.5 : 0;

  const finalScore =
    intentScore * eqWeight * coachWeight + similarityBoost;

  return {
    intentScore,
    eqWeight,
    coachWeight,
    similarityBoost,
    finalScore
  };
}

/**
 * Filter Low Quality Chunks
 *
 * Removes chunks that score below a quality threshold.
 * Ensures only high-quality, relevant chips are returned.
 *
 * @param rankedChunks - Array of ranked chunks
 * @param threshold - Minimum score threshold (default: 0.3)
 * @returns Filtered array of chunks
 */
export function filterLowQualityChunks(
  rankedChunks: Array<{ metadata: ChipMetadata; score: number }>,
  threshold: number = 0.3
): Array<{ metadata: ChipMetadata; score: number }> {
  const filtered = rankedChunks.filter(chunk => chunk.score >= threshold);

  const removed = rankedChunks.length - filtered.length;
  if (removed > 0) {
    console.log(`[ChunkRanker] Filtered out ${removed} low-quality chunks (< ${threshold})`);
  }

  return filtered;
}
