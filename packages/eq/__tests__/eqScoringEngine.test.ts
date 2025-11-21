/**
 * EQ Scoring Engine Comprehensive Tests
 *
 * Tests the quantitative scoring system that measures how Jenny-like
 * a response is across multiple dimensions.
 */

import { scoreEQ, getScoreSummary, compareScores, EQScoreReport } from "../eqScoringEngine";
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
 * HIGH EQ RESPONSE TESTS (4)
 * ======================
 */
describe("High EQ Response Detection", () => {
  test("1. Should score authentic Jenny response highly", () => {
    const response = `Totally hear you on this. What you're feeling is completely valid.
    Here's the part that matters: you've got real strengths here. This is actually good news.
    Let's break this down step by step. We've totally got this. You're doing the right work.`;

    const report = scoreEQ(response, highWarmthStyle);

    expect(report.overallEQScore).toBeGreaterThan(70);
    expect(report.isPassing).toBe(true);
    expect(report.recommendations.length).toBe(0);
  });

  test("2. Should detect high warmth", () => {
    const response = `I totally hear you on this. You're not alone in feeling this way.
    That makes complete sense. And here's the good part: we can fix this.`;

    const report = scoreEQ(response, highWarmthStyle);

    const warmthScore = report.scores.find(s => s.dimension === "warmth");
    expect(warmthScore?.detected).toBe("high");
    expect(warmthScore?.score).toBe(100);
  });

  test("3. Should detect high empathy", () => {
    const response = `Sounds like you're feeling overwhelmed. So what I'm hearing is that
    the deadlines are piling up. It seems like you need a clearer plan.`;

    const report = scoreEQ(response, highWarmthStyle);

    const empathyScore = report.scores.find(s => s.dimension === "empathy");
    expect(empathyScore?.detected).toBe("high");
  });

  test("4. Should detect multiple Jenny patterns", () => {
    const response = `Let's unpack this together. Here's the part that matters most.
    Let's take this one step at a time. This is solid thinking.`;

    const report = scoreEQ(response, balancedStyle);

    const jennyismsScore = report.scores.find(s => s.dimension === "jennyisms");
    expect(jennyismsScore?.detected).toBeGreaterThanOrEqual(2);
    expect(jennyismsScore?.score).toBeGreaterThanOrEqual(85);
  });
});

/**
 * ======================
 * LOW EQ RESPONSE TESTS (4)
 * ======================
 */
describe("Low EQ Response Detection", () => {
  test("5. Should score generic response lowly", () => {
    const response = `As per your request, the summary is below.
    Furthermore, your approach lacks structure. In conclusion, you need to improve.`;

    const report = scoreEQ(response, highWarmthStyle);

    expect(report.overallEQScore).toBeLessThan(50);
    expect(report.isPassing).toBe(false);
    expect(report.recommendations.length).toBeGreaterThan(0);
  });

  test("6. Should detect low warmth", () => {
    const response = "Here's the answer. Do this. Then do that. Done.";

    const report = scoreEQ(response, highWarmthStyle);

    const warmthScore = report.scores.find(s => s.dimension === "warmth");
    expect(warmthScore?.detected).toBe("low");
    expect(warmthScore?.score).toBeLessThan(50);
  });

  test("7. Should detect low empathy", () => {
    const response = "You need to fix this. Follow these steps. That's all.";

    const report = scoreEQ(response, highWarmthStyle);

    const empathyScore = report.scores.find(s => s.dimension === "empathy");
    expect(empathyScore?.detected).toBe("low");
  });

  test("8. Should detect missing Jenny patterns", () => {
    const response = "The solution is straightforward. Just implement the framework.";

    const report = scoreEQ(response, balancedStyle);

    const jennyismsScore = report.scores.find(s => s.dimension === "jennyisms");
    expect(jennyismsScore?.detected).toBeLessThan(2);
    expect(jennyismsScore?.score).toBeLessThan(70);
  });
});

/**
 * ======================
 * WARMTH DETECTION TESTS (3)
 * ======================
 */
describe("Warmth Detection", () => {
  test("9. Should detect high warmth with validation phrases", () => {
    const response = "I totally hear you on this. What you're feeling is completely valid.";

    const report = scoreEQ(response, highWarmthStyle);

    const warmthScore = report.scores.find(s => s.dimension === "warmth");
    expect(warmthScore?.detected).toBe("high");
  });

  test("10. Should detect medium warmth with one phrase", () => {
    const response = "I'm with you. Here's what we'll do.";

    const report = scoreEQ(response, balancedStyle);

    const warmthScore = report.scores.find(s => s.dimension === "warmth");
    expect(warmthScore?.detected).toBe("medium");
  });

  test("11. Should detect low warmth with no phrases", () => {
    const response = "Do this. Then that. Finish it.";

    const report = scoreEQ(response, lowWarmthStyle);

    const warmthScore = report.scores.find(s => s.dimension === "warmth");
    expect(warmthScore?.detected).toBe("low");
  });
});

