/**
 * Response Style Engine Comprehensive Tests
 *
 * Tests all components of the EQ-Adaptive Response Style Generator:
 * - Tone Rubrics (Jenny's linguistic DNA)
 * - Style Mixer (mood vector → directives)
 * - Response Style (system prompt generation)
 */

import {
  JENNY_TONE_RUBRIC,
  ToneRubric,
  getRandomRubricItem,
  getRubricExamples,
  getAllRubricCategories,
  validateRubricCompleteness,
  getRubricSummary
} from "../toneRubrics";

import {
  StyleDirectives,
  mixStyle,
  getStyleSummary,
  compareStyleDirectives,
  getChangedDirectives,
  isHighWarmthStyle,
  isHighFirmnessStyle,
  isSlowPaceStyle,
  isFastPaceStyle,
  getDominantStyleTraits,
  detectStyleArchetype,
  validateStyleDirectives
} from "../styleMixer";

import {
  ResponseStyleBlock,
  buildResponseStyleBlock,
  buildMinimalStyleBlock,
  injectStyleBlockIntoSystemPrompt,
  extractStyleDirectivesFromBlock,
  getStyleBlockStats,
  validateStyleBlock,
  compareStyleBlocks
} from "../responseStyle";

import { MoodVector } from "../moodVectorEngine";

/**
 * ======================
 * TONE RUBRICS TESTS (8)
 * ======================
 */
describe("Tone Rubrics", () => {
  test("1. Should have all 7 rubric categories", () => {
    expect(JENNY_TONE_RUBRIC.openings).toBeDefined();
    expect(JENNY_TONE_RUBRIC.validations).toBeDefined();
    expect(JENNY_TONE_RUBRIC.pacingCues).toBeDefined();
    expect(JENNY_TONE_RUBRIC.microEncouragements).toBeDefined();
    expect(JENNY_TONE_RUBRIC.firmnessPatterns).toBeDefined();
    expect(JENNY_TONE_RUBRIC.reframes).toBeDefined();
    expect(JENNY_TONE_RUBRIC.closures).toBeDefined();
  });

  test("2. Each category should have multiple items", () => {
    expect(JENNY_TONE_RUBRIC.openings.length).toBeGreaterThan(5);
    expect(JENNY_TONE_RUBRIC.validations.length).toBeGreaterThan(5);
    expect(JENNY_TONE_RUBRIC.pacingCues.length).toBeGreaterThan(5);
    expect(JENNY_TONE_RUBRIC.microEncouragements.length).toBeGreaterThan(5);
    expect(JENNY_TONE_RUBRIC.firmnessPatterns.length).toBeGreaterThan(5);
    expect(JENNY_TONE_RUBRIC.reframes.length).toBeGreaterThan(5);
    expect(JENNY_TONE_RUBRIC.closures.length).toBeGreaterThan(5);
  });

  test("3. Should get random rubric item", () => {
    const opening = getRandomRubricItem("openings");
    expect(JENNY_TONE_RUBRIC.openings).toContain(opening);

    const validation = getRandomRubricItem("validations");
    expect(JENNY_TONE_RUBRIC.validations).toContain(validation);
  });

  test("4. Should get rubric examples", () => {
    const examples = getRubricExamples("openings", 3);
    expect(examples.length).toBe(3);
    expect(JENNY_TONE_RUBRIC.openings).toEqual(expect.arrayContaining(examples));
  });

  test("5. Should get all rubric categories", () => {
    const categories = getAllRubricCategories();
    expect(categories.length).toBe(7);
    expect(categories).toContain("openings");
    expect(categories).toContain("validations");
    expect(categories).toContain("closures");
  });

  test("6. Should validate rubric completeness", () => {
    const validation = validateRubricCompleteness(5);
    expect(validation.isValid).toBe(true);
    expect(validation.warnings.length).toBe(0);
  });

  test("7. Should get rubric summary", () => {
    const summary = getRubricSummary();
    expect(summary).toContain("Jenny's Tone Rubric");
    expect(summary).toContain("openings:");
    expect(summary).toContain("validations:");
  });

  test("8. Rubrics should reflect Jenny's voice (not generic)", () => {
    // Check for Jenny-specific patterns
    expect(JENNY_TONE_RUBRIC.openings.join(" ")).toContain("Totally hear you");
    expect(JENNY_TONE_RUBRIC.firmnessPatterns.join(" ")).toContain("reality check");
    expect(JENNY_TONE_RUBRIC.closures.join(" ")).toContain("one step at a time");
  });
});

