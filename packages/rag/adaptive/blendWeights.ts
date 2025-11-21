/**
 * Blend Weights v4.0
 *
 * Turns EQ mode + Archetype → retrieval weight vector.
 *
 * This controls the balance between different types of knowledge chips:
 * - Semantic: Framework, strategic, big-picture understanding
 * - Tactical: Specific actions, concrete steps, how-to guidance
 * - Emotional: EQ-rich, supportive, identity-building content
 *
 * Different EQ modes and archetypes need different balances.
 */

export interface RetrievalWeights {
  semantic: number;
  tactical: number;
  emotional: number;
}

/**
 * Blend Retrieval Weights
 *
 * Calculates optimal retrieval weights based on EQ mode and student archetype.
 *
 * Base Weights (before adjustments):
 * - semantic: 0.4 (framework, strategy)
 * - tactical: 0.4 (concrete actions)
 * - emotional: 0.2 (EQ support)
 *
 * EQ Mode Adjustments:
 * - gentle: Boost emotional to 0.45 (prioritize support)
 * - direct: Boost tactical to 0.55 (prioritize actions)
 * - motivational: Boost emotional to 0.35 (prioritize momentum)
 * - mentor: Boost semantic to 0.55 (prioritize wisdom)
 *
 * Archetype Adjustments:
 * - high_achiever: +0.15 tactical (want concrete steps)
 * - burnout: +0.15 emotional (need support first)
 * - late_starter: +0.15 emotional (need confidence boost)
 * - quiet_builder: +0.15 semantic (want understanding)
 * - explorer: +0.10 semantic (want frameworks to explore)
 *
 * Weights are normalized to sum to 1.0.
 *
 * @param eqMode - The EQ mode (gentle/direct/motivational/mentor)
 * @param archetype - Student archetype type
 * @returns Normalized retrieval weights
 */
export function blendRetrievalWeights(eqMode: string, archetype: string): RetrievalWeights {
  console.log(`[BlendWeights] Calculating weights for EQ:${eqMode}, Archetype:${archetype}`);

  // Start with base weights
  let semantic = 0.4;
  let tactical = 0.4;
  let emotional = 0.2;

  // EQ mode adjustments
  if (eqMode === "gentle") {
    emotional = 0.45;
    tactical = 0.35;
    semantic = 0.2;
    console.log(`[BlendWeights] Gentle mode: boosting emotional to ${emotional}`);
  }

  if (eqMode === "direct") {
    tactical = 0.55;
    semantic = 0.3;
    emotional = 0.15;
    console.log(`[BlendWeights] Direct mode: boosting tactical to ${tactical}`);
  }

  if (eqMode === "motivational") {
    emotional = 0.35;
    semantic = 0.35;
    tactical = 0.3;
    console.log(`[BlendWeights] Motivational mode: boosting emotional to ${emotional}`);
  }

  if (eqMode === "mentor") {
    semantic = 0.55;
    tactical = 0.25;
    emotional = 0.2;
    console.log(`[BlendWeights] Mentor mode: boosting semantic to ${semantic}`);
  }

  // Archetype adjustments (additive)
  if (archetype === "high_achiever") {
    tactical += 0.15;
    console.log(`[BlendWeights] High achiever: adding 0.15 to tactical → ${tactical}`);
  }

  if (archetype === "burnout") {
    emotional += 0.15;
    console.log(`[BlendWeights] Burnout: adding 0.15 to emotional → ${emotional}`);
  }

  if (archetype === "late_starter") {
    emotional += 0.15;
    semantic += 0.05;
    console.log(`[BlendWeights] Late starter: adding to emotional and semantic`);
  }

  if (archetype === "quiet_builder") {
    semantic += 0.15;
    console.log(`[BlendWeights] Quiet builder: adding 0.15 to semantic → ${semantic}`);
  }

  if (archetype === "explorer") {
    semantic += 0.10;
    emotional += 0.05;
    console.log(`[BlendWeights] Explorer: adding to semantic and emotional`);
  }

  // Normalize to sum to 1.0
  const sum = semantic + tactical + emotional;
  const normalized = {
    semantic: semantic / sum,
    tactical: tactical / sum,
    emotional: emotional / sum
  };

  console.log(
    `[BlendWeights] Final weights: semantic=${normalized.semantic.toFixed(2)}, ` +
      `tactical=${normalized.tactical.toFixed(2)}, emotional=${normalized.emotional.toFixed(2)}`
  );

  return normalized;
}

/**
 * Get Weight Explanation
 *
 * Returns human-readable explanation of why weights were chosen.
 * Useful for debugging and transparency.
 *
 * @param weights - Retrieval weights
 * @param eqMode - EQ mode used
 * @param archetype - Archetype used
 * @returns Explanation string
 */
export function getWeightExplanation(
  weights: RetrievalWeights,
  eqMode: string,
  archetype: string
): string {
  const lines: string[] = [];

  lines.push(`Retrieval Weight Distribution:`);
  lines.push(`  Semantic (framework/strategy): ${(weights.semantic * 100).toFixed(0)}%`);
  lines.push(`  Tactical (concrete actions): ${(weights.tactical * 100).toFixed(0)}%`);
  lines.push(`  Emotional (EQ support): ${(weights.emotional * 100).toFixed(0)}%`);
  lines.push(``);
  lines.push(`Factors:`);
  lines.push(`  EQ Mode: ${eqMode}`);
  lines.push(`  Archetype: ${archetype}`);

  return lines.join("\n");
}

/**
 * Get Dominant Weight
 *
 * Returns which weight dimension is dominant.
 * Useful for quick classification.
 *
 * @param weights - Retrieval weights
 * @returns "semantic", "tactical", or "emotional"
 */
export function getDominantWeight(weights: RetrievalWeights): string {
  if (weights.semantic > weights.tactical && weights.semantic > weights.emotional) {
    return "semantic";
  }
  if (weights.tactical > weights.semantic && weights.tactical > weights.emotional) {
    return "tactical";
  }
  return "emotional";
}

/**
 * Validate Weights
 *
 * Ensures weights sum to 1.0 and are all non-negative.
 * Returns warnings if weights seem off.
 *
 * @param weights - Retrieval weights
 * @returns Array of warnings (empty if valid)
 */
export function validateWeights(weights: RetrievalWeights): string[] {
  const warnings: string[] = [];

  const sum = weights.semantic + weights.tactical + weights.emotional;
  if (Math.abs(sum - 1.0) > 0.01) {
    warnings.push(`Weights don't sum to 1.0 (sum: ${sum.toFixed(2)})`);
  }

  if (weights.semantic < 0 || weights.tactical < 0 || weights.emotional < 0) {
    warnings.push(`Negative weights detected`);
  }

  // Warn if any dimension is too dominant (> 80%)
  if (weights.semantic > 0.8 || weights.tactical > 0.8 || weights.emotional > 0.8) {
    warnings.push(`One dimension is too dominant (> 80%)`);
  }

  // Warn if any dimension is too low (< 5%)
  if (weights.semantic < 0.05 || weights.tactical < 0.05 || weights.emotional < 0.05) {
    warnings.push(`One dimension is very low (< 5%) - may miss important content`);
  }

  return warnings;
}
