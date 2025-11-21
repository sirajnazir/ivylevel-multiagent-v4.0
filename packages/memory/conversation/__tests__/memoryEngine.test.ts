/**
 * Component 25 Tests - Conversation Memory Engine
 *
 * Tests cover:
 * - Short-term memory sliding window behavior
 * - Session memory accumulation
 * - EQ signals tracking
 * - Archetype storage
 * - Intent recording
 * - Chips tracking
 * - Assessment progress flags
 * - Combined context retrieval
 * - Serialization/restoration
 * - No mutation leaks
 */

import { ShortTermMemory } from "../shortTermMemory";
import { SessionMemory } from "../sessionMemory";
import { MemoryManager } from "../memoryManager";
import { MemoryTurn } from "../memoryTypes";

describe("Component 25 - Conversation Memory Engine", () => {
  /**
   * SHORT-TERM MEMORY TESTS
   */

  /**
   * Test 1: STM sliding window evicts oldest
   */
  test("STM sliding window evicts oldest when full", () => {
    const stm = new ShortTermMemory(3); // Small window for testing

    stm.addTurn({ role: "user", content: "Turn 1", timestamp: "2024-01-01T00:00:00Z" });
    stm.addTurn({ role: "assistant", content: "Turn 2", timestamp: "2024-01-01T00:01:00Z" });
    stm.addTurn({ role: "user", content: "Turn 3", timestamp: "2024-01-01T00:02:00Z" });

    expect(stm.getWindowSize()).toBe(3);

    // Add 4th turn - should evict Turn 1
    stm.addTurn({ role: "assistant", content: "Turn 4", timestamp: "2024-01-01T00:03:00Z" });

    const window = stm.getWindow();
    expect(window.length).toBe(3);
    expect(window[0].content).toBe("Turn 2"); // Turn 1 evicted
    expect(window[2].content).toBe("Turn 4");
  });

  /**
   * Test 2: STM returns copy (no mutation)
   */
  test("STM returns window copy to prevent mutation", () => {
    const stm = new ShortTermMemory();

    stm.addTurn({ role: "user", content: "Original", timestamp: "2024-01-01T00:00:00Z" });

    const window1 = stm.getWindow();
    window1[0].content = "Mutated";

    const window2 = stm.getWindow();
    expect(window2[0].content).toBe("Original"); // Not mutated
  });

  /**
   * Test 3: STM get last user message
   */
  test("STM correctly retrieves last user message", () => {
    const stm = new ShortTermMemory();

    stm.addTurn({ role: "user", content: "User 1", timestamp: "2024-01-01T00:00:00Z" });
    stm.addTurn({ role: "assistant", content: "Assistant 1", timestamp: "2024-01-01T00:01:00Z" });
    stm.addTurn({ role: "user", content: "User 2", timestamp: "2024-01-01T00:02:00Z" });

    const lastUser = stm.getLastUserMessage();
    expect(lastUser?.content).toBe("User 2");
  });

  /**
   * Test 4: STM get last assistant message
   */
  test("STM correctly retrieves last assistant message", () => {
    const stm = new ShortTermMemory();

    stm.addTurn({ role: "user", content: "User 1", timestamp: "2024-01-01T00:00:00Z" });
    stm.addTurn({ role: "assistant", content: "Assistant 1", timestamp: "2024-01-01T00:01:00Z" });
    stm.addTurn({ role: "user", content: "User 2", timestamp: "2024-01-01T00:02:00Z" });
    stm.addTurn({ role: "assistant", content: "Assistant 2", timestamp: "2024-01-01T00:03:00Z" });

    const lastAssistant = stm.getLastAssistantMessage();
    expect(lastAssistant?.content).toBe("Assistant 2");
  });

  /**
   * Test 5: STM window clear
   */
  test("STM clear removes all turns", () => {
    const stm = new ShortTermMemory();

    stm.addTurn({ role: "user", content: "Turn 1", timestamp: "2024-01-01T00:00:00Z" });
    stm.addTurn({ role: "assistant", content: "Turn 2", timestamp: "2024-01-01T00:01:00Z" });

    expect(stm.getWindowSize()).toBe(2);

    stm.clear();

    expect(stm.getWindowSize()).toBe(0);
  });

  /**
   * Test 6: STM window resize
   */
  test("STM resize evicts excess turns", () => {
    const stm = new ShortTermMemory(5);

    for (let i = 1; i <= 5; i++) {
      stm.addTurn({ role: "user", content: `Turn ${i}`, timestamp: `2024-01-01T00:0${i}:00Z` });
    }

    expect(stm.getWindowSize()).toBe(5);

    // Resize to 3
    stm.resizeWindow(3);

    expect(stm.getWindowSize()).toBe(3);
    const window = stm.getWindow();
    expect(window[0].content).toBe("Turn 3"); // Oldest evicted
    expect(window[2].content).toBe("Turn 5");
  });

  /**
   * SESSION MEMORY TESTS
   */

  /**
   * Test 7: SM accumulates all turns
   */
  test("SM accumulates all turns without eviction", () => {
    const sm = new SessionMemory("test-session");

    for (let i = 1; i <= 50; i++) {
      sm.addTurn({ role: "user", content: `Turn ${i}`, timestamp: `2024-01-01T00:${i}:00Z` });
    }

    expect(sm.getAllTurns().length).toBe(50);
  });

  /**
   * Test 8: SM tracks EQ signals
   */
  test("SM records and retrieves EQ signals", () => {
    const sm = new SessionMemory("test-session");

    sm.addEQSignal("gentle");
    sm.addEQSignal("direct");
    sm.addEQSignal("motivational");

    const signals = sm.getEQSignals();
    expect(signals).toEqual(["gentle", "direct", "motivational"]);
  });

  /**
   * Test 9: SM stores archetype
   */
  test("SM stores and updates archetype", () => {
    const sm = new SessionMemory("test-session");

    expect(sm.getArchetype()).toBeNull();

    sm.setArchetype("uncertain");
    expect(sm.getArchetype()).toBe("uncertain");

    // Update archetype (archetype can evolve)
    sm.setArchetype("high_achiever");
    expect(sm.getArchetype()).toBe("high_achiever");
  });

  /**
   * Test 10: SM records intents
   */
  test("SM records all intents", () => {
    const sm = new SessionMemory("test-session");

    sm.addIntent("academics");
    sm.addIntent("activities");
    sm.addIntent("eq");
    sm.addIntent("academics"); // Duplicate

    const intents = sm.getIntents();
    expect(intents.length).toBe(4); // All recorded including duplicates

    const uniqueIntents = sm.getUniqueIntents();
    expect(uniqueIntents.length).toBe(3); // Deduplicated
  });

  /**
   * Test 11: SM tracks chips used
   */
  test("SM tracks knowledge chips used", () => {
    const sm = new SessionMemory("test-session");

    sm.addChips(["chip-1", "chip-2"]);
    sm.addChips(["chip-3", "chip-4", "chip-5"]);

    const state = sm.getFullState();
    expect(state.chipsUsed.length).toBe(5);
    expect(state.chipsUsed).toContain("chip-3");
  });

  /**
   * Test 12: SM assessment progress flags
   */
  test("SM tracks assessment progress flags", () => {
    const sm = new SessionMemory("test-session");

    expect(sm.isStepComplete("profileExtracted")).toBe(false);

    sm.updateProgress("profileExtracted", true);
    expect(sm.isStepComplete("profileExtracted")).toBe(true);

    sm.updateProgress("oraclesDone", true);
    expect(sm.isStepComplete("oraclesDone")).toBe(true);

    const progress = sm.getProgress();
    expect(progress.profileExtracted).toBe(true);
    expect(progress.oraclesDone).toBe(true);
    expect(progress.narrativeDone).toBe(false);
  });

  /**
   * Test 13: SM full state copy (no mutation)
   */
  test("SM returns full state copy to prevent mutation", () => {
    const sm = new SessionMemory("test-session");

    sm.addTurn({ role: "user", content: "Original", timestamp: "2024-01-01T00:00:00Z" });

    const state1 = sm.getFullState();
    state1.turns[0].content = "Mutated";

    const state2 = sm.getFullState();
    expect(state2.turns[0].content).toBe("Original"); // Not mutated
  });

  /**
   * Test 14: SM serialization and restoration
   */
  test("SM can be serialized and restored", () => {
    const sm = new SessionMemory("test-session");

    sm.addTurn({ role: "user", content: "Hello", timestamp: "2024-01-01T00:00:00Z" });
    sm.addEQSignal("gentle");
    sm.setArchetype("burnout");
    sm.updateProgress("profileExtracted", true);

    const serialized = sm.serialize();
    expect(typeof serialized).toBe("string");

    const restored = SessionMemory.restore(serialized);
    expect(restored.getSessionId()).toBe("test-session");
    expect(restored.getAllTurns().length).toBe(1);
    expect(restored.getEQSignals()).toEqual(["gentle"]);
    expect(restored.getArchetype()).toBe("burnout");
    expect(restored.isStepComplete("profileExtracted")).toBe(true);
  });

  /**
   * MEMORY MANAGER TESTS
   */

  /**
   * Test 15: MemoryManager adds to both STM and SM
   */
  test("MemoryManager adds turns to both STM and SM", () => {
    const manager = new MemoryManager("test-session");

    manager.addTurn("user", "Hello Jenny");
    manager.addTurn("assistant", "Hi there!");

    const context = manager.getContext();
    expect(context.shortContext.length).toBe(2);
    expect(context.fullSession.turns.length).toBe(2);
  });

  /**
   * Test 16: MemoryManager tracks signals
   */
  test("MemoryManager records EQ signals and archetype", () => {
    const manager = new MemoryManager("test-session");

    manager.addEQSignal("direct");
    manager.setArchetype("high_achiever");

    expect(manager.getCurrentArchetype()).toBe("high_achiever");

    const context = manager.getContext();
    expect(context.fullSession.eqSignals).toContain("direct");
  });

  /**
   * Test 17: MemoryManager marks progress
   */
  test("MemoryManager updates assessment progress", () => {
    const manager = new MemoryManager("test-session");

    expect(manager.isStepComplete("oraclesDone")).toBe(false);

    manager.markProgress("oraclesDone");

    expect(manager.isStepComplete("oraclesDone")).toBe(true);
  });

  /**
   * Test 18: MemoryManager combines context correctly
   */
  test("MemoryManager provides combined context", () => {
    const manager = new MemoryManager("test-session", 3);

    // Add 5 turns
    for (let i = 1; i <= 5; i++) {
      manager.addTurn("user", `Message ${i}`);
    }

    const context = manager.getContext();

    // Short context should have last 3
    expect(context.shortContext.length).toBe(3);
    expect(context.shortContext[0].content).toBe("Message 3");

    // Full session should have all 5
    expect(context.fullSession.turns.length).toBe(5);
  });

  /**
   * Test 19: MemoryManager short context as string
   */
  test("MemoryManager formats short context as string", () => {
    const manager = new MemoryManager("test-session");

    manager.addTurn("user", "What should I do?");
    manager.addTurn("assistant", "Let's start with your profile.");

    const contextString = manager.getShortContextString();

    expect(contextString).toContain("Student: What should I do?");
    expect(contextString).toContain("Jenny: Let's start with your profile.");
  });

  /**
   * Test 20: MemoryManager clear short-term only
   */
  test("MemoryManager clears STM without affecting SM", () => {
    const manager = new MemoryManager("test-session");

    manager.addTurn("user", "Message 1");
    manager.addTurn("assistant", "Response 1");

    expect(manager.getContext().shortContext.length).toBe(2);
    expect(manager.getContext().fullSession.turns.length).toBe(2);

    manager.clearShortTerm();

    expect(manager.getContext().shortContext.length).toBe(0); // STM cleared
    expect(manager.getContext().fullSession.turns.length).toBe(2); // SM intact
  });

  /**
   * Test 21: MemoryManager session stats
   */
  test("MemoryManager provides accurate stats", () => {
    const manager = new MemoryManager("test-session");

    manager.addTurn("user", "User message 1");
    manager.addTurn("assistant", "Assistant response 1");
    manager.addTurn("user", "User message 2");
    manager.addEQSignal("gentle");
    manager.addEQSignal("direct");
    manager.addIntent("academics");
    manager.addIntent("activities");
    manager.addChips(["chip-1", "chip-2", "chip-3"]);

    const stats = manager.getStats();

    expect(stats.totalTurns).toBe(3);
    expect(stats.userTurns).toBe(2);
    expect(stats.assistantTurns).toBe(1);
    expect(stats.eqSignalsRecorded).toBe(2);
    expect(stats.uniqueIntents).toBe(2);
    expect(stats.chipsUsedCount).toBe(3);
  });

  /**
   * Test 22: MemoryManager serialization and restoration
   */
  test("MemoryManager can be serialized and restored", () => {
    const manager = new MemoryManager("test-session", 5);

    manager.addTurn("user", "Hello");
    manager.addTurn("assistant", "Hi");
    manager.addTurn("user", "How are you?");
    manager.setArchetype("uncertain");
    manager.markProgress("profileExtracted");

    const serialized = manager.serialize();

    const restored = MemoryManager.restore(serialized, 5);

    expect(restored.getSessionId()).toBe("test-session");
    expect(restored.getContext().fullSession.turns.length).toBe(3);
    expect(restored.getContext().shortContext.length).toBe(3); // Rebuilt from recent
    expect(restored.getCurrentArchetype()).toBe("uncertain");
    expect(restored.isStepComplete("profileExtracted")).toBe(true);
  });

  /**
   * Test 23: MemoryManager get last messages
   */
  test("MemoryManager retrieves last user and assistant messages", () => {
    const manager = new MemoryManager("test-session");

    manager.addTurn("user", "User 1");
    manager.addTurn("assistant", "Assistant 1");
    manager.addTurn("user", "User 2");
    manager.addTurn("assistant", "Assistant 2");

    const lastUser = manager.getLastUserMessage();
    const lastAssistant = manager.getLastAssistantMessage();

    expect(lastUser?.content).toBe("User 2");
    expect(lastAssistant?.content).toBe("Assistant 2");
  });

  /**
   * Test 24: MemoryManager session summary
   */
  test("MemoryManager generates readable session summary", () => {
    const manager = new MemoryManager("test-session");

    manager.addTurn("user", "Message 1");
    manager.addTurn("assistant", "Response 1");
    manager.setArchetype("high_achiever");
    manager.markProgress("profileExtracted");
    manager.markProgress("oraclesDone");

    const summary = manager.getSummary();

    expect(summary).toContain("test-session");
    expect(summary).toContain("high_achiever");
    expect(summary).toContain("Profile Extracted: ✓");
    expect(summary).toContain("Oracles Done: ✓");
    expect(summary).toContain("Narrative Done: ○");
  });

  /**
   * Test 25: MemoryManager conversation history
   */
  test("MemoryManager formats conversation history", () => {
    const manager = new MemoryManager("test-session");

    manager.addTurn("user", "Hello");
    manager.addTurn("assistant", "Hi there");

    const history = manager.getConversationHistory();

    expect(history).toContain("Student:");
    expect(history).toContain("Jenny:");
    expect(history).toContain("Hello");
    expect(history).toContain("Hi there");
  });

  /**
   * Test 26: MemoryManager window stats
   */
  test("MemoryManager provides window statistics", () => {
    const manager = new MemoryManager("test-session", 10);

    manager.addTurn("user", "Message 1");
    manager.addTurn("assistant", "Response 1");
    manager.addTurn("user", "Message 2");

    const windowStats = manager.getWindowStats();

    expect(windowStats.size).toBe(3);
    expect(windowStats.maxSize).toBe(10);
    expect(windowStats.userTurns).toBe(2);
    expect(windowStats.assistantTurns).toBe(1);
    expect(windowStats.isFull).toBe(false);
  });
});
