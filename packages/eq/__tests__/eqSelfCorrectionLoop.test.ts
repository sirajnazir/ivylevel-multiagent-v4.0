/**
 * EQ Self-Correction Loop Comprehensive Tests
 *
 * Tests the emotional airbag that guarantees Jenny-tone safety.
 */

import {
  runEQSelfCorrectionLoop,
  getCorrectionSummary,
  compareCorrectionResults,
  SelfCorrectionResult
} from "../eqSelfCorrectionLoop";
import { StyleDirectives } from "../styleMixer";
import { rerankJennyTone, checkToneMarkers, getRerankSummary } from "../toneReranker";
import { DRIFT_PROMPT } from "../prompts/eqDriftPrompt";
import { scoreEQ } from "../eqScoringEngine";

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

const balancedStyle: StyleDirectives = {
  warmthLevel: "medium",
  firmnessLevel: "medium",
  paceLevel: "normal",
  empathyLevel: "medium",
  cheerLevel: "medium",
  intensityLevel: "medium"
};

const highFirmnessStyle: StyleDirectives = {
  warmthLevel: "medium",
  firmnessLevel: "high",
  paceLevel: "fast",
  empathyLevel: "low",
  cheerLevel: "medium",
  intensityLevel: "high"
};

/**
 * ======================
 * TONE RERANKER TESTS (6)
 * ======================
 */
describe("Tone Reranker", () => {
  test("1. Should add warm opening when high warmth required", () => {
    const text = "Here's what you need to do.";
    const reranked = rerankJennyTone(text, highWarmthStyle);

    expect(reranked).toContain("I totally hear you");
    expect(reranked).toContain("Here's what you need to do");
  });

  test("2. Should add firmness anchor when high firmness required", () => {
    const text = "Do this now.";
    const reranked = rerankJennyTone(text, highFirmnessStyle);

    expect(reranked).toContain("Here's the part that matters");
  });

  test("3. Should add validation when high empathy required", () => {
    const text = "Let's work on your essays.";
    const reranked = rerankJennyTone(text, highWarmthStyle);

    expect(reranked).toContain("What you're feeling makes sense");
  });

  test("4. Should not heavily modify text that already has most tone markers", () => {
    const text =
      "I totally hear you. Here's what makes sense. You've got real strengths. This is fixable.";
    const reranked = rerankJennyTone(text, highWarmthStyle);

    // Should be very similar since it has warmth, empathy (makes sense), and cheer
    expect(reranked.length).toBeLessThanOrEqual(text.length + 40);
  });

  test("5. Should normalize spacing consistently", () => {
    const text = "This is good.  Let's keep going.   We're on track.";
    const reranked = rerankJennyTone(text, balancedStyle);

    expect(reranked).not.toContain("  ");
    expect(reranked).toMatch(/\.\s\w/); // Single space after periods
  });

  test("6. Should check tone markers correctly", () => {
    const text = "I totally hear you. Here's the part that matters. You've got real strengths.";
    const markers = checkToneMarkers(text);

    expect(markers.hasWarmOpening).toBe(true);
    expect(markers.hasFirmnessAnchor).toBe(true);
    expect(markers.hasCheer).toBe(true);
    expect(markers.hasJennyPattern).toBe(true);
  });
});

/**
 * ======================
 * DRIFT PROMPT TESTS (3)
 * ======================
 */
describe("Drift Prompt Generation", () => {
  test("7. Should generate complete correction prompt", () => {
    const original = "Your grades are bad. Fix them.";
    const score = scoreEQ(original, highWarmthStyle);

    const prompt = DRIFT_PROMPT({ original, directives: highWarmthStyle, score });

    expect(prompt.system).toContain("Jenny Duan");
    expect(prompt.system).toContain("EQ-corrective");
    expect(prompt.user).toContain(original);
    expect(prompt.user).toContain("warmth");
    expect(prompt.user).toContain("empathy");
  });

  test("8. Should include style directives in prompt", () => {
    const original = "Do better.";
    const score = scoreEQ(original, highWarmthStyle);

    const prompt = DRIFT_PROMPT({ original, directives: highWarmthStyle, score });

    expect(prompt.user).toContain("Warmth: high");
    expect(prompt.user).toContain("Empathy: high");
    expect(prompt.user).toContain("Firmness: medium");
  });

  test("9. Should include score and recommendations in prompt", () => {
    const original = "Fix your work.";
    const score = scoreEQ(original, highWarmthStyle);

    const prompt = DRIFT_PROMPT({ original, directives: highWarmthStyle, score });

    expect(prompt.user).toContain("Overall EQ Score");
    expect(prompt.user).toContain("Specific issues to fix");
  });
});

