/**
 * Confidence Signal Model v4.0
 *
 * Detects and quantifies confidence signals in student messages.
 *
 * Confidence is tracked as a cumulative score that increases or decreases
 * based on language patterns, self-assessment, and emotional signals.
 *
 * Purpose: Enable real-time confidence tracking to adjust EQ curve
 * appropriately (high confidence → can push harder, low confidence → more support).
 */

/**
 * Compute Confidence Delta
 *
 * Analyzes a student message and returns the change in confidence signal.
 *
 * Positive values indicate increased confidence.
 * Negative values indicate decreased confidence.
 *
 * Range: -10 to +10 (most deltas are -5 to +5)
 *
 * @param msg - Student message text
 * @returns Confidence delta score
 */
export function computeConfidenceDelta(msg: string): number {
  const m = msg.toLowerCase();
  let delta = 0;

  // STRONG POSITIVE SIGNALS (+3 to +5)
  if (m.includes("i got this") || m.includes("i've got this")) delta += 4;
  if (m.includes("easy") || m.includes("no problem")) delta += 3;
  if (m.includes("i'm confident") || m.includes("i feel good about")) delta += 4;
  if (m.includes("already done") || m.includes("finished already")) delta += 3;
  if (m.includes("i know i can") || m.includes("i can definitely")) delta += 3;

  // MODERATE POSITIVE SIGNALS (+1 to +2)
  if (m.includes("i think i can") || m.includes("maybe i can")) delta += 1;
  if (m.includes("feeling good") || m.includes("feel better")) delta += 2;
  if (m.includes("ready") || m.includes("prepared")) delta += 2;
  if (m.includes("excited") || m.includes("looking forward")) delta += 2;
  if (m.includes("i understand") || m.includes("makes sense")) delta += 1;

  // STRONG NEGATIVE SIGNALS (-3 to -5)
  if (m.includes("i'm lost") || m.includes("totally lost")) delta -= 5;
  if (m.includes("overwhelmed") || m.includes("too much")) delta -= 4;
  if (m.includes("i don't know") || m.includes("idk")) delta -= 3;
  if (m.includes("can't do this") || m.includes("can't handle")) delta -= 4;
  if (m.includes("give up") || m.includes("giving up")) delta -= 5;
  if (m.includes("failing") || m.includes("i'm failing")) delta -= 4;
  if (m.includes("not smart enough") || m.includes("too dumb")) delta -= 5;

  // MODERATE NEGATIVE SIGNALS (-1 to -2)
  if (m.includes("not sure") || m.includes("unsure")) delta -= 2;
  if (m.includes("worried") || m.includes("nervous")) delta -= 2;
  if (m.includes("confused") || m.includes("don't understand")) delta -= 2;
  if (m.includes("struggling") || m.includes("having trouble")) delta -= 2;
  if (m.includes("hard") || m.includes("difficult")) delta -= 1;
  if (m.includes("doubt") || m.includes("doubting")) delta -= 2;

  // SELF-COMPARISON SIGNALS
  if (m.includes("everyone else is better") || m.includes("behind everyone")) delta -= 3;
  if (m.includes("i'm ahead") || m.includes("ahead of my peers")) delta += 3;
  if (m.includes("falling behind") || m.includes("fell behind")) delta -= 2;
  if (m.includes("catching up") || m.includes("making progress")) delta += 2;

  // CAPABILITY SIGNALS
  if (m.includes("i can't") || m.includes("unable to")) delta -= 2;
  if (m.includes("i can") || m.includes("i'm able to")) delta += 1;

  // Clamp to reasonable range
  return Math.max(-10, Math.min(10, delta));
}

/**
 * Get Confidence Signals
 *
 * Returns all confidence signals detected in a message with their values.
 *
 * Useful for debugging and understanding confidence score changes.
 *
 * @param msg - Student message text
 * @returns Array of detected signals
 */
