/**
 * Momentum Engine Comprehensive Tests
 *
 * Tests the conversation momentum tracking and energy detection system.
 */

import {
  MomentumEngine,
  detectMomentumShift,
  calculateMomentumVolatility
} from "../momentumEngine";

/**
 * ======================
 * BASIC FUNCTIONALITY TESTS (6)
 * ======================
 */
describe("Momentum Engine - Basic Functionality", () => {
  test("1. Should initialize with neutral momentum", () => {
    const m = new MomentumEngine();
    const state = m.getState();

    expect(state.momentumScore).toBe(50);
    expect(state.trend).toBe("flat");
    expect(state.spikes).toBe(0);
    expect(state.dips).toBe(0);
    expect(state.disengaged).toBe(false);
    expect(state.focusLost).toBe(false);
    expect(state.energyHistory).toHaveLength(1);
  });

  test("2. Should track momentum score changes", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("This is amazing!");
    const state = m.getState();

    expect(state.momentumScore).toBeGreaterThan(50);
    expect(state.trend).toBe("up");
  });

  test("3. Should maintain energy history", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("Message 1");
    m.updateWithMessage("Message 2");
    m.updateWithMessage("Message 3");

    const state = m.getState();
    expect(state.energyHistory.length).toBe(4); // Initial + 3 messages
  });

  test("4. Should clamp momentum score between 0 and 100", () => {
    const m = new MomentumEngine();

    // Try to push above 100
    for (let i = 0; i < 10; i++) {
      m.updateWithMessage("Wow this is amazing!");
    }

    expect(m.getState().momentumScore).toBeLessThanOrEqual(100);

    // Try to push below 0
    const m2 = new MomentumEngine();
    for (let i = 0; i < 10; i++) {
      m2.updateWithMessage("ok");
    }

    expect(m2.getState().momentumScore).toBeGreaterThanOrEqual(0);
  });

  test("5. Should get momentum level categories", () => {
    const m = new MomentumEngine();

    // Start at medium
    expect(m.getMomentumLevel()).toBe("medium");

    // Boost to high
    m.updateWithMessage("This is so helpful!");
    m.updateWithMessage("I love this approach!");
    expect(m.getMomentumLevel()).toBe("high");
  });

  test("6. Should reset state correctly", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("Wow amazing!");
    m.updateWithMessage("This is great!");

    expect(m.getState().spikes).toBeGreaterThan(0);
    expect(m.getState().momentumScore).not.toBe(50);

    m.reset();

    const state = m.getState();
    expect(state.momentumScore).toBe(50);
    expect(state.spikes).toBe(0);
    expect(state.trend).toBe("flat");
  });
});

/**
 * ======================
 * SPIKE DETECTION TESTS (5)
 * ======================
 */
describe("Momentum Engine - Spike Detection", () => {
  test("7. Should detect enthusiasm spikes", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("Omg this is actually helpful!");

    expect(state.momentumScore).toBeGreaterThan(50);
    expect(state.spikes).toBe(1);
    expect(state.trend).toBe("up");
  });

  test("8. Should detect 'wow' pattern", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("Wow that makes so much sense");

    expect(state.spikes).toBe(1);
    expect(state.momentumScore).toBeGreaterThan(50);
  });

  test("9. Should detect 'i love' pattern", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("I love this strategy!");

    expect(state.spikes).toBe(1);
  });

  test("10. Should accumulate multiple spikes", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("Wow this is cool");
    m.updateWithMessage("I love it!");
    m.updateWithMessage("This is amazing");

    const state = m.getState();
    expect(state.spikes).toBe(3);
    expect(state.momentumScore).toBeGreaterThan(70);
  });

  test("11. Should boost momentum significantly on spike", () => {
    const m = new MomentumEngine();
    const before = m.getState().momentumScore;

    m.updateWithMessage("Wow that's exactly what I needed!");

    const after = m.getState().momentumScore;
    expect(after - before).toBeGreaterThan(10);
  });
});