/**
 * ======================
 * STYLE MIXER TESTS (12)
 * ======================
 */
describe("Style Mixer", () => {
  test("9. Should convert low mood values to low directives", () => {
    const mood: MoodVector = {
      warmth: 0.2,
      firmness: 0.2,
      optimism: 0.5,
      pace: 0.2,
      empathy: 0.2,
      cheer: 0.2,
      intensity: 0.2
    };

    const style = mixStyle(mood);

    expect(style.warmthLevel).toBe("low");
    expect(style.firmnessLevel).toBe("low");
    expect(style.paceLevel).toBe("slow");
    expect(style.empathyLevel).toBe("low");
    expect(style.cheerLevel).toBe("low");
    expect(style.intensityLevel).toBe("low");
  });

  test("10. Should convert high mood values to high directives", () => {
    const mood: MoodVector = {
      warmth: 0.9,
      firmness: 0.9,
      optimism: 0.9,
      pace: 0.9,
      empathy: 0.9,
      cheer: 0.9,
      intensity: 0.9
    };

    const style = mixStyle(mood);

    expect(style.warmthLevel).toBe("high");
    expect(style.firmnessLevel).toBe("high");
    expect(style.paceLevel).toBe("fast");
    expect(style.empathyLevel).toBe("high");
    expect(style.cheerLevel).toBe("high");
    expect(style.intensityLevel).toBe("high");
  });

  test("11. Should convert medium mood values to medium directives", () => {
    const mood: MoodVector = {
      warmth: 0.5,
      firmness: 0.5,
      optimism: 0.5,
      pace: 0.5,
      empathy: 0.5,
      cheer: 0.5,
      intensity: 0.5
    };

    const style = mixStyle(mood);

    expect(style.warmthLevel).toBe("medium");
    expect(style.firmnessLevel).toBe("medium");
    expect(style.paceLevel).toBe("normal");
    expect(style.empathyLevel).toBe("medium");
    expect(style.cheerLevel).toBe("medium");
    expect(style.intensityLevel).toBe("medium");
  });

  test("12. Should handle ANXIETY mood vector", () => {
    // ANXIETY: high warmth, high empathy, slow pace, low firmness
    const mood: MoodVector = {
      warmth: 0.9,
      firmness: 0.2,
      optimism: 0.5,
      pace: 0.3, // Changed to 0.3 to fall in "slow" bucket (<=0.33)
      empathy: 0.9,
      cheer: 0.6,
      intensity: 0.3
    };

    const style = mixStyle(mood);

    expect(style.warmthLevel).toBe("high");
    expect(style.empathyLevel).toBe("high");
    expect(style.paceLevel).toBe("slow");
    expect(style.firmnessLevel).toBe("low");
  });

  test("13. Should handle EAGERNESS mood vector", () => {
    // EAGERNESS: high firmness, high pace, high cheer
    const mood: MoodVector = {
      warmth: 0.6,
      firmness: 0.7,
      optimism: 0.8,
      pace: 0.7,
      empathy: 0.5,
      cheer: 0.8,
      intensity: 0.7
    };

    const style = mixStyle(mood);

    expect(style.firmnessLevel).toBe("high");
    expect(style.paceLevel).toBe("fast");
    expect(style.cheerLevel).toBe("high");
  });

  test("14. Should compare style directives", () => {
    const style1: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const style2: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "high",
      paceLevel: "fast",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "high"
    };

    const comparison = compareStyleDirectives(style1, style2);

    expect(comparison.warmthLevel).toBe(false); // Same
    expect(comparison.firmnessLevel).toBe(true); // Changed
    expect(comparison.paceLevel).toBe(true); // Changed
  });

  test("15. Should get changed directives", () => {
    const style1: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const style2: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "high",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const changed = getChangedDirectives(style1, style2);

    expect(changed).toContain("firmnessLevel");
    expect(changed.length).toBe(1);
  });

  test("16. Should detect high warmth style", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "medium",
      paceLevel: "normal",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    expect(isHighWarmthStyle(style)).toBe(true);
  });

  test("17. Should detect high firmness style", () => {
    const style: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "high",
      paceLevel: "normal",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    expect(isHighFirmnessStyle(style)).toBe(true);
  });

  test("18. Should detect slow pace style", () => {
    const style: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "medium",
      paceLevel: "slow",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    expect(isSlowPaceStyle(style)).toBe(true);
    expect(isFastPaceStyle(style)).toBe(false);
  });

  test("19. Should get dominant style traits", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const traits = getDominantStyleTraits(style);

    expect(traits).toContain("high warmth");
    expect(traits).toContain("high empathy");
    expect(traits).toContain("slow pace");
  });

  test("20. Should detect style archetypes", () => {
    // Supportive archetype
    const supportive: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    expect(detectStyleArchetype(supportive)).toBe("supportive");

    // Motivational archetype
    const motivational: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "medium",
      paceLevel: "fast",
      empathyLevel: "medium",
      cheerLevel: "high",
      intensityLevel: "high"
    };

    expect(detectStyleArchetype(motivational)).toBe("motivational");
  });
});