export function getConfidenceSignals(msg: string): Array<{
  pattern: string;
  delta: number;
  type: "positive" | "negative";
}> {
  const m = msg.toLowerCase();
  const signals: Array<{ pattern: string; delta: number; type: "positive" | "negative" }> = [];

  // Positive signals
  if (m.includes("i got this")) {
    signals.push({ pattern: "i got this", delta: 4, type: "positive" });
  }
  if (m.includes("easy")) {
    signals.push({ pattern: "easy", delta: 3, type: "positive" });
  }
  if (m.includes("i'm confident")) {
    signals.push({ pattern: "i'm confident", delta: 4, type: "positive" });
  }
  if (m.includes("i think i can")) {
    signals.push({ pattern: "i think i can", delta: 1, type: "positive" });
  }
  if (m.includes("ready")) {
    signals.push({ pattern: "ready", delta: 2, type: "positive" });
  }
  if (m.includes("excited")) {
    signals.push({ pattern: "excited", delta: 2, type: "positive" });
  }

  // Negative signals
  if (m.includes("i'm lost")) {
    signals.push({ pattern: "i'm lost", delta: -5, type: "negative" });
  }
  if (m.includes("overwhelmed")) {
    signals.push({ pattern: "overwhelmed", delta: -4, type: "negative" });
  }
  if (m.includes("i don't know") || m.includes("idk")) {
    signals.push({ pattern: "i don't know/idk", delta: -3, type: "negative" });
  }
  if (m.includes("can't do this")) {
    signals.push({ pattern: "can't do this", delta: -4, type: "negative" });
  }
  if (m.includes("give up")) {
    signals.push({ pattern: "give up", delta: -5, type: "negative" });
  }
  if (m.includes("not smart enough")) {
    signals.push({ pattern: "not smart enough", delta: -5, type: "negative" });
  }
  if (m.includes("not sure")) {
    signals.push({ pattern: "not sure", delta: -2, type: "negative" });
  }
  if (m.includes("worried")) {
    signals.push({ pattern: "worried", delta: -2, type: "negative" });
  }
  if (m.includes("confused")) {
    signals.push({ pattern: "confused", delta: -2, type: "negative" });
  }
  if (m.includes("struggling")) {
    signals.push({ pattern: "struggling", delta: -2, type: "negative" });
  }

  return signals;
}

/**
 * Classify Confidence Level
 *
 * Converts cumulative confidence score into categorical level.
 *
 * @param cumulativeScore - Total confidence score
 * @returns Confidence level category
 */
export function classifyConfidenceLevel(
  cumulativeScore: number
): "very-low" | "low" | "medium" | "high" | "very-high" {
  if (cumulativeScore <= -8) return "very-low";
  if (cumulativeScore <= -3) return "low";
  if (cumulativeScore >= 8) return "very-high";
  if (cumulativeScore >= 3) return "high";
  return "medium";
}

/**
 * Get Confidence Summary
 *
 * Returns a human-readable summary of confidence state.
 *
 * @param cumulativeScore - Total confidence score
 * @returns Summary string
 */
export function getConfidenceSummary(cumulativeScore: number): string {
  const level = classifyConfidenceLevel(cumulativeScore);

  const summaries = {
    "very-low": "Student shows very low confidence and high self-doubt",
    low: "Student shows low confidence and needs encouragement",
    medium: "Student shows balanced confidence",
    high: "Student shows high confidence and self-belief",
    "very-high": "Student shows very high confidence (may be overconfident)"
  };

  return summaries[level];
}

/**
 * Detect Confidence Trajectory
 *
 * Analyzes recent confidence deltas to determine trend.
 *
 * @param recentDeltas - Array of recent confidence deltas (most recent last)
 * @returns Trajectory: rising, falling, or stable
 */
export function detectConfidenceTrajectory(
  recentDeltas: number[]
): "rising" | "falling" | "stable" {
  if (recentDeltas.length < 3) return "stable";

  // Take last 3-5 deltas
  const recent = recentDeltas.slice(-5);
  const avgDelta = recent.reduce((sum, d) => sum + d, 0) / recent.length;

  if (avgDelta > 1) return "rising";
  if (avgDelta < -1) return "falling";
  return "stable";
}
