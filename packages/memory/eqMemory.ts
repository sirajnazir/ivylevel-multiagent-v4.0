/**
 * eqMemory.ts
 *
 * M1 - EQ Memory Manager
 *
 * Clean in-memory store for emotional intelligence state.
 * Session-scoped, lightweight, purely functional.
 */

import type { EQMemory, ToneSignature, Archetype } from "./eqMemory.types";

const DEFAULT_TONE: ToneSignature = {
  warmth: 0.7,
  directness: 0.4,
  enthusiasm: 0.5,
  firmness: 0.3,
  empathy: 0.8,
  encouragement: 0.6,
};

const DEFAULT_EQ_MEMORY: EQMemory = {
  archetype: null,
  tone: DEFAULT_TONE,
  rapportLevel: 0.2,
};

/**
 * Session Store Interface
 *
 * Minimal interface for session storage.
 * Allows EQMemoryManager to work with any session store implementation.
 */
interface SessionStore {
  get(sessionId: string): any;
  update(sessionId: string, data: any): void;
}

export class EQMemoryManager {
  constructor(private sessionStore: SessionStore) {}

  /**
   * Get EQ Memory
   *
   * Returns EQ memory for a session, initializing if needed.
   *
   * @param sessionId - Session identifier
   * @returns EQ memory state
   */
  private getEQ(sessionId: string): EQMemory {
    const session = this.sessionStore.get(sessionId);

    if (!session) {
      throw new Error(`EQMemory: session ${sessionId} not found`);
    }

    if (!session.eqMemory) {
      session.eqMemory = { ...DEFAULT_EQ_MEMORY };
      this.sessionStore.update(sessionId, session);
    }

    return session.eqMemory;
  }

  /**
   * Set Archetype
   *
   * Updates the student's archetype classification.
   *
   * @param sessionId - Session identifier
   * @param archetype - Detected archetype
   */
  setArchetype(sessionId: string, archetype: Archetype): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.eqMemory = {
      ...this.getEQ(sessionId),
      archetype,
    };

    this.sessionStore.update(sessionId, session);

    console.log(`[EQMemory] Set archetype for ${sessionId}: ${archetype}`);
  }

  /**
   * Update Tone
   *
   * Adjusts tone signature by delta values.
   * Values are clamped to 0-1 range.
   *
   * @param sessionId - Session identifier
   * @param toneDelta - Partial tone adjustments
   */
  updateTone(sessionId: string, toneDelta: Partial<ToneSignature>): void {
    const eq = this.getEQ(sessionId);

    const newTone: ToneSignature = {
      warmth: Math.min(1, Math.max(0, eq.tone.warmth + (toneDelta.warmth ?? 0))),
      directness: Math.min(1, Math.max(0, eq.tone.directness + (toneDelta.directness ?? 0))),
      enthusiasm: Math.min(1, Math.max(0, eq.tone.enthusiasm + (toneDelta.enthusiasm ?? 0))),
      firmness: Math.min(1, Math.max(0, eq.tone.firmness + (toneDelta.firmness ?? 0))),
      empathy: Math.min(1, Math.max(0, eq.tone.empathy + (toneDelta.empathy ?? 0))),
      encouragement: Math.min(1, Math.max(0, eq.tone.encouragement + (toneDelta.encouragement ?? 0))),
    };

    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.eqMemory = {
      ...eq,
      tone: newTone,
    };

    this.sessionStore.update(sessionId, session);

    console.log(`[EQMemory] Updated tone for ${sessionId}`, toneDelta);
  }

  /**
   * Update Rapport
   *
   * Adjusts rapport level by delta value.
   * Value is clamped to 0-1 range.
   *
   * @param sessionId - Session identifier
   * @param delta - Rapport adjustment
   */
  updateRapport(sessionId: string, delta: number): void {
    const eq = this.getEQ(sessionId);

    const newRapport = Math.min(1, Math.max(0, eq.rapportLevel + delta));

    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.eqMemory = {
      ...eq,
      rapportLevel: newRapport,
    };

    this.sessionStore.update(sessionId, session);

    console.log(`[EQMemory] Updated rapport for ${sessionId}: ${eq.rapportLevel} → ${newRapport}`);
  }

  /**
   * Set Sentiment
   *
   * Records the last detected sentiment.
   *
   * @param sessionId - Session identifier
   * @param sentiment - Detected sentiment
   */
  setSentiment(sessionId: string, sentiment: string): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    const eq = this.getEQ(sessionId);

    session.eqMemory = {
      ...eq,
      lastSentiment: sentiment,
    };

    this.sessionStore.update(sessionId, session);
  }

  /**
   * Set Last Affirmation
   *
   * Records the last affirmation used (prevents repetition).
   *
   * @param sessionId - Session identifier
   * @param affirmation - Affirmation text
   */
  setLastAffirmation(sessionId: string, affirmation: string): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    const eq = this.getEQ(sessionId);

    session.eqMemory = {
      ...eq,
      lastAffirmationUsed: affirmation,
    };

    this.sessionStore.update(sessionId, session);
  }

  /**
   * Get Full EQ Memory
   *
   * Returns complete EQ memory state.
   *
   * @param sessionId - Session identifier
   * @returns Complete EQ memory
   */
  getFull(sessionId: string): EQMemory {
    return this.getEQ(sessionId);
  }

  /**
   * Reset EQ Memory
   *
   * Resets EQ memory to default state.
   *
   * @param sessionId - Session identifier
   */
  reset(sessionId: string): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.eqMemory = { ...DEFAULT_EQ_MEMORY };
    this.sessionStore.update(sessionId, session);

    console.log(`[EQMemory] Reset for ${sessionId}`);
  }
}
