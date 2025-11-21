/**
 * EQ Curve Engine Comprehensive Tests
 *
 * Tests the dynamic emotional intelligence curve that makes
 * the agent flow like real Jenny instead of staying flat.
 */

import { computeDynamicEQCurve, getCurveSummary, EQCurveParams } from "../eqCurveEngine";
import { StyleDirectives } from "../styleMixer";
import {
  getStageOrder,
  getNextStage,
  getPreviousStage,
  getStageProgress,
  isEarlyStage,
  isMiddleStage,
  isLateStage,
  estimateStageFromTime
} from "../sessionStageModel";
import {
  getArchetypeEQNeeds,
  detectArchetypeFromSignals,
  getArchetypeCoachingTips,
  compareArchetypes
} from "../archetypeModel";

/**
 * Base style (neutral starting point)
 */
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
 * SESSION STAGE MODEL TESTS (8)
 * ======================
 */
describe("Session Stage Model", () => {
  test("1. Should have 7 stages in correct order", () => {
    const order = getStageOrder();

    expect(order).toHaveLength(7);
    expect(order[0]).toBe("opening");
    expect(order[order.length - 1]).toBe("closing");
  });

  test("2. Should get next stage correctly", () => {
    expect(getNextStage("opening")).toBe("rapport-building");
    expect(getNextStage("motivation")).toBe("closing");
    expect(getNextStage("closing")).toBe(null);
  });

  test("3. Should get previous stage correctly", () => {
    expect(getPreviousStage("closing")).toBe("motivation");
    expect(getPreviousStage("rapport-building")).toBe("opening");
    expect(getPreviousStage("opening")).toBe(null);
  });

  test("4. Should calculate stage progress correctly", () => {
    expect(getStageProgress("opening")).toBe(0);
    expect(getStageProgress("closing")).toBe(1);
    expect(getStageProgress("analysis")).toBeGreaterThan(0);
    expect(getStageProgress("analysis")).toBeLessThan(1);
  });

  test("5. Should identify early stages", () => {
    expect(isEarlyStage("opening")).toBe(true);
    expect(isEarlyStage("rapport-building")).toBe(true);
    expect(isEarlyStage("analysis")).toBe(false);
  });

  test("6. Should identify middle stages", () => {
    expect(isMiddleStage("diagnostic-probing")).toBe(true);
    expect(isMiddleStage("analysis")).toBe(true);
    expect(isMiddleStage("strategy-reveal")).toBe(true);
    expect(isMiddleStage("opening")).toBe(false);
  });

  test("7. Should identify late stages", () => {
    expect(isLateStage("motivation")).toBe(true);
    expect(isLateStage("closing")).toBe(true);
    expect(isLateStage("opening")).toBe(false);
  });

  test("8. Should estimate stage from elapsed time", () => {
    expect(estimateStageFromTime(2)).toBe("opening"); // 0-5 min
    expect(estimateStageFromTime(10)).toBe("rapport-building"); // 5-15 min
    expect(estimateStageFromTime(60)).toBe("closing"); // Beyond 60 min
  });
});

/**
 * ======================
 * ARCHETYPE MODEL TESTS (6)
 * ======================
 */
describe("Archetype Model", () => {
  test("9. Should get archetype EQ needs", () => {
    const needs = getArchetypeEQNeeds("low-confidence-builder");

    expect(needs.warmth).toBe("high");
    expect(needs.empathy).toBe("high");
    expect(needs.firmness).toBe("low");
    expect(needs.cheer).toBe("high");
  });

  test("10. Should detect overconfident archetype from signals", () => {
    const archetype = detectArchetypeFromSignals({
      confidenceLevel: 8,
      anxietyLevel: "low",
      resistanceSignals: 7,
      motivationLevel: "high",
      performanceGap: "on-track"
    });

    expect(archetype).toBe("overconfident-spiky");
  });

  test("11. Should detect high-achiever-anxious from signals", () => {
    const archetype = detectArchetypeFromSignals({
      confidenceLevel: 3,
      anxietyLevel: "high",
      resistanceSignals: 2,
      motivationLevel: "high",
      performanceGap: "ahead"
    });

    expect(archetype).toBe("high-achiever-anxious");
  });

  test("12. Should detect low-confidence-builder from signals", () => {
    const archetype = detectArchetypeFromSignals({
      confidenceLevel: -5,
      anxietyLevel: "medium",
      resistanceSignals: 0,
      motivationLevel: "medium",
      performanceGap: "on-track"
    });

    expect(archetype).toBe("low-confidence-builder");
  });

  test("13. Should get archetype coaching tips", () => {
    const tips = getArchetypeCoachingTips("overconfident-spiky");

    expect(tips.length).toBeGreaterThan(0);
    expect(tips.some(tip => tip.toLowerCase().includes("reality"))).toBe(true);
  });

  test("14. Should compare archetypes correctly", () => {
    const sameDiff = compareArchetypes("low-confidence-builder", "low-confidence-builder");
    const totalDiff = compareArchetypes("low-confidence-builder", "overconfident-spiky");

    expect(sameDiff).toBe(0);
    expect(totalDiff).toBeGreaterThan(0.5); // Very different
  });
});

