/**
 * Conversation Momentum Engine v4.0
 *
 * Detects energy spikes, dips, disengagement, focus-loss, and engagement curves.
 *
 * This is Jenny's intuition about when a student is:
 * - Fading (dropout risk)
 * - Overhyping (enthusiasm surge)
 * - Zoning out (focus loss)
 * - Pushing too hard (overwhelm)
 * - Disengaging (short replies, detachment)
 *
 * Purpose: Enable the agent to detect and respond to conversation energy shifts
 * in real-time, preventing dropout and maintaining engagement throughout the session.
 *
 * All deterministic. No LLM required.
 */

/**
 * Momentum State
 *
 * Tracks the current conversation momentum and energy dynamics.
 */
export interface MomentumState {
  momentumScore: number; // 0-100 (50 = neutral, >70 = high energy, <30 = dropout risk)
  trend: "up" | "down" | "flat"; // Direction of momentum change
  spikes: number; // Count of enthusiasm surges
  dips: number; // Count of energy drops
  disengaged: boolean; // Student showing disengagement signals
  focusLost: boolean; // Student showing focus-loss patterns
  energyHistory: number[]; // Rolling history of momentum scores
}

/**
 * Pattern Thresholds and Definitions
 */
const SHORT_REPLY_THRESHOLD = 5; // characters
const VERY_SHORT_REPLY_THRESHOLD = 15; // characters for partial disengagement
const ENERGY_HISTORY_LIMIT = 20; // Keep last 20 momentum scores

/**
 * Focus Loss Patterns
 *
 * Phrases that indicate student is losing focus or becoming vague.
 */
const FOCUS_LOSS_PATTERNS = [
  "idk",
  "i don't know",
  "whatever",
  "uh",
  "um",
  "maybe",
  "i guess",
  "dunno",
  "not sure",
  "kind of",
  "sort of"
];

/**
 * Spike Patterns
 *
 * Phrases that indicate enthusiasm surge or positive energy spike.
 */
const SPIKE_PATTERNS = [
  "omg",
  "wow",
  "that's cool",
  "that's awesome",
  "amazing",
  "no way",
  "i love",
  "i can do this",
  "this is great",
  "really helpful",
  "makes sense now",
  "i get it",
  "excited",
  "thank you so much",
  "perfect",
  "exactly what i needed"
];

/**
 * Dip Patterns
 *
 * Phrases that indicate energy drop or overwhelm.
 */
const DIP_PATTERNS = [
  "i'm tired",
  "overwhelmed",
  "stressed",
  "this is hard",
  "i can't",
  "too much",
  "giving up",
  "don't want to",
  "this sucks",
  "hate this",
  "frustrated",
  "confused",
  "lost",
  "stuck"
];

/**
 * Disengagement Patterns
 *
 * Short, non-committal replies that signal disengagement.
 */
const DISENGAGEMENT_PATTERNS = [
  "ok",
  "k",
  "sure",
  "fine",
  "idk",
  "yeah",
  "yep",
  "nope",
  "nah",
  "mhm",
  "uh huh"
];

/**
 * Momentum Engine
 *
 * Main class for tracking and analyzing conversation momentum.
 *
 * Usage:
 * ```typescript
 * const momentum = new MomentumEngine();
 *
 * // On each student message:
 * const state = momentum.updateWithMessage(message);
 *
 * // Check if intervention needed:
 * if (state.disengaged || state.momentumScore < 30) {
 *   // Boost energy, increase cheer
 * }
 * ```
 */
export class MomentumEngine {
  private state: MomentumState;

  constructor() {
    this.state = {
      momentumScore: 50,
      trend: "flat",
      spikes: 0,
      dips: 0,
      disengaged: false,
      focusLost: false,
      energyHistory: [50] // Start with neutral
    };

    console.log("[MomentumEngine] Initialized with neutral momentum (50)");
  }

