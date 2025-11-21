/**
 * EQ Engine Comprehensive Tests
 *
 * Tests all components of the EQ Signal Tracker & Mood Vector Engine:
 * - EQ Signals (definitions, helpers)
 * - EQ Classifier (keyword + hybrid)
 * - EQ Profile Tracker (accumulation, analysis)
 * - Mood Vector Engine (computation, formatting)
 * - LLM EQ Refinement (mock, validation)
 */

import {
  EQSignal,
  EQ_KEYWORDS,
  getEQSignalLabel,
  getEQSignalCategory,
  isSupportiveSignalNeeded,
  isChallengingSignalAppropriate
} from "../eqSignals";

import {
  classifyEQKeywords,
  classifyEQ,
  classifyEQBatch,
  getDominantSignal,
  hasConflictingSignals,
  filterLowConfidenceSignals,
  getClassificationSummary
} from "../eqClassifier";

import { EQProfileTracker } from "../eqProfile";

import {
  computeMoodVector,
  getMoodVectorDescription,
  formatMoodVectorForPrompt,
  compareMoodVectors
} from "../moodVectorEngine";

import {
  runEQRefinementLLM,
  mockEQRefinementLLM,
  validateRefinement,
  getRefinementStats
} from "../llmEQ";

/**
 * ======================
 * EQ SIGNALS TESTS (6)
 * ======================
 */
describe("EQ Signals", () => {
  test("1. Should have 12 EQ signals defined", () => {
    const signals = Object.keys(EQ_KEYWORDS);
    expect(signals.length).toBe(12);

    expect(signals).toContain("ANXIETY");
    expect(signals).toContain("INSECURITY");
    expect(signals).toContain("CONFUSION");
    expect(signals).toContain("OVERWHELM");
    expect(signals).toContain("APATHY");
    expect(signals).toContain("EAGERNESS");
    expect(signals).toContain("CONFIDENCE");
    expect(signals).toContain("CURIOSITY");
    expect(signals).toContain("PRIDE");
    expect(signals).toContain("DISCIPLINE");
    expect(signals).toContain("FRUSTRATION");
    expect(signals).toContain("RESISTANCE");
  });

  test("2. Should have keywords for each signal", () => {
    expect(EQ_KEYWORDS.ANXIETY.length).toBeGreaterThan(0);
    expect(EQ_KEYWORDS.ANXIETY).toContain("anxious");
    expect(EQ_KEYWORDS.ANXIETY).toContain("nervous");

    expect(EQ_KEYWORDS.EAGERNESS.length).toBeGreaterThan(0);
    expect(EQ_KEYWORDS.EAGERNESS).toContain("excited");
    expect(EQ_KEYWORDS.EAGERNESS).toContain("ready");
  });

  test("3. Should return correct signal labels", () => {
    expect(getEQSignalLabel("ANXIETY")).toBe("Anxious/Nervous");
    expect(getEQSignalLabel("EAGERNESS")).toBe("Eager/Excited");
    expect(getEQSignalLabel("RESISTANCE")).toBe("Resistant/Defiant");
  });

  test("4. Should categorize signals correctly", () => {
    expect(getEQSignalCategory("ANXIETY")).toBe("negative");
    expect(getEQSignalCategory("INSECURITY")).toBe("negative");
    expect(getEQSignalCategory("FRUSTRATION")).toBe("negative");

    expect(getEQSignalCategory("EAGERNESS")).toBe("positive");
    expect(getEQSignalCategory("CONFIDENCE")).toBe("positive");
    expect(getEQSignalCategory("PRIDE")).toBe("positive");

    expect(getEQSignalCategory("CURIOSITY")).toBe("neutral");
  });

  test("5. Should identify signals needing support", () => {
    expect(isSupportiveSignalNeeded("ANXIETY")).toBe(true);
    expect(isSupportiveSignalNeeded("INSECURITY")).toBe(true);
    expect(isSupportiveSignalNeeded("OVERWHELM")).toBe(true);
    expect(isSupportiveSignalNeeded("FRUSTRATION")).toBe(true);

    expect(isSupportiveSignalNeeded("EAGERNESS")).toBe(false);
    expect(isSupportiveSignalNeeded("CONFIDENCE")).toBe(false);
  });

  test("6. Should identify signals appropriate for challenge", () => {
    expect(isChallengingSignalAppropriate("CONFIDENCE")).toBe(true);
    expect(isChallengingSignalAppropriate("EAGERNESS")).toBe(true);
    expect(isChallengingSignalAppropriate("DISCIPLINE")).toBe(true);
    expect(isChallengingSignalAppropriate("PRIDE")).toBe(true);

    expect(isChallengingSignalAppropriate("ANXIETY")).toBe(false);
    expect(isChallengingSignalAppropriate("INSECURITY")).toBe(false);
  });
});

