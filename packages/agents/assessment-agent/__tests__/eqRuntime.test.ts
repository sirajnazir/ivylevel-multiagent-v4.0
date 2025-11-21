/**
 * EQ Runtime Integration Tests
 *
 * Tests the real-time emotional intelligence orchestration system
 * that runs during live conversations.
 */

import { EQRuntime, buildStyleOverlay } from "../src/eqRuntime";
import { StyleDirectives } from "../../../eq/styleMixer";

const baseStyle: StyleDirectives = {
  warmthLevel: "medium",
  empathyLevel: "medium",
  firmnessLevel: "medium",
  cheerLevel: "medium",
  paceLevel: "normal",
  intensityLevel: "medium"
};

/**
 * ======================
 * BASIC RUNTIME TESTS (6)
 * ======================
 */
describe("EQ Runtime - Basic Functionality", () => {
  test("1. Should initialize with default state", () => {
    const runtime = new EQRuntime();
    const state = runtime.getState();

    expect(state.archetype).toBe("unknown");
    expect(state.stage).toBe("opening");
    expect(state.anxietyLevel).toBe("medium");
    expect(state.confidenceSignal).toBe(0);
    expect(state.totalMessages).toBe(0);
    expect(state.messageCountInStage).toBe(0);
  });

  test("2. Should update archetype from student message", () => {
    const runtime = new EQRuntime();
    runtime.updateFromStudentMessage("I'm not good at this and I feel behind everyone");

    const state = runtime.getState();
    expect(state.archetype).toBe("low-confidence-builder");
  });

  test("3. Should update anxiety level from message content", () => {
    const runtime = new EQRuntime();

    runtime.updateFromStudentMessage("idk what to do, I'm so overwhelmed");
    expect(runtime.getState().anxietyLevel).toBe("high");

    runtime.updateFromStudentMessage("This is easy, I got this");
    expect(runtime.getState().anxietyLevel).toBe("low");
  });

  test("4. Should track confidence signals cumulatively", () => {
    const runtime = new EQRuntime();

    runtime.updateFromStudentMessage("I'm lost and confused");
    expect(runtime.getState().confidenceSignal).toBeLessThan(0);

    const before = runtime.getState().confidenceSignal;
    runtime.updateFromStudentMessage("I think I can do this");
    expect(runtime.getState().confidenceSignal).toBeGreaterThan(before);
  });

  test("5. Should advance session stage on opening", () => {
    const runtime = new EQRuntime();

    expect(runtime.getState().stage).toBe("opening");

    runtime.updateFromStudentMessage("Hi, I need help");
    expect(runtime.getState().stage).toBe("rapport-building");
  });

  test("6. Should compute directives based on current state", () => {
    const runtime = new EQRuntime();
    runtime.updateFromStudentMessage("I'm not good at this");

    const directives = runtime.computeDirectives(baseStyle);

    // Low-confidence-builder in rapport-building should get high empathy
    expect(directives.empathyLevel).toBe("high");
    expect(directives.warmthLevel).toBe("high");
  });
});

/**
 * ======================
 * ARCHETYPE DETECTION TESTS (5)
 * ======================
 */
describe("EQ Runtime - Archetype Detection", () => {
  test("7. Should detect low-confidence-builder archetype", () => {
    const runtime = new EQRuntime();
    runtime.updateFromStudentMessage("I'm not smart enough for this college");

    expect(runtime.getState().archetype).toBe("low-confidence-builder");
  });

  test("8. Should detect high-achiever-anxious archetype", () => {
    const runtime = new EQRuntime();
    runtime.updateFromStudentMessage("I need to get into Stanford, I'm panicking");

    expect(runtime.getState().archetype).toBe("high-achiever-anxious");
  });

  test("9. Should detect overconfident-spiky archetype", () => {
    const runtime = new EQRuntime();
    runtime.updateFromStudentMessage("I already know all this, I'm way ahead");

    expect(runtime.getState().archetype).toBe("overconfident-spiky");
  });

  test("10. Should detect late-starter archetype", () => {
    const runtime = new EQRuntime();
    runtime.updateFromStudentMessage("I'm starting late and need to catch up");

    expect(runtime.getState().archetype).toBe("late-starter");
  });

  test("11. Should detect underdog-high-ceiling archetype", () => {
    const runtime = new EQRuntime();
    runtime.updateFromStudentMessage("I'm first generation and proving them wrong");

    expect(runtime.getState().archetype).toBe("underdog-high-ceiling");
  });
});

/**
 * ======================
 * STAGE PROGRESSION TESTS (6)
 * ======================
 */
