/**
 * EQ Drift Detector Comprehensive Tests
 *
 * Tests the quality gate that prevents tone drift and ensures
 * Jenny's authentic voice remains consistent.
 */

import {
  detectEQDrift,
  DriftReport,
  mockNormalizeResponse,
  validateNormalization,
  getDriftSummary
} from "../driftDetector";
import { StyleDirectives } from "../styleMixer";

/**
 * Test style directives
 */
const highWarmthStyle: StyleDirectives = {
  warmthLevel: "high",
  firmnessLevel: "medium",
  paceLevel: "normal",
  empathyLevel: "high",
  cheerLevel: "medium",
  intensityLevel: "low"
};

const lowWarmthStyle: StyleDirectives = {
  warmthLevel: "low",
  firmnessLevel: "high",
  paceLevel: "fast",
  empathyLevel: "low",
  cheerLevel: "low",
  intensityLevel: "high"
};

const balancedStyle: StyleDirectives = {
  warmthLevel: "medium",
  firmnessLevel: "medium",
  paceLevel: "normal",
  empathyLevel: "medium",
  cheerLevel: "medium",
  intensityLevel: "medium"
};

/**
 * ======================
 * THERAPY LANGUAGE TESTS (4)
 * ======================
 */
describe("Therapy Language Detection", () => {
  test("1. Should detect trauma language", async () => {
    const response = "You may need to heal your trauma through therapy.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.some(r => r.includes("Therapy"))).toBe(true);
  });

  test("2. Should detect inner child language", async () => {
    const response = "This connects to your inner child's wounds.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.some(r => r.includes("Therapy"))).toBe(true);
  });

  test("3. Should detect healing language", async () => {
    const response = "The healing process requires emotional processing.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
  });

  test("4. Should NOT flag appropriate challenge language", async () => {
    const response = "Let's work through this challenge together.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(false);
  });
});

/**
 * ======================
 * FORMAL TONE TESTS (4)
 * ======================
 */
describe("Formal Tone Detection", () => {
  test("5. Should detect 'as per your request'", async () => {
    const response = "As per your request, here are the recommendations.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.some(r => r.includes("formal"))).toBe(true);
  });

  test("6. Should detect 'furthermore'", async () => {
    const response = "Here's the plan. Furthermore, you should consider this.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
  });

  test("7. Should detect 'dear student'", async () => {
    const response = "Dear student, please review these materials.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
  });

  test("8. Should pass conversational tone", async () => {
    const response = "Here's what I'm thinking. Let's tackle this piece first.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(false);
  });
});

/**
 * ======================
 * HYPE LANGUAGE TESTS (4)
 * ======================
 */
describe("Hype Language Detection", () => {
  test("9. Should detect 'unstoppable'", async () => {
    const response = "You are unstoppable! Nothing can hold you back!";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.some(r => r.includes("hype"))).toBe(true);
  });

  test("10. Should detect 'limitless potential'", async () => {
    const response = "You have limitless potential to achieve anything.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
  });

  test("11. Should detect 'manifest'", async () => {
    const response = "Just manifest your dreams and the universe will provide.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
  });

  test("12. Should pass grounded encouragement", async () => {
    const response = "You've got real strengths here. This is solid work.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(false);
  });
});

/**
 * ======================
 * WARMTH MISMATCH TESTS (4)
 * ======================
 */
