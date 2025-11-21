/**
 * responseMemory.test.ts
 *
 * Tests for M3 - Response Memory Manager
 */

import { ResponseMemoryManager } from "../responseMemory";
import type { AgentTurnMeta } from "../responseMemory.types";

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

describe("ResponseMemoryManager", () => {
  let sessionStore: MockSessionStore;
  let responseMemory: ResponseMemoryManager;
  const sessionId = "test-session-123";

  beforeEach(() => {
    sessionStore = new MockSessionStore();
    sessionStore.update(sessionId, {});
    responseMemory = new ResponseMemoryManager(sessionStore);
  });

  afterEach(() => {
    sessionStore.clear();
  });

  describe("Initialization", () => {
    it("should initialize with empty trail", () => {
      const all = responseMemory.getAll(sessionId);
      expect(all.trail).toEqual([]);
    });

    it("should throw error for non-existent session", () => {
      expect(() => {
        responseMemory.getAll("nonexistent-session");
      }).toThrow("Session not found");
    });
  });

  describe("Adding Turn Metadata", () => {
    it("should add turn with minimal metadata", () => {
      responseMemory.addTurn(sessionId, {
        turn: 1,
        intent: "build_rapport",
      });

      const turnMeta = responseMemory.getTurnMeta(sessionId, 1);
      expect(turnMeta).toBeDefined();
      expect(turnMeta!.turn).toBe(1);
      expect(turnMeta!.intent).toBe("build_rapport");
      expect(turnMeta!.timestamp).toBeDefined();
    });

    it("should add turn with complete metadata", () => {
      responseMemory.addTurn(sessionId, {
        turn: 2,
        intent: "explore_academics",
        appliedFramework: "SPARK",
        eqAdjustment: {
          toneDelta: { warmth: +0.1, enthusiasm: +0.15 },
          rapportDelta: +0.05,
        },
        inferenceInputs: {
          kbChipsUsed: ["kb-123", "kb-456"],
          ragPassagesUsed: ["rag-789"],
        },
        expectedStudentSignal: "will_reveal_gpa_context",
      });

      const turnMeta = responseMemory.getTurnMeta(sessionId, 2);
      expect(turnMeta).toBeDefined();
      expect(turnMeta!.intent).toBe("explore_academics");
      expect(turnMeta!.appliedFramework).toBe("SPARK");
      expect(turnMeta!.eqAdjustment?.toneDelta?.warmth).toBe(0.1);
      expect(turnMeta!.inferenceInputs?.kbChipsUsed).toHaveLength(2);
    });

    it("should maintain chronological trail", () => {
      responseMemory.addTurn(sessionId, { turn: 1, intent: "warmup" });
      responseMemory.addTurn(sessionId, { turn: 2, intent: "academics" });
      responseMemory.addTurn(sessionId, { turn: 3, intent: "activities" });

      const all = responseMemory.getAll(sessionId);
      expect(all.trail).toHaveLength(3);
      expect(all.trail[0].turn).toBe(1);
      expect(all.trail[1].turn).toBe(2);
      expect(all.trail[2].turn).toBe(3);
    });
  });

  describe("Retrieving Turn Metadata", () => {
    beforeEach(() => {
      responseMemory.addTurn(sessionId, {
        turn: 1,
        intent: "build_rapport",
        appliedFramework: "CARE",
      });
      responseMemory.addTurn(sessionId, {
        turn: 2,
        intent: "explore_academics",
        appliedFramework: "SPARK",
      });
      responseMemory.addTurn(sessionId, {
        turn: 3,
        intent: "explore_activities",
      });
    });

    it("should get turn metadata by turn number", () => {
      const turn2 = responseMemory.getTurnMeta(sessionId, 2);
      expect(turn2?.intent).toBe("explore_academics");
      expect(turn2?.appliedFramework).toBe("SPARK");
    });

    it("should return undefined for non-existent turn", () => {
      const turn99 = responseMemory.getTurnMeta(sessionId, 99);
      expect(turn99).toBeUndefined();
    });

    it("should get all turns", () => {
      const all = responseMemory.getAll(sessionId);
      expect(all.trail).toHaveLength(3);
    });
  });

  describe("Recent Turns", () => {
    beforeEach(() => {
      for (let i = 1; i <= 10; i++) {
        responseMemory.addTurn(sessionId, {
          turn: i,
          intent: `intent_${i}`,
        });
      }
    });

    it("should get recent N turns", () => {
      const recent3 = responseMemory.getRecentTurns(sessionId, 3);
      expect(recent3).toHaveLength(3);
      expect(recent3[0].turn).toBe(8);
      expect(recent3[1].turn).toBe(9);
      expect(recent3[2].turn).toBe(10);
    });

    it("should handle request for more turns than exist", () => {
      const recent20 = responseMemory.getRecentTurns(sessionId, 20);
      expect(recent20).toHaveLength(10);
    });
  });

  describe("Filtering by Intent", () => {
    beforeEach(() => {
      responseMemory.addTurn(sessionId, { turn: 1, intent: "build_rapport" });
      responseMemory.addTurn(sessionId, { turn: 2, intent: "explore_academics" });
      responseMemory.addTurn(sessionId, { turn: 3, intent: "build_rapport" });
      responseMemory.addTurn(sessionId, { turn: 4, intent: "explore_activities" });
      responseMemory.addTurn(sessionId, { turn: 5, intent: "build_rapport" });
    });

    it("should get all turns with specific intent", () => {
      const rapportTurns = responseMemory.getTurnsByIntent(sessionId, "build_rapport");
      expect(rapportTurns).toHaveLength(3);
      expect(rapportTurns.map((t) => t.turn)).toEqual([1, 3, 5]);
    });

    it("should return empty array for unused intent", () => {
      const narrativeTurns = responseMemory.getTurnsByIntent(sessionId, "narrative");
      expect(narrativeTurns).toEqual([]);
    });
  });

  describe("Filtering by Framework", () => {
    beforeEach(() => {
      responseMemory.addTurn(sessionId, {
        turn: 1,
        intent: "warmup",
        appliedFramework: "CARE",
      });
      responseMemory.addTurn(sessionId, {
        turn: 2,
        intent: "academics",
        appliedFramework: "SPARK",
      });
      responseMemory.addTurn(sessionId, {
        turn: 3,
        intent: "activities",
        appliedFramework: "ANCHOR",
      });
      responseMemory.addTurn(sessionId, {
        turn: 4,
        intent: "academics",
        appliedFramework: "SPARK",
      });
    });

    it("should get all turns using specific framework", () => {
      const sparkTurns = responseMemory.getTurnsByFramework(sessionId, "SPARK");
      expect(sparkTurns).toHaveLength(2);
      expect(sparkTurns.map((t) => t.turn)).toEqual([2, 4]);
    });

    it("should return empty array for unused framework", () => {
      const customFramework = responseMemory.getTurnsByFramework(sessionId, "CUSTOM");
      expect(customFramework).toEqual([]);
    });
  });

  describe("Inference Statistics", () => {
    beforeEach(() => {
      responseMemory.addTurn(sessionId, {
        turn: 1,
        intent: "build_rapport",
        appliedFramework: "CARE",
        inferenceInputs: {
          kbChipsUsed: ["kb-1", "kb-2"],
          eqChipsUsed: ["eq-1"],
        },
      });
      responseMemory.addTurn(sessionId, {
        turn: 2,
        intent: "explore_academics",
        appliedFramework: "SPARK",
        inferenceInputs: {
          kbChipsUsed: ["kb-3"],
          ragPassagesUsed: ["rag-1", "rag-2"],
          intelChipsUsed: ["intel-1"],
        },
      });
      responseMemory.addTurn(sessionId, {
        turn: 3,
        intent: "explore_academics",
        appliedFramework: "SPARK",
        inferenceInputs: {
          kbChipsUsed: ["kb-4", "kb-5"],
          eqChipsUsed: ["eq-2"],
        },
      });
    });

    it("should calculate total inference inputs", () => {
      const stats = responseMemory.getInferenceStats(sessionId);
      expect(stats.totalKBChips).toBe(5);
      expect(stats.totalEQChips).toBe(2);
      expect(stats.totalRAGPassages).toBe(2);
      expect(stats.totalIntelChips).toBe(1);
    });

    it("should calculate framework usage", () => {
      const stats = responseMemory.getInferenceStats(sessionId);
      expect(stats.frameworkUsage).toEqual({
        CARE: 1,
        SPARK: 2,
      });
    });

    it("should calculate intent distribution", () => {
      const stats = responseMemory.getInferenceStats(sessionId);
      expect(stats.intentDistribution).toEqual({
        build_rapport: 1,
        explore_academics: 2,
      });
    });

    it("should handle turns without inference inputs", () => {
      responseMemory.addTurn(sessionId, {
        turn: 4,
        intent: "narrative",
        appliedFramework: "ANCHOR",
      });

      const stats = responseMemory.getInferenceStats(sessionId);
      expect(stats.totalKBChips).toBe(5); // Unchanged
      expect(stats.frameworkUsage.ANCHOR).toBe(1);
    });
  });

  describe("EQ Adjustment History", () => {
    beforeEach(() => {
      responseMemory.addTurn(sessionId, {
        turn: 1,
        intent: "build_rapport",
      });
      responseMemory.addTurn(sessionId, {
        turn: 2,
        intent: "explore_academics",
        eqAdjustment: {
          toneDelta: { warmth: +0.1, empathy: +0.05 },
          rapportDelta: +0.1,
        },
      });
      responseMemory.addTurn(sessionId, {
        turn: 3,
        intent: "explore_activities",
      });
      responseMemory.addTurn(sessionId, {
        turn: 4,
        intent: "narrative",
        eqAdjustment: {
          toneDelta: { enthusiasm: +0.15 },
        },
      });
    });

    it("should get all EQ adjustments", () => {
      const history = responseMemory.getEQAdjustmentHistory(sessionId);
      expect(history).toHaveLength(2);
      expect(history[0].turn).toBe(2);
      expect(history[1].turn).toBe(4);
    });

    it("should preserve adjustment details", () => {
      const history = responseMemory.getEQAdjustmentHistory(sessionId);
      expect(history[0].adjustment?.toneDelta?.warmth).toBe(0.1);
      expect(history[0].adjustment?.rapportDelta).toBe(0.1);
      expect(history[1].adjustment?.toneDelta?.enthusiasm).toBe(0.15);
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete assessment workflow", () => {
      // Turn 1: Warmup
      responseMemory.addTurn(sessionId, {
        turn: 1,
        intent: "build_rapport",
        appliedFramework: "CARE",
        eqAdjustment: {
          rapportDelta: +0.1,
        },
        inferenceInputs: {
          eqChipsUsed: ["eq-warmup-1"],
        },
      });

      // Turn 2: Academics exploration
      responseMemory.addTurn(sessionId, {
        turn: 2,
        intent: "explore_academics",
        appliedFramework: "SPARK",
        eqAdjustment: {
          toneDelta: { enthusiasm: +0.1 },
          rapportDelta: +0.05,
        },
        inferenceInputs: {
          kbChipsUsed: ["kb-spark-1", "kb-spark-2"],
          ragPassagesUsed: ["rag-frameworks-1"],
          intelChipsUsed: ["intel-mit-1"],
        },
        expectedStudentSignal: "will_reveal_gpa",
      });

      // Turn 3: Activities
      responseMemory.addTurn(sessionId, {
        turn: 3,
        intent: "explore_activities",
        appliedFramework: "ANCHOR",
        inferenceInputs: {
          kbChipsUsed: ["kb-activities-1"],
        },
      });

      // Verify complete trail
      const all = responseMemory.getAll(sessionId);
      expect(all.trail).toHaveLength(3);

      // Verify statistics
      const stats = responseMemory.getInferenceStats(sessionId);
      expect(stats.totalKBChips).toBe(3);
      expect(stats.totalEQChips).toBe(1);
      expect(stats.totalRAGPassages).toBe(1);
      expect(stats.totalIntelChips).toBe(1);
      expect(stats.frameworkUsage).toEqual({
        CARE: 1,
        SPARK: 1,
        ANCHOR: 1,
      });

      // Verify EQ adjustments
      const eqHistory = responseMemory.getEQAdjustmentHistory(sessionId);
      expect(eqHistory).toHaveLength(2);
    });
  });
});