describe("EQ Runtime - Stage Progression", () => {
  test("12. Should advance from rapport-building to diagnostic-probing", () => {
    const runtime = new EQRuntime();

    runtime.updateFromStudentMessage("Hi");
    expect(runtime.getState().stage).toBe("rapport-building");

    runtime.updateFromStudentMessage("Here are my grades and activities");
    expect(runtime.getState().stage).toBe("diagnostic-probing");
  });

  test("13. Should advance from diagnostic-probing to analysis", () => {
    const runtime = new EQRuntime();

    // Fast-forward to diagnostic-probing
    runtime.updateFromStudentMessage("Hi");
    runtime.updateFromStudentMessage("Here's my profile");

    expect(runtime.getState().stage).toBe("diagnostic-probing");

    runtime.updateFromStudentMessage("So what does this mean for my chances?");
    expect(runtime.getState().stage).toBe("analysis");
  });

  test("14. Should advance from analysis to strategy-reveal", () => {
    const runtime = new EQRuntime();

    // Fast-forward to analysis
    runtime.updateFromStudentMessage("Hi");
    runtime.updateFromStudentMessage("My profile");
    runtime.updateFromStudentMessage("What does this mean?");

    expect(runtime.getState().stage).toBe("analysis");

    runtime.updateFromStudentMessage("What should I do about this?");
    expect(runtime.getState().stage).toBe("strategy-reveal");
  });

  test("15. Should advance from strategy-reveal to motivation", () => {
    const runtime = new EQRuntime();

    // Fast-forward to strategy-reveal
    runtime.updateFromStudentMessage("Hi");
    runtime.updateFromStudentMessage("My profile");
    runtime.updateFromStudentMessage("What does this mean?");
    runtime.updateFromStudentMessage("What's the plan?");

    expect(runtime.getState().stage).toBe("strategy-reveal");

    runtime.updateFromStudentMessage("Okay, that makes sense");
    expect(runtime.getState().stage).toBe("motivation");
  });

  test("16. Should advance from motivation to closing", () => {
    const runtime = new EQRuntime();

    // Fast-forward to motivation
    runtime.updateFromStudentMessage("Hi");
    runtime.updateFromStudentMessage("My profile");
    runtime.updateFromStudentMessage("What does this mean?");
    runtime.updateFromStudentMessage("What's the plan?");
    runtime.updateFromStudentMessage("Got it");

    expect(runtime.getState().stage).toBe("motivation");

    runtime.updateFromStudentMessage("Thank you, this helps a lot");
    expect(runtime.getState().stage).toBe("closing");
  });

  test("17. Should stay in closing stage", () => {
    const runtime = new EQRuntime();

    // Fast-forward to closing
    runtime.updateFromStudentMessage("Hi");
    runtime.updateFromStudentMessage("My profile");
    runtime.updateFromStudentMessage("What does this mean?");
    runtime.updateFromStudentMessage("What's the plan?");
    runtime.updateFromStudentMessage("Got it");
    runtime.updateFromStudentMessage("Thanks");

    expect(runtime.getState().stage).toBe("closing");

    runtime.updateFromStudentMessage("Anything else?");
    expect(runtime.getState().stage).toBe("closing");
  });
});

/**
 * ======================
 * EQ CURVE INTEGRATION TESTS (5)
 * ======================
 */
