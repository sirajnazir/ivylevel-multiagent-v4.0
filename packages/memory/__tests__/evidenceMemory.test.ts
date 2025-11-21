/**
 * evidenceMemory.test.ts
 *
 * Tests for M2 - Evidence Memory Manager
 */

import { EvidenceMemoryManager } from "../evidenceMemory";
import type { EvidenceReference } from "../evidenceMemory.types";

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

describe("EvidenceMemoryManager", () => {
  let sessionStore: MockSessionStore;
  let evidenceMemory: EvidenceMemoryManager;
  const sessionId = "test-session-123";

  beforeEach(() => {
    sessionStore = new MockSessionStore();
    sessionStore.update(sessionId, {});
    evidenceMemory = new EvidenceMemoryManager(sessionStore);
  });

  afterEach(() => {
    sessionStore.clear();
  });

  describe("Initialization", () => {
    it("should initialize with empty trail", () => {
      const trail = evidenceMemory.getFullTrail(sessionId);
      expect(trail.trail).toEqual([]);
    });

    it("should throw error for non-existent session", () => {
      expect(() => {
        evidenceMemory.getFullTrail("nonexistent-session");
      }).toThrow("Session not found");
    });
  });

  describe("Adding Evidence", () => {
    it("should add evidence for a turn", () => {
      const evidence: EvidenceReference[] = [
        {
          id: "kb-chip-123",
          sourceType: "kb_chip",
          excerpt: "High achievers benefit from SPARK framework",
          confidence: 0.92,
        },
      ];

      evidenceMemory.addEvidence(sessionId, 1, evidence);
      const turnEvidence = evidenceMemory.getEvidenceForTurn(sessionId, 1);

      expect(turnEvidence).toHaveLength(1);
      expect(turnEvidence[0].id).toBe("kb-chip-123");
      expect(turnEvidence[0].sourceType).toBe("kb_chip");
    });

    it("should add multiple evidence references for a turn", () => {
      const evidence: EvidenceReference[] = [
        {
          id: "kb-chip-123",
          sourceType: "kb_chip",
          excerpt: "SPARK framework for high achievers",
          confidence: 0.92,
        },
        {
          id: "rag-passage-456",
          sourceType: "rag_passage",
          filePath: "frameworks/SPARK.md",
          excerpt: "Students with high GPA respond well to...",
          confidence: 0.88,
        },
        {
          id: "eq-chip-789",
          sourceType: "eq_chip",
          excerpt: "Tone adjustment for anxious students",
          confidence: 0.85,
        },
      ];

      evidenceMemory.addEvidence(sessionId, 2, evidence);
      const turnEvidence = evidenceMemory.getEvidenceForTurn(sessionId, 2);

      expect(turnEvidence).toHaveLength(3);
      expect(turnEvidence.map((e) => e.sourceType)).toEqual([
        "kb_chip",
        "rag_passage",
        "eq_chip",
      ]);
    });

    it("should maintain append-only trail", () => {
      evidenceMemory.addEvidence(sessionId, 1, [
        { id: "ev-1", sourceType: "kb_chip" },
      ]);
      evidenceMemory.addEvidence(sessionId, 2, [
        { id: "ev-2", sourceType: "rag_passage" },
      ]);
      evidenceMemory.addEvidence(sessionId, 3, [
        { id: "ev-3", sourceType: "eq_chip" },
      ]);

      const trail = evidenceMemory.getFullTrail(sessionId);
      expect(trail.trail).toHaveLength(3);
      expect(trail.trail[0].turn).toBe(1);
      expect(trail.trail[1].turn).toBe(2);
      expect(trail.trail[2].turn).toBe(3);
    });
  });

  describe("Retrieving Evidence", () => {
    beforeEach(() => {
      // Setup test data
      evidenceMemory.addEvidence(sessionId, 1, [
        { id: "kb-1", sourceType: "kb_chip", confidence: 0.9 },
        { id: "rag-1", sourceType: "rag_passage", confidence: 0.85 },
      ]);
      evidenceMemory.addEvidence(sessionId, 2, [
        { id: "kb-2", sourceType: "kb_chip", confidence: 0.88 },
      ]);
      evidenceMemory.addEvidence(sessionId, 3, [
        { id: "eq-1", sourceType: "eq_chip", confidence: 0.92 },
        { id: "kb-3", sourceType: "kb_chip", confidence: 0.87 },
      ]);
    });

    it("should get evidence for specific turn", () => {
      const turn1Evidence = evidenceMemory.getEvidenceForTurn(sessionId, 1);
      expect(turn1Evidence).toHaveLength(2);
      expect(turn1Evidence[0].id).toBe("kb-1");
    });

    it("should return empty array for turn with no evidence", () => {
      const turn99Evidence = evidenceMemory.getEvidenceForTurn(sessionId, 99);
      expect(turn99Evidence).toEqual([]);
    });

    it("should get full trail", () => {
      const trail = evidenceMemory.getFullTrail(sessionId);
      expect(trail.trail).toHaveLength(3);
    });
  });

  describe("Evidence by Source Type", () => {
    beforeEach(() => {
      evidenceMemory.addEvidence(sessionId, 1, [
        { id: "kb-1", sourceType: "kb_chip" },
        { id: "rag-1", sourceType: "rag_passage" },
      ]);
      evidenceMemory.addEvidence(sessionId, 2, [
        { id: "kb-2", sourceType: "kb_chip" },
        { id: "eq-1", sourceType: "eq_chip" },
      ]);
      evidenceMemory.addEvidence(sessionId, 3, [
        { id: "kb-3", sourceType: "kb_chip" },
      ]);
    });

    it("should get all evidence of specific source type", () => {
      const kbChips = evidenceMemory.getEvidenceBySourceType(sessionId, "kb_chip");
      expect(kbChips).toHaveLength(3);
      expect(kbChips.map((e) => e.id)).toEqual(["kb-1", "kb-2", "kb-3"]);
    });

    it("should get evidence for different source types", () => {
      const ragPassages = evidenceMemory.getEvidenceBySourceType(sessionId, "rag_passage");
      const eqChips = evidenceMemory.getEvidenceBySourceType(sessionId, "eq_chip");

      expect(ragPassages).toHaveLength(1);
      expect(eqChips).toHaveLength(1);
    });

    it("should return empty array for unused source type", () => {
      const intelChips = evidenceMemory.getEvidenceBySourceType(sessionId, "intel_chip");
      expect(intelChips).toEqual([]);
    });
  });

  describe("Evidence Statistics", () => {
    beforeEach(() => {
      evidenceMemory.addEvidence(sessionId, 1, [
        { id: "kb-1", sourceType: "kb_chip", confidence: 0.9 },
        { id: "rag-1", sourceType: "rag_passage", confidence: 0.8 },
      ]);
      evidenceMemory.addEvidence(sessionId, 2, [
        { id: "kb-2", sourceType: "kb_chip", confidence: 0.85 },
        { id: "eq-1", sourceType: "eq_chip", confidence: 0.95 },
      ]);
      evidenceMemory.addEvidence(sessionId, 3, [
        { id: "kb-3", sourceType: "kb_chip", confidence: 0.88 },
      ]);
    });

    it("should calculate total evidence count", () => {
      const stats = evidenceMemory.getEvidenceStats(sessionId);
      expect(stats.totalEvidence).toBe(5);
    });

    it("should calculate evidence by source type", () => {
      const stats = evidenceMemory.getEvidenceStats(sessionId);
      expect(stats.bySourceType).toEqual({
        kb_chip: 3,
        rag_passage: 1,
        eq_chip: 1,
      });
    });

    it("should calculate average confidence", () => {
      const stats = evidenceMemory.getEvidenceStats(sessionId);
      // (0.9 + 0.8 + 0.85 + 0.95 + 0.88) / 5 = 0.876
      expect(stats.averageConfidence).toBeCloseTo(0.876, 3);
    });

    it("should handle evidence without confidence values", () => {
      evidenceMemory.addEvidence(sessionId, 4, [
        { id: "kb-4", sourceType: "kb_chip" },
        { id: "kb-5", sourceType: "kb_chip" },
      ]);

      const stats = evidenceMemory.getEvidenceStats(sessionId);
      expect(stats.totalEvidence).toBe(7);
      // Average should only include items with confidence
      expect(stats.averageConfidence).toBeCloseTo(0.876, 3);
    });

    it("should return 0 average confidence when no confidence values", () => {
      const newSessionId = "session-no-confidence";
      sessionStore.update(newSessionId, {});

      evidenceMemory.addEvidence(newSessionId, 1, [
        { id: "kb-1", sourceType: "kb_chip" },
      ]);

      const stats = evidenceMemory.getEvidenceStats(newSessionId);
      expect(stats.averageConfidence).toBe(0);
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete evidence tracking workflow", () => {
      // Turn 1: Initial rapport building
      evidenceMemory.addEvidence(sessionId, 1, [
        {
          id: "eq-warmup-1",
          sourceType: "eq_chip",
          excerpt: "Build rapport with anxious students",
          confidence: 0.9,
        },
      ]);

      // Turn 2: Academic exploration with multiple evidence sources
      evidenceMemory.addEvidence(sessionId, 2, [
        {
          id: "kb-spark-1",
          sourceType: "kb_chip",
          excerpt: "SPARK framework for high achievers",
          confidence: 0.92,
        },
        {
          id: "rag-framework-1",
          sourceType: "rag_passage",
          filePath: "frameworks/SPARK.md",
          excerpt: "High GPA students respond to...",
          confidence: 0.88,
        },
        {
          id: "intel-mit-1",
          sourceType: "intel_chip",
          excerpt: "MIT admission criteria",
          confidence: 0.85,
        },
      ]);

      // Turn 3: Activities discussion
      evidenceMemory.addEvidence(sessionId, 3, [
        {
          id: "kb-activities-1",
          sourceType: "kb_chip",
          excerpt: "Evaluate extracurricular depth",
          confidence: 0.87,
        },
      ]);

      // Verify complete trail
      const trail = evidenceMemory.getFullTrail(sessionId);
      expect(trail.trail).toHaveLength(3);

      // Verify statistics
      const stats = evidenceMemory.getEvidenceStats(sessionId);
      expect(stats.totalEvidence).toBe(5);
      expect(stats.bySourceType.kb_chip).toBe(2);
      expect(stats.bySourceType.eq_chip).toBe(1);
      expect(stats.bySourceType.rag_passage).toBe(1);
      expect(stats.bySourceType.intel_chip).toBe(1);

      // Verify all KB chips used
      const kbChips = evidenceMemory.getEvidenceBySourceType(sessionId, "kb_chip");
      expect(kbChips).toHaveLength(2);
    });

    it("should support empty evidence for some turns", () => {
      evidenceMemory.addEvidence(sessionId, 1, [
        { id: "ev-1", sourceType: "kb_chip" },
      ]);
      evidenceMemory.addEvidence(sessionId, 2, []); // No evidence
      evidenceMemory.addEvidence(sessionId, 3, [
        { id: "ev-3", sourceType: "eq_chip" },
      ]);

      const trail = evidenceMemory.getFullTrail(sessionId);
      expect(trail.trail).toHaveLength(3);
      expect(trail.trail[1].usedEvidence).toEqual([]);

      const stats = evidenceMemory.getEvidenceStats(sessionId);
      expect(stats.totalEvidence).toBe(2);
    });
  });
});
