import { z } from "zod";

/**
 * Memory Signal Schema v1
 *
 * Defines the structure for emotional and behavioral signal detection.
 * These signals are extracted from student messages and used to update
 * the conversation memory's emotional tracking.
 *
 * Deltas represent changes to apply to existing signal levels:
 * - Positive delta = signal increasing
 * - Negative delta = signal decreasing
 * - Zero delta = no change
 */

/**
 * Memory Signal
 *
 * Detected changes in emotional and behavioral signals from a single message.
 */
export const memorySignalSchema = z.object({
  /**
   * Change in frustration level (-5 to +5)
   * Positive = more frustrated
   * Negative = less frustrated
   */
  frustrationDelta: z.number().min(-5).max(5),

  /**
   * Change in confidence level (-5 to +5)
   * Positive = more confident
   * Negative = less confident
   */
  confidenceDelta: z.number().min(-5).max(5),

  /**
   * Change in overwhelm level (-5 to +5)
   * Positive = more overwhelmed
   * Negative = less overwhelmed
   */
  overwhelmDelta: z.number().min(-5).max(5),

  /**
   * Change in motivation level (-5 to +5)
   * Positive = more motivated
   * Negative = less motivated
   */
  motivationDelta: z.number().min(-5).max(5),

  /**
   * Change in agency level (-5 to +5)
   * Positive = more agency/ownership
   * Negative = less agency/ownership
   */
  agencyDelta: z.number().min(-5).max(5),

  /**
   * Detected behavioral patterns
   * Examples:
   * - "avoidance_of_difficult_topics"
   * - "empowerment_language_emerging"
   * - "micro_win_celebration"
   * - "parental_pressure_expressed"
   * - "confidence_building"
   * - "seeking_permission"
   * - "taking_ownership"
   */
  patterns: z.array(z.string())
});

export type MemorySignal = z.infer<typeof memorySignalSchema>;

/**
 * Create Neutral Signal
 *
 * Returns a signal with no changes (all deltas = 0, no patterns).
 * Useful as a fallback or default.
 */
export function createNeutralSignal(): MemorySignal {
  return {
    frustrationDelta: 0,
    confidenceDelta: 0,
    overwhelmDelta: 0,
    motivationDelta: 0,
    agencyDelta: 0,
    patterns: []
  };
}

/**
 * Apply Signal Bounds
 *
 * Ensures emotional signal values stay within 0-5 range after applying deltas.
 */
export function applySignalBounds(value: number, delta: number): number {
  return Math.max(0, Math.min(5, value + delta));
}