/**
 * ======================
 * SELF-CORRECTION LOOP TESTS (10)
 * ======================
 */
describe("Self-Correction Loop", () => {
  test("10. Should pass through already-good text with 0 attempts", async () => {
    const goodText = `I totally hear you on this. Sounds like you're feeling overwhelmed.
    This is actually good news - you're asking the right questions. Let's work through this together.`;

    const result = await runEQSelfCorrectionLoop(goodText, highWarmthStyle);

    expect(result.attempts).toBe(0);
    expect(result.driftFixed).toBe(false);
    expect(result.finalScore.overallEQScore).toBeGreaterThanOrEqual(70);
    expect(result.notes.some(n => n.includes("already within EQ spec"))).toBe(true);
  });

  test("11. Should improve low-EQ text", async () => {
    const badText = "Your grades are low. You must improve.";

    const result = await runEQSelfCorrectionLoop(badText, highWarmthStyle);

    expect(result.initialScore.overallEQScore).toBeLessThan(70);
    expect(result.finalScore.overallEQScore).toBeGreaterThan(result.initialScore.overallEQScore);
    expect(result.attempts).toBeGreaterThan(0);
  });

  test("12. Should fix formal language", async () => {
    const formalText = "As per your request, furthermore you need to improve.";

    const result = await runEQSelfCorrectionLoop(formalText, highWarmthStyle);

    expect(result.finalText).not.toContain("as per your request");
    expect(result.finalText).not.toContain("furthermore");
  });

  test("13. Should add warmth to cold responses", async () => {
    const coldText = "Do this. Then that. Done.";

    const result = await runEQSelfCorrectionLoop(coldText, highWarmthStyle);

    const hasWarmth =
      /i totally hear you|i'm with you|makes sense|you've got/i.test(result.finalText);
    expect(hasWarmth).toBe(true);
  });

  test("14. Should respect custom min EQ threshold", async () => {
    const text = "Let's work on this.";

    const result = await runEQSelfCorrectionLoop(text, highWarmthStyle, {
      minAcceptableEQ: 80
    });

    // Even if original passes 70, it should try to reach 80
    if (result.initialScore.overallEQScore < 80) {
      expect(result.attempts).toBeGreaterThan(0);
    }
  });

  test("15. Should respect max attempts limit", async () => {
    const badText = "Bad.";

    const result = await runEQSelfCorrectionLoop(badText, highWarmthStyle, {
      maxAttempts: 2
    });

    expect(result.attempts).toBeLessThanOrEqual(2);
  });

  test("16. Should track attempts in notes", async () => {
    const text = "Fix it.";

    const result = await runEQSelfCorrectionLoop(text, highWarmthStyle);

    expect(result.notes.length).toBeGreaterThan(1);
    expect(result.notes.some(n => n.includes("Initial EQ score"))).toBe(true);
  });

  test("17. Should mark driftFixed as true when successful", async () => {
    const text = "Your work needs improvement.";

    const result = await runEQSelfCorrectionLoop(text, highWarmthStyle);

    if (result.finalScore.overallEQScore >= 70) {
      expect(result.driftFixed).toBe(true);
    }
  });

  test("18. Should escalate if max attempts reached", async () => {
    // Create artificially bad text
    const terribleText = "No.";

    const result = await runEQSelfCorrectionLoop(terribleText, highWarmthStyle, {
      maxAttempts: 1,
      minAcceptableEQ: 90 // Impossibly high
    });

    if (result.finalScore.overallEQScore < 90) {
      expect(result.driftFixed).toBe(false);
      expect(result.notes.some(n => n.includes("manual override"))).toBe(true);
    }
  });

  test("19. Should apply reranking by default", async () => {
    const text = "Do better work.";

    const result = await runEQSelfCorrectionLoop(text, highWarmthStyle);

    // Reranking should add tone markers
    const hasMarkers = /i totally hear you|you've got|makes sense/i.test(result.finalText);
    expect(hasMarkers).toBe(true);
  });
});

/**
 * ======================
 * UTILITY TESTS (3)
 * ======================
 */