describe("EQ Runtime - EQ Curve Integration", () => {
  test("18. Should apply high anxiety override in analysis stage", () => {
    const runtime = new EQRuntime();

    // Get to analysis stage with high anxiety
    runtime.updateFromStudentMessage("Hi");
    runtime.updateFromStudentMessage("My grades and activities");
    runtime.updateFromStudentMessage("So what does this mean, idk, I'm freaking out");

    const directives = runtime.computeDirectives(baseStyle);

    // High anxiety should override stage settings
    expect(directives.warmthLevel).toBe("high");
    expect(directives.empathyLevel).toBe("high");
    expect(directives.firmnessLevel).toBe("low");
    expect(directives.paceLevel).toBe("slow");
  });

  test("19. Should apply archetype modulation on top of stage", () => {
    const runtime = new EQRuntime();

    // Get overconfident student to analysis stage
    runtime.updateFromStudentMessage("Hi");
    runtime.updateFromStudentMessage("I already know I'm ahead of everyone, my profile is strong");
    runtime.updateFromStudentMessage("So what does this mean for my chances?");

    const directives = runtime.computeDirectives(baseStyle);

    // Analysis stage + overconfident archetype = high firmness
    expect(directives.firmnessLevel).toBe("high");
    expect(directives.intensityLevel).toBe("high");
  });

  test("20. Should apply confidence modulation for low confidence", () => {
    const runtime = new EQRuntime();

    runtime.updateFromStudentMessage("I'm lost and overwhelmed");
    runtime.updateFromStudentMessage("I don't know if I can do this");

    const directives = runtime.computeDirectives(baseStyle);

    // Low confidence should boost empathy
    expect(directives.empathyLevel).toBe("high");
    expect(directives.firmnessLevel).toBe("low");
  });

  test("21. Should apply confidence modulation for high confidence", () => {
    const runtime = new EQRuntime();

    runtime.updateFromStudentMessage("I got this, feeling confident");
    runtime.updateFromStudentMessage("This is easy");

    // Navigate to analysis where we can push harder
    runtime.updateFromStudentMessage("What does my profile look like?");

    const directives = runtime.computeDirectives(baseStyle);

    // High confidence in analysis = can push harder
    expect(directives.firmnessLevel).toBe("high");
    expect(directives.intensityLevel).toBe("high");
  });

  test("22. Should create emotional arc across session stages", () => {
    const runtime = new EQRuntime();

    // Opening/rapport: warm and slow
    runtime.updateFromStudentMessage("Hi there");
    const opening = runtime.computeDirectives(baseStyle);
    expect(opening.warmthLevel).toBe("high");
    expect(opening.paceLevel).toBe("slow");

    // Analysis: firm and fast
    runtime.updateFromStudentMessage("My grades and SAT scores");
    runtime.updateFromStudentMessage("So what does this mean for my college chances?");
    const analysis = runtime.computeDirectives(baseStyle);
    expect(analysis.firmnessLevel).toBe("high");
    expect(analysis.paceLevel).toBe("fast");

    // Closing: warm and slow again
    runtime.updateFromStudentMessage("What should I do to improve?");
    runtime.updateFromStudentMessage("Okay, that makes sense");
    runtime.updateFromStudentMessage("Thank you so much for the help");
    const closing = runtime.computeDirectives(baseStyle);
    expect(closing.warmthLevel).toBe("high");
    expect(closing.paceLevel).toBe("slow");
  });
});

/**
 * ======================
 * STATE MANAGEMENT TESTS (4)
 * ======================
 */
describe("EQ Runtime - State Management", () => {
  test("23. Should track message count in stage", () => {
    const runtime = new EQRuntime();

    expect(runtime.getState().messageCountInStage).toBe(0);

    runtime.updateFromStudentMessage("Hi");
    expect(runtime.getState().messageCountInStage).toBe(0); // Stage changed, resets to 0

    runtime.updateFromStudentMessage("Tell me more");
    expect(runtime.getState().messageCountInStage).toBe(1); // Stage didn't change, increments

    runtime.updateFromStudentMessage("And what else?");
    expect(runtime.getState().messageCountInStage).toBe(2);
  });

  test("24. Should track total message count", () => {
    const runtime = new EQRuntime();

    expect(runtime.getState().totalMessages).toBe(0);

    runtime.updateFromStudentMessage("Message 1");
    expect(runtime.getState().totalMessages).toBe(1);

    runtime.updateFromStudentMessage("Message 2");
    expect(runtime.getState().totalMessages).toBe(2);

    runtime.updateFromStudentMessage("Message 3");
    expect(runtime.getState().totalMessages).toBe(3);
  });

  test("25. Should track confidence history", () => {
    const runtime = new EQRuntime();

    runtime.updateFromStudentMessage("I'm lost");
    runtime.updateFromStudentMessage("I think I can do it");
    runtime.updateFromStudentMessage("I got this");

    const state = runtime.getState();
    expect(state.confidenceHistory.length).toBe(3);
    expect(state.confidenceHistory.length).toBeGreaterThan(0);
  });

  test("26. Should reset state correctly", () => {
    const runtime = new EQRuntime();

    // Build up some state
    runtime.updateFromStudentMessage("I'm not good at this");
    runtime.updateFromStudentMessage("My grades are low");
    runtime.updateFromStudentMessage("What should I do?");

    expect(runtime.getState().totalMessages).toBeGreaterThan(0);
    expect(runtime.getState().stage).not.toBe("opening");

    // Reset
    runtime.reset();

    const state = runtime.getState();
    expect(state.archetype).toBe("unknown");
    expect(state.stage).toBe("opening");
    expect(state.anxietyLevel).toBe("medium");
    expect(state.confidenceSignal).toBe(0);
    expect(state.totalMessages).toBe(0);
    expect(state.confidenceHistory).toHaveLength(0);
  });
});

/**
 * ======================
 * STYLE OVERLAY TESTS (4)
 * ======================
 */