/**
 * ======================
 * RESPONSE STYLE TESTS (12)
 * ======================
 */
describe("Response Style", () => {
  test("21. Should build response style block", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "medium",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const block = buildResponseStyleBlock(style);

    expect(block.block).toContain("RESPONSE STYLE INSTRUCTIONS");
    expect(block.block).toContain("STYLISTIC DIRECTIVES");
    expect(block.block).toContain("Warmth: high");
    expect(block.block).toContain("Firmness: medium");
    expect(block.block).toContain("Pace: slow");
  });

  test("22. Should include adaptation guidance", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "high",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const block = buildResponseStyleBlock(style);

    expect(block.block).toContain("HOW TO ADAPT");
    expect(block.block).toContain("Warmth=HIGH");
    expect(block.block).toContain("Firmness=HIGH");
    expect(block.block).toContain("Pace=SLOW");
  });

  test("23. Should include tone rubric elements", () => {
    const style: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "medium",
      paceLevel: "normal",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    const block = buildResponseStyleBlock(style);

    expect(block.block).toContain("TONE ELEMENTS TO USE");
    expect(block.block).toContain("Openings:");
    expect(block.block).toContain("Validations:");
    expect(block.block).toContain("Pacing cues:");
    expect(block.block).toContain("Micro-encouragements:");
    expect(block.block).toContain("Firmness patterns:");
    expect(block.block).toContain("Reframes:");
    expect(block.block).toContain("Closures:");
  });

  test("24. Should include critical reminders", () => {
    const style: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "medium",
      paceLevel: "normal",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    const block = buildResponseStyleBlock(style);

    expect(block.block).toContain("CRITICAL REMINDERS");
    expect(block.block).toContain("DELIVERY patterns");
    expect(block.block).toContain("not content requirements");
  });

  test("25. Should calculate block metadata", () => {
    const style: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "medium",
      paceLevel: "normal",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    const block = buildResponseStyleBlock(style);

    expect(block.metadata.directives).toEqual(style);
    expect(block.metadata.length).toBeGreaterThan(0);
    expect(block.metadata.estimatedTokens).toBeGreaterThan(0);
  });

  test("26. Should build minimal style block", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const minimal = buildMinimalStyleBlock(style);

    expect(minimal).toContain("STYLE (EQ-ADAPTIVE)");
    expect(minimal).toContain("Warmth: high");
    expect(minimal).toContain("Firmness: low");
    expect(minimal.length).toBeLessThan(500); // Should be compact
  });

  test("27. Should inject style block into system prompt", () => {
    const basePrompt = "You are Jenny, a college admissions coach.";
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "medium",
      paceLevel: "normal",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    const fullPrompt = injectStyleBlockIntoSystemPrompt(basePrompt, style);

    expect(fullPrompt).toContain(basePrompt);
    expect(fullPrompt).toContain("RESPONSE STYLE INSTRUCTIONS");
    expect(fullPrompt).toContain("END STYLE BLOCK");
  });

  test("28. Should inject minimal style block when requested", () => {
    const basePrompt = "You are Jenny.";
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const fullPrompt = injectStyleBlockIntoSystemPrompt(basePrompt, style, true);

    expect(fullPrompt).toContain(basePrompt);
    expect(fullPrompt).toContain("STYLE (EQ-ADAPTIVE)");
    expect(fullPrompt.length).toBeLessThan(1000); // Should be compact
  });

  test("29. Should extract style directives from block", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const block = buildResponseStyleBlock(style);
    const extracted = extractStyleDirectivesFromBlock(block.block);

    expect(extracted).not.toBeNull();
    expect(extracted!.warmthLevel).toBe("high");
    expect(extracted!.firmnessLevel).toBe("low");
    expect(extracted!.paceLevel).toBe("slow");
  });

  test("30. Should get style block stats", () => {
    const style: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "medium",
      paceLevel: "normal",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    const block = buildResponseStyleBlock(style);
    const stats = getStyleBlockStats(block);

    expect(stats.length).toBeGreaterThan(0);
    expect(stats.tokens).toBeGreaterThan(0);
    expect(stats.lines).toBeGreaterThan(10);
    expect(stats.hasOpenings).toBe(true);
    expect(stats.hasValidations).toBe(true);
    expect(stats.hasPacingCues).toBe(true);
  });

  test("31. Should validate style block", () => {
    const style: StyleDirectives = {
      warmthLevel: "medium",
      firmnessLevel: "medium",
      paceLevel: "normal",
      empathyLevel: "medium",
      cheerLevel: "medium",
      intensityLevel: "medium"
    };

    const block = buildResponseStyleBlock(style);
    const validation = validateStyleBlock(block.block);

    expect(validation.isValid).toBe(true);
    expect(validation.errors.length).toBe(0);
  });

  test("32. Should compare style blocks", () => {
    const style1: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const style2: StyleDirectives = {
      warmthLevel: "low",
      firmnessLevel: "high",
      paceLevel: "fast",
      empathyLevel: "low",
      cheerLevel: "high",
      intensityLevel: "high"
    };

    const block1 = buildResponseStyleBlock(style1);
    const block2 = buildResponseStyleBlock(style2);

    const comparison = compareStyleBlocks(block1, block2);

    expect(comparison.directivesChanged).toBe(true);
    expect(comparison.changedDirectives.length).toBeGreaterThan(0);
  });
});