  /**
   * Update With Message
   *
   * Processes a student message to detect momentum shifts.
   *
   * Analyzes:
   * - Spike patterns (enthusiasm)
   * - Dip patterns (overwhelm)
   * - Reply length (disengagement)
   * - Focus-loss patterns (vagueness)
   *
   * Updates momentum score and flags.
   *
   * @param msg - Student message text
   * @returns Updated momentum state
   */
  updateWithMessage(msg: string): MomentumState {
    const m = msg.toLowerCase().trim();
    const previousScore = this.state.momentumScore;

    console.log(`[MomentumEngine] Processing message (${msg.length} chars)`);

    let scoreDelta = 0;

    // 1. Spike detection (+10 to +15)
    const spikeDetected = SPIKE_PATTERNS.some((p) => m.includes(p));
    if (spikeDetected) {
      scoreDelta += 12;
      this.state.spikes += 1;
      console.log("[MomentumEngine] Spike detected! Energy surge");
    }

    // 2. Dip detection (-10 to -15)
    const dipDetected = DIP_PATTERNS.some((p) => m.includes(p));
    if (dipDetected) {
      scoreDelta -= 12;
      this.state.dips += 1;
      console.log("[MomentumEngine] Dip detected! Energy drop");
    }

    // 3. Reply length analysis
    if (m.length <= SHORT_REPLY_THRESHOLD) {
      // Very short reply = likely disengaged
      scoreDelta -= 8;
      this.state.disengaged = true;
      console.log("[MomentumEngine] Very short reply - disengagement risk");
    } else if (m.length <= VERY_SHORT_REPLY_THRESHOLD) {
      // Short but not alarming
      scoreDelta -= 3;
      this.state.disengaged = DISENGAGEMENT_PATTERNS.some((p) => m === p);
      if (this.state.disengaged) {
        console.log("[MomentumEngine] Disengagement pattern detected");
      }
    } else {
      // Normal length - check if it's a disengagement phrase
      this.state.disengaged = DISENGAGEMENT_PATTERNS.some((p) => m === p);
      if (this.state.disengaged) {
        scoreDelta -= 5;
        console.log("[MomentumEngine] Disengagement pattern in longer message");
      }
    }

    // 4. Focus loss detection
    this.state.focusLost = FOCUS_LOSS_PATTERNS.some((p) => m.includes(p));
    if (this.state.focusLost) {
      scoreDelta -= 4;
      console.log("[MomentumEngine] Focus loss detected");
    }

    // 5. Engagement boost for long, detailed replies
    if (m.length > 100 && !this.state.focusLost) {
      scoreDelta += 5;
      console.log("[MomentumEngine] Long engaged reply - momentum boost");
    }

    // 6. Question asking = engagement
    if (m.includes("?") && m.length > 20) {
      scoreDelta += 3;
      console.log("[MomentumEngine] Student asking questions - engaged");
    }

    // 7. Update momentum score (clamped 0-100)
    this.state.momentumScore = Math.max(0, Math.min(100, previousScore + scoreDelta));

    // 8. Update trend
    if (this.state.momentumScore > previousScore) {
      this.state.trend = "up";
    } else if (this.state.momentumScore < previousScore) {
      this.state.trend = "down";
    } else {
      this.state.trend = "flat";
    }

    // 9. Track energy history
    this.state.energyHistory.push(this.state.momentumScore);
    if (this.state.energyHistory.length > ENERGY_HISTORY_LIMIT) {
      this.state.energyHistory.shift();
    }

    console.log(
      `[MomentumEngine] Score: ${previousScore} → ${this.state.momentumScore} (${this.state.trend})`
    );
    console.log(
      `[MomentumEngine] Flags: disengaged=${this.state.disengaged}, focusLost=${this.state.focusLost}`
    );

    return { ...this.state };
  }

  /**
   * Get State
   *
   * Returns current momentum state.
   *
   * @returns Current momentum state
   */
  getState(): MomentumState {
    return { ...this.state };
  }

  /**
   * Get Momentum Level
   *
   * Returns categorical momentum level based on score.
   *
   * @returns Momentum level category
   */
  getMomentumLevel(): "critical" | "low" | "medium" | "high" | "excellent" {
    const score = this.state.momentumScore;
    if (score < 20) return "critical"; // Dropout risk
    if (score < 40) return "low"; // Needs boost
    if (score < 60) return "medium"; // Neutral
    if (score < 80) return "high"; // Good energy
    return "excellent"; // Peak engagement
  }