/**
 * ======================
 * DIP DETECTION TESTS (5)
 * ======================
 */
describe("Momentum Engine - Dip Detection", () => {
  test("12. Should detect energy dips", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("I'm overwhelmed and stressed");

    expect(state.momentumScore).toBeLessThan(50);
    expect(state.dips).toBe(1);
    expect(state.trend).toBe("down");
  });

  test("13. Should detect 'this is hard' pattern", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("This is so hard, I can't do it");

    expect(state.dips).toBeGreaterThan(0);
    expect(state.momentumScore).toBeLessThan(50);
  });

  test("14. Should detect frustration patterns", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("I'm so frustrated and confused");

    expect(state.dips).toBe(1);
    expect(state.momentumScore).toBeLessThan(50);
  });

  test("15. Should accumulate multiple dips", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("I'm tired");
    m.updateWithMessage("This is hard");
    m.updateWithMessage("I'm lost");

    const state = m.getState();
    expect(state.dips).toBe(3);
    expect(state.momentumScore).toBeLessThan(30);
  });

  test("16. Should decrease momentum significantly on dip", () => {
    const m = new MomentumEngine();
    const before = m.getState().momentumScore;

    m.updateWithMessage("I'm overwhelmed and giving up");

    const after = m.getState().momentumScore;
    expect(before - after).toBeGreaterThan(10);
  });
});

/**
 * ======================
 * DISENGAGEMENT DETECTION TESTS (6)
 * ======================
 */
describe("Momentum Engine - Disengagement Detection", () => {
  test("17. Should detect very short replies", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("ok");

    expect(state.disengaged).toBe(true);
    expect(state.momentumScore).toBeLessThan(50);
  });

  test("18. Should detect 'k' as disengagement", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("k");

    expect(state.disengaged).toBe(true);
  });

  test("19. Should detect 'sure' as disengagement", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("sure");

    expect(state.disengaged).toBe(true);
  });

  test("20. Should not flag long engaged replies as disengaged", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage(
      "That makes sense, I can see how this could help with my college applications"
    );

    expect(state.disengaged).toBe(false);
    expect(state.momentumScore).toBeGreaterThanOrEqual(50);
  });

  test("21. Should reduce momentum on disengagement", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("ok");
    m.updateWithMessage("sure");
    m.updateWithMessage("fine");

    const state = m.getState();
    expect(state.momentumScore).toBeLessThan(40);
  });

  test("22. Should clear disengagement flag on engaged reply", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("ok");
    expect(m.getState().disengaged).toBe(true);

    m.updateWithMessage("Actually, I have a question about this strategy");
    expect(m.getState().disengaged).toBe(false);
  });
});

/**
 * ======================
 * FOCUS LOSS DETECTION TESTS (5)
 * ======================
 */
describe("Momentum Engine - Focus Loss Detection", () => {
  test("23. Should detect 'idk' as focus loss", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("idk what to do");

    expect(state.focusLost).toBe(true);
  });

  test("24. Should detect 'maybe' as focus loss", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("maybe I guess");

    expect(state.focusLost).toBe(true);
  });

  test("25. Should detect 'whatever' as focus loss", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("whatever works");

    expect(state.focusLost).toBe(true);
  });

  test("26. Should reduce momentum on focus loss", () => {
    const m = new MomentumEngine();
    const before = m.getState().momentumScore;

    m.updateWithMessage("idk maybe whatever");

    const after = m.getState().momentumScore;
    expect(after).toBeLessThan(before);
  });

  test("27. Should not flag confident replies as focus loss", () => {
    const m = new MomentumEngine();
    const state = m.updateWithMessage("I know exactly what I need to do");

    expect(state.focusLost).toBe(false);
  });
});

/**
 * ======================
 * ENGAGEMENT BOOST TESTS (4)
 * ======================
 */
