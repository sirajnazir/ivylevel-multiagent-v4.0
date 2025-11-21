/**
 * Style Mixer v4.0
 *
 * Converts mood vector (continuous 0-1 values) into discrete style directives.
 *
 * Purpose:
 * - Translate numeric mood vector into categorical instructions
 * - Make it easy for LLM to understand style requirements
 * - Provide clear buckets: low/medium/high for most dimensions
 * - Provide clear buckets: slow/normal/fast for pace
 *
 * This is the bridge between:
 * - What we DETECT (mood vector from EQ signals)
 * - What we INSTRUCT (style directives for LLM)
 */

import { MoodVector } from "./moodVectorEngine";

/**
 * Style Directives
 *
 * Discrete, categorical instructions for the LLM.
 * Much easier for the model to follow than continuous values.
 */
export interface StyleDirectives {
  warmthLevel: "low" | "medium" | "high";
  firmnessLevel: "low" | "medium" | "high";
  paceLevel: "slow" | "normal" | "fast";
  empathyLevel: "low" | "medium" | "high";
  cheerLevel: "low" | "medium" | "high";
  intensityLevel: "low" | "medium" | "high";
}

/**
 * Mix Style
 *
 * Converts a mood vector into style directives.
 *
 * Buckets:
 * - 0.00 - 0.33 → low (or slow for pace)
 * - 0.34 - 0.66 → medium (or normal for pace)
 * - 0.67 - 1.00 → high (or fast for pace)
 *
 * @param mood - Mood vector from EQ profile
 * @returns Style directives
 */
export function mixStyle(mood: MoodVector): StyleDirectives {
  console.log(
    `[StyleMixer] Converting mood vector to directives: warmth=${mood.warmth.toFixed(2)}, firmness=${mood.firmness.toFixed(2)}, pace=${mood.pace.toFixed(2)}`
  );

  const directives: StyleDirectives = {
    warmthLevel: bucket(mood.warmth),
    firmnessLevel: bucket(mood.firmness),
    paceLevel: bucketPace(mood.pace),
    empathyLevel: bucket(mood.empathy),
    cheerLevel: bucket(mood.cheer),
    intensityLevel: bucket(mood.intensity)
  };

  console.log(
    `[StyleMixer] Directives: warmth=${directives.warmthLevel}, firmness=${directives.firmnessLevel}, pace=${directives.paceLevel}`
  );

  return directives;
}

/**
 * Bucket Helper
 *
 * Converts 0-1 value to low/medium/high.
 *
 * @param value - Continuous value (0-1)
 * @returns Discrete level
 */
function bucket(value: number): "low" | "medium" | "high" {
  if (value <= 0.33) return "low";
  if (value <= 0.66) return "medium";
  return "high";
}

/**
 * Bucket Pace Helper
 *
 * Converts 0-1 pace value to slow/normal/fast.
 *
 * @param value - Continuous pace value (0-1)
 * @returns Discrete pace level
 */
function bucketPace(value: number): "slow" | "normal" | "fast" {
  if (value <= 0.33) return "slow";
  if (value <= 0.66) return "normal";
  return "fast";
}

/**
 * Get Style Summary
 *
 * Returns human-readable summary of style directives.
 *
 * @param directives - Style directives
 * @returns Summary string
 */
export function getStyleSummary(directives: StyleDirectives): string {
  return `Style Directives:
  Warmth: ${directives.warmthLevel}
  Firmness: ${directives.firmnessLevel}
  Pace: ${directives.paceLevel}
  Empathy: ${directives.empathyLevel}
  Cheer: ${directives.cheerLevel}
  Intensity: ${directives.intensityLevel}`;
}

/**
 * Compare Style Directives
 *
 * Compares two style directive sets and returns differences.
 *
 * @param s1 - First style directives
 * @param s2 - Second style directives
 * @returns Object with differences
 */
export function compareStyleDirectives(
  s1: StyleDirectives,
  s2: StyleDirectives
): Record<keyof StyleDirectives, boolean> {
  return {
    warmthLevel: s1.warmthLevel !== s2.warmthLevel,
    firmnessLevel: s1.firmnessLevel !== s2.firmnessLevel,
    paceLevel: s1.paceLevel !== s2.paceLevel,
    empathyLevel: s1.empathyLevel !== s2.empathyLevel,
    cheerLevel: s1.cheerLevel !== s2.cheerLevel,
    intensityLevel: s1.intensityLevel !== s2.intensityLevel
  };
}

/**
 * Get Changed Directives
 *
 * Returns list of directives that changed between two style sets.
 *
 * @param s1 - First style directives
 * @param s2 - Second style directives
 * @returns Array of changed directive names
 */
export function getChangedDirectives(
  s1: StyleDirectives,
  s2: StyleDirectives
): Array<keyof StyleDirectives> {
  const comparison = compareStyleDirectives(s1, s2);
  return (Object.keys(comparison) as Array<keyof StyleDirectives>).filter(
    key => comparison[key]
  );
}