  /**
   * Get Energy Trajectory
   *
   * Analyzes recent energy history to determine trajectory.
   *
   * @returns Trajectory: rising, falling, volatile, or stable
   */
  getEnergyTrajectory(): "rising" | "falling" | "volatile" | "stable" {
    if (this.state.energyHistory.length < 3) return "stable";

    const recent = this.state.energyHistory.slice(-5);
    const deltas = recent.slice(1).map((val, i) => val - recent[i]);

    // Calculate average delta and variance
    const avgDelta = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;
    const variance =
      deltas.reduce((sum, d) => sum + Math.pow(d - avgDelta, 2), 0) / deltas.length;

    if (variance > 50) return "volatile"; // Large swings
    if (avgDelta > 3) return "rising"; // Consistent upward
    if (avgDelta < -3) return "falling"; // Consistent downward
    return "stable"; // Relatively flat
  }

  /**
   * Needs Intervention
   *
   * Determines if agent should intervene to boost momentum.
   *
   * @returns True if intervention recommended
   */
  needsIntervention(): boolean {
    return (
      this.state.momentumScore < 30 || // Low momentum
      this.state.disengaged || // Student disengaging
      (this.state.trend === "down" && this.state.momentumScore < 50) || // Declining momentum
      this.getEnergyTrajectory() === "falling" // Consistent decline
    );
  }

  /**
   * Get Intervention Suggestions
   *
   * Returns suggested interventions based on current momentum state.
   *
   * @returns Array of intervention suggestions
   */
  getInterventionSuggestions(): string[] {
    const suggestions: string[] = [];

    if (this.state.disengaged) {
      suggestions.push("Student disengaged - ask engaging question or share insight");
    }

    if (this.state.focusLost) {
      suggestions.push("Focus lost - provide structure and clear next steps");
    }

    if (this.state.momentumScore < 30) {
      suggestions.push("Critical momentum - boost energy with encouragement or win");
    }

    if (this.state.trend === "down" && this.state.momentumScore < 50) {
      suggestions.push("Momentum declining - inject enthusiasm or pivot topic");
    }

    if (this.state.dips > this.state.spikes && this.state.dips > 2) {
      suggestions.push("Multiple dips detected - check for overwhelm, simplify");
    }

    if (suggestions.length === 0 && this.state.momentumScore > 70) {
      suggestions.push("High momentum - maintain energy and capitalize on engagement");
    }

    return suggestions;
  }

  /**
   * Reset
   *
   * Resets momentum state to initial values.
   *
   * Use when starting a new conversation session.
   */
  reset(): void {
    this.state = {
      momentumScore: 50,
      trend: "flat",
      spikes: 0,
      dips: 0,
      disengaged: false,
      focusLost: false,
      energyHistory: [50]
    };

    console.log("[MomentumEngine] Reset to neutral state");
  }

  /**
   * Get Momentum Summary
   *
   * Returns human-readable summary of current momentum.
   *
   * @returns Summary string
   */
  getMomentumSummary(): string {
    const level = this.getMomentumLevel();
    const trajectory = this.getEnergyTrajectory();

    const summaries = {
      critical: "Student at dropout risk - immediate intervention needed",
      low: "Low engagement - needs energy boost and encouragement",
      medium: "Neutral momentum - maintain steady pacing",
      high: "Good engagement - student is responsive and engaged",
      excellent: "Peak momentum - student highly engaged and energized"
    };

    return `${summaries[level]} (trajectory: ${trajectory})`;
  }
}

/**
 * Detect Momentum Shift
 *
 * Standalone function to detect if there's been a significant momentum shift.
 *
 * @param history - Energy history array
 * @param windowSize - Number of recent messages to analyze
 * @returns True if significant shift detected
 */
export function detectMomentumShift(history: number[], windowSize: number = 5): boolean {
  if (history.length < windowSize * 2) return false;

  const recent = history.slice(-windowSize);
  const previous = history.slice(-windowSize * 2, -windowSize);

  const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
  const previousAvg = previous.reduce((sum, v) => sum + v, 0) / previous.length;

  // Shift if difference > 15 points
  return Math.abs(recentAvg - previousAvg) > 15;
}

/**
 * Calculate Momentum Volatility
 *
 * Measures how volatile the conversation momentum is.
 *
 * @param history - Energy history array
 * @returns Volatility score (0-100)
 */
export function calculateMomentumVolatility(history: number[]): number {
  if (history.length < 2) return 0;

  const deltas = history.slice(1).map((val, i) => Math.abs(val - history[i]));
  const avgDelta = deltas.reduce((sum, d) => sum + d, 0) / deltas.length;

  // Normalize to 0-100 (delta of 10 = 50 volatility)
  return Math.min(100, avgDelta * 5);
}