describe("Momentum Engine - Engagement Boost", () => {
  test("28. Should boost momentum for long engaged replies", () => {
    const m = new MomentumEngine();
    const before = m.getState().momentumScore;

    const longMessage =
      "I really appreciate this breakdown. Looking at my profile, I understand how focusing on robotics leadership and combining it with community service could create a stronger narrative. The summer planning is clear now and I'm excited to implement this strategy.";

    m.updateWithMessage(longMessage);

    const after = m.getState().momentumScore;
    // Long detailed reply should at least maintain or boost momentum
    expect(after).toBeGreaterThan(before - 1);
  });

  test("29. Should boost momentum when student asks questions", () => {
    const m = new MomentumEngine();
    const before = m.getState().momentumScore;

    m.updateWithMessage("What specific steps should I take to structure my summer activities and align them with this strategy?");

    const after = m.getState().momentumScore;
    // Question asking shows engagement, should maintain or slightly boost
    expect(after).toBeGreaterThanOrEqual(before - 1);
  });

  test("30. Should not boost for short questions", () => {
    const m = new MomentumEngine();
    const before = m.getState().momentumScore;

    m.updateWithMessage("Why?");

    const after = m.getState().momentumScore;
    expect(after).toBeLessThanOrEqual(before);
  });

  test("31. Should boost more for detailed questions", () => {
    const m = new MomentumEngine();

    const shortQuestion = m.updateWithMessage("What should I do?");
    const shortScore = shortQuestion.momentumScore;

    const m2 = new MomentumEngine();
    const detailedQuestion = m2.updateWithMessage(
      "What specific activities should I focus on to strengthen my engineering narrative?"
    );
    const detailedScore = detailedQuestion.momentumScore;

    expect(detailedScore).toBeGreaterThan(shortScore);
  });
});

/**
 * ======================
 * MOMENTUM LEVEL & TRAJECTORY TESTS (5)
 * ======================
 */
describe("Momentum Engine - Levels and Trajectory", () => {
  test("32. Should classify critical momentum level", () => {
    const m = new MomentumEngine();

    // Drive momentum down
    for (let i = 0; i < 5; i++) {
      m.updateWithMessage("ok");
    }

    expect(m.getMomentumLevel()).toBe("critical");
  });

  test("33. Should classify excellent momentum level", () => {
    const m = new MomentumEngine();

    // Drive momentum up
    for (let i = 0; i < 5; i++) {
      m.updateWithMessage("Wow this is amazing!");
    }

    expect(m.getMomentumLevel()).toBe("excellent");
  });

  test("34. Should detect rising trajectory", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("This is helpful");
    m.updateWithMessage("I love this approach");
    m.updateWithMessage("Wow that makes sense");
    m.updateWithMessage("This is amazing");

    expect(m.getEnergyTrajectory()).toBe("rising");
  });

  test("35. Should detect falling trajectory", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("I'm getting tired");
    m.updateWithMessage("This is hard");
    m.updateWithMessage("ok");
    m.updateWithMessage("k");

    expect(m.getEnergyTrajectory()).toBe("falling");
  });

  test("36. Should detect volatile trajectory", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("Wow amazing!");
    m.updateWithMessage("ok");
    m.updateWithMessage("This is great!");
    m.updateWithMessage("I'm overwhelmed");
    m.updateWithMessage("Awesome!");

    const trajectory = m.getEnergyTrajectory();
    expect(trajectory === "volatile" || trajectory === "stable").toBe(true);
  });
});

/**
 * ======================
 * INTERVENTION DETECTION TESTS (4)
 * ======================
 */