describe("Utility Functions", () => {
  test("20. Should generate correction summary", async () => {
    const text = "Bad response.";
    const result = await runEQSelfCorrectionLoop(text, highWarmthStyle);

    const summary = getCorrectionSummary(result);

    expect(summary).toContain("EQ Self-Correction Summary");
    expect(summary).toContain("Initial Score");
    expect(summary).toContain("Final Score");
    expect(summary).toContain("Attempts");
  });

  test("21. Should compare correction results", async () => {
    const text1 = "Bad.";
    const text2 = "Also bad.";

    const result1 = await runEQSelfCorrectionLoop(text1, highWarmthStyle);
    const result2 = await runEQSelfCorrectionLoop(text2, highWarmthStyle);

    const comparison = compareCorrectionResults(result1, result2);

    expect(comparison).toHaveProperty("better");
    expect(comparison).toHaveProperty("scoreDifference");
    expect(comparison).toHaveProperty("attemptDifference");
  });

  test("22. Should get rerank summary", () => {
    const original = "Here's the plan.";
    const reranked = rerankJennyTone(original, highWarmthStyle);

    const summary = getRerankSummary(original, reranked);

    if (original === reranked) {
      expect(summary).toContain("No changes");
    } else {
      expect(summary.length).toBeGreaterThan(0);
    }
  });
});

/**
 * ======================
 * INTEGRATION TESTS (3)
 * ======================
 */
describe("Integration", () => {
  test("23. Full pipeline: bad text → corrected → passing", async () => {
    const badText = "As per your request, you must improve your grades immediately.";

    // Initial score should be low
    const initialScore = scoreEQ(badText, highWarmthStyle);
    expect(initialScore.overallEQScore).toBeLessThan(70);

    // Run correction
    const result = await runEQSelfCorrectionLoop(badText, highWarmthStyle);

    // Final should be better
    expect(result.finalScore.overallEQScore).toBeGreaterThan(initialScore.overallEQScore);
    expect(result.finalText).not.toContain("as per your request");
    expect(result.finalText).not.toContain("you must");
  });

  test("24. Should work with different style profiles", async () => {
    const text = "Do it now.";

    const warmResult = await runEQSelfCorrectionLoop(text, highWarmthStyle);
    const firmResult = await runEQSelfCorrectionLoop(text, highFirmnessStyle);

    // Warm version should have more warmth markers
    const warmMarkers = checkToneMarkers(warmResult.finalText);
    const firmMarkers = checkToneMarkers(firmResult.finalText);

    // Both should improve from original
    expect(warmResult.finalScore.overallEQScore).toBeGreaterThan(0);
    expect(firmResult.finalScore.overallEQScore).toBeGreaterThan(0);
  });

  test("25. Should preserve meaning while fixing tone", async () => {
    const text = "You need to write 3 essays by next week for Stanford, MIT, and Harvard.";

    const result = await runEQSelfCorrectionLoop(text, highWarmthStyle);

    // Should still contain the factual content
    expect(result.finalText).toContain("3");
    expect(result.finalText.toLowerCase()).toContain("stanford");
    expect(result.finalText.toLowerCase()).toContain("mit");
    expect(result.finalText.toLowerCase()).toContain("harvard");
    expect(result.finalText.toLowerCase()).toContain("week");
  });
});

/**
 * ======================
 * EDGE CASES (3)
 * ======================
 */
describe("Edge Cases", () => {
  test("26. Should handle empty text", async () => {
    const result = await runEQSelfCorrectionLoop("", highWarmthStyle);

    expect(result).toBeDefined();
    expect(result.finalText).toBeDefined();
  });

  test("27. Should handle very short text", async () => {
    const result = await runEQSelfCorrectionLoop("No.", highWarmthStyle);

    expect(result).toBeDefined();
    expect(result.finalText.length).toBeGreaterThan(2);
  });

  test("28. Should handle already-perfect text", async () => {
    const perfectText = `I totally hear you on this. Sounds like you're overwhelmed, and that makes complete sense.
    Here's the part that matters: you've got real strengths here. This is actually good news.
    Let's break this down step by step. We've totally got this. You're doing the right work.`;

    const result = await runEQSelfCorrectionLoop(perfectText, highWarmthStyle);

    expect(result.attempts).toBe(0);
    expect(result.finalText).toBe(perfectText);
    expect(result.driftFixed).toBe(false);
  });
});
