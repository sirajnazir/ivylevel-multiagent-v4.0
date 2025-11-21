import { SessionFlowOrchestrator, createSessionFlowOrchestrator } from "../runtime/sessionFlow/flowOrchestrator";
import { initializeFlowState, FlowState } from "../runtime/sessionFlow/flowState";
import { getJennyPersona } from "../src/jennyPersona";
import { stepCatalog, getTotalStepCount } from "../runtime/sessionFlow/stepCatalog";

/**
 * Component 15 Tests - Conversational Flow Orchestrator v1.0
 *
 * Tests cover:
 * - Flow initialization
 * - Turn execution
 * - Phase transitions
 * - Data collection
 * - Step transitions
 * - Session completion detection
 * - Progress tracking
 * - Persona composition during flow
 */

describe("Component 15 - Conversational Flow Orchestrator", () => {
  let orchestrator: SessionFlowOrchestrator;
  let initialState: FlowState;

  beforeEach(() => {
    orchestrator = createSessionFlowOrchestrator();
    const jennyPersona = getJennyPersona();
    initialState = orchestrator.initializeSession(jennyPersona);
  });

  /**
   * Test 1: Flow initializes correctly
   */
  test("flow initializes correctly", () => {
    expect(initialState.phase).toBe("warmup");
    expect(initialState.step).toBe("warmup_intro");
    expect(initialState.turnCount).toBe(0);
    expect(initialState.history).toEqual([]);
    expect(initialState.persona.identity.name).toBe("Jenny");
  });

  /**
   * Test 2: Steps don't loop infinitely
   */
  test("steps transition forward without loops", () => {
    let state = { ...initialState };
    const visitedSteps = new Set<string>();

    // Simulate 10 turns
    for (let i = 0; i < 10; i++) {
      const stepBefore = state.step;

      // If we've seen this step before and it's not terminal, we have a loop
      if (visitedSteps.has(stepBefore) && stepBefore !== "session_complete") {
        fail(`Step loop detected: ${stepBefore}`);
      }

      visitedSteps.add(stepBefore);

      state = orchestrator.runTurn(`Test message ${i}`, state);

      // Step should change (unless we're at session_complete)
      if (stepBefore !== "session_complete") {
        expect(state.step).not.toBe(stepBefore);
      }
    }

    expect(visitedSteps.size).toBeGreaterThan(1);
  });

  /**
   * Test 3: Emotional modulation applied
   */
  test("emotional modulation applied during flow", () => {
    let state = { ...initialState };

    // Send frustrated message
    state = orchestrator.runTurn("I'm so frustrated with all this", state);

    // Frustration should increase
    expect(state.emotionalSignals.frustration).toBeGreaterThan(0);
  });

  /**
   * Test 4: Persona stays consistent
   */
  test("persona identity stays consistent across turns", () => {
    let state = { ...initialState };

    const initialName = state.persona.identity.name;
    const initialArchetype = state.persona.identity.archetype;

    // Run 5 turns
    for (let i = 0; i < 5; i++) {
      state = orchestrator.runTurn(`Message ${i}`, state);
    }

    // Identity should remain constant
    expect(state.persona.identity.name).toBe(initialName);
    expect(state.persona.identity.archetype).toBe(initialArchetype);
  });

  /**
   * Test 5: Phase transitions correctly
   */
  test("phase transitions correctly based on step", () => {
    let state = { ...initialState };

    // Start in warmup
    expect(state.phase).toBe("warmup");

    // Manually advance to diagnostic step
    state.step = "diagnostic_academics_gpa";
    state = orchestrator.runTurn("My GPA is 3.8", state);

    // Should now be in diagnostic phase
    expect(state.phase).toBe("diagnostic");
  });

  /**
   * Test 6: Data collected correctly
   */
  test("data collected correctly during intake", () => {
    let state = { ...initialState };

    // Start warmup
    state = orchestrator.runTurn("I'm excited but also nervous about college", state);

    // Should have collected personality data
    expect(state.collected.personality).toBeDefined();
  });

  /**
   * Test 7: History grows as expected
   */
  test("history grows with each turn", () => {
    let state = { ...initialState };

    expect(state.history.length).toBe(0);

    state = orchestrator.runTurn("First message", state);
    expect(state.history.length).toBe(1);
    expect(state.history[0].role).toBe("user");

    // Add assistant message
    orchestrator.addAssistantMessage(state, "First response");
    expect(state.history.length).toBe(2);
    expect(state.history[1].role).toBe("assistant");

    state = orchestrator.runTurn("Second message", state);
    expect(state.history.length).toBe(3);
  });

  /**
   * Test 8: Turn count increments
   */
  test("turn count increments correctly", () => {
    let state = { ...initialState };

    expect(state.turnCount).toBe(0);

    state = orchestrator.runTurn("Message 1", state);
    expect(state.turnCount).toBe(1);

    state = orchestrator.runTurn("Message 2", state);
    expect(state.turnCount).toBe(2);
  });

  /**
   * Test 9: Session completion detection works
   */
  test("session completion detection works", () => {
    let state = { ...initialState };

    expect(orchestrator.isSessionComplete(state)).toBe(false);

    // Manually set to complete step
    state.step = "session_complete";

    expect(orchestrator.isSessionComplete(state)).toBe(true);
  });

  /**
   * Test 10: getCurrentInstruction returns valid instruction
   */
  test("getCurrentInstruction returns valid instruction", () => {
    const instruction = orchestrator.getCurrentInstruction(initialState);

    expect(instruction).toBeDefined();
    expect(instruction.length).toBeGreaterThan(50);
    expect(instruction).toContain("Jenny");
  });

  /**
   * Test 11: Progress summary includes key info
   */
  test("progress summary includes key information", () => {
    let state = { ...initialState };

    state = orchestrator.runTurn("Test message", state);

    const summary = orchestrator.getProgressSummary(state);

    expect(summary).toContain("Phase:");
    expect(summary).toContain("Step:");
    expect(summary).toContain("Turn Count:");
    expect(summary).toContain("Data Collection:");
  });

  /**
   * Test 12: Step catalog has sufficient steps
   */
  test("step catalog has sufficient steps", () => {
    const stepCount = getTotalStepCount();

    // Should have at least 30 steps
    expect(stepCount).toBeGreaterThanOrEqual(30);
  });

  /**
   * Test 13: All steps have valid transition functions
   */
  test("all steps have valid transition functions", () => {
    const steps = Object.values(stepCatalog);

    steps.forEach(step => {
      expect(step.transition).toBeDefined();
      expect(typeof step.transition).toBe("function");

      // Call transition with mock state
      const mockState = initializeFlowState(getJennyPersona());
      const nextStep = step.transition(mockState);

      expect(nextStep).toBeDefined();
      expect(typeof nextStep).toBe("string");
    });
  });

  /**
   * Test 14: GPA collection works
   */
  test("GPA collection works from user message", () => {
    let state = { ...initialState };

    // Move to GPA step
    state.step = "diagnostic_academics_gpa";

    state = orchestrator.runTurn("My GPA is 3.85 unweighted and 4.2 weighted", state);

    // Should have collected GPA
    expect(state.collected.academics).toBeDefined();
    expect(state.collected.academics?.gpa).toBeDefined();
  });

  /**
   * Test 15: Conditional transitions work
   */
  test("conditional transitions work based on collected data", () => {
    let state = { ...initialState };

    // Move to GPA step
    state.step = "diagnostic_academics_gpa";

    // Provide clear GPA
    state = orchestrator.runTurn("My GPA is 3.8", state);

    // Should transition to rigor step, not clarification
    expect(state.step).toBe("diagnostic_academics_rigor");
  });

  /**
   * Test 16: Metadata updates correctly
   */
  test("metadata updates with each turn", () => {
    let state = { ...initialState };

    const initialTimestamp = state.metadata.lastUpdatedAt;

    // Wait a bit
    setTimeout(() => {
      state = orchestrator.runTurn("Test message", state);

      expect(state.metadata.lastUpdatedAt).not.toBe(initialTimestamp);
    }, 10);
  });

  /**
   * Test 17: Persona warmth adapts to frustration
   */
  test("persona warmth adapts to high frustration", () => {
    let state = { ...initialState };

    // Set high frustration manually
    state.emotionalSignals.frustration = 4;

    state = orchestrator.runTurn("This is overwhelming", state);

    // Persona should have adapted
    expect(["high", "very high"]).toContain(state.persona.tone.warmth);
  });

  /**
   * Test 18: Multiple phases can be traversed
   */
  test("multiple phases can be traversed in sequence", () => {
    let state = { ...initialState };

    // Start in warmup
    expect(state.phase).toBe("warmup");

    // Force progression through phases
    state.step = "diagnostic_academics_gpa";
    state = orchestrator.runTurn("GPA is 3.8", state);
    expect(state.phase).toBe("diagnostic");

    state.step = "deep_probe_passion";
    state = orchestrator.runTurn("I love computer science", state);
    expect(state.phase).toBe("deep_probe");

    state.step = "narrative_reflection";
    state = orchestrator.runTurn("Yes, that resonates", state);
    expect(state.phase).toBe("narrative");

    state.step = "wrap_action_items";
    state = orchestrator.runTurn("Got it", state);
    expect(state.phase).toBe("wrap");
  });

  /**
   * Test 19: Background collection works
   */
  test("background collection detects immigrant identity", () => {
    let state = { ...initialState };

    state.step = "warmup_background";
    state = orchestrator.runTurn("My parents immigrated from China when I was young", state);

    expect(state.collected.personality).toBeDefined();
    expect(state.collected.personality?.background).toContain("immigrant background");
  });

  /**
   * Test 20: Session can be serialized
   */
  test("session state can be serialized and restored", () => {
    let state = { ...initialState };

    state = orchestrator.runTurn("Test message", state);

    // Serialize
    const serialized = JSON.stringify(state);

    // Deserialize
    const restored: FlowState = JSON.parse(serialized);

    expect(restored.phase).toBe(state.phase);
    expect(restored.step).toBe(state.step);
    expect(restored.turnCount).toBe(state.turnCount);
    expect(restored.history.length).toBe(state.history.length);
  });
});