describe("Warmth Mismatch Detection", () => {
  test("13. Should detect missing warmth when high warmth required", async () => {
    const response =
      "Here's your answer. The solution is straightforward. Follow these steps.";
    const report = await detectEQDrift(response, highWarmthStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.some(r => r.includes("warmth"))).toBe(true);
  });

  test("14. Should pass Jenny-warm opening", async () => {
    const response = "Totally hear you on this. Here's what I'm seeing.";
    const report = await detectEQDrift(response, highWarmthStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(false);
  });

  test("15. Should pass with validation phrase", async () => {
    const response = "What you're feeling is completely valid. Let's work through it.";
    const report = await detectEQDrift(response, highWarmthStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(false);
  });

  test("16. Should NOT check warmth for low warmth style", async () => {
    const response = "Here's the answer. Do this.";
    const report = await detectEQDrift(response, lowWarmthStyle, { enableNormalization: false });

    // Should pass because low warmth doesn't require warm openings
    expect(report.driftReasons.some(r => r.includes("warmth"))).toBe(false);
  });
});

/**
 * ======================
 * FIRMNESS TESTS (3)
 * ======================
 */
describe("Firmness Detection", () => {
  test("17. Should detect excessive firmness when low firmness required", async () => {
    const lowFirmnessStyle: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const response = "You must stop doing this. This is unacceptable behavior.";
    const report = await detectEQDrift(response, lowFirmnessStyle, {
      enableNormalization: false
    });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.some(r => r.includes("firmness"))).toBe(true);
  });

  test("18. Should allow firm language when high firmness required", async () => {
    const highFirmnessStyle: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "high",
      paceLevel: "normal",
      empathyLevel: "low",
      cheerLevel: "medium",
      intensityLevel: "high"
    };

    const response = "Let's be honest with ourselves here. This needs to change.";
    const report = await detectEQDrift(response, highFirmnessStyle, {
      enableNormalization: false
    });

    // Should pass - firm language is appropriate
    expect(report.driftReasons.some(r => r.includes("firmness"))).toBe(false);
  });

  test("19. Should detect harsh language inappropriately", async () => {
    const response = "You should know better than this. I'm disappointed.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(true);
  });
});

/**
 * ======================
 * GENERIC LANGUAGE TESTS (3)
 * ======================
 */
describe("Generic Language Detection (Strict Mode)", () => {
  test("20. Should detect generic AI language in strict mode", async () => {
    const response = "I'd be happy to help you with this. Feel free to reach out.";
    const report = await detectEQDrift(response, balancedStyle, {
      enableNormalization: false,
      strictMode: true
    });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.some(r => r.includes("Generic"))).toBe(true);
  });

  test("21. Should NOT detect in normal mode", async () => {
    const response = "I'd be happy to help you with this.";
    const report = await detectEQDrift(response, balancedStyle, {
      enableNormalization: false,
      strictMode: false
    });

    // In normal mode, this might pass
    expect(report.driftReasons.some(r => r.includes("Generic"))).toBe(false);
  });

  test("22. Should pass Jenny-specific language", async () => {
    const response = "Let's unpack this together. Here's what matters most.";
    const report = await detectEQDrift(response, balancedStyle, {
      enableNormalization: false,
      strictMode: true
    });

    expect(report.driftDetected).toBe(false);
  });
});

/**
 * ======================
 * SEVERITY TESTS (3)
 * ======================
 */
describe("Severity Calculation", () => {
  test("23. Should calculate minor severity for 1-2 violations", async () => {
    const response = "Furthermore, here's the plan.";
    const report = await detectEQDrift(response, balancedStyle, { enableNormalization: false });

    expect(report.severity).toBe("minor");
  });

  test("24. Should calculate major severity for 3+ violations", async () => {
    const response =
      "As per your request, furthermore, you need to heal your trauma. You are unstoppable!";
    const report = await detectEQDrift(response, highWarmthStyle, {
      enableNormalization: false
    });

    expect(report.severity).toBe("major");
    expect(report.driftReasons.length).toBeGreaterThanOrEqual(3);
  });

  test("25. Should have none severity for clean response", async () => {
    const response = "Totally hear you. Let's break this down step by step.";
    const report = await detectEQDrift(response, highWarmthStyle, { enableNormalization: false });

    expect(report.severity).toBe("none");
  });
});

/**
 * ======================
 * NORMALIZATION TESTS (4)
 * ======================
 */