/**
 * ======================
 * EQ CLASSIFIER TESTS (10)
 * ======================
 */
describe("EQ Classifier", () => {
  test("7. Should detect ANXIETY from keywords", () => {
    const result = classifyEQKeywords("I'm so anxious about this essay deadline.");
    expect(result.signals).toContain("ANXIETY");
    expect(result.method).toBe("keyword");
    expect(result.confidence).toBeGreaterThan(0);
  });

  test("8. Should detect EAGERNESS from keywords", () => {
    const result = classifyEQKeywords("I'm so excited to start working on this!");
    expect(result.signals).toContain("EAGERNESS");
    expect(result.primary).toBe("EAGERNESS");
  });

  test("9. Should detect RESISTANCE from keywords", () => {
    const result = classifyEQKeywords("I don't want to do this essay right now.");
    expect(result.signals).toContain("RESISTANCE");
  });

  test("10. Should detect CONFUSION from keywords", () => {
    const result = classifyEQKeywords("I don't get what this prompt is asking for.");
    expect(result.signals).toContain("CONFUSION");
  });

  test("11. Should detect multiple signals", () => {
    const result = classifyEQKeywords(
      "I'm confused and overwhelmed by all these requirements."
    );
    expect(result.signals.length).toBeGreaterThan(1);
    expect(result.signals).toContain("CONFUSION");
    expect(result.signals).toContain("OVERWHELM");
  });

  test("12. Should return empty for neutral message", () => {
    const result = classifyEQKeywords("What time is the deadline?");
    expect(result.signals.length).toBe(0);
    expect(result.primary).toBeNull();
  });

  test("13. Should use LLM refinement when provided", async () => {
    const result = await classifyEQ(
      "I'm so stressed and freaking out about this.",
      mockEQRefinementLLM
    );

    expect(result.method).toBe("hybrid");
    expect(result.confidence).toBeGreaterThan(0.7);
    expect(result.signals).toContain("ANXIETY");
  });

  test("14. Should detect dominant signal from batch", () => {
    const results = [
      { signals: ["ANXIETY", "CONFUSION"] as EQSignal[], primary: "ANXIETY" as EQSignal, confidence: 0.7, method: "keyword" as const, trace: [] },
      { signals: ["ANXIETY", "OVERWHELM"] as EQSignal[], primary: "ANXIETY" as EQSignal, confidence: 0.7, method: "keyword" as const, trace: [] },
      { signals: ["ANXIETY"] as EQSignal[], primary: "ANXIETY" as EQSignal, confidence: 0.7, method: "keyword" as const, trace: [] }
    ];

    const dominant = getDominantSignal(results);
    expect(dominant).toBe("ANXIETY");
  });

  test("15. Should detect conflicting signals", () => {
    expect(hasConflictingSignals(["CONFIDENCE", "INSECURITY"])).toBe(true);
    expect(hasConflictingSignals(["EAGERNESS", "APATHY"])).toBe(true);
    expect(hasConflictingSignals(["ANXIETY", "CONFUSION"])).toBe(false);
  });

  test("16. Should filter low confidence signals", () => {
    const lowConfidence = {
      signals: ["ANXIETY", "CONFUSION", "OVERWHELM"] as EQSignal[],
      primary: "ANXIETY" as EQSignal,
      confidence: 0.4,
      method: "keyword" as const,
      trace: []
    };

    const filtered = filterLowConfidenceSignals(lowConfidence, 0.5);
    expect(filtered.signals.length).toBeLessThanOrEqual(2);
  });
});