/**
 * ======================
 * STAGE MODULATION TESTS (7)
 * ======================
 */
describe("Stage Modulation", () => {
  test("15. Opening stage should be warm and slow", () => {
    const params: EQCurveParams = {
      stage: "opening",
      archetype: "high-achiever-anxious",
      anxietyLevel: "medium",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.empathyLevel).toBe("high");
    expect(adjusted.paceLevel).toBe("slow");
  });

  test("16. Analysis stage should be firm and fast", () => {
    const params: EQCurveParams = {
      stage: "analysis",
      archetype: "high-achiever-anxious",
      anxietyLevel: "low",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.firmnessLevel).toBe("high");
    expect(adjusted.intensityLevel).toBe("high");
    expect(adjusted.paceLevel).toBe("fast");
  });

  test("17. Motivation stage should be warm, cheerful, and empathetic", () => {
    const params: EQCurveParams = {
      stage: "motivation",
      archetype: "late-starter",
      anxietyLevel: "medium",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.cheerLevel).toBe("high");
    expect(adjusted.empathyLevel).toBe("high");
  });

  test("18. Strategy-reveal stage should be moderately cheerful", () => {
    const params: EQCurveParams = {
      stage: "strategy-reveal",
      archetype: "underdog-high-ceiling",
      anxietyLevel: "low",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.cheerLevel).toBe("high");
  });

  test("19. Diagnostic-probing stage should have medium firmness", () => {
    const params: EQCurveParams = {
      stage: "diagnostic-probing",
      archetype: "late-starter",
      anxietyLevel: "medium",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.firmnessLevel).toBe("medium");
  });

  test("20. Rapport-building stage should be warm", () => {
    const params: EQCurveParams = {
      stage: "rapport-building",
      archetype: "high-achiever-anxious",
      anxietyLevel: "low",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.empathyLevel).toBe("high");
  });

  test("21. Closing stage should be warm and slow", () => {
    const params: EQCurveParams = {
      stage: "closing",
      archetype: "low-confidence-builder",
      anxietyLevel: "low",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.paceLevel).toBe("slow");
  });
});

/**
 * ======================
 * ARCHETYPE MODULATION TESTS (5)
 * ======================
 */
describe("Archetype Modulation", () => {
  test("22. Low-confidence-builder should receive high empathy and cheer", () => {
    const params: EQCurveParams = {
      stage: "diagnostic-probing",
      archetype: "low-confidence-builder",
      anxietyLevel: "medium",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.empathyLevel).toBe("high");
    expect(adjusted.cheerLevel).toBe("high");
    expect(adjusted.firmnessLevel).toBe("low");
  });

  test("23. Overconfident-spiky should receive high firmness", () => {
    const params: EQCurveParams = {
      stage: "analysis",
      archetype: "overconfident-spiky",
      anxietyLevel: "low",
      confidenceSignals: 8
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.firmnessLevel).toBe("high");
    expect(adjusted.intensityLevel).toBe("high");
    expect(adjusted.empathyLevel).toBe("low");
  });

  test("24. High-achiever-anxious should receive high empathy", () => {
    const params: EQCurveParams = {
      stage: "rapport-building",
      archetype: "high-achiever-anxious",
      anxietyLevel: "high",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.empathyLevel).toBe("high");
    expect(adjusted.warmthLevel).toBe("high");
  });

  test("25. Late-starter should have medium firmness and high warmth", () => {
    const params: EQCurveParams = {
      stage: "strategy-reveal",
      archetype: "late-starter",
      anxietyLevel: "medium",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.firmnessLevel).toBe("medium");
  });

  test("26. Underdog-high-ceiling should have high firmness and high warmth", () => {
    const params: EQCurveParams = {
      stage: "motivation",
      archetype: "underdog-high-ceiling",
      anxietyLevel: "low",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.firmnessLevel).toBe("high");
    expect(adjusted.cheerLevel).toBe("high");
  });
});

/**
 * ======================
 * ANXIETY MODULATION TESTS (3)
 * ======================
 */