describe("EQ Runtime - Style Overlay", () => {
  test("27. Should build style overlay with all directives", () => {
    const directives: StyleDirectives = {
      warmthLevel: "high",
      empathyLevel: "medium",
      firmnessLevel: "low",
      cheerLevel: "high",
      paceLevel: "slow",
      intensityLevel: "medium"
    };

    const overlay = buildStyleOverlay(directives);

    expect(overlay).toContain("Warmth: high");
    expect(overlay).toContain("Empathy: medium");
    expect(overlay).toContain("Firmness: low");
    expect(overlay).toContain("Cheer: high");
    expect(overlay).toContain("Pace: slow");
    expect(overlay).toContain("Intensity: medium");
  });

  test("28. Should include guidance for warmth levels", () => {
    const high = buildStyleOverlay({ ...baseStyle, warmthLevel: "high" });
    expect(high).toContain("very warm");

    const medium = buildStyleOverlay({ ...baseStyle, warmthLevel: "medium" });
    expect(medium).toContain("moderately warm");

    const low = buildStyleOverlay({ ...baseStyle, warmthLevel: "low" });
    expect(low).toContain("neutral");
  });

  test("29. Should include guidance for empathy levels", () => {
    const high = buildStyleOverlay({ ...baseStyle, empathyLevel: "high" });
    expect(high).toContain("deep understanding");

    const medium = buildStyleOverlay({ ...baseStyle, empathyLevel: "medium" });
    expect(medium).toContain("Acknowledge emotions");

    const low = buildStyleOverlay({ ...baseStyle, empathyLevel: "low" });
    expect(low).toContain("facts and actions");
  });

  test("30. Should include guidance for pace levels", () => {
    const slow = buildStyleOverlay({ ...baseStyle, paceLevel: "slow" });
    expect(slow).toContain("Take your time");

    const normal = buildStyleOverlay({ ...baseStyle, paceLevel: "normal" });
    expect(normal).toContain("natural conversational");

    const fast = buildStyleOverlay({ ...baseStyle, paceLevel: "fast" });
    expect(fast).toContain("concise and energetic");
  });
});

/**
 * ======================
 * INTEGRATION SCENARIO TESTS (3)
 * ======================
 */
describe("EQ Runtime - Full Conversation Scenarios", () => {
  test("31. Low-confidence student full journey", () => {
    const runtime = new EQRuntime();

    // Opening: establish safety
    runtime.updateFromStudentMessage("Hi, I'm worried about college");
    let directives = runtime.computeDirectives(baseStyle);
    expect(directives.warmthLevel).toBe("high");
    expect(directives.empathyLevel).toBe("high");

    // Share vulnerability
    runtime.updateFromStudentMessage("I feel like I'm not smart enough, here's my profile");
    expect(runtime.getState().archetype).toBe("low-confidence-builder");
    directives = runtime.computeDirectives(baseStyle);
    expect(directives.empathyLevel).toBe("high");
    expect(directives.firmnessLevel).toBe("low");

    // Analysis: gentle reality check
    runtime.updateFromStudentMessage("So what does this mean? Am I even competitive?");
    directives = runtime.computeDirectives(baseStyle);
    expect(runtime.getState().stage).toBe("analysis");
    // Should still be gentle for low-confidence student
    expect(directives.firmnessLevel).not.toBe("high");
  });

  test("32. Overconfident student reality check journey", () => {
    const runtime = new EQRuntime();

    runtime.updateFromStudentMessage("I already know I'm ahead of everyone");
    expect(runtime.getState().archetype).toBe("overconfident-spiky");

    runtime.updateFromStudentMessage("My profile is probably perfect, here's my grades");
    runtime.updateFromStudentMessage("So what does this mean? Where do I actually stand?");

    const directives = runtime.computeDirectives(baseStyle);

    // In analysis with overconfident student = reality check mode
    expect(runtime.getState().stage).toBe("analysis");
    expect(directives.firmnessLevel).toBe("high");
    expect(directives.empathyLevel).not.toBe("high");
  });

  test("33. High-achiever-anxious from panic to grounding", () => {
    const runtime = new EQRuntime();

    // Panic state
    runtime.updateFromStudentMessage("I need to get into MIT, I'm panicking");
    expect(runtime.getState().archetype).toBe("high-achiever-anxious");
    expect(runtime.getState().anxietyLevel).toBe("high");

    let directives = runtime.computeDirectives(baseStyle);
    expect(directives.empathyLevel).toBe("high");
    expect(directives.firmnessLevel).toBe("low");
    expect(directives.paceLevel).toBe("slow");

    // After some grounding, anxiety reduces (or stays at default medium)
    runtime.updateFromStudentMessage("Okay, that makes sense, I'm feeling better");
    // Anxiety should be medium or low, not high
    const anxietyAfterGrounding = runtime.getState().anxietyLevel;
    expect(anxietyAfterGrounding).not.toBe("high");

    runtime.updateFromStudentMessage("I'm ready now, this is easy to handle");
    expect(runtime.getState().anxietyLevel).toBe("low");

    directives = runtime.computeDirectives(baseStyle);
    // Can now be more directive
    expect(directives.firmnessLevel).not.toBe("low");
  });
});
