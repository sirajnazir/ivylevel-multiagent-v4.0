/**
 * studentStateMemory.ts
 *
 * M4 - Student State Memory Manager
 *
 * Tracks the student's evolving emotional and cognitive state.
 * M4 tracks what the student is becoming (phenotyping in real-time).
 */

import type {
  StudentStateSnapshot,
  StudentStateMemoryState,
  EmotionalTone,
  CognitiveLoad,
  MotivationLevel,
  ConfidenceLevel,
  ArchetypeState,
} from "./studentStateMemory.types";

const DEFAULT_STATE: StudentStateMemoryState = {
  snapshots: [],
  latestSnapshot: null,
};

/**
 * Session Store Interface
 */
interface SessionStore {
  get(sessionId: string): any;
  update(sessionId: string, data: any): void;
}

export class StudentStateMemoryManager {
  constructor(private sessionStore: SessionStore) {}

  /**
   * Get State
   *
   * Returns student state memory, initializing if needed.
   *
   * @param sessionId - Session identifier
   * @returns Student state memory
   */
  private getState(sessionId: string): StudentStateMemoryState {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    if (!session.studentStateMemory) {
      session.studentStateMemory = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.sessionStore.update(sessionId, session);
    }

    return session.studentStateMemory;
  }

  /**
   * Add Snapshot
   *
   * Records a new state snapshot for the current turn.
   *
   * @param sessionId - Session identifier
   * @param snapshot - Student state snapshot (without timestamp)
   */
  addSnapshot(
    sessionId: string,
    snapshot: Omit<StudentStateSnapshot, "timestamp">
  ): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    const state = this.getState(sessionId);

    const entry: StudentStateSnapshot = {
      ...snapshot,
      timestamp: new Date().toISOString(),
    };

    state.snapshots.push(entry);
    state.latestSnapshot = entry;

    this.sessionStore.update(sessionId, {
      ...session,
      studentStateMemory: state,
    });