describe("Response Normalization", () => {
  test("26. Should normalize therapy language", async () => {
    const original = "You need to heal your trauma.";
    const normalized = await mockNormalizeResponse(original, balancedStyle, [
      "Therapy language detected"
    ]);

    expect(normalized).not.toContain("trauma");
    expect(normalized).not.toContain("heal");
  });

  test("27. Should normalize formal language", async () => {
    const original = "As per your request, furthermore, here's the answer.";
    const normalized = await mockNormalizeResponse(original, balancedStyle, [
      "Overly formal tone"
    ]);

    expect(normalized).not.toContain("as per your request");
    expect(normalized).not.toContain("furthermore");
  });

  test("28. Should add warmth when missing", async () => {
    const original = "Here's your answer.";
    const normalized = await mockNormalizeResponse(original, highWarmthStyle, [
      "Warmth mismatch"
    ]);

    expect(normalized.length).toBeGreaterThan(original.length);
    expect(normalized).toContain("Totally hear you");
  });

  test("29. Should normalize hype language", async () => {
    const original = "You are unstoppable with limitless potential!";
    const normalized = await mockNormalizeResponse(original, balancedStyle, [
      "Excessive hype tone"
    ]);

    expect(normalized).not.toContain("unstoppable");
    expect(normalized).not.toContain("limitless");
  });
});

/**
 * ======================
 * INTEGRATION TESTS (4)
 * ======================
 */
describe("Drift Detection Integration", () => {
  test("30. Full flow: detect multiple violations", async () => {
    const response =
      "Dear student, as per your request, you need to heal your inner child. You are unstoppable!";

    const report = await detectEQDrift(response, highWarmthStyle, {
      enableNormalization: false
    });

    expect(report.driftDetected).toBe(true);
    expect(report.driftReasons.length).toBeGreaterThanOrEqual(3);
    expect(report.severity).toBe("major");

    // Check that all violation types are caught
    expect(report.driftReasons.some(r => r.includes("formal"))).toBe(true);
    expect(report.driftReasons.some(r => r.includes("Therapy"))).toBe(true);
    expect(report.driftReasons.some(r => r.includes("hype"))).toBe(true);
  });

  test("31. Should pass authentic Jenny response", async () => {
    const response = `Totally hear you on this. What you're feeling is completely valid.
    Let's break this down step by step. Here's what matters most: you're doing the right work.
    This is a great starting point. Let's keep building from here.`;

    const report = await detectEQDrift(response, highWarmthStyle, {
      enableNormalization: false
    });

    expect(report.driftDetected).toBe(false);
    expect(report.severity).toBe("none");
  });

  test("32. Should validate normalization effectiveness", async () => {
    const original = "As per your request, here's the framework.";
    const normalized = "Sure, here's the plan.";

    const validation = await validateNormalization(original, normalized, balancedStyle);

    expect(validation.isImproved).toBe(true);
    expect(validation.remainingIssues.length).toBe(0);
  });

  test("33. Should generate drift summary", async () => {
    const report: DriftReport = {
      driftDetected: true,
      driftReasons: ["Therapy language", "Overly formal"],
      normalizedResponse: "Fixed response",
      severity: "minor",
      corrections: ["Response rewritten"]
    };

    const summary = getDriftSummary(report);

    expect(summary).toContain("Drift detected");
    expect(summary).toContain("minor severity");
    expect(summary).toContain("Therapy language");
    expect(summary).toContain("Response rewritten");
  });
});

/**
 * ======================
 * EDGE CASES (3)
 * ======================
 */
describe("Edge Cases", () => {
  test("34. Should handle empty response", async () => {
    const report = await detectEQDrift("", balancedStyle, { enableNormalization: false });

    expect(report.driftDetected).toBe(false);
  });

  test("35. Should handle very short response", async () => {
    const report = await detectEQDrift("Got it.", balancedStyle, { enableNormalization: false });

    // Short responses don't need to hit all warmth requirements
    expect(report.severity).toBe("none");
  });

  test("36. Should handle response with multiple Jenny patterns", async () => {
    const response = `I'm with you. Let's unpack this together. What you're feeling makes sense.
    Here's the part that matters most: you're asking the right questions.
    Let's take this one step at a time.`;

    const report = await detectEQDrift(response, highWarmthStyle, {
      enableNormalization: false,
      strictMode: true
    });

    expect(report.driftDetected).toBe(false);
  });
});