/**
 * Is High Warmth Style
 *
 * Quick check if style is high warmth (for supportive contexts).
 *
 * @param directives - Style directives
 * @returns True if high warmth
 */
export function isHighWarmthStyle(directives: StyleDirectives): boolean {
  return directives.warmthLevel === "high";
}

/**
 * Is High Firmness Style
 *
 * Quick check if style is high firmness (for accountability contexts).
 *
 * @param directives - Style directives
 * @returns True if high firmness
 */
export function isHighFirmnessStyle(directives: StyleDirectives): boolean {
  return directives.firmnessLevel === "high";
}

/**
 * Is Slow Pace Style
 *
 * Quick check if style is slow pace (for overwhelmed students).
 *
 * @param directives - Style directives
 * @returns True if slow pace
 */
export function isSlowPaceStyle(directives: StyleDirectives): boolean {
  return directives.paceLevel === "slow";
}

/**
 * Is Fast Pace Style
 *
 * Quick check if style is fast pace (for eager students).
 *
 * @param directives - Style directives
 * @returns True if fast pace
 */
export function isFastPaceStyle(directives: StyleDirectives): boolean {
  return directives.paceLevel === "fast";
}

/**
 * Get Dominant Style Traits
 *
 * Returns the most pronounced style traits (high level or extremes).
 * Useful for summarizing the overall style character.
 *
 * @param directives - Style directives
 * @returns Array of dominant trait descriptions
 */
export function getDominantStyleTraits(directives: StyleDirectives): string[] {
  const traits: string[] = [];

  if (directives.warmthLevel === "high") traits.push("high warmth");
  if (directives.firmnessLevel === "high") traits.push("high firmness");
  if (directives.empathyLevel === "high") traits.push("high empathy");
  if (directives.cheerLevel === "high") traits.push("high energy");
  if (directives.intensityLevel === "high") traits.push("high intensity");
  if (directives.paceLevel === "slow") traits.push("slow pace");
  if (directives.paceLevel === "fast") traits.push("fast pace");

  // Also note notable lows
  if (directives.warmthLevel === "low") traits.push("low warmth");
  if (directives.firmnessLevel === "low") traits.push("low firmness");
  if (directives.intensityLevel === "low") traits.push("gentle intensity");

  return traits;
}

/**
 * Style Archetype Detection
 *
 * Detects common style patterns that correspond to known archetypes.
 * Useful for validation and debugging.
 *
 * @param directives - Style directives
 * @returns Detected archetype or null
 */
export function detectStyleArchetype(
  directives: StyleDirectives
): "supportive" | "motivational" | "firm-coach" | "balanced" | null {
  // Supportive: high warmth, high empathy, slow pace
  if (
    directives.warmthLevel === "high" &&
    directives.empathyLevel === "high" &&
    directives.paceLevel === "slow"
  ) {
    return "supportive";
  }

  // Motivational: high cheer, high intensity, fast pace
  if (
    directives.cheerLevel === "high" &&
    directives.intensityLevel === "high" &&
    directives.paceLevel === "fast"
  ) {
    return "motivational";
  }

  // Firm coach: high firmness, high intensity, medium warmth
  if (
    directives.firmnessLevel === "high" &&
    directives.intensityLevel === "high" &&
    directives.warmthLevel === "medium"
  ) {
    return "firm-coach";
  }

  // Balanced: all medium
  if (
    directives.warmthLevel === "medium" &&
    directives.firmnessLevel === "medium" &&
    directives.paceLevel === "normal"
  ) {
    return "balanced";
  }

  return null;
}

/**
 * Validate Style Directives
 *
 * Checks for potentially problematic style combinations.
 * Warns if conflicting directives are detected.
 *
 * @param directives - Style directives
 * @returns Validation result
 */
export function validateStyleDirectives(directives: StyleDirectives): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Warn if high firmness + low warmth (might be too harsh)
  if (directives.firmnessLevel === "high" && directives.warmthLevel === "low") {
    warnings.push("High firmness + low warmth may feel harsh");
  }

  // Warn if high intensity + slow pace (conflicting signals)
  if (directives.intensityLevel === "high" && directives.paceLevel === "slow") {
    warnings.push("High intensity + slow pace may send mixed signals");
  }

  // Warn if high empathy but low warmth (unusual combination)
  if (directives.empathyLevel === "high" && directives.warmthLevel === "low") {
    warnings.push("High empathy + low warmth is an unusual combination");
  }

  // Warn if all low (might be too flat)
  if (
    directives.warmthLevel === "low" &&
    directives.firmnessLevel === "low" &&
    directives.cheerLevel === "low" &&
    directives.empathyLevel === "low"
  ) {
    warnings.push("All dimensions are low - response may feel flat");
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}