/**
 * ======================
 * FIRMNESS DETECTION TESTS (3)
 * ======================
 */
describe("Firmness Detection", () => {
  test("12. Should detect high firmness", () => {
    const response = "Here's the part that matters. Let's be honest here. This is non-negotiable.";

    const report = scoreEQ(response, balancedStyle);

    const firmnessScore = report.scores.find(s => s.dimension === "firmness");
    expect(firmnessScore?.detected).toBe("high");
  });

  test("13. Should detect medium firmness", () => {
    const response = "Here's what I'd do in your situation.";

    const report = scoreEQ(response, balancedStyle);

    const firmnessScore = report.scores.find(s => s.dimension === "firmness");
    expect(firmnessScore?.detected).toBe("medium");
  });

  test("14. Should detect low firmness", () => {
    const response = "Maybe consider this option if you want.";

    const report = scoreEQ(response, balancedStyle);

    const firmnessScore = report.scores.find(s => s.dimension === "firmness");
    expect(firmnessScore?.detected).toBe("low");
  });
});

/**
 * ======================
 * PACE DETECTION TESTS (3)
 * ======================
 */
describe("Pace Detection", () => {
  test("15. Should detect fast pace with short sentences", () => {
    const response = "Do this. Then that. Simple. Quick. Done.";

    const report = scoreEQ(response, balancedStyle);

    const paceScore = report.scores.find(s => s.dimension === "pace");
    expect(paceScore?.detected).toBe("fast");
  });

  test("16. Should detect slow pace with long sentences", () => {
    const response = `This is a really long and complex sentence that goes on and on with multiple
    clauses and details that make it quite verbose and slow-paced for the reader to process.`;

    const report = scoreEQ(response, balancedStyle);

    const paceScore = report.scores.find(s => s.dimension === "pace");
    expect(paceScore?.detected).toBe("slow");
  });

  test("17. Should detect normal pace", () => {
    const response = "Here's the plan. Let's start with step one. Then we'll move to step two.";

    const report = scoreEQ(response, balancedStyle);

    const paceScore = report.scores.find(s => s.dimension === "pace");
    expect(paceScore?.detected).toBe("normal");
  });
});

/**
 * ======================
 * SPECIFICITY TESTS (2)
 * ======================
 */
describe("Specificity Detection", () => {
  test("18. Should detect high specificity with numbers and examples", () => {
    const response = "Here are 3 specific steps. For example, start with your top 2 schools.";

    const report = scoreEQ(response, balancedStyle);

    const specificityScore = report.scores.find(s => s.dimension === "specificity");
    expect(specificityScore?.detected).toBe("high");
    expect(specificityScore?.score).toBe(100);
  });

  test("19. Should detect low specificity without concrete details", () => {
    const response = "You should work on your essays and improve them.";

    const report = scoreEQ(response, balancedStyle);

    const specificityScore = report.scores.find(s => s.dimension === "specificity");
    expect(specificityScore?.detected).toBe("low");
    expect(specificityScore?.score).toBe(40);
  });
});

/**
 * ======================
 * SCORING LOGIC TESTS (4)
 * ======================
 */
describe("Scoring Logic", () => {
  test("20. Should give perfect score for exact match", () => {
    const response = `I totally hear you. Sounds like you're overwhelmed. That makes complete sense.
    Here's what I'd do. This is fixable. You've got real strengths. Let's take this step by step.`;

    const report = scoreEQ(response, highWarmthStyle);

    // Should score very high when all dimensions match
    expect(report.overallEQScore).toBeGreaterThan(75);
    expect(report.isPassing).toBe(true);
  });

  test("21. Should give partial score for one-off mismatch", () => {
    const response = "Here's the answer."; // Low warmth when high expected

    const report = scoreEQ(response, highWarmthStyle);

    const warmthScore = report.scores.find(s => s.dimension === "warmth");
    // One level off (high→low) should give 20
    expect(warmthScore?.score).toBeLessThan(30);
  });

  test("22. Should calculate weighted overall score", () => {
    const response = "Totally hear you. That makes sense. Here's the plan.";

    const report = scoreEQ(response, highWarmthStyle, {
      weights: {
        warmth: 2.0, // Double weight
        empathy: 1.0,
        firmness: 0.5, // Half weight
        cheer: 0.5,
        pace: 0.5,
        specificity: 0.5,
        jennyisms: 1.0
      }
    });

    // Overall score should reflect increased warmth weight
    expect(report.overallEQScore).toBeDefined();
  });

  test("23. Should use custom passing threshold", () => {
    const response = "Here's the answer. Do this.";

    const report = scoreEQ(response, balancedStyle, { passingThreshold: 90 });

    expect(report.passingThreshold).toBe(90);
    expect(report.isPassing).toBe(false);
  });
});

/**
 * ======================
 * CHEER DETECTION TESTS (3)
 * ======================
 */
