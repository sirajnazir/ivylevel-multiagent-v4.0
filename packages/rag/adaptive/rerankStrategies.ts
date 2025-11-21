/**
 * Rerank Strategies v4.0
 *
 * EQ-aware reranking logic that adjusts retrieval results based on
 * emotional intelligence mode.
 *
 * This is the post-processing layer that ensures the final chip selection
 * matches the emotional tone needed for the conversation.
 */

import { RankedChunk, ChipMetadata } from "./ragTypes";

/**
 * Chip with EQ Metrics
 *
 * Extended chip metadata with EQ-specific scoring dimensions.
 */
export interface ChipWithEQMetrics {
  id: string;
  text: string;
  metadata: ChipMetadata;
  score: number;
  eqMetrics: {
    empathy: number;
    clarity: number;
    energy: number;
    wisdom: number;
  };
}

/**
 * Calculate EQ Metrics
 *
 * Derives EQ metrics from chip metadata and text content.
 * These metrics power EQ-aware reranking.
 *
 * @param chip - The chip to analyze
 * @returns EQ metrics object
 */
export function calculateEQMetrics(chip: {
  text: string;
  metadata: ChipMetadata;
}): { empathy: number; clarity: number; energy: number; wisdom: number } {
  const text = chip.text.toLowerCase();
  const eqSignals = chip.metadata.eqSignals || [];

  let empathy = 0;
  let clarity = 0;
  let energy = 0;
  let wisdom = 0;

  // Empathy scoring (0-1)
  if (eqSignals.includes("supportive")) empathy += 0.3;
  if (eqSignals.includes("empathetic")) empathy += 0.3;
  if (eqSignals.includes("validating")) empathy += 0.2;
  if (text.match(/\b(i get it|i understand|that makes sense|you're not alone)\b/i))
    empathy += 0.2;

  // Clarity scoring (0-1)
  if (eqSignals.includes("straight")) clarity += 0.3;
  if (eqSignals.includes("tactical")) clarity += 0.3;
  if (text.match(/\b(here's what|the key is|specifically|exactly)\b/i)) clarity += 0.2;
  if (text.match(/\b(step 1|step 2|first|second|next)\b/i)) clarity += 0.2;

  // Energy scoring (0-1)
  if (eqSignals.includes("uplifting")) energy += 0.3;
  if (eqSignals.includes("encouraging")) energy += 0.3;
  if (eqSignals.includes("motivational")) energy += 0.2;
  if (text.match(/\b(you can|let's go|excited|momentum)\b/i)) energy += 0.2;

  // Wisdom scoring (0-1)
  if (eqSignals.includes("guiding")) wisdom += 0.3;
  if (eqSignals.includes("experienced")) wisdom += 0.3;
  if (text.match(/\b(i've seen|in my experience|what i've learned|pattern)\b/i))
    wisdom += 0.2;
  if (text.match(/\b(framework|principle|approach)\b/i)) wisdom += 0.2;

  // Cap at 1.0
  return {
    empathy: Math.min(empathy, 1.0),
    clarity: Math.min(clarity, 1.0),
    energy: Math.min(energy, 1.0),
    wisdom: Math.min(wisdom, 1.0)
  };
}

/**
 * Rerank with EQ
 *
 * Main reranking function that sorts chips based on EQ mode preferences.
 *
 * EQ Mode → Priority Dimension:
 * - gentle: Prioritize empathy score
 * - direct: Prioritize clarity score
 * - motivational: Prioritize energy score
 * - mentor: Prioritize wisdom score
 *
 * @param chips - Chips to rerank
 * @param eqMode - EQ mode to optimize for
 * @returns Reranked chips
 */
export function rerankWithEQ(chips: RankedChunk[], eqMode: string): RankedChunk[] {
  console.log(`[RerankStrategies] Reranking ${chips.length} chips for EQ mode: ${eqMode}`);

  // Calculate EQ metrics for each chip
  const chipsWithMetrics = chips.map(chip => ({
    ...chip,
    eqMetrics: calculateEQMetrics({
      text: chip.text,
      metadata: {
        text: chip.text,
        coachId: "jenny",
        sourcePath: "",
        semanticType: chip.semanticType,
        eqSignals: chip.eqSignals,
        order: 0,
        size: chip.text.length
      }
    })
  }));

  // Sort based on EQ mode
  let sorted: typeof chipsWithMetrics;

  if (eqMode === "gentle") {
    sorted = chipsWithMetrics.sort((a, b) => b.eqMetrics.empathy - a.eqMetrics.empathy);
    console.log(`[RerankStrategies] Sorted by empathy (gentle mode)`);
  } else if (eqMode === "direct") {
    sorted = chipsWithMetrics.sort((a, b) => b.eqMetrics.clarity - a.eqMetrics.clarity);
    console.log(`[RerankStrategies] Sorted by clarity (direct mode)`);
  } else if (eqMode === "motivational") {
    sorted = chipsWithMetrics.sort((a, b) => b.eqMetrics.energy - a.eqMetrics.energy);
    console.log(`[RerankStrategies] Sorted by energy (motivational mode)`);
  } else if (eqMode === "mentor") {
    sorted = chipsWithMetrics.sort((a, b) => b.eqMetrics.wisdom - a.eqMetrics.wisdom);
    console.log(`[RerankStrategies] Sorted by wisdom (mentor mode)`);
  } else {
    // Default: no reranking
    sorted = chipsWithMetrics;
    console.log(`[RerankStrategies] Unknown EQ mode, no reranking applied`);
  }

  // Log top 3 scores
  if (sorted.length > 0) {
    console.log(`[RerankStrategies] Top 3 after reranking:`);
    sorted.slice(0, 3).forEach((chip, idx) => {
      const metric = eqMode === "gentle" ? chip.eqMetrics.empathy :
                     eqMode === "direct" ? chip.eqMetrics.clarity :
                     eqMode === "motivational" ? chip.eqMetrics.energy :
                     eqMode === "mentor" ? chip.eqMetrics.wisdom : 0;
      console.log(`  ${idx + 1}. Score: ${metric.toFixed(2)} - "${chip.text.substring(0, 50)}..."`);
    });
  }

  // Remove eqMetrics before returning (keep chips clean)
  return sorted.map(({ eqMetrics, ...chip }) => chip);
}

/**
 * Rerank with Multi-Criteria
 *
 * Advanced reranking that combines multiple EQ dimensions.
 * Useful when you want a balanced selection.
 *
 * @param chips - Chips to rerank
 * @param weights - Weights for each EQ dimension
 * @returns Reranked chips
 */
export function rerankWithMultiCriteria(
  chips: RankedChunk[],
  weights: { empathy: number; clarity: number; energy: number; wisdom: number }
): RankedChunk[] {
  console.log(`[RerankStrategies] Multi-criteria reranking with custom weights`);

  const chipsWithMetrics = chips.map(chip => {
    const metrics = calculateEQMetrics({
      text: chip.text,
      metadata: {
        text: chip.text,
        coachId: "jenny",
        sourcePath: "",
        semanticType: chip.semanticType,
        eqSignals: chip.eqSignals,
        order: 0,
        size: chip.text.length
      }
    });

    // Calculate weighted score
    const weightedScore =
      metrics.empathy * weights.empathy +
      metrics.clarity * weights.clarity +
      metrics.energy * weights.energy +
      metrics.wisdom * weights.wisdom;

    return {
      ...chip,
      eqMetrics: metrics,
      weightedScore
    };
  });

  const sorted = chipsWithMetrics.sort((a, b) => b.weightedScore - a.weightedScore);

  console.log(`[RerankStrategies] Top weighted score: ${sorted[0]?.weightedScore.toFixed(2)}`);

  return sorted.map(({ eqMetrics, weightedScore, ...chip }) => chip);
}

/**
 * Filter Bland Chips
 *
 * Removes chips that are too generic or lack EQ richness.
 * Ensures no bland chips escape into final results.
 *
 * @param chips - Chips to filter
 * @param threshold - Minimum total EQ score (default: 0.3)
 * @returns Filtered chips
 */
export function filterBlandChips(chips: RankedChunk[], threshold: number = 0.3): RankedChunk[] {
  console.log(`[RerankStrategies] Filtering bland chips (threshold: ${threshold})`);

  const filtered = chips.filter(chip => {
    const metrics = calculateEQMetrics({
      text: chip.text,
      metadata: {
        text: chip.text,
        coachId: "jenny",
        sourcePath: "",
        semanticType: chip.semanticType,
        eqSignals: chip.eqSignals,
        order: 0,
        size: chip.text.length
      }
    });

    const totalScore = metrics.empathy + metrics.clarity + metrics.energy + metrics.wisdom;

    if (totalScore < threshold) {
      console.log(`[RerankStrategies] Filtered out bland chip: "${chip.text.substring(0, 40)}..."`);
      return false;
    }

    return true;
  });

  console.log(`[RerankStrategies] Kept ${filtered.length}/${chips.length} chips after filtering`);

  return filtered;
}

/**
 * Boost Narrative Chips
 *
 * Increases scores for narrative/EQ-rich chips when appropriate.
 * Used in certain EQ modes or conversation stages.
 *
 * @param chips - Chips to boost
 * @param boostFactor - Multiplier for narrative chips (default: 1.3)
 * @returns Chips with boosted scores
 */
export function boostNarrativeChips(chips: RankedChunk[], boostFactor: number = 1.3): RankedChunk[] {
  console.log(`[RerankStrategies] Boosting narrative chips by ${boostFactor}x`);

  return chips.map(chip => {
    if (chip.semanticType === "narrative" || chip.semanticType === "eq") {
      return {
        ...chip,
        score: chip.score * boostFactor
      };
    }
    return chip;
  });
}

/**
 * Diversity Rerank
 *
 * Ensures diversity in semantic types to avoid echo chamber.
 * Prevents all chips from being the same type.
 *
 * @param chips - Chips to diversify
 * @param maxPerType - Maximum chips per semantic type (default: 3)
 * @returns Diversified chips
 */
export function diversityRerank(chips: RankedChunk[], maxPerType: number = 3): RankedChunk[] {
  console.log(`[RerankStrategies] Applying diversity constraint (max ${maxPerType} per type)`);

  const typeCounts: Record<string, number> = {};
  const diversified: RankedChunk[] = [];

  for (const chip of chips) {
    const type = chip.semanticType;
    const count = typeCounts[type] || 0;

    if (count < maxPerType) {
      diversified.push(chip);
      typeCounts[type] = count + 1;
    } else {
      console.log(`[RerankStrategies] Skipping chip (too many ${type} chips already)`);
    }
  }

  console.log(`[RerankStrategies] Diversity filtering: ${diversified.length}/${chips.length} kept`);

  return diversified;
}
