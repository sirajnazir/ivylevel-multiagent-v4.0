/**
 * evidenceMemory.ts
 *
 * M2 - Evidence Memory Manager
 *
 * Lean append-only structure for tracking evidence used in each response.
 * Provides transparency and fidelity checking.
 */

import type {
  EvidenceReference,
  EvidenceMemoryState,
  EvidenceMemoryEntry,
} from "./evidenceMemory.types";

const DEFAULT_STATE: EvidenceMemoryState = {
  trail: [],
};

/**
 * Session Store Interface
 */
interface SessionStore {
  get(sessionId: string): any;
  update(sessionId: string, data: any): void;
}

export class EvidenceMemoryManager {
  constructor(private sessionStore: SessionStore) {}

  /**
   * Get State
   *
   * Returns evidence memory state, initializing if needed.
   *
   * @param sessionId - Session identifier
   * @returns Evidence memory state
   */
  private getState(sessionId: string): EvidenceMemoryState {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    if (!session.evidenceMemory) {
      session.evidenceMemory = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.sessionStore.update(sessionId, session);
    }

    return session.evidenceMemory;
  }

  /**
   * Add Evidence
   *
   * Records evidence used for a specific turn.
   *
   * @param sessionId - Session identifier
   * @param turn - Turn number
   * @param evidence - Array of evidence references
   */
  addEvidence(
    sessionId: string,
    turn: number,
    evidence: EvidenceReference[]
  ): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    const state = this.getState(sessionId);

    const entry: EvidenceMemoryEntry = {
      turn,
      usedEvidence: evidence,
    };

    state.trail.push(entry);
    this.sessionStore.update(sessionId, {
      ...session,
      evidenceMemory: state,
    });

    console.log(`[EvidenceMemory] Added ${evidence.length} evidence refs for turn ${turn}`);
  }

  /**
   * Get Evidence for Turn
   *
   * Returns evidence used in a specific turn.
   *
   * @param sessionId - Session identifier
   * @param turn - Turn number
   * @returns Array of evidence references
   */
  getEvidenceForTurn(sessionId: string, turn: number): EvidenceReference[] {
    const state = this.getState(sessionId);
    const entry = state.trail.find((e) => e.turn === turn);
    return entry ? entry.usedEvidence : [];
  }

  /**
   * Get Full Trail
   *
   * Returns complete evidence trail.
   *
   * @param sessionId - Session identifier
   * @returns Complete evidence memory state
   */
  getFullTrail(sessionId: string): EvidenceMemoryState {
    return this.getState(sessionId);
  }

  /**
   * Get Evidence by Source Type
   *
   * Returns all evidence of a specific type.
   *
   * @param sessionId - Session identifier
   * @param sourceType - Evidence source type
   * @returns Array of evidence references
   */
  getEvidenceBySourceType(sessionId: string, sourceType: string): EvidenceReference[] {
    const state = this.getState(sessionId);
    const allEvidence: EvidenceReference[] = [];

    state.trail.forEach((entry) => {
      entry.usedEvidence.forEach((ev) => {
        if (ev.sourceType === sourceType) {
          allEvidence.push(ev);
        }
      });
    });

    return allEvidence;
  }

  /**
   * Get Evidence Stats
   *
   * Returns statistics about evidence usage.
   *
   * @param sessionId - Session identifier
   * @returns Evidence statistics
   */
  getEvidenceStats(sessionId: string): {
    totalEvidence: number;
    bySourceType: Record<string, number>;
    averageConfidence: number;
  } {
    const state = this.getState(sessionId);
    const bySourceType: Record<string, number> = {};
    let totalEvidence = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    state.trail.forEach((entry) => {
      entry.usedEvidence.forEach((ev) => {
        totalEvidence++;
        bySourceType[ev.sourceType] = (bySourceType[ev.sourceType] || 0) + 1;

        if (ev.confidence !== undefined) {
          totalConfidence += ev.confidence;
          confidenceCount++;
        }
      });
    });

    return {
      totalEvidence,
      bySourceType,
      averageConfidence: confidenceCount > 0 ? totalConfidence / confidenceCount : 0,
    };
  }
}
