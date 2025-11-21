/**
 * responseMemory.ts
 *
 * M3 - Response Memory Manager
 *
 * Turn-by-turn agent thought trail.
 * Tracks what the agent said, why it said it, and how it adapted its tone/strategy.
 * Most important fidelity mechanism for measuring Jenny-likeness.
 */

import type { AgentTurnMeta, ResponseMemoryState } from "./responseMemory.types";

const DEFAULT_STATE: ResponseMemoryState = {
  trail: [],
};

/**
 * Session Store Interface
 */
interface SessionStore {
  get(sessionId: string): any;
  update(sessionId: string, data: any): void;
}

export class ResponseMemoryManager {
  constructor(private sessionStore: SessionStore) {}

  /**
   * Get State
   *
   * Returns response memory state, initializing if needed.
   *
   * @param sessionId - Session identifier
   * @returns Response memory state
   */
  private getState(sessionId: string): ResponseMemoryState {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    if (!session.responseMemory) {
      session.responseMemory = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.sessionStore.update(sessionId, session);
    }

    return session.responseMemory;
  }

  /**
   * Add Turn
   *
   * Records agent's thought process for a specific turn.
   *
   * @param sessionId - Session identifier
   * @param meta - Agent turn metadata
   */
  addTurn(sessionId: string, meta: Omit<AgentTurnMeta, "timestamp">): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    const state = this.getState(sessionId);

    const entry: AgentTurnMeta = {
      ...meta,
      timestamp: new Date().toISOString(),
    };

    state.trail.push(entry);
    this.sessionStore.update(sessionId, {
      ...session,
      responseMemory: state,
    });

    console.log(`[ResponseMemory] Recorded turn ${meta.turn} with intent: ${meta.intent}`);
  }

  /**
   * Get Turn Meta
   *
   * Returns agent's thought process for a specific turn.
   *
   * @param sessionId - Session identifier
   * @param turn - Turn number
   * @returns Agent turn metadata or undefined
   */
  getTurnMeta(sessionId: string, turn: number): AgentTurnMeta | undefined {
    const state = this.getState(sessionId);
    return state.trail.find((t) => t.turn === turn);
  }

  /**
   * Get All Turns
   *
   * Returns complete agent thought trail.
   *
   * @param sessionId - Session identifier
   * @returns Complete response memory state
   */
  getAll(sessionId: string): ResponseMemoryState {
    return this.getState(sessionId);
  }

  /**
   * Get Recent Turns
   *
   * Returns the last N turns from the trail.
   *
   * @param sessionId - Session identifier
   * @param count - Number of recent turns to retrieve
   * @returns Array of recent agent turn metadata
   */
  getRecentTurns(sessionId: string, count: number): AgentTurnMeta[] {
    const state = this.getState(sessionId);
    return state.trail.slice(-count);
  }

  /**
   * Get Turns by Intent
   *
   * Returns all turns matching a specific intent.
   *
   * @param sessionId - Session identifier
   * @param intent - Intent to filter by
   * @returns Array of matching agent turn metadata
   */
  getTurnsByIntent(sessionId: string, intent: string): AgentTurnMeta[] {
    const state = this.getState(sessionId);
    return state.trail.filter((t) => t.intent === intent);
  }

  /**
   * Get Turns by Framework
   *
   * Returns all turns where a specific framework was applied.
   *
   * @param sessionId - Session identifier
   * @param framework - Framework name to filter by
   * @returns Array of matching agent turn metadata
   */
  getTurnsByFramework(sessionId: string, framework: string): AgentTurnMeta[] {
    const state = this.getState(sessionId);
    return state.trail.filter((t) => t.appliedFramework === framework);
  }

  /**
   * Get Inference Stats
   *
   * Returns statistics about inference inputs used across all turns.
   *
   * @param sessionId - Session identifier
   * @returns Inference usage statistics
   */
  getInferenceStats(sessionId: string): {
    totalKBChips: number;
    totalEQChips: number;
    totalIntelChips: number;
    totalRAGPassages: number;
    frameworkUsage: Record<string, number>;
    intentDistribution: Record<string, number>;
  } {
    const state = this.getState(sessionId);
    const frameworkUsage: Record<string, number> = {};
    const intentDistribution: Record<string, number> = {};
    let totalKBChips = 0;
    let totalEQChips = 0;
    let totalIntelChips = 0;
    let totalRAGPassages = 0;

    state.trail.forEach((turn) => {
      // Count framework usage
      if (turn.appliedFramework) {
        frameworkUsage[turn.appliedFramework] = (frameworkUsage[turn.appliedFramework] || 0) + 1;
      }

      // Count intent distribution
      intentDistribution[turn.intent] = (intentDistribution[turn.intent] || 0) + 1;

      // Count inference inputs
      if (turn.inferenceInputs) {
        totalKBChips += turn.inferenceInputs.kbChipsUsed?.length || 0;
        totalEQChips += turn.inferenceInputs.eqChipsUsed?.length || 0;
        totalIntelChips += turn.inferenceInputs.intelChipsUsed?.length || 0;
        totalRAGPassages += turn.inferenceInputs.ragPassagesUsed?.length || 0;
      }
    });

    return {
      totalKBChips,
      totalEQChips,
      totalIntelChips,
      totalRAGPassages,
      frameworkUsage,
      intentDistribution,
    };
  }

  /**
   * Get EQ Adjustment History
   *
   * Returns all EQ adjustments made across the session.
   *
   * @param sessionId - Session identifier
   * @returns Array of turns with EQ adjustments
   */
  getEQAdjustmentHistory(sessionId: string): Array<{
    turn: number;
    adjustment: AgentTurnMeta["eqAdjustment"];
  }> {
    const state = this.getState(sessionId);
    return state.trail
      .filter((t) => t.eqAdjustment)
      .map((t) => ({
        turn: t.turn,
        adjustment: t.eqAdjustment,
      }));
  }
}
