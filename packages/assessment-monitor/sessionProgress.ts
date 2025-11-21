/**
 * sessionProgress.ts
 *
 * SessionProgress_v1 - Session completeness scorer
 *
 * Tracks progress toward stage completion.
 * Detects "stalling" - when student talks for many turns without providing useful data.
 *
 * Returns score 0-100 (higher = more complete)
 */

import type { TelemetryEvent, ProgressDetails, TelemetryFlag } from './types';

/**
 * Compute Progress Score
 *
 * Calculates how complete the current stage is based on:
 * - Slots collected vs. required
 * - Turn efficiency (progress per turn)
 *
 * @param event - Telemetry event to check
 * @returns Progress score (0-100)
 */
export function computeProgressScore(event: TelemetryEvent): number {
  const collected = event.extractedSlots?.length || 0;
  const required = event.requiredSlots?.length || 5;  // Default: 5 slots per stage

  // Base progress score
  const progress = (collected / required) * 100;

  // Cap at 100
  return Math.min(100, progress);
}

/**
 * Get Progress Details
 *
 * Returns detailed breakdown of session progress.
 *
 * @param event - Telemetry event to check
 * @returns Detailed progress breakdown
 */
export function getProgressDetails(event: TelemetryEvent): ProgressDetails {
  const collectedSlots = event.extractedSlots || [];
  const requiredSlots = event.requiredSlots || [];

  const collected = collectedSlots.length;
  const required = requiredSlots.length;

  const percentComplete = required > 0 ? (collected / required) * 100 : 0;

  // Determine missing slots
  const missingSlots = requiredSlots.filter(
    slot => !collectedSlots.includes(slot)
  );

  return {
    collectedSlots: collected,
    requiredSlots: required,
    percentComplete,
    missingSlots
  };
}

/**
 * Get Progress Flags
 *
 * Returns specific telemetry flags based on progress.
 *
 * @param event - Telemetry event to check
 * @param score - Progress score
 * @returns Array of telemetry flags
 */
export function getProgressFlags(event: TelemetryEvent, score: number): TelemetryFlag[] {
  const flags: TelemetryFlag[] = [];

  if (score < 50) {
    flags.push('slow_progress');
  }

  // Check for stalled conversation (no slots collected despite multiple turns)
  const turnNumber = event.turnNumber || 0;
  const collected = event.extractedSlots?.length || 0;

  if (turnNumber >= 5 && collected === 0) {
    flags.push('stalled_conversation');
  }

  return flags;
}

/**
 * Compute Turn Efficiency
 *
 * Calculates average slots collected per turn.
 * Useful for detecting inefficient conversations.
 *
 * @param totalSlots - Total slots collected
 * @param totalTurns - Total turns in session
 * @returns Slots per turn
 */
export function computeTurnEfficiency(totalSlots: number, totalTurns: number): number {
  if (totalTurns === 0) return 0;
  return totalSlots / totalTurns;
}

/**
 * Detect Stalling
 *
 * Detects if conversation is stalled (no progress for N turns).
 *
 * @param recentSlots - Slots collected in last N turns
 * @param threshold - Number of turns to consider
 * @returns True if stalled
 */
export function detectStalling(recentSlots: number[], threshold: number = 3): boolean {
  if (recentSlots.length < threshold) {
    return false;  // Not enough data yet
  }

  // Check if last N turns had zero progress
  const recentProgress = recentSlots.slice(-threshold);
  return recentProgress.every(count => count === 0);
}

/**
 * Compute Expected Progress
 *
 * Estimates expected progress based on stage and turn number.
 * Useful for flagging conversations that are behind schedule.
 *
 * @param stage - Current stage
 * @param turnNumber - Current turn number
 * @returns Expected slots collected by this turn
 */
export function computeExpectedProgress(stage: string, turnNumber: number): number {
  // Stage-specific expectations
  const stageExpectations: Record<string, { minTurns: number; maxTurns: number }> = {
    'rapport': { minTurns: 2, maxTurns: 4 },
    'current_state': { minTurns: 4, maxTurns: 8 },
    'diagnostic': { minTurns: 3, maxTurns: 6 },
    'preview': { minTurns: 2, maxTurns: 4 }
  };

  const expectations = stageExpectations[stage] || { minTurns: 3, maxTurns: 6 };

  // Linear progress expectation
  const expectedSlots = (turnNumber / expectations.maxTurns) * 5;  // Assuming 5 slots per stage

  return Math.min(5, expectedSlots);
}

/**
 * Analyze Progress Velocity
 *
 * Calculates rate of progress over recent turns.
 * Useful for predicting when stage will complete.
 *
 * @param slotHistory - Array of slot counts per turn
 * @param windowSize - Number of recent turns to analyze
 * @returns Progress velocity (slots per turn)
 */
export function analyzeProgressVelocity(
  slotHistory: number[],
  windowSize: number = 5
): {
  velocity: number;
  acceleration: number;
  predictedTurnsToComplete: number;
} {
  if (slotHistory.length === 0) {
    return {
      velocity: 0,
      acceleration: 0,
      predictedTurnsToComplete: Infinity
    };
  }

  // Get recent window
  const recentHistory = slotHistory.slice(-windowSize);

  // Calculate velocity (average slots per turn)
  const totalSlots = recentHistory.reduce((sum, count) => sum + count, 0);
  const velocity = totalSlots / recentHistory.length;

  // Calculate acceleration (change in velocity)
  let acceleration = 0;
  if (recentHistory.length >= 2) {
    const firstHalf = recentHistory.slice(0, Math.floor(recentHistory.length / 2));
    const secondHalf = recentHistory.slice(Math.floor(recentHistory.length / 2));

    const firstVelocity = firstHalf.reduce((sum, c) => sum + c, 0) / firstHalf.length;
    const secondVelocity = secondHalf.reduce((sum, c) => sum + c, 0) / secondHalf.length;

    acceleration = secondVelocity - firstVelocity;
  }

  // Predict turns to complete (assuming 5 slots remaining)
  const remainingSlots = 5 - totalSlots;  // Assuming 5 slots per stage
  const predictedTurnsToComplete = velocity > 0 ? remainingSlots / velocity : Infinity;

  return {
    velocity,
    acceleration,
    predictedTurnsToComplete
  };
}
