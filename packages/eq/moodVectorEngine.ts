/**
 * Mood Vector Engine v4.0
 *
 * Produces a numeric vector that tunes Jenny's coaching tone.
 *
 * This is THE HEART of Jenny-EQ control.
 *
 * Maps emotional state → coaching parameters:
 * - ANXIETY → slow pace, high warmth, high empathy, low firmness
 * - EAGERNESS → fast pace, moderate warmth, high firmness
 * - RESISTANCE → high firmness, high intensity, moderate empathy
 * - OVERWHELM → slow pace, high warmth, high empathy, scaffolding
 * - etc.
 *
 * These mappings are derived from analyzing Jenny's real sessions.
 * NOT psychobabble. NOT guesswork. REAL patterns.
 */

import { EQProfile } from "./eqProfile";
import { EQSignal } from "./eqSignals";

/**
 * Mood Vector
 *
 * 7-dimensional vector controlling Jenny's coaching tone.
 *
 * Each dimension is 0-1 scale:
 * - warmth: How much emotional warmth (0 = cold, 1 = very warm)
 * - firmness: How much directness/boundaries (0 = soft, 1 = firm)
 * - optimism: How upbeat/hopeful (0 = realistic, 1 = optimistic)
 * - pace: How fast to move (0 = slow/careful, 1 = fast/momentum)
 * - empathy: How much validation (0 = tactical, 1 = validating)
 * - cheer: How energizing/uplifting (0 = calm, 1 = energizing)
 * - intensity: How much push/challenge (0 = gentle, 1 = intense)
 */
export interface MoodVector {
  warmth: number; // 0-1
  firmness: number; // 0-1
  optimism: number; // 0-1
  pace: number; // 0-1
  empathy: number; // 0-1
  cheer: number; // 0-1
  intensity: number; // 0-1
}

/**
 * Compute Mood Vector
 *
 * Maps EQ profile to mood vector for tone control.
 *
 * Logic:
 * 1. Start with neutral baseline (all 0.5)
 * 2. Apply primary signal adjustments
 * 3. Apply secondary signal blend (if present)
 * 4. Return final vector
 *
 * @param profile - EQ profile from tracker
 * @returns Mood vector
 */
export function computeMoodVector(profile: EQProfile): MoodVector {
  console.log(
    `[MoodVectorEngine] Computing mood vector for primary:${profile.primary}, secondary:${profile.secondary}`
  );

  // Baseline: neutral mood
  const base: MoodVector = {
    warmth: 0.5,
    firmness: 0.5,
    optimism: 0.5,
    pace: 0.5,
    empathy: 0.5,
    cheer: 0.5,
    intensity: 0.5
  };

  if (!profile.primary) {
    console.log(`[MoodVectorEngine] No primary signal, returning neutral vector`);
    return base;
  }

  // Get primary adjustment
  const primaryAdjustment = getSignalMoodAdjustment(profile.primary);

  // Get secondary adjustment (if present, apply at 50% weight)
  const secondaryAdjustment = profile.secondary
    ? getSignalMoodAdjustment(profile.secondary)
    : {};

  // Blend adjustments
  const blended: MoodVector = { ...base };

  // Apply primary (100% weight)
  for (const [key, value] of Object.entries(primaryAdjustment)) {
    blended[key as keyof MoodVector] = value as number;
  }

  // Apply secondary (50% weight, blend with base)
  if (profile.secondary) {
    for (const [key, value] of Object.entries(secondaryAdjustment)) {
      const current = blended[key as keyof MoodVector];
      blended[key as keyof MoodVector] = current * 0.7 + (value as number) * 0.3;
    }
  }

  console.log(
    `[MoodVectorEngine] Final vector: warmth=${blended.warmth.toFixed(2)}, firmness=${blended.firmness.toFixed(2)}, empathy=${blended.empathy.toFixed(2)}`
  );

  return blended;
}

/**
 * Get Signal Mood Adjustment
 *
 * Returns mood vector adjustments for a specific EQ signal.
 * These mappings are derived from Jenny's real coaching patterns.
 *
 * @param signal - EQ signal
 * @returns Partial mood vector
 */
