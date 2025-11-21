/**
 * EQ Profile v4.0
 *
 * Running EQ baseline for the entire session.
 * Tracks cumulative emotional state across all conversational turns.
 *
 * Purpose:
 * - Understand persistent EQ state (not just momentary)
 * - Detect patterns (student consistently anxious? consistently eager?)
 * - Adapt coaching strategy based on emotional trend
 * - Feed into archetype refinement
 *
 * This is the "emotional memory" of the session.
 */

import { EQSignal } from "./eqSignals";

/**
 * EQ Profile
 *
 * Summary of a student's emotional state across the session.
 */
export interface EQProfile {
  primary: EQSignal | null; // Most frequent signal
  secondary: EQSignal | null; // Second most frequent
  distribution: Record<EQSignal, number>; // Count of each signal
  cumulativeCount: number; // Total signals recorded
  dominance: number; // How dominant is the primary signal (0-1)
}

/**
 * EQ Profile Tracker
 *
 * Accumulates EQ signals throughout a session to build an emotional profile.
 */
export class EQProfileTracker {
  private distribution: Record<EQSignal, number>;
  private total: number;
  private sessionId: string;

  /**
   * Constructor
   *
   * @param sessionId - Session identifier
   */
  constructor(sessionId: string) {
    console.log(`[EQProfileTracker] Initializing for session: ${sessionId}`);

    this.sessionId = sessionId;
    this.total = 0;

    // Initialize distribution with all signals at 0
    this.distribution = {
      ANXIETY: 0,
      INSECURITY: 0,
      CONFUSION: 0,
      OVERWHELM: 0,
      APATHY: 0,
      EAGERNESS: 0,
      CONFIDENCE: 0,
      CURIOSITY: 0,
      PRIDE: 0,
      DISCIPLINE: 0,
      FRUSTRATION: 0,
      RESISTANCE: 0
    };
  }

  /**
   * Add Signals
   *
   * Records EQ signals detected in a message.
   *
   * @param signals - Array of EQ signals
   */
  addSignals(signals: EQSignal[]): void {
    console.log(`[EQProfileTracker] Adding ${signals.length} signals: ${signals.join(", ")}`);

    for (const signal of signals) {
      this.distribution[signal] += 1;
      this.total += 1;
    }

    console.log(`[EQProfileTracker] Total signals recorded: ${this.total}`);
  }

  /**
   * Get Profile
   *
   * Returns current EQ profile snapshot.
   *
   * @returns EQ profile
   */
  getProfile(): EQProfile {
    const primary = this._getMostFrequent();
    const secondary = this._getSecondMostFrequent();
    const dominance = this._calculateDominance(primary);

    return {
      primary,
      secondary,
      distribution: { ...this.distribution },
      cumulativeCount: this.total,
      dominance
    };
  }

  /**
   * Get Distribution
   *
   * Returns copy of signal distribution.
   *
   * @returns Distribution map
   */
  getDistribution(): Record<EQSignal, number> {
    return { ...this.distribution };
  }

  /**
   * Get Total Count
   *
   * @returns Total signals recorded
   */
  getTotalCount(): number {
    return this.total;
  }

  /**
   * Get Signal Count
   *
   * Returns count for a specific signal.
   *
   * @param signal - EQ signal
   * @returns Count
   */
  getSignalCount(signal: EQSignal): number {
    return this.distribution[signal];
  }

  /**
   * Get Signal Percentage
   *
   * Returns percentage of total for a specific signal.
   *
   * @param signal - EQ signal
   * @returns Percentage (0-100)
   */
  getSignalPercentage(signal: EQSignal): number {
    if (this.total === 0) return 0;
    return (this.distribution[signal] / this.total) * 100;
  }

  /**
   * Get Top N Signals
   *
   * Returns the N most frequent signals.
   *
   * @param n - Number of signals to return
   * @returns Array of [signal, count] tuples
   */
  getTopNSignals(n: number): Array<[EQSignal, number]> {
    const entries = Object.entries(this.distribution) as Array<[EQSignal, number]>;
    return entries.sort((a, b) => b[1] - a[1]).slice(0, n);
  }