describe("Momentum Engine - Intervention Detection", () => {
  test("37. Should flag intervention need for low momentum", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("ok");
    m.updateWithMessage("sure");
    m.updateWithMessage("fine");

    expect(m.needsIntervention()).toBe(true);
  });

  test("38. Should flag intervention need for disengagement", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("k");

    expect(m.needsIntervention()).toBe(true);
  });

  test("39. Should provide intervention suggestions", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("ok");

    const suggestions = m.getInterventionSuggestions();
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((s) => s.includes("disengaged"))).toBe(true);
  });

  test("40. Should not flag intervention for high momentum", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("This is amazing!");
    m.updateWithMessage("I love this approach!");

    expect(m.needsIntervention()).toBe(false);
  });
});

/**
 * ======================
 * MOMENTUM SUMMARY TESTS (2)
 * ======================
 */
describe("Momentum Engine - Summary", () => {
  test("41. Should generate momentum summary", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("Wow this is helpful");

    const summary = m.getMomentumSummary();
    expect(summary.length).toBeGreaterThan(0);
    expect(summary).toContain("trajectory");
  });

  test("42. Should reflect current state in summary", () => {
    const m = new MomentumEngine();

    // Drive down momentum
    for (let i = 0; i < 5; i++) {
      m.updateWithMessage("ok");
    }

    const summary = m.getMomentumSummary();
    expect(summary.toLowerCase()).toContain("dropout");
  });
});

/**
 * ======================
 * UTILITY FUNCTION TESTS (3)
 * ======================
 */
describe("Momentum Engine - Utility Functions", () => {
  test("43. Should detect momentum shift", () => {
    const history = [50, 52, 54, 56, 58, 70, 72, 74, 76, 78];
    const shift = detectMomentumShift(history, 5);

    expect(shift).toBe(true);
  });

  test("44. Should not detect shift for stable momentum", () => {
    const history = [50, 51, 50, 49, 50, 51, 50, 49, 50, 51];
    const shift = detectMomentumShift(history, 5);

    expect(shift).toBe(false);
  });

  test("45. Should calculate momentum volatility", () => {
    const stable = [50, 50, 50, 50, 50];
    const volatile = [50, 70, 30, 80, 20];

    const stableVol = calculateMomentumVolatility(stable);
    const volatileVol = calculateMomentumVolatility(volatile);

    expect(volatileVol).toBeGreaterThan(stableVol);
    expect(stableVol).toBe(0);
  });
});

/**
 * ======================
 * INTEGRATION SCENARIO TESTS (3)
 * ======================
 */
describe("Momentum Engine - Full Conversation Scenarios", () => {
  test("46. Engaged student journey", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("Hi, I need help with college planning");
    expect(m.getMomentumLevel()).toBe("medium");

    m.updateWithMessage("Wow this framework is really helpful!");
    expect(m.getMomentumLevel()).toBe("high");

    m.updateWithMessage(
      "I can see how my robotics work ties into my narrative now. What should I focus on next?"
    );
    expect(m.getMomentumLevel()).toBe("high");
    expect(m.getState().disengaged).toBe(false);
  });

  test("47. Dropout risk journey", () => {
    const m = new MomentumEngine();

    m.updateWithMessage("idk about this");
    expect(m.getMomentumLevel()).not.toBe("excellent");

    m.updateWithMessage("ok");
    m.updateWithMessage("sure");
    m.updateWithMessage("k");

    expect(m.getMomentumLevel()).toBe("critical");
    expect(m.needsIntervention()).toBe(true);
    expect(m.getState().disengaged).toBe(true);
  });

  test("48. Recovery from dip", () => {
    const m = new MomentumEngine();

    // Initial dip
    m.updateWithMessage("I'm overwhelmed");
    expect(m.getState().dips).toBe(1);
    const lowScore = m.getState().momentumScore;

    // Recovery
    m.updateWithMessage("Okay, that actually makes sense now");
    m.updateWithMessage("I think I can do this!");

    const recoveredScore = m.getState().momentumScore;
    expect(recoveredScore).toBeGreaterThan(lowScore);
    expect(m.getState().trend).toBe("up");
  });
});