describe("Anxiety Modulation", () => {
  test("27. High anxiety should trigger max warmth and slow pace", () => {
    const params: EQCurveParams = {
      stage: "analysis",
      archetype: "high-achiever-anxious",
      anxietyLevel: "high",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.empathyLevel).toBe("high");
    expect(adjusted.firmnessLevel).toBe("low");
    expect(adjusted.paceLevel).toBe("slow");
  });

  test("28. Medium anxiety should elevate empathy", () => {
    const params: EQCurveParams = {
      stage: "diagnostic-probing",
      archetype: "late-starter",
      anxietyLevel: "medium",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    // Medium empathy from stage, elevated to high by medium anxiety
    expect(adjusted.empathyLevel).toBe("high");
  });

  test("29. Low anxiety should not override other modulations", () => {
    const params: EQCurveParams = {
      stage: "analysis",
      archetype: "overconfident-spiky",
      anxietyLevel: "low",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    // Should maintain analysis stage firmness
    expect(adjusted.firmnessLevel).toBe("high");
  });
});

/**
 * ======================
 * CONFIDENCE MODULATION TESTS (3)
 * ======================
 */
describe("Confidence Modulation", () => {
  test("30. Very low confidence (<-5) should boost empathy and cheer", () => {
    const params: EQCurveParams = {
      stage: "diagnostic-probing",
      archetype: "late-starter",
      anxietyLevel: "medium",
      confidenceSignals: -7
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.empathyLevel).toBe("high");
    expect(adjusted.firmnessLevel).toBe("low");
  });

  test("31. High confidence (>5) should allow higher firmness", () => {
    const params: EQCurveParams = {
      stage: "analysis",
      archetype: "overconfident-spiky",
      anxietyLevel: "low",
      confidenceSignals: 8
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.firmnessLevel).toBe("high");
    expect(adjusted.intensityLevel).toBe("high");
  });

  test("32. Balanced confidence should not trigger special modulation", () => {
    const params: EQCurveParams = {
      stage: "rapport-building",
      archetype: "high-achiever-anxious",
      anxietyLevel: "medium",
      confidenceSignals: 0
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    // Should reflect stage + archetype without confidence boost
    expect(adjusted.warmthLevel).toBe("high");
  });
});

/**
 * ======================
 * INTEGRATION TESTS (3)
 * ======================
 */
describe("Integration", () => {
  test("33. Multiple modulations should layer correctly", () => {
    // Opening stage + low-confidence archetype + high anxiety = max support
    const params: EQCurveParams = {
      stage: "opening",
      archetype: "low-confidence-builder",
      anxietyLevel: "high",
      confidenceSignals: -8
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    expect(adjusted.warmthLevel).toBe("high");
    expect(adjusted.empathyLevel).toBe("high");
    expect(adjusted.firmnessLevel).toBe("low");
    expect(adjusted.paceLevel).toBe("slow");
  });

  test("34. Curve should create emotional arc across stages", () => {
    const archetype = "high-achiever-anxious";
    const anxietyLevel = "medium";
    const confidenceSignals = 0;

    const opening = computeDynamicEQCurve(baseStyle, {
      stage: "opening",
      archetype,
      anxietyLevel,
      confidenceSignals
    });

    const analysis = computeDynamicEQCurve(baseStyle, {
      stage: "analysis",
      archetype,
      anxietyLevel,
      confidenceSignals
    });

    const closing = computeDynamicEQCurve(baseStyle, {
      stage: "closing",
      archetype,
      anxietyLevel,
      confidenceSignals
    });

    // Opening should be warmer than analysis
    expect(opening.warmthLevel).not.toBe(analysis.warmthLevel);

    // Analysis should be firmer than opening
    expect(analysis.firmnessLevel).toBe("high");

    // Closing should be warm again
    expect(closing.warmthLevel).toBe("high");
  });

  test("35. Should generate curve summary", () => {
    const params: EQCurveParams = {
      stage: "analysis",
      archetype: "overconfident-spiky",
      anxietyLevel: "low",
      confidenceSignals: 8
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);
    const summary = getCurveSummary(baseStyle, adjusted, params);

    expect(summary).toContain("stage=analysis");
    expect(summary).toContain("archetype=overconfident-spiky");
    expect(summary.length).toBeGreaterThan(0);
  });
});

/**
 * ======================
 * EDGE CASES (2)
 * ======================
 */
describe("Edge Cases", () => {
  test("36. Should handle extreme confidence signals", () => {
    const veryLow = computeDynamicEQCurve(baseStyle, {
      stage: "diagnostic-probing",
      archetype: "low-confidence-builder",
      anxietyLevel: "low",
      confidenceSignals: -10
    });

    const veryHigh = computeDynamicEQCurve(baseStyle, {
      stage: "analysis",
      archetype: "overconfident-spiky",
      anxietyLevel: "low",
      confidenceSignals: 10
    });

    expect(veryLow.empathyLevel).toBe("high");
    expect(veryHigh.firmnessLevel).toBe("high");
  });

  test("37. Should always return valid directive levels", () => {
    const params: EQCurveParams = {
      stage: "opening",
      archetype: "underdog-high-ceiling",
      anxietyLevel: "high",
      confidenceSignals: -5
    };

    const adjusted = computeDynamicEQCurve(baseStyle, params);

    const validLevels = ["low", "medium", "high"];
    const validPace = ["slow", "normal", "fast"];

    expect(validLevels).toContain(adjusted.warmthLevel);
    expect(validLevels).toContain(adjusted.empathyLevel);
    expect(validLevels).toContain(adjusted.firmnessLevel);
    expect(validLevels).toContain(adjusted.cheerLevel);
    expect(validPace).toContain(adjusted.paceLevel);
    expect(validLevels).toContain(adjusted.intensityLevel);
  });
});