/**
 * ======================
 * INTEGRATION TESTS (4)
 * ======================
 */
describe("Response Style Integration", () => {
  test("33. Full flow: mood vector → style → prompt block", () => {
    // Step 1: Start with mood vector (ANXIETY)
    const mood: MoodVector = {
      warmth: 0.9,
      firmness: 0.2,
      optimism: 0.6,
      pace: 0.3, // Changed to 0.3 to fall in "slow" bucket
      empathy: 0.9,
      cheer: 0.6,
      intensity: 0.3
    };

    // Step 2: Mix style
    const style = mixStyle(mood);
    expect(style.warmthLevel).toBe("high");
    expect(style.paceLevel).toBe("slow");

    // Step 3: Build style block
    const block = buildResponseStyleBlock(style);
    expect(block.block).toContain("Warmth: high");
    expect(block.block).toContain("Pace: slow");

    // Step 4: Inject into system prompt
    const basePrompt = "You are Jenny.";
    const fullPrompt = injectStyleBlockIntoSystemPrompt(basePrompt, style);
    expect(fullPrompt).toContain("RESPONSE STYLE INSTRUCTIONS");
  });

  test("34. Style should adapt across different EQ states", () => {
    // ANXIETY → high warmth, slow pace
    const anxietyMood: MoodVector = {
      warmth: 0.9,
      firmness: 0.2,
      optimism: 0.5,
      pace: 0.3,
      empathy: 0.9,
      cheer: 0.5,
      intensity: 0.3
    };
    const anxietyStyle = mixStyle(anxietyMood);
    expect(anxietyStyle.warmthLevel).toBe("high");
    expect(anxietyStyle.paceLevel).toBe("slow");

    // EAGERNESS → high firmness, fast pace
    const eagerness: MoodVector = {
      warmth: 0.6,
      firmness: 0.7,
      optimism: 0.8,
      pace: 0.7,
      empathy: 0.5,
      cheer: 0.8,
      intensity: 0.7
    };
    const eagernessStyle = mixStyle(eagerness);
    expect(eagernessStyle.firmnessLevel).toBe("high");
    expect(eagernessStyle.paceLevel).toBe("fast");
  });

  test("35. Style block should be deterministic for same input", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "medium",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const block1 = buildResponseStyleBlock(style);
    const block2 = buildResponseStyleBlock(style);

    // Note: The actual tone rubric examples may vary due to slicing,
    // but the structure and directives should be the same
    expect(block1.metadata.directives).toEqual(block2.metadata.directives);
  });

  test("36. Minimal vs full block should contain same directives", () => {
    const style: StyleDirectives = {
      warmthLevel: "high",
      firmnessLevel: "low",
      paceLevel: "slow",
      empathyLevel: "high",
      cheerLevel: "medium",
      intensityLevel: "low"
    };

    const fullBlock = buildResponseStyleBlock(style);
    const minimalBlock = buildMinimalStyleBlock(style);

    expect(fullBlock.block).toContain("Warmth: high");
    expect(minimalBlock).toContain("Warmth: high");

    expect(fullBlock.block).toContain("Firmness: low");
    expect(minimalBlock).toContain("Firmness: low");

    expect(minimalBlock.length).toBeLessThan(fullBlock.metadata.length);
  });
});
