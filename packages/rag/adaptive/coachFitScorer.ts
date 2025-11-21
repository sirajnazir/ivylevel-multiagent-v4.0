/**
 * Coach Fit Scorer v4.0
 *
 * Signals how strongly a chip aligns with Jenny's known coaching style.
 *
 * This is the "Jenny-ness" detector. It ensures retrieved chips
 * match her distinctive approach:
 * - EQ-driven insights
 * - Framework-based clarity
 * - Supportive but direct tone
 * - Tactical next steps
 */

import { ChipMetadata } from "./ragTypes";

/**
 * Coach Fit Score
 *
 * Returns a multiplier (0.8 - 1.3) based on how well the chip
 * aligns with Jenny's coaching style.
 *
 * Jenny's Style Markers:
 * - EQ-rich content (high emotional intelligence)
 * - Framework-based approach (clarity, structure, steps)
 * - Supportive language ("you can do this", "proud of you")
 * - Tactical specificity (concrete next steps)
 * - Question-based discovery ("what excites you most?")
 *
 * @param chip - The chip metadata from Pinecone
 * @returns Multiplier for coach fit (0.8 - 1.3)
 */
export function coachFit(chip: ChipMetadata): number {
  console.log(`[CoachFit] Calculating coach fit score`);

  let score = 1.0;
  const text = chip.text.toLowerCase();

  // Boost 1: EQ-rich content
  if (chip.semanticType === "eq") {
    score += 0.2;
    console.log(`[CoachFit] EQ semantic type boost: +0.2 → ${score}`);
  }

  // Boost 2: Framework/clarity markers
  if (
    text.match(/\b(framework|principle|step|phase|approach|here's how|the key is)\b/i)
  ) {
    score += 0.15;
    console.log(`[CoachFit] Framework language boost: +0.15 → ${score}`);
  }

  // Boost 3: Supportive language
  if (text.match(/\b(you can|proud|believe in|excited|love seeing)\b/i)) {
    score += 0.1;
    console.log(`[CoachFit] Supportive language boost: +0.1 → ${score}`);
  }

  // Boost 4: Question-based discovery
  if (text.match(/\b(what|why|how|which|tell me)\b.*\?/i)) {
    score += 0.08;
    console.log(`[CoachFit] Question-based discovery boost: +0.08 → ${score}`);
  }

  // Boost 5: Tactical specificity
  if (text.match(/\b(next step|specific|concrete|actionable|here's what)\b/i)) {
    score += 0.12;
    console.log(`[CoachFit] Tactical specificity boost: +0.12 → ${score}`);
  }

  // Boost 6: Jenny's signature phrases
  if (
    text.match(
      /\b(depth over breadth|impact over participation|spike|rigor story|the question is)\b/i
    )
  ) {
    score += 0.15;
    console.log(`[CoachFit] Jenny signature phrase boost: +0.15 → ${score}`);
  }

  // Penalty 1: Generic admissions advice
  if (
    text.match(/\b(make sure to|don't forget|remember to|it's important)\b/i) &&
    !text.match(/\b(specific|concrete|next step)\b/i)
  ) {
    score -= 0.1;
    console.log(`[CoachFit] Generic advice penalty: -0.1 → ${score}`);
  }

  // Penalty 2: Overly formal/corporate language
  if (
    text.match(
      /\b(utilize|facilitate|implement|ensure|pursuant|herein|aforementioned)\b/i
    )
  ) {
    score -= 0.15;
    console.log(`[CoachFit] Formal language penalty: -0.15 → ${score}`);
  }

  // Cap the score at reasonable bounds
  score = Math.max(0.8, Math.min(1.3, score));

  console.log(`[CoachFit] Final coach fit score: ${score.toFixed(2)}`);
  return score;
}

/**
 * Get Jenny Style Match Count
 *
 * Returns the number of Jenny-style markers found in the chip.
 * Used for additional ranking signals.
 *
 * @param chip - The chip metadata
 * @returns Number of style markers found
 */
export function getJennyStyleMatchCount(chip: ChipMetadata): number {
  const text = chip.text.toLowerCase();
  let count = 0;

  const markers = [
    /\b(framework|principle|step|phase|approach)\b/i,
    /\b(you can|proud|believe in|excited)\b/i,
    /\b(what|why|how).*\?/i,
    /\b(next step|specific|concrete|actionable)\b/i,
    /\b(depth over breadth|impact over participation|spike|rigor story)\b/i,
    /\b(eq|values|identity|motivation)\b/i
  ];

  for (const marker of markers) {
    if (marker.test(text)) {
      count++;
    }
  }

  console.log(`[CoachFit] Jenny style markers found: ${count}`);
  return count;
}

/**
 * Is Jenny Authentic
 *
 * Returns true if the chip feels authentically "Jenny" vs generic admissions advice.
 * Used to filter out low-quality or mismatched chips.
 *
 * @param chip - The chip metadata
 * @returns True if authentic, false if generic
 */
export function isJennyAuthentic(chip: ChipMetadata): boolean {
  const text = chip.text.toLowerCase();

  // Red flags for generic/non-Jenny content
  const genericMarkers = [
    /\b(please note|kindly|as per|in accordance with)\b/i,
    /\b(best of luck|good luck|all the best)\b/i,
    /\b(utilize|facilitate|pursuant to)\b/i
  ];

  for (const marker of genericMarkers) {
    if (marker.test(text)) {
      console.log(`[CoachFit] Generic marker detected - not authentic Jenny`);
      return false;
    }
  }

  // Must have at least ONE Jenny marker to be authentic
  const hasJennyMarker =
    chip.semanticType === "eq" ||
    text.match(/\b(framework|you can|what|why|next step|spike|depth over breadth)\b/i);

  if (!hasJennyMarker) {
    console.log(`[CoachFit] No Jenny markers found - not authentic`);
    return false;
  }

  console.log(`[CoachFit] Chip passes authenticity check`);
  return true;
}

/**
 * Get Coach Persona Alignment
 *
 * Returns a score (0-1) indicating how well the chip aligns with
 * specific Jenny persona traits.
 *
 * Persona Traits:
 * - Warmth: Supportive, encouraging language
 * - Directness: Clear, specific guidance
 * - Insight: EQ-driven observations
 * - Structure: Framework-based approach
 *
 * @param chip - The chip metadata
 * @returns Alignment score (0-1)
 */
export function getCoachPersonaAlignment(chip: ChipMetadata): number {
  const text = chip.text.toLowerCase();
  let alignment = 0;

  // Warmth (0-0.25)
  if (text.match(/\b(you can|proud|excited|love|believe in)\b/i)) {
    alignment += 0.25;
  } else if (text.match(/\b(great|good|nice|cool)\b/i)) {
    alignment += 0.15;
  }

  // Directness (0-0.25)
  if (text.match(/\b(here's|specific|concrete|next step|actionable)\b/i)) {
    alignment += 0.25;
  } else if (text.match(/\b(should|need to|must)\b/i)) {
    alignment += 0.15;
  }

  // Insight (0-0.25)
  if (chip.semanticType === "eq" || text.match(/\b(the question is|what matters)\b/i)) {
    alignment += 0.25;
  } else if (text.match(/\b(values|identity|motivation|why)\b/i)) {
    alignment += 0.15;
  }

  // Structure (0-0.25)
  if (text.match(/\b(framework|step|phase|principle|approach)\b/i)) {
    alignment += 0.25;
  } else if (text.match(/\b(first|second|next|then)\b/i)) {
    alignment += 0.15;
  }

  console.log(`[CoachFit] Persona alignment score: ${alignment.toFixed(2)}`);
  return alignment;
}