/**
 * ======================
 * EQ PROFILE TRACKER TESTS (8)
 * ======================
 */
describe("EQ Profile Tracker", () => {
  test("17. Should initialize with zero signals", () => {
    const tracker = new EQProfileTracker("session-123");
    const profile = tracker.getProfile();

    expect(profile.cumulativeCount).toBe(0);
    expect(profile.primary).toBeNull();
    expect(profile.secondary).toBeNull();
  });

  test("18. Should accumulate signals", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY", "CONFUSION"]);
    tracker.addSignals(["EAGERNESS"]);

    const profile = tracker.getProfile();
    expect(profile.cumulativeCount).toBe(4);
    expect(profile.distribution.ANXIETY).toBe(2);
    expect(profile.distribution.CONFUSION).toBe(1);
    expect(profile.distribution.EAGERNESS).toBe(1);
  });

  test("19. Should identify primary signal", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["CONFUSION"]);

    const profile = tracker.getProfile();
    expect(profile.primary).toBe("ANXIETY");
  });

  test("20. Should identify secondary signal", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["CONFUSION"]);
    tracker.addSignals(["EAGERNESS"]);

    const profile = tracker.getProfile();
    expect(profile.primary).toBe("ANXIETY");
    expect(profile.secondary).toBe("CONFUSION");
  });

  test("21. Should calculate dominance", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["CONFUSION"]);

    const profile = tracker.getProfile();
    expect(profile.dominance).toBeCloseTo(0.75, 2); // 3/4 = 0.75
  });

  test("22. Should check if predominantly a signal", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["CONFUSION"]);

    expect(tracker.isPredominantly("ANXIETY", 50)).toBe(true);
    expect(tracker.isPredominantly("CONFUSION", 50)).toBe(false);
  });

  test("23. Should serialize and restore", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["CONFUSION"]);

    const serialized = tracker.serialize();
    const restored = EQProfileTracker.restore(serialized);

    expect(restored.getTotalCount()).toBe(2);
    expect(restored.getSignalCount("ANXIETY")).toBe(1);
    expect(restored.getSignalCount("CONFUSION")).toBe(1);
  });

  test("24. Should reset tracker", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["CONFUSION"]);
    tracker.reset();

    expect(tracker.getTotalCount()).toBe(0);
    const profile = tracker.getProfile();
    expect(profile.primary).toBeNull();
  });
});

/**
 * ======================
 * MOOD VECTOR ENGINE TESTS (8)
 * ======================
 */