  /**
   * Has Signal
   *
   * Checks if a signal has been detected at least once.
   *
   * @param signal - EQ signal
   * @returns True if detected
   */
  hasSignal(signal: EQSignal): boolean {
    return this.distribution[signal] > 0;
  }

  /**
   * Is Predominantly
   *
   * Checks if a signal represents more than a threshold percentage.
   *
   * @param signal - EQ signal
   * @param threshold - Minimum percentage (default: 50)
   * @returns True if predominant
   */
  isPredominantly(signal: EQSignal, threshold: number = 50): boolean {
    return this.getSignalPercentage(signal) >= threshold;
  }

  /**
   * Get Profile Summary
   *
   * Returns human-readable summary of EQ profile.
   *
   * @returns Summary string
   */
  getSummary(): string {
    const profile = this.getProfile();

    if (profile.cumulativeCount === 0) {
      return "No EQ signals recorded yet.";
    }

    const lines: string[] = [];
    lines.push(`EQ Profile (${this.sessionId}):`);
    lines.push(`  Total Signals: ${profile.cumulativeCount}`);
    lines.push(
      `  Primary: ${profile.primary || "None"} (${(profile.dominance * 100).toFixed(0)}% dominance)`
    );
    lines.push(`  Secondary: ${profile.secondary || "None"}`);
    lines.push(``);
    lines.push(`  Top 5 Signals:`);

    const top5 = this.getTopNSignals(5);
    for (const [signal, count] of top5) {
      if (count > 0) {
        const pct = ((count / this.total) * 100).toFixed(0);
        lines.push(`    ${signal}: ${count} (${pct}%)`);
      }
    }

    return lines.join("\n");
  }

  /**
   * Reset
   *
   * Clears all recorded signals.
   * Useful for testing or session reset.
   */
  reset(): void {
    console.log(`[EQProfileTracker] Resetting profile`);

    for (const key of Object.keys(this.distribution) as EQSignal[]) {
      this.distribution[key] = 0;
    }

    this.total = 0;
  }

  /**
   * Serialize
   *
   * Converts profile to JSON string for storage.
   *
   * @returns JSON string
   */
  serialize(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      distribution: this.distribution,
      total: this.total
    });
  }

  /**
   * Restore
   *
   * Static method to restore profile from JSON string.
   *
   * @param serialized - JSON string
   * @returns Restored tracker
   */
  static restore(serialized: string): EQProfileTracker {
    const data = JSON.parse(serialized);
    const tracker = new EQProfileTracker(data.sessionId);
    tracker.distribution = data.distribution;
    tracker.total = data.total;
    return tracker;
  }

  /**
   * Private: Get Most Frequent
   *
   * Finds the signal with highest count.
   *
   * @returns Most frequent signal or null
   */
  private _getMostFrequent(): EQSignal | null {
    if (this.total === 0) return null;

    let best: EQSignal | null = null;
    let max = -1;

    for (const signal of Object.keys(this.distribution) as EQSignal[]) {
      if (this.distribution[signal] > max) {
        best = signal;
        max = this.distribution[signal];
      }
    }

    return best;
  }

  /**
   * Private: Get Second Most Frequent
   *
   * Finds the signal with second highest count.
   *
   * @returns Second most frequent signal or null
   */
  private _getSecondMostFrequent(): EQSignal | null {
    if (this.total === 0) return null;

    const primary = this._getMostFrequent();
    let best: EQSignal | null = null;
    let max = -1;

    for (const signal of Object.keys(this.distribution) as EQSignal[]) {
      if (signal !== primary && this.distribution[signal] > max) {
        best = signal;
        max = this.distribution[signal];
      }
    }

    // Return null if the secondary signal has count 0 (no real secondary)
    return max > 0 ? best : null;
  }

  /**
   * Private: Calculate Dominance
   *
   * Calculates how dominant the primary signal is.
   * Returns ratio of primary count to total.
   *
   * @param primary - Primary signal
   * @returns Dominance score (0-1)
   */
  private _calculateDominance(primary: EQSignal | null): number {
    if (!primary || this.total === 0) return 0;
    return this.distribution[primary] / this.total;
  }
}
