/**
 * studentStateMemory.test.ts
 *
 * Tests for M4 - Student State Memory Manager
 */

import { StudentStateMemoryManager } from "../studentStateMemory";
import type { StudentStateSnapshot } from "../studentStateMemory.types";

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

describe("StudentStateMemoryManager", () => {
  let sessionStore: MockSessionStore;
  let studentStateMemory: StudentStateMemoryManager;
  const sessionId = "test-session-123";

  beforeEach(() => {
    sessionStore = new MockSessionStore();
    sessionStore.update(sessionId, {});
    studentStateMemory = new StudentStateMemoryManager(sessionStore);
  });

  afterEach(() => {
    sessionStore.clear();
  });

  describe("Initialization", () => {
    it("should initialize with empty snapshots", () => {
      const all = studentStateMemory.getAll(sessionId);
      expect(all.snapshots).toEqual([]);
      expect(all.latestSnapshot).toBeNull();
    });

    it("should throw error for non-existent session", () => {
      expect(() => {
        studentStateMemory.getAll("nonexistent-session");
      }).toThrow("Session not found");
    });
  });

  describe("Adding Snapshots", () => {
    it("should add snapshot with minimal data", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "medium",
        motivation: "high",
        confidence: "medium",
      });

      const latest = studentStateMemory.latest(sessionId);
      expect(latest).toBeDefined();
      expect(latest!.turn).toBe(1);
      expect(latest!.emotionalTone).toBe("curious");
      expect(latest!.timestamp).toBeDefined();
    });

    it("should add snapshot with complete data", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "anxious",
        cognitiveLoad: "high",
        motivation: "medium",
        confidence: "low",
        archetypeState: {
          current: "AnxiousHighPotential",
          confidence: 0.83,
          drift: {
            toward: "StructuredThinker",
            strength: 0.12,
          },
        },
        signalsDetected: [
          "mentions_time_pressure",
          "asks_clarifying_questions",
        ],
      });

      const latest = studentStateMemory.latest(sessionId);
      expect(latest!.archetypeState?.current).toBe("AnxiousHighPotential");
      expect(latest!.signalsDetected).toHaveLength(2);
    });

    it("should update latest snapshot", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
      });

      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "confident",
        cognitiveLoad: "medium",
        motivation: "high",
        confidence: "high",
      });

      const latest = studentStateMemory.latest(sessionId);
      expect(latest!.turn).toBe(2);
      expect(latest!.emotionalTone).toBe("confident");
    });
  });

  describe("Retrieving Snapshots", () => {
    beforeEach(() => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
      });
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "engaged",
        cognitiveLoad: "medium",
        motivation: "high",
        confidence: "high",
      });
      studentStateMemory.addSnapshot(sessionId, {
        turn: 3,
        emotionalTone: "anxious",
        cognitiveLoad: "high",
        motivation: "medium",
        confidence: "low",
      });
    });

    it("should get snapshot for specific turn", () => {
      const turn2 = studentStateMemory.getSnapshotForTurn(sessionId, 2);
      expect(turn2?.emotionalTone).toBe("engaged");
      expect(turn2?.cognitiveLoad).toBe("medium");
    });

    it("should return undefined for non-existent turn", () => {
      const turn99 = studentStateMemory.getSnapshotForTurn(sessionId, 99);
      expect(turn99).toBeUndefined();
    });

    it("should get all snapshots", () => {
      const all = studentStateMemory.getAll(sessionId);
      expect(all.snapshots).toHaveLength(3);
    });

    it("should get recent snapshots", () => {
      const recent2 = studentStateMemory.getRecentSnapshots(sessionId, 2);
      expect(recent2).toHaveLength(2);
      expect(recent2[0].turn).toBe(2);
      expect(recent2[1].turn).toBe(3);
    });
  });

  describe("Emotional Trends", () => {
    beforeEach(() => {
      const emotions: Array<StudentStateSnapshot["emotionalTone"]> = [
        "curious",
        "engaged",
        "confident",
        "anxious",
        "overwhelmed",
      ];

      emotions.forEach((emotion, i) => {
        studentStateMemory.addSnapshot(sessionId, {
          turn: i + 1,
          emotionalTone: emotion,
          cognitiveLoad: "medium",
          motivation: "medium",
          confidence: "medium",
        });
      });
    });

    it("should get emotional trend", () => {
      const trend = studentStateMemory.getEmotionalTrend(sessionId);
      expect(trend).toEqual([
        "curious",
        "engaged",
        "confident",
        "anxious",
        "overwhelmed",
      ]);
    });
  });

  describe("Cognitive Load Trends", () => {
    beforeEach(() => {
      const loads: Array<StudentStateSnapshot["cognitiveLoad"]> = [
        "low",
        "medium",
        "medium",
        "high",
        "overloaded",
      ];

      loads.forEach((load, i) => {
        studentStateMemory.addSnapshot(sessionId, {
          turn: i + 1,
          emotionalTone: "neutral",
          cognitiveLoad: load,
          motivation: "medium",
          confidence: "medium",
        });
      });
    });

    it("should get cognitive load trend", () => {
      const trend = studentStateMemory.getCognitiveLoadTrend(sessionId);
      expect(trend).toEqual(["low", "medium", "medium", "high", "overloaded"]);
    });
  });

  describe("State Change Detection", () => {
    beforeEach(() => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
      });
    });

    it("should detect emotional shift", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "anxious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
      });

      const changes = studentStateMemory.detectStateChange(sessionId);
      expect(changes).toBeDefined();
      expect(changes!.emotionalShift).toEqual({
        from: "curious",
        to: "anxious",
      });
    });

    it("should detect cognitive load shift", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "curious",
        cognitiveLoad: "high",
        motivation: "high",
        confidence: "high",
      });

      const changes = studentStateMemory.detectStateChange(sessionId);
      expect(changes!.cognitiveLoadShift).toEqual({
        from: "low",
        to: "high",
      });
    });

    it("should detect multiple simultaneous shifts", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "overwhelmed",
        cognitiveLoad: "overloaded",
        motivation: "low",
        confidence: "low",
      });

      const changes = studentStateMemory.detectStateChange(sessionId);
      expect(changes!.emotionalShift).toBeDefined();
      expect(changes!.cognitiveLoadShift).toBeDefined();
      expect(changes!.motivationShift).toBeDefined();
      expect(changes!.confidenceShift).toBeDefined();
    });

    it("should return null when no changes", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
      });

      const changes = studentStateMemory.detectStateChange(sessionId);
      expect(changes).toBeNull();
    });

    it("should return null with only one snapshot", () => {
      const changes = studentStateMemory.detectStateChange(sessionId);
      expect(changes).toBeNull();
    });
  });

  describe("Archetype Drift", () => {
    it("should get archetype drift from latest snapshot", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "anxious",
        cognitiveLoad: "high",
        motivation: "medium",
        confidence: "low",
        archetypeState: {
          current: "AnxiousHighPotential",
          confidence: 0.85,
          drift: {
            toward: "StructuredThinker",
            strength: 0.15,
          },
        },
      });

      const drift = studentStateMemory.getArchetypeDrift(sessionId);
      expect(drift).toBeDefined();
      expect(drift!.current).toBe("AnxiousHighPotential");
      expect(drift!.drift?.toward).toBe("StructuredThinker");
      expect(drift!.drift?.strength).toBe(0.15);
    });

    it("should return null when no archetype state", () => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
      });

      const drift = studentStateMemory.getArchetypeDrift(sessionId);
      expect(drift).toBeNull();
    });
  });

  describe("Detected Signals", () => {
    beforeEach(() => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
        signalsDetected: ["asks_questions", "shows_enthusiasm"],
      });
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "anxious",
        cognitiveLoad: "high",
        motivation: "medium",
        confidence: "low",
        signalsDetected: ["mentions_time_pressure", "asks_questions"],
      });
      studentStateMemory.addSnapshot(sessionId, {
        turn: 3,
        emotionalTone: "overwhelmed",
        cognitiveLoad: "overloaded",
        motivation: "low",
        confidence: "low",
        signalsDetected: ["shows_self_doubt"],
      });
    });

    it("should get all unique detected signals", () => {
      const signals = studentStateMemory.getAllDetectedSignals(sessionId);
      expect(signals).toHaveLength(4);
      expect(signals).toContain("asks_questions");
      expect(signals).toContain("shows_enthusiasm");
      expect(signals).toContain("mentions_time_pressure");
      expect(signals).toContain("shows_self_doubt");
    });
  });

  describe("State Summary", () => {
    beforeEach(() => {
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
      });
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "engaged",
        cognitiveLoad: "medium",
        motivation: "high",
        confidence: "high",
      });
      studentStateMemory.addSnapshot(sessionId, {
        turn: 3,
        emotionalTone: "anxious",
        cognitiveLoad: "high",
        motivation: "medium",
        confidence: "low",
      });
    });

    it("should calculate state summary", () => {
      const summary = studentStateMemory.getStateSummary(sessionId);
      expect(summary.totalSnapshots).toBe(3);
      expect(summary.emotionalToneDistribution.curious).toBe(1);
      expect(summary.emotionalToneDistribution.engaged).toBe(1);
      expect(summary.emotionalToneDistribution.anxious).toBe(1);
      expect(summary.cognitiveLoadDistribution.low).toBe(1);
      expect(summary.cognitiveLoadDistribution.medium).toBe(1);
      expect(summary.cognitiveLoadDistribution.high).toBe(1);
    });

    it("should calculate average motivation and confidence", () => {
      const summary = studentStateMemory.getStateSummary(sessionId);
      // high=1.0, high=1.0, medium=0.66 => avg = 0.887
      expect(summary.averageMotivation).toBeCloseTo(0.887, 2);
      // high=1.0, high=1.0, low=0.33 => avg = 0.777
      expect(summary.averageConfidence).toBeCloseTo(0.777, 2);
    });
  });

  describe("Integration Scenarios", () => {
    it("should track student evolution through assessment", () => {
      // Turn 1: Initial curiosity
      studentStateMemory.addSnapshot(sessionId, {
        turn: 1,
        emotionalTone: "curious",
        cognitiveLoad: "low",
        motivation: "high",
        confidence: "high",
        signalsDetected: ["asks_questions"],
      });

      // Turn 2: Engagement with academics
      studentStateMemory.addSnapshot(sessionId, {
        turn: 2,
        emotionalTone: "engaged",
        cognitiveLoad: "medium",
        motivation: "high",
        confidence: "high",
        archetypeState: {
          current: "Achiever",
          confidence: 0.75,
        },
        signalsDetected: ["shares_gpa", "mentions_ap_courses"],
      });

      // Turn 3: Anxiety emerges
      studentStateMemory.addSnapshot(sessionId, {
        turn: 3,
        emotionalTone: "anxious",
        cognitiveLoad: "high",
        motivation: "medium",
        confidence: "low",
        archetypeState: {
          current: "AnxiousHighPotential",
          confidence: 0.88,
          drift: {
            toward: "StructuredThinker",
            strength: 0.12,
          },
        },
        signalsDetected: ["mentions_time_pressure", "shows_self_doubt"],
      });

      // Verify progression
      const emotionalTrend = studentStateMemory.getEmotionalTrend(sessionId);
      expect(emotionalTrend).toEqual(["curious", "engaged", "anxious"]);

      const loadTrend = studentStateMemory.getCognitiveLoadTrend(sessionId);
      expect(loadTrend).toEqual(["low", "medium", "high"]);

      // Verify archetype evolution
      const drift = studentStateMemory.getArchetypeDrift(sessionId);
      expect(drift?.current).toBe("AnxiousHighPotential");

      // Verify all signals
      const signals = studentStateMemory.getAllDetectedSignals(sessionId);
      expect(signals).toHaveLength(5);
    });
  });
});