function getSignalMoodAdjustment(signal: EQSignal): Partial<MoodVector> {
  const mapping: Record<EQSignal, Partial<MoodVector>> = {
    // Anxious students need: warmth, empathy, slow pace, gentle approach
    ANXIETY: {
      warmth: 0.9,
      empathy: 0.9,
      pace: 0.4,
      firmness: 0.2,
      cheer: 0.6,
      intensity: 0.3
    },

    // Insecure students need: validation, confidence-building, encouragement
    INSECURITY: {
      warmth: 0.85,
      empathy: 0.9,
      cheer: 0.7,
      optimism: 0.75,
      firmness: 0.3,
      intensity: 0.4
    },

    // Confused students need: clarity, patience, scaffolding
    CONFUSION: {
      warmth: 0.8,
      empathy: 0.8,
      pace: 0.3,
      firmness: 0.3,
      intensity: 0.4,
      optimism: 0.6
    },

    // Overwhelmed students need: tactical breakdown, slow pace, reassurance
    OVERWHELM: {
      warmth: 0.9,
      empathy: 0.9,
      pace: 0.3,
      intensity: 0.2,
      firmness: 0.25,
      cheer: 0.5
    },

    // Apathetic students need: energy injection, momentum, spark
    APATHY: {
      intensity: 0.8,
      cheer: 0.8,
      optimism: 0.9,
      pace: 0.6,
      firmness: 0.6,
      warmth: 0.6
    },

    // Eager students can handle: faster pace, more challenge, momentum
    EAGERNESS: {
      firmness: 0.7,
      pace: 0.7,
      cheer: 0.8,
      intensity: 0.7,
      optimism: 0.8,
      warmth: 0.6
    },

    // Confident students can handle: high challenge, stretch goals
    CONFIDENCE: {
      firmness: 0.8,
      intensity: 0.8,
      pace: 0.7,
      cheer: 0.7,
      optimism: 0.8,
      empathy: 0.4
    },

    // Curious students need: exploration space, thoughtful pacing
    CURIOSITY: {
      cheer: 0.7,
      optimism: 0.8,
      pace: 0.55,
      firmness: 0.5,
      warmth: 0.6,
      empathy: 0.6
    },

    // Proud students need: celebration, validation, next challenge
    PRIDE: {
      cheer: 0.9,
      optimism: 0.9,
      warmth: 0.75,
      firmness: 0.6,
      intensity: 0.6,
      empathy: 0.7
    },

    // Disciplined students can handle: rigor, pace, high expectations
    DISCIPLINE: {
      firmness: 0.9,
      pace: 0.7,
      intensity: 0.75,
      cheer: 0.65,
      optimism: 0.75,
      empathy: 0.5
    },

    // Frustrated students need: validation, then tactical help
    FRUSTRATION: {
      warmth: 0.7,
      empathy: 0.7,
      intensity: 0.7,
      firmness: 0.6,
      pace: 0.5,
      optimism: 0.65
    },

    // Resistant students need: firm boundaries, "coach energy"
    RESISTANCE: {
      firmness: 0.9,
      intensity: 0.9,
      empathy: 0.6,
      warmth: 0.55,
      pace: 0.6,
      optimism: 0.7
    }
  };

  return mapping[signal];
}

/**
 * Get Mood Vector Description
 *
 * Returns human-readable description of mood vector.
 *
 * @param vector - Mood vector
 * @returns Description string
 */
export function getMoodVectorDescription(vector: MoodVector): string {
  const lines: string[] = [];

  lines.push(`Mood Vector:`);
  lines.push(`  Warmth: ${(vector.warmth * 100).toFixed(0)}% - ${describeLevel(vector.warmth)}`);
  lines.push(`  Firmness: ${(vector.firmness * 100).toFixed(0)}% - ${describeLevel(vector.firmness)}`);
  lines.push(`  Empathy: ${(vector.empathy * 100).toFixed(0)}% - ${describeLevel(vector.empathy)}`);
  lines.push(`  Pace: ${(vector.pace * 100).toFixed(0)}% - ${describePace(vector.pace)}`);
  lines.push(`  Cheer: ${(vector.cheer * 100).toFixed(0)}% - ${describeLevel(vector.cheer)}`);
  lines.push(`  Optimism: ${(vector.optimism * 100).toFixed(0)}% - ${describeLevel(vector.optimism)}`);
  lines.push(
    `  Intensity: ${(vector.intensity * 100).toFixed(0)}% - ${describeLevel(vector.intensity)}`
  );

  return lines.join("\n");
}

/**
 * Format Mood Vector for Prompt
 *
 * Formats mood vector for injection into LLM prompt.
 *
 * @param vector - Mood vector
 * @returns Formatted string for prompt
 */
export function formatMoodVectorForPrompt(vector: MoodVector): string {
  return `
# MOOD VECTOR
Use this to calibrate your tone and pacing:

- Warmth: ${vector.warmth.toFixed(2)} (${describeLevel(vector.warmth)})
- Firmness: ${vector.firmness.toFixed(2)} (${describeLevel(vector.firmness)})
- Empathy: ${vector.empathy.toFixed(2)} (${describeLevel(vector.empathy)})
- Pace: ${vector.pace.toFixed(2)} (${describePace(vector.pace)})
- Cheer: ${vector.cheer.toFixed(2)} (${describeLevel(vector.cheer)})
- Optimism: ${vector.optimism.toFixed(2)} (${describeLevel(vector.optimism)})
- Intensity: ${vector.intensity.toFixed(2)} (${describeLevel(vector.intensity)})

Adjust your response accordingly. High warmth = more emotional support. High firmness = more direct. High pace = faster momentum.
`.trim();
}

/**
 * Compare Mood Vectors
 *
 * Compares two mood vectors and returns differences.
 *
 * @param v1 - First vector
 * @param v2 - Second vector
 * @returns Object with differences
 */
export function compareMoodVectors(v1: MoodVector, v2: MoodVector): Record<keyof MoodVector, number> {
  return {
    warmth: v2.warmth - v1.warmth,
    firmness: v2.firmness - v1.firmness,
    optimism: v2.optimism - v1.optimism,
    pace: v2.pace - v1.pace,
    empathy: v2.empathy - v1.empathy,
    cheer: v2.cheer - v1.cheer,
    intensity: v2.intensity - v1.intensity
  };
}

/**
 * Helper: Describe Level
 *
 * Converts 0-1 value to descriptive label.
 */
function describeLevel(value: number): string {
  if (value < 0.3) return "Low";
  if (value < 0.5) return "Moderate-Low";
  if (value < 0.7) return "Moderate";
  if (value < 0.9) return "Moderate-High";
  return "High";
}

/**
 * Helper: Describe Pace
 *
 * Converts pace value to descriptive label.
 */
function describePace(value: number): string {
  if (value < 0.4) return "Slow/Careful";
  if (value < 0.6) return "Moderate";
  return "Fast/Momentum";
}