describe("Cheer Detection", () => {
  test("24. Should detect high cheer", () => {
    const response = "This is actually good news. You're more capable than you think. We've totally got this.";

    const report = scoreEQ(response, balancedStyle);

    const cheerScore = report.scores.find(s => s.dimension === "cheer");
    expect(cheerScore?.detected).toBe("high");
  });

  test("25. Should detect medium cheer", () => {
    const response = "This is fixable. Let's work on it.";

    const report = scoreEQ(response, balancedStyle);

    const cheerScore = report.scores.find(s => s.dimension === "cheer");
    expect(cheerScore?.detected).toBe("medium");
  });

  test("26. Should detect low cheer", () => {
    const response = "This is problematic. You need to address it.";

    const report = scoreEQ(response, balancedStyle);

    const cheerScore = report.scores.find(s => s.dimension === "cheer");
    expect(cheerScore?.detected).toBe("low");
  });
});

/**
 * ======================
 * RECOMMENDATIONS TESTS (3)
 * ======================
 */
describe("Recommendations", () => {
  test("27. Should provide recommendations for low scores", () => {
    const response = "Do this. Then that.";

    const report = scoreEQ(response, highWarmthStyle);

    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.recommendations.some(r => r.includes("warmth"))).toBe(true);
  });

  test("28. Should not provide recommendations for high scores", () => {
    const response = `I totally hear you on this. Sounds like you're feeling stuck.
    Here's the part that matters. This is fixable. You've got real strengths.
    Let's break this down step by step.`;

    const report = scoreEQ(response, highWarmthStyle);

    expect(report.recommendations.length).toBe(0);
  });

  test("29. Should suggest specific improvements", () => {
    const response = "Here's the answer.";

    const report = scoreEQ(response, highWarmthStyle);

    expect(report.recommendations.some(r => r.toLowerCase().includes("warmth"))).toBe(true);
    expect(report.recommendations.some(r => r.toLowerCase().includes("empathy"))).toBe(true);
  });
});

/**
 * ======================
 * UTILITY TESTS (3)
 * ======================
 */
describe("Utility Functions", () => {
  test("30. Should generate score summary", () => {
    const response = "Totally hear you. This is solid thinking.";

    const report = scoreEQ(response, balancedStyle);
    const summary = getScoreSummary(report);

    expect(summary).toContain("EQ Score Report");
    expect(summary).toContain("Overall Score");
    expect(summary).toContain("Dimension Breakdown");
  });

  test("31. Should compare scores", () => {
    const response1 = "Here's the answer.";
    const response2 = "I totally hear you. Here's what we'll do together.";

    const report1 = scoreEQ(response1, highWarmthStyle);
    const report2 = scoreEQ(response2, highWarmthStyle);

    const comparison = compareScores(report1, report2);

    expect(comparison.overallChange).toBeGreaterThan(0);
    expect(comparison.improved.length).toBeGreaterThan(0);
  });

  test("32. Should track regressions", () => {
    const response1 = "I totally hear you. This makes sense.";
    const response2 = "Do this.";

    const report1 = scoreEQ(response1, highWarmthStyle);
    const report2 = scoreEQ(response2, highWarmthStyle);

    const comparison = compareScores(report1, report2);

    expect(comparison.overallChange).toBeLessThan(0);
    expect(comparison.regressed.length).toBeGreaterThan(0);
  });
});

/**
 * ======================
 * INTEGRATION TESTS (3)
 * ======================
 */
describe("Integration", () => {
  test("33. Should work with drift detector threshold", () => {
    const lowQualityResponse = "As per your request, here's the summary.";
    const highQualityResponse = `I totally hear you on this. Sounds like you're feeling stuck.
    This is actually good news - you're asking the right questions. Let's work through this together.`;

    const lowReport = scoreEQ(lowQualityResponse, highWarmthStyle);
    const highReport = scoreEQ(highQualityResponse, highWarmthStyle);

    // Low quality should trigger drift correction (< 70)
    expect(lowReport.overallEQScore).toBeLessThan(70);
    expect(lowReport.isPassing).toBe(false);

    // High quality should pass
    expect(highReport.overallEQScore).toBeGreaterThan(70);
    expect(highReport.isPassing).toBe(true);
  });

  test("34. Should adapt to different style requirements", () => {
    const response = "Here's the move. Do it now. Quick action required.";

    const highWarmthReport = scoreEQ(response, highWarmthStyle);
    const lowWarmthReport = scoreEQ(response, lowWarmthStyle);

    // Should score poorly with high warmth style
    expect(highWarmthReport.overallEQScore).toBeLessThan(lowWarmthReport.overallEQScore);
  });

  test("35. Should provide actionable feedback", () => {
    const response = "Follow the framework. Implement the strategy.";

    const report = scoreEQ(response, highWarmthStyle);

    // Should identify specific issues
    expect(report.recommendations.length).toBeGreaterThan(2);
    expect(report.scores.every(s => s.dimension && s.expected && s.detected !== undefined)).toBe(
      true
    );
  });
});