describe("Mood Vector Engine", () => {
  test("25. Should return neutral baseline for no signals", () => {
    const tracker = new EQProfileTracker("session-123");
    const profile = tracker.getProfile();
    const vector = computeMoodVector(profile);

    expect(vector.warmth).toBe(0.5);
    expect(vector.firmness).toBe(0.5);
    expect(vector.empathy).toBe(0.5);
    expect(vector.pace).toBe(0.5);
    expect(vector.cheer).toBe(0.5);
    expect(vector.optimism).toBe(0.5);
    expect(vector.intensity).toBe(0.5);
  });

  test("26. Should adjust for ANXIETY signal", () => {
    const tracker = new EQProfileTracker("session-123");
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);

    const profile = tracker.getProfile();
    const vector = computeMoodVector(profile);

    // ANXIETY should increase warmth & empathy, decrease pace & firmness
    expect(vector.warmth).toBeGreaterThan(0.7);
    expect(vector.empathy).toBeGreaterThan(0.7);
    expect(vector.pace).toBeLessThan(0.5);
    expect(vector.firmness).toBeLessThan(0.5);
  });

  test("27. Should adjust for EAGERNESS signal", () => {
    const tracker = new EQProfileTracker("session-123");
    tracker.addSignals(["EAGERNESS"]);
    tracker.addSignals(["EAGERNESS"]);

    const profile = tracker.getProfile();
    const vector = computeMoodVector(profile);

    // EAGERNESS should increase pace, firmness, cheer
    expect(vector.pace).toBeGreaterThan(0.5);
    expect(vector.firmness).toBeGreaterThan(0.5);
    expect(vector.cheer).toBeGreaterThan(0.5);
  });

  test("28. Should adjust for RESISTANCE signal", () => {
    const tracker = new EQProfileTracker("session-resistance");
    tracker.addSignals(["RESISTANCE"]);
    tracker.addSignals(["RESISTANCE"]); // Add twice to ensure it's primary

    const profile = tracker.getProfile();
    const vector = computeMoodVector(profile);

    // RESISTANCE should increase firmness & intensity
    expect(vector.firmness).toBeGreaterThan(0.8);
    expect(vector.intensity).toBeGreaterThan(0.8);
  });

  test("29. Should blend primary + secondary signals", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["EAGERNESS"]);

    const profile = tracker.getProfile();
    expect(profile.primary).toBe("ANXIETY");
    expect(profile.secondary).toBe("EAGERNESS");

    const vector = computeMoodVector(profile);

    // Should be primarily ANXIETY but with some EAGERNESS blend
    expect(vector.warmth).toBeGreaterThan(0.5); // ANXIETY influence
    expect(vector.pace).toBeGreaterThan(0.3); // EAGERNESS blend
  });

  test("30. Should format mood vector for prompt", () => {
    const tracker = new EQProfileTracker("session-123");
    tracker.addSignals(["ANXIETY"]);

    const profile = tracker.getProfile();
    const vector = computeMoodVector(profile);
    const formatted = formatMoodVectorForPrompt(vector);

    expect(formatted).toContain("MOOD VECTOR");
    expect(formatted).toContain("Warmth:");
    expect(formatted).toContain("Firmness:");
    expect(formatted).toContain("Empathy:");
    expect(formatted).toContain("Pace:");
  });

  test("31. Should describe mood vector", () => {
    const tracker = new EQProfileTracker("session-123");
    tracker.addSignals(["ANXIETY"]);

    const profile = tracker.getProfile();
    const vector = computeMoodVector(profile);
    const description = getMoodVectorDescription(vector);

    expect(description).toContain("Mood Vector:");
    expect(description).toContain("Warmth:");
    expect(description).toContain("High"); // ANXIETY = high warmth
  });

  test("32. Should compare mood vectors", () => {
    const tracker1 = new EQProfileTracker("session-1");
    tracker1.addSignals(["ANXIETY"]);
    const vector1 = computeMoodVector(tracker1.getProfile());

    const tracker2 = new EQProfileTracker("session-2");
    tracker2.addSignals(["EAGERNESS"]);
    const vector2 = computeMoodVector(tracker2.getProfile());

    const diff = compareMoodVectors(vector1, vector2);

    // EAGERNESS has higher pace than ANXIETY
    expect(diff.pace).toBeGreaterThan(0);

    // ANXIETY has higher warmth than EAGERNESS
    expect(diff.warmth).toBeLessThan(0);
  });
});

/**
 * ======================
 * LLM REFINEMENT TESTS (6)
 * ======================
 */
