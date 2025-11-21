/**
 * workingMemory.test.ts
 *
 * Tests for M5 - Working Memory Manager
 */

import { WorkingMemoryManager, Summarizer } from "../workingMemory";
import type { WorkingMemoryTurn } from "../workingMemory.types";

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

// Mock summarizer
class MockSummarizer implements Summarizer {
  async summarize(turns: WorkingMemoryTurn[]): Promise<{
    summary: string;
    keyPoints: string[];
  }> {
    return {
      summary: `Summary of turns ${turns[0].turn}-${turns[turns.length - 1].turn}`,
      keyPoints: [`Key point from ${turns.length} turns`],
    };
  }
}

describe("WorkingMemoryManager", () => {
  let sessionStore: MockSessionStore;
  let workingMemory: WorkingMemoryManager;
  const sessionId = "test-session-123";

  beforeEach(() => {
    sessionStore = new MockSessionStore();
    sessionStore.update(sessionId, {});
    workingMemory = new WorkingMemoryManager(sessionStore);
  });

  afterEach(() => {
    sessionStore.clear();
  });

  describe("Initialization", () => {
    it("should initialize with empty hot window", () => {
      const hotWindow = workingMemory.getHotWindow(sessionId);
      expect(hotWindow).toEqual([]);
    });

    it("should initialize with empty summaries", () => {
      const summaries = workingMemory.getAllSummaries(sessionId);
      expect(summaries).toEqual([]);
    });

    it("should throw error for non-existent session", () => {
      expect(() => {
        workingMemory.getHotWindow("nonexistent-session");
      }).toThrow("Session not found");
    });
  });

  describe("Adding Turns", () => {
    it("should add turn to hot window", async () => {
      await workingMemory.addTurn(
        sessionId,
        1,
        "What GPA do I need for MIT?",
        "For MIT, competitive applicants typically..."
      );

      const hotWindow = workingMemory.getHotWindow(sessionId);
      expect(hotWindow).toHaveLength(1);
      expect(hotWindow[0].turn).toBe(1);
      expect(hotWindow[0].userMessage).toBe("What GPA do I need for MIT?");
    });

    it("should maintain chronological order", async () => {
      await workingMemory.addTurn(sessionId, 1, "Message 1", "Reply 1");
      await workingMemory.addTurn(sessionId, 2, "Message 2", "Reply 2");
      await workingMemory.addTurn(sessionId, 3, "Message 3", "Reply 3");

      const hotWindow = workingMemory.getHotWindow(sessionId);
      expect(hotWindow).toHaveLength(3);
      expect(hotWindow[0].turn).toBe(1);
      expect(hotWindow[1].turn).toBe(2);
      expect(hotWindow[2].turn).toBe(3);
    });

    it("should add timestamp to turns", async () => {
      await workingMemory.addTurn(sessionId, 1, "Message", "Reply");
      const hotWindow = workingMemory.getHotWindow(sessionId);
      expect(hotWindow[0].timestamp).toBeDefined();
    });
  });

  describe("Window Size Management", () => {
    it("should use default window size of 16", async () => {
      for (let i = 1; i <= 16; i++) {
        await workingMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }

      const hotWindow = workingMemory.getHotWindow(sessionId);
      expect(hotWindow).toHaveLength(16);
    });

    it("should use custom window size", async () => {
      const customMemory = new WorkingMemoryManager(sessionStore, {
        windowSize: 8,
      });

      for (let i = 1; i <= 8; i++) {
        await customMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }

      const hotWindow = customMemory.getHotWindow(sessionId);
      expect(hotWindow).toHaveLength(8);
    });
  });

  describe("Summarization without LLM", () => {
    it("should trigger summarization when window exceeds size", async () => {
      // Add 17 turns (exceeds default 16)
      for (let i = 1; i <= 17; i++) {
        await workingMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }

      // Should have created a summary
      const summaries = workingMemory.getAllSummaries(sessionId);
      expect(summaries).toHaveLength(1);

      // Hot window should be reduced
      const hotWindow = workingMemory.getHotWindow(sessionId);
      expect(hotWindow.length).toBeLessThan(17);
    });

    it("should use fallback summary without summarizer", async () => {
      for (let i = 1; i <= 17; i++) {
        await workingMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }

      const summaries = workingMemory.getAllSummaries(sessionId);
      expect(summaries[0].summary).toContain("Turns");
    });
  });

  describe("Summarization with LLM", () => {
    let memoryWithSummarizer: WorkingMemoryManager;

    beforeEach(() => {
      memoryWithSummarizer = new WorkingMemoryManager(sessionStore, {
        summarizer: new MockSummarizer(),
      });
    });

    it("should use LLM summarizer when provided", async () => {
      for (let i = 1; i <= 17; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Message ${i}`,
          `Reply ${i}`
        );
      }

      const summaries = memoryWithSummarizer.getAllSummaries(sessionId);
      expect(summaries).toHaveLength(1);
      expect(summaries[0].summary).toContain("Summary of turns");
      expect(summaries[0].keyPoints).toHaveLength(1);
    });

    it("should create multiple summaries for long conversations", async () => {
      // Add 33 turns (exceeds 2x window size)
      for (let i = 1; i <= 33; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Message ${i}`,
          `Reply ${i}`
        );
      }

      const summaries = memoryWithSummarizer.getAllSummaries(sessionId);
      expect(summaries.length).toBeGreaterThan(1);
    });
  });

  describe("Context Bundle", () => {
    it("should return empty context for new session", () => {
      const context = workingMemory.getContext(sessionId);
      expect(context.recentTurns).toEqual([]);
      expect(context.historySummaries).toEqual([]);
      expect(context.totalTurns).toBe(0);
    });

    it("should return context with recent turns only", async () => {
      await workingMemory.addTurn(sessionId, 1, "Message 1", "Reply 1");
      await workingMemory.addTurn(sessionId, 2, "Message 2", "Reply 2");
      await workingMemory.addTurn(sessionId, 3, "Message 3", "Reply 3");

      const context = workingMemory.getContext(sessionId);
      expect(context.recentTurns).toHaveLength(3);
      expect(context.historySummaries).toEqual([]);
      expect(context.totalTurns).toBe(3);
    });

    it("should return context with summaries and recent turns", async () => {
      const memoryWithSummarizer = new WorkingMemoryManager(sessionStore, {
        summarizer: new MockSummarizer(),
      });

      // Add 17 turns to trigger summarization
      for (let i = 1; i <= 17; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Message ${i}`,
          `Reply ${i}`
        );
      }

      const context = memoryWithSummarizer.getContext(sessionId);
      expect(context.recentTurns.length).toBeGreaterThan(0);
      expect(context.historySummaries).toHaveLength(1);
      expect(context.totalTurns).toBe(17);
    });
  });

  describe("Finding Turns", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 5; i++) {
        await workingMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }
    });

    it("should find turn by number", () => {
      const turn3 = workingMemory.findTurn(sessionId, 3);
      expect(turn3).toBeDefined();
      expect(turn3!.turn).toBe(3);
      expect(turn3!.userMessage).toBe("Message 3");
    });

    it("should return undefined for non-existent turn", () => {
      const turn99 = workingMemory.findTurn(sessionId, 99);
      expect(turn99).toBeUndefined();
    });

    it("should return undefined for summarized turn", async () => {
      // Add more turns to trigger summarization
      for (let i = 6; i <= 18; i++) {
        await workingMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }

      // Early turns should be summarized and not in hot window
      const turn1 = workingMemory.findTurn(sessionId, 1);
      expect(turn1).toBeUndefined();
    });
  });

  describe("Recent Turns", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 10; i++) {
        await workingMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }
    });

    it("should get recent N turns", () => {
      const recent3 = workingMemory.getRecentTurns(sessionId, 3);
      expect(recent3).toHaveLength(3);
      expect(recent3[0].turn).toBe(8);
      expect(recent3[1].turn).toBe(9);
      expect(recent3[2].turn).toBe(10);
    });

    it("should handle request for more turns than exist", () => {
      const recent20 = workingMemory.getRecentTurns(sessionId, 20);
      expect(recent20).toHaveLength(10);
    });
  });

  describe("Turn Count", () => {
    it("should count total turns correctly", async () => {
      await workingMemory.addTurn(sessionId, 1, "Message 1", "Reply 1");
      await workingMemory.addTurn(sessionId, 2, "Message 2", "Reply 2");
      await workingMemory.addTurn(sessionId, 3, "Message 3", "Reply 3");

      const count = workingMemory.getTurnCount(sessionId);
      expect(count).toBe(3);
    });

    it("should count turns across summaries and hot window", async () => {
      const memoryWithSummarizer = new WorkingMemoryManager(sessionStore, {
        summarizer: new MockSummarizer(),
      });

      for (let i = 1; i <= 20; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Message ${i}`,
          `Reply ${i}`
        );
      }

      const count = memoryWithSummarizer.getTurnCount(sessionId);
      expect(count).toBe(20);
    });
  });

  describe("Memory Statistics", () => {
    it("should return stats for empty memory", () => {
      const stats = workingMemory.getMemoryStats(sessionId);
      expect(stats.hotWindowSize).toBe(0);
      expect(stats.hotWindowCapacity).toBe(16);
      expect(stats.summaryCount).toBe(0);
      expect(stats.totalTurns).toBe(0);
      expect(stats.oldestSummarizedTurn).toBeNull();
      expect(stats.newestTurn).toBeNull();
    });

    it("should return stats with turns", async () => {
      for (let i = 1; i <= 5; i++) {
        await workingMemory.addTurn(sessionId, i, `Message ${i}`, `Reply ${i}`);
      }

      const stats = workingMemory.getMemoryStats(sessionId);
      expect(stats.hotWindowSize).toBe(5);
      expect(stats.hotWindowCapacity).toBe(16);
      expect(stats.summaryCount).toBe(0);
      expect(stats.totalTurns).toBe(5);
      expect(stats.oldestSummarizedTurn).toBeNull();
      expect(stats.newestTurn).toBe(5);
    });

    it("should return stats with summaries", async () => {
      const memoryWithSummarizer = new WorkingMemoryManager(sessionStore, {
        summarizer: new MockSummarizer(),
      });

      for (let i = 1; i <= 20; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Message ${i}`,
          `Reply ${i}`
        );
      }

      const stats = memoryWithSummarizer.getMemoryStats(sessionId);
      expect(stats.hotWindowSize).toBeGreaterThan(0);
      expect(stats.summaryCount).toBeGreaterThan(0);
      expect(stats.totalTurns).toBe(20);
      expect(stats.oldestSummarizedTurn).toBeDefined();
      expect(stats.newestTurn).toBe(20);
    });
  });

  describe("Clear Memory", () => {
    it("should clear all memory", async () => {
      await workingMemory.addTurn(sessionId, 1, "Message 1", "Reply 1");
      await workingMemory.addTurn(sessionId, 2, "Message 2", "Reply 2");

      workingMemory.clear(sessionId);

      const hotWindow = workingMemory.getHotWindow(sessionId);
      const summaries = workingMemory.getAllSummaries(sessionId);
      expect(hotWindow).toEqual([]);
      expect(summaries).toEqual([]);
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complete assessment workflow", async () => {
      const memoryWithSummarizer = new WorkingMemoryManager(sessionStore, {
        summarizer: new MockSummarizer(),
        windowSize: 8,
      });

      // Simulate 20-turn assessment conversation
      for (let i = 1; i <= 20; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Student message ${i}`,
          `Jenny's reply ${i}`
        );
      }

      // Verify context bundle
      const context = memoryWithSummarizer.getContext(sessionId);
      expect(context.totalTurns).toBe(20);
      expect(context.recentTurns.length).toBeGreaterThan(0);
      expect(context.historySummaries.length).toBeGreaterThan(0);

      // Verify recent turns are accessible
      const recent5 = memoryWithSummarizer.getRecentTurns(sessionId, 5);
      expect(recent5).toHaveLength(5);
      expect(recent5[4].turn).toBe(20);

      // Verify stats
      const stats = memoryWithSummarizer.getMemoryStats(sessionId);
      expect(stats.totalTurns).toBe(20);
      expect(stats.summaryCount).toBeGreaterThan(0);
    });

    it("should handle mixed summarization cycles", async () => {
      const memoryWithSummarizer = new WorkingMemoryManager(sessionStore, {
        summarizer: new MockSummarizer(),
        windowSize: 8,
      });

      // First batch
      for (let i = 1; i <= 10; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Message ${i}`,
          `Reply ${i}`
        );
      }

      const stats1 = memoryWithSummarizer.getMemoryStats(sessionId);
      const summaryCount1 = stats1.summaryCount;

      // Second batch
      for (let i = 11; i <= 20; i++) {
        await memoryWithSummarizer.addTurn(
          sessionId,
          i,
          `Message ${i}`,
          `Reply ${i}`
        );
      }

      const stats2 = memoryWithSummarizer.getMemoryStats(sessionId);
      expect(stats2.summaryCount).toBeGreaterThanOrEqual(summaryCount1);
      expect(stats2.totalTurns).toBe(20);
    });
  });
});