    console.log(
      `[StudentStateMemory] Snapshot for turn ${snapshot.turn}: ${snapshot.emotionalTone} / ${snapshot.cognitiveLoad} load`
    );
  }

  /**
   * Get Latest Snapshot
   *
   * Returns the most recent student state snapshot.
   *
   * @param sessionId - Session identifier
   * @returns Latest snapshot or null
   */
  latest(sessionId: string): StudentStateSnapshot | null {
    const state = this.getState(sessionId);
    return state.latestSnapshot;
  }

  /**
   * Get All Snapshots
   *
   * Returns complete student state history.
   *
   * @param sessionId - Session identifier
   * @returns Complete student state memory
   */
  getAll(sessionId: string): StudentStateMemoryState {
    return this.getState(sessionId);
  }

  /**
   * Get Snapshot for Turn
   *
   * Returns student state for a specific turn.
   *
   * @param sessionId - Session identifier
   * @param turn - Turn number
   * @returns Student state snapshot or undefined
   */
  getSnapshotForTurn(sessionId: string, turn: number): StudentStateSnapshot | undefined {
    const state = this.getState(sessionId);
    return state.snapshots.find((s) => s.turn === turn);
  }

  /**
   * Get Recent Snapshots
   *
   * Returns the last N snapshots.
   *
   * @param sessionId - Session identifier
   * @param count - Number of recent snapshots to retrieve
   * @returns Array of recent snapshots
   */
  getRecentSnapshots(sessionId: string, count: number): StudentStateSnapshot[] {
    const state = this.getState(sessionId);
    return state.snapshots.slice(-count);
  }

  /**
   * Get Emotional Trend
   *
   * Returns the progression of emotional tones across snapshots.
   *
   * @param sessionId - Session identifier
   * @returns Array of emotional tones in chronological order
   */
  getEmotionalTrend(sessionId: string): EmotionalTone[] {
    const state = this.getState(sessionId);
    return state.snapshots.map((s) => s.emotionalTone);
  }

  /**
   * Get Cognitive Load Trend
   *
   * Returns the progression of cognitive load across snapshots.
   *
   * @param sessionId - Session identifier
   * @returns Array of cognitive loads in chronological order
   */
  getCognitiveLoadTrend(sessionId: string): CognitiveLoad[] {
    const state = this.getState(sessionId);
    return state.snapshots.map((s) => s.cognitiveLoad);
  }

  /**
   * Detect State Change
   *
   * Compares the latest snapshot to the previous one and returns changes.
   *
   * @param sessionId - Session identifier
   * @returns Object describing state changes or null
   */
  detectStateChange(sessionId: string): {
    emotionalShift?: { from: EmotionalTone; to: EmotionalTone };
    cognitiveLoadShift?: { from: CognitiveLoad; to: CognitiveLoad };
    motivationShift?: { from: MotivationLevel; to: MotivationLevel };
    confidenceShift?: { from: ConfidenceLevel; to: ConfidenceLevel };
  } | null {
    const state = this.getState(sessionId);
    if (state.snapshots.length < 2) return null;

    const latest = state.snapshots[state.snapshots.length - 1];
    const previous = state.snapshots[state.snapshots.length - 2];

    const changes: ReturnType<typeof this.detectStateChange> = {};

    if (latest.emotionalTone !== previous.emotionalTone) {
      changes.emotionalShift = {
        from: previous.emotionalTone,
        to: latest.emotionalTone,
      };
    }

    if (latest.cognitiveLoad !== previous.cognitiveLoad) {
      changes.cognitiveLoadShift = {
        from: previous.cognitiveLoad,
        to: latest.cognitiveLoad,
      };
    }

    if (latest.motivation !== previous.motivation) {
      changes.motivationShift = {
        from: previous.motivation,
        to: latest.motivation,
      };
    }

    if (latest.confidence !== previous.confidence) {
      changes.confidenceShift = {
        from: previous.confidence,
        to: latest.confidence,
      };
    }

    return Object.keys(changes).length > 0 ? changes : null;
  }

  /**
   * Get Archetype Drift
   *
   * Returns archetype drift information from the latest snapshot.
   *
   * @param sessionId - Session identifier
   * @returns Archetype state or null
   */
  getArchetypeDrift(sessionId: string): ArchetypeState | null {
    const state = this.getState(sessionId);
    return state.latestSnapshot?.archetypeState || null;
  }

  /**
   * Get All Detected Signals
   *
   * Returns all unique signals detected across the session.
   *
   * @param sessionId - Session identifier
   * @returns Array of unique signal strings
   */
  getAllDetectedSignals(sessionId: string): string[] {
    const state = this.getState(sessionId);
    const allSignals = new Set<string>();

    state.snapshots.forEach((snapshot) => {
      snapshot.signalsDetected?.forEach((signal) => allSignals.add(signal));
    });

    return Array.from(allSignals);
  }

  /**
   * Get State Summary
   *
   * Returns a summary of the student's state progression.
   *
   * @param sessionId - Session identifier
   * @returns State summary statistics
   */
  getStateSummary(sessionId: string): {
    totalSnapshots: number;
    emotionalToneDistribution: Record<EmotionalTone, number>;
    cognitiveLoadDistribution: Record<CognitiveLoad, number>;
    averageMotivation: number;
    averageConfidence: number;
    totalSignalsDetected: number;
  } {
    const state = this.getState(sessionId);
    const emotionalToneDistribution: Record<string, number> = {};
    const cognitiveLoadDistribution: Record<string, number> = {};
    let totalMotivation = 0;
    let totalConfidence = 0;

    const motivationMap = { low: 0.33, medium: 0.66, high: 1.0 };
    const confidenceMap = { low: 0.33, medium: 0.66, high: 1.0 };

    state.snapshots.forEach((snapshot) => {
      emotionalToneDistribution[snapshot.emotionalTone] =
        (emotionalToneDistribution[snapshot.emotionalTone] || 0) + 1;
      cognitiveLoadDistribution[snapshot.cognitiveLoad] =
        (cognitiveLoadDistribution[snapshot.cognitiveLoad] || 0) + 1;
      totalMotivation += motivationMap[snapshot.motivation];
      totalConfidence += confidenceMap[snapshot.confidence];
    });

    return {
      totalSnapshots: state.snapshots.length,
      emotionalToneDistribution: emotionalToneDistribution as Record<EmotionalTone, number>,
      cognitiveLoadDistribution: cognitiveLoadDistribution as Record<CognitiveLoad, number>,
      averageMotivation: state.snapshots.length > 0 ? totalMotivation / state.snapshots.length : 0,
      averageConfidence: state.snapshots.length > 0 ? totalConfidence / state.snapshots.length : 0,
      totalSignalsDetected: this.getAllDetectedSignals(sessionId).length,
    };
  }
}