describe("LLM EQ Refinement", () => {
  test("33. Mock LLM should refine anxiety signals", async () => {
    const refined = await mockEQRefinementLLM(
      "I'm so stressed and freaking out about this deadline.",
      []
    );

    expect(refined).toContain("ANXIETY");
  });

  test("34. Mock LLM should refine eagerness signals", async () => {
    const refined = await mockEQRefinementLLM("I'm so excited, let's do this!", []);

    expect(refined).toContain("EAGERNESS");
  });

  test("35. Mock LLM should refine resistance signals", async () => {
    const refined = await mockEQRefinementLLM("I don't want to do this essay.", []);

    expect(refined).toContain("RESISTANCE");
  });

  test("36. Mock LLM should preserve preliminary signals", async () => {
    const refined = await mockEQRefinementLLM("I'm not sure what to do.", ["CONFUSION"]);

    expect(refined).toContain("CONFUSION");
  });

  test("37. Should validate refinement results", () => {
    const preliminary: EQSignal[] = ["ANXIETY"];
    const refined: EQSignal[] = ["ANXIETY", "OVERWHELM"];

    const validation = validateRefinement(preliminary, refined);
    expect(validation.isValid).toBe(true);
    expect(validation.warnings.length).toBe(0);
  });

  test("38. Should warn on excessive new signals", () => {
    const preliminary: EQSignal[] = ["ANXIETY"];
    const refined: EQSignal[] = [
      "ANXIETY",
      "OVERWHELM",
      "CONFUSION",
      "FRUSTRATION",
      "INSECURITY"
    ];

    const validation = validateRefinement(preliminary, refined);
    expect(validation.warnings.length).toBeGreaterThan(0);
  });
});

/**
 * ======================
 * INTEGRATION TESTS (4)
 * ======================
 */
describe("EQ Engine Integration", () => {
  test("39. Full flow: classify → track → compute mood", async () => {
    // Step 1: Classify student message
    const result = await classifyEQ(
      "I'm so anxious about my college essay. I don't know where to start.",
      mockEQRefinementLLM
    );

    expect(result.signals.length).toBeGreaterThan(0);

    // Step 2: Track in profile
    const tracker = new EQProfileTracker("session-123");
    tracker.addSignals(result.signals);

    expect(tracker.getTotalCount()).toBeGreaterThan(0);

    // Step 3: Compute mood vector
    const profile = tracker.getProfile();
    const vector = computeMoodVector(profile);

    expect(vector.warmth).toBeGreaterThan(0.5); // Should be warm for anxiety
    expect(vector.empathy).toBeGreaterThan(0.5); // Should be empathetic
  });

  test("40. Multiple messages should accumulate profile", async () => {
    const tracker = new EQProfileTracker("session-123");

    // Message 1: Anxious
    const result1 = await classifyEQ("I'm so nervous about this.", mockEQRefinementLLM);
    tracker.addSignals(result1.signals);

    // Message 2: Still anxious
    const result2 = await classifyEQ(
      "This is overwhelming me.",
      mockEQRefinementLLM
    );
    tracker.addSignals(result2.signals);

    // Message 3: Becoming eager
    const result3 = await classifyEQ("Okay, I'm ready to try.", mockEQRefinementLLM);
    tracker.addSignals(result3.signals);

    const profile = tracker.getProfile();
    expect(profile.cumulativeCount).toBeGreaterThan(0);
    expect(profile.primary).not.toBeNull();
  });

  test("41. Mood vector should adapt as profile changes", () => {
    const tracker = new EQProfileTracker("session-123");

    // Start anxious
    tracker.addSignals(["ANXIETY"]);
    const vector1 = computeMoodVector(tracker.getProfile());
    expect(vector1.warmth).toBeGreaterThan(0.7);

    // Become more eager
    tracker.addSignals(["EAGERNESS"]);
    tracker.addSignals(["EAGERNESS"]);
    tracker.addSignals(["EAGERNESS"]);

    const vector2 = computeMoodVector(tracker.getProfile());
    expect(vector2.pace).toBeGreaterThan(vector1.pace); // Should increase pace
  });

  test("42. Summary should describe entire EQ state", () => {
    const tracker = new EQProfileTracker("session-123");

    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["ANXIETY"]);
    tracker.addSignals(["CONFUSION"]);
    tracker.addSignals(["EAGERNESS"]);

    const summary = tracker.getSummary();

    expect(summary).toContain("EQ Profile");
    expect(summary).toContain("Total Signals:");
    expect(summary).toContain("Primary:");
    expect(summary).toContain("Secondary:");
  });
});
