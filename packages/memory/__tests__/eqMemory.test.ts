/**
 * eqMemory.test.ts
 *
 * Tests for M1 - EQ Memory Manager
 */

import { EQMemoryManager } from "../eqMemory";
import type { Archetype, ToneSignature } from "../eqMemory.types";

// Mock session store
class MockSessionStore {
  private sessions: Map<string, any> = new Map();

  get(sessionId: string): any {
    return this.sessions.get(sessionId);
  }

  update(sessionId: string, data: any): void {
    this.sessions.set(sessionId, data);
  }

  clear(): void {
    this.sessions.clear();
  }
}

describe("EQMemoryManager", () => {
  let sessionStore: MockSessionStore;
  let eqMemory: EQMemoryManager;
  const sessionId = "test-session-123";

  beforeEach(() => {
    sessionStore = new MockSessionStore();
    sessionStore.update(sessionId, {});
    eqMemory = new EQMemoryManager(sessionStore);
  });

  afterEach(() => {
    sessionStore.clear();
  });

  describe("Initialization", () => {
    it("should initialize with default EQ memory", () => {
      const eq = eqMemory.getFull(sessionId);

      expect(eq.archetype).toBeNull();
      expect(eq.tone.warmth).toBe(0.7);
      expect(eq.tone.directness).toBe(0.4);
      expect(eq.tone.enthusiasm).toBe(0.5);
      expect(eq.tone.firmness).toBe(0.3);
      expect(eq.tone.empathy).toBe(0.8);
      expect(eq.tone.encouragement).toBe(0.6);
      expect(eq.rapportLevel).toBe(0.2);
    });

    it("should throw error for non-existent session", () => {
      expect(() => {
        eqMemory.getFull("nonexistent-session");
      }).toThrow("Session not found");
    });
  });

  describe("Archetype Management", () => {
    it("should set archetype", () => {
      eqMemory.setArchetype(sessionId, "AnxiousHighPotential");
      const eq = eqMemory.getFull(sessionId);

      expect(eq.archetype).toBe("AnxiousHighPotential");
    });

    it("should update archetype", () => {
      eqMemory.setArchetype(sessionId, "Achiever");
      eqMemory.setArchetype(sessionId, "Builder");
      const eq = eqMemory.getFull(sessionId);

      expect(eq.archetype).toBe("Builder");
    });
  });

  describe("Tone Management", () => {
    it("should update tone with positive deltas", () => {
      eqMemory.updateTone(sessionId, {
        warmth: +0.1,
        empathy: +0.15,
      });

      const eq = eqMemory.getFull(sessionId);
      expect(eq.tone.warmth).toBe(0.8);
      expect(eq.tone.empathy).toBe(0.95);
      expect(eq.tone.directness).toBe(0.4); // Unchanged
    });

    it("should update tone with negative deltas", () => {
      eqMemory.updateTone(sessionId, {
        directness: -0.2,
        firmness: -0.1,
      });

      const eq = eqMemory.getFull(sessionId);
      expect(eq.tone.directness).toBe(0.2);
      expect(eq.tone.firmness).toBe(0.2);
    });

    it("should clamp tone values to 0-1 range (upper bound)", () => {
      eqMemory.updateTone(sessionId, {
        warmth: +0.5,  // 0.7 + 0.5 = 1.2, should clamp to 1.0
        empathy: +0.3, // 0.8 + 0.3 = 1.1, should clamp to 1.0
      });

      const eq = eqMemory.getFull(sessionId);
      expect(eq.tone.warmth).toBe(1.0);
      expect(eq.tone.empathy).toBe(1.0);
    });

    it("should clamp tone values to 0-1 range (lower bound)", () => {
      eqMemory.updateTone(sessionId, {
        warmth: -1.0,     // 0.7 - 1.0 = -0.3, should clamp to 0.0
        directness: -0.5, // 0.4 - 0.5 = -0.1, should clamp to 0.0
      });

      const eq = eqMemory.getFull(sessionId);
      expect(eq.tone.warmth).toBe(0.0);
      expect(eq.tone.directness).toBe(0.0);
    });

    it("should handle multiple tone updates cumulatively", () => {
      eqMemory.updateTone(sessionId, { warmth: +0.1 });
      eqMemory.updateTone(sessionId, { warmth: +0.1 });
      eqMemory.updateTone(sessionId, { warmth: +0.05 });

      const eq = eqMemory.getFull(sessionId);
      expect(eq.tone.warmth).toBeCloseTo(0.95, 2);
    });
  });

  describe("Rapport Management", () => {
    it("should update rapport with positive delta", () => {
      eqMemory.updateRapport(sessionId, +0.3);
      const eq = eqMemory.getFull(sessionId);

      expect(eq.rapportLevel).toBe(0.5);
    });

    it("should update rapport with negative delta", () => {
      eqMemory.updateRapport(sessionId, -0.1);
      const eq = eqMemory.getFull(sessionId);

      expect(eq.rapportLevel).toBe(0.1);
    });

    it("should clamp rapport to 0-1 range (upper bound)", () => {
      eqMemory.updateRapport(sessionId, +0.9); // 0.2 + 0.9 = 1.1, should clamp to 1.0
      const eq = eqMemory.getFull(sessionId);

      expect(eq.rapportLevel).toBe(1.0);
    });

    it("should clamp rapport to 0-1 range (lower bound)", () => {
      eqMemory.updateRapport(sessionId, -0.5); // 0.2 - 0.5 = -0.3, should clamp to 0.0
      const eq = eqMemory.getFull(sessionId);

      expect(eq.rapportLevel).toBe(0.0);
    });

    it("should handle multiple rapport updates cumulatively", () => {
      eqMemory.updateRapport(sessionId, +0.15);
      eqMemory.updateRapport(sessionId, +0.2);
      eqMemory.updateRapport(sessionId, -0.05);

      const eq = eqMemory.getFull(sessionId);
      expect(eq.rapportLevel).toBeCloseTo(0.5, 2);
    });
  });

  describe("Sentiment Management", () => {
    it("should set sentiment", () => {
      eqMemory.setSentiment(sessionId, "positive");
      const eq = eqMemory.getFull(sessionId);

      expect(eq.lastSentiment).toBe("positive");
    });

    it("should update sentiment", () => {
      eqMemory.setSentiment(sessionId, "positive");
      eqMemory.setSentiment(sessionId, "negative");
      const eq = eqMemory.getFull(sessionId);

      expect(eq.lastSentiment).toBe("negative");
    });
  });

  describe("Affirmation Management", () => {
    it("should set last affirmation", () => {
      eqMemory.setLastAffirmation(sessionId, "You're doing great!");
      const eq = eqMemory.getFull(sessionId);

      expect(eq.lastAffirmationUsed).toBe("You're doing great!");
    });

    it("should update last affirmation", () => {
      eqMemory.setLastAffirmation(sessionId, "Nice work!");
      eqMemory.setLastAffirmation(sessionId, "Excellent progress!");
      const eq = eqMemory.getFull(sessionId);

      expect(eq.lastAffirmationUsed).toBe("Excellent progress!");
    });
  });

  describe("Reset Functionality", () => {
    it("should reset EQ memory to defaults", () => {
      // Modify state
      eqMemory.setArchetype(sessionId, "Achiever");
      eqMemory.updateTone(sessionId, { warmth: +0.2 });
      eqMemory.updateRapport(sessionId, +0.5);
      eqMemory.setSentiment(sessionId, "positive");

      // Reset
      eqMemory.reset(sessionId);

      // Verify reset to defaults
      const eq = eqMemory.getFull(sessionId);
      expect(eq.archetype).toBeNull();
      expect(eq.tone.warmth).toBe(0.7);
      expect(eq.rapportLevel).toBe(0.2);
      expect(eq.lastSentiment).toBeUndefined();
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete EQ workflow", () => {
      // Initial classification
      eqMemory.setArchetype(sessionId, "AnxiousHighPotential");

      // Build rapport through conversation
      eqMemory.updateRapport(sessionId, +0.1);
      eqMemory.updateRapport(sessionId, +0.15);

      // Adjust tone for anxious student
      eqMemory.updateTone(sessionId, {
        warmth: +0.2,
        empathy: +0.15,
        directness: -0.1,
      });

      // Track sentiment
      eqMemory.setSentiment(sessionId, "anxious");

      // Verify final state
      const eq = eqMemory.getFull(sessionId);
      expect(eq.archetype).toBe("AnxiousHighPotential");
      expect(eq.rapportLevel).toBeCloseTo(0.45, 2);
      expect(eq.tone.warmth).toBeCloseTo(0.9, 2);
      expect(eq.tone.empathy).toBeCloseTo(0.95, 2);
      expect(eq.tone.directness).toBeCloseTo(0.3, 2);
      expect(eq.lastSentiment).toBe("anxious");
    });
  });
});
