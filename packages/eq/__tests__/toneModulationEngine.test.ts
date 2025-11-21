/**
 * Tests for Tone Modulation Layer v4.0
 *
 * Verifies:
 * - Archetype baseline tones
 * - EQ state adjustments
 * - Coaching move adjustments
 * - Priority and layering
 * - Range normalization
 */

import {
  ToneModulationEngine,
  ArchetypeProfile,
  EQStateForTone,
  ToneDirective,
  convertEQStateForTone,
  convertArchetypeToProfile,
  buildToneHints,
  getToneSummary
} from "../toneModulationEngine";
import { CoachingMove } from "../microCoachingEngine";
import { EQRuntimeState } from "../../agents/assessment-agent/src/eqRuntime";

// Mock helpers
const fakeArchetype = (type: string): ArchetypeProfile => ({
  type: type as any,
  confidence: 0.5
});

const fakeEQ = (overrides?: Partial<EQStateForTone>): EQStateForTone => ({
  valence: 0,
  activation: "medium",
  cognitiveLoad: "medium",
  vulnerability: false,
  safetySignals: true,
  ...overrides
});

describe("ToneModulationEngine - Archetype Baselines", () => {
  test("HighAchiever baseline: high directness, high specificity, fast pacing", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.directness).toBeGreaterThanOrEqual(8);
    expect(directive.specificity).toBeGreaterThanOrEqual(8);
    expect(directive.pacing).toBe("fast");
    expect(directive.warmth).toBeLessThanOrEqual(5);
  });

  test("AnxiousPerfectionist baseline: high warmth, low assertiveness, slow pacing", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.warmth).toBeGreaterThanOrEqual(8);
    expect(directive.assertiveness).toBeLessThanOrEqual(5);
    expect(directive.pacing).toBe("slow");
  });

  test("UnfocusedExplorer baseline: balanced, medium pacing", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("UnfocusedExplorer");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.warmth).toBeGreaterThanOrEqual(6);
    expect(directive.pacing).toBe("medium");
    expect(directive.styleMarkers).toContain("curiosity-led");
  });

  test("ReluctantPragmatist baseline: high directness, respect autonomy", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("ReluctantPragmatist");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.directness).toBeGreaterThanOrEqual(7);
    expect(directive.specificity).toBeGreaterThanOrEqual(7);
    expect(directive.styleMarkers).toContain("respect autonomy");
  });

  test("OverscheduledOverachiever baseline: high warmth, low assertiveness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("OverscheduledOverachiever");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.warmth).toBeGreaterThanOrEqual(7);
    expect(directive.assertiveness).toBeLessThanOrEqual(5);
    expect(directive.styleMarkers).toContain("relieve pressure");
  });

  test("QuietDeepThinker baseline: high specificity, slow pacing, reflective", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("QuietDeepThinker");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.specificity).toBeGreaterThanOrEqual(8);
    expect(directive.pacing).toBe("slow");
    expect(directive.styleMarkers).toContain("reflective");
  });

  test("Unknown archetype: balanced defaults", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("Unknown");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.warmth).toBe(6);
    expect(directive.directness).toBe(6);
    expect(directive.assertiveness).toBe(5);
    expect(directive.pacing).toBe("medium");
  });
});

describe("ToneModulationEngine - EQ Adjustments", () => {
  test("Negative valence increases warmth, decreases assertiveness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({ valence: -0.7 });

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.warmth).toBeGreaterThan(4); // Base is 4, should increase
    expect(directive.assertiveness).toBeLessThan(7); // Base is 7, should decrease
    expect(directive.pacing).toBe("slow");
    expect(directive.styleMarkers).toContain("emotional-safety");
  });

  test("High cognitive load increases specificity, slows pacing", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({ cognitiveLoad: "high" });

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.specificity).toBeGreaterThan(9); // Base is 9, should increase
    expect(directive.directness).toBeLessThan(9); // Base is 9, should decrease
    expect(directive.pacing).toBe("slow");
    expect(directive.styleMarkers).toContain("reduce-information-density");
  });

  test("High activation increases pacing and directness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist");
    const eq = fakeEQ({ activation: "high" });

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.pacing).toBe("fast");
    expect(directive.directness).toBeGreaterThan(5); // Base is 5, should increase
    expect(directive.styleMarkers).toContain("momentum-matching");
  });

  test("Vulnerability maximizes warmth, minimizes assertiveness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({ vulnerability: true });

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.warmth).toBeGreaterThan(4); // Base 4 + 3
    expect(directive.assertiveness).toBeLessThan(7); // Base 7 - 2
    expect(directive.pacing).toBe("slow");
    expect(directive.styleMarkers).toContain("warm-grounding");
  });

  test("Multiple EQ signals compound", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({
      valence: -0.5,
      cognitiveLoad: "high",
      vulnerability: true
    });

    const directive = engine.modulate(archetype, eq, "none");

    // All three should affect warmth
    expect(directive.warmth).toBeGreaterThan(7); // Significant increase
    expect(directive.pacing).toBe("slow");
    expect(directive.styleMarkers.length).toBeGreaterThan(3); // Multiple markers
  });
});

describe("ToneModulationEngine - Coaching Move Adjustments", () => {
  test("Affirm move increases warmth", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "affirm");

    expect(directive.warmth).toBeGreaterThan(4); // Base 4 + 2
    expect(directive.styleMarkers).toContain("validation");
    expect(directive.rationale).toContain("affirm");
  });

  test("Reframe move increases directness and specificity", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "reframe");

    expect(directive.directness).toBeGreaterThan(5); // Base 5 + 2
    expect(directive.specificity).toBeGreaterThan(6); // Base 6 + 2
    expect(directive.styleMarkers).toContain("clarity-blade");
  });

  test("Challenge move increases assertiveness significantly", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("UnfocusedExplorer");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "challenge");

    expect(directive.assertiveness).toBeGreaterThan(5); // Base 5 + 3
    expect(directive.directness).toBeGreaterThan(6); // Base 6 + 1
    expect(directive.styleMarkers).toContain("gentle-push");
  });

  test("Motivate move increases warmth and assertiveness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("ReluctantPragmatist");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "motivate");

    expect(directive.warmth).toBeGreaterThan(5); // Base 5 + 1
    expect(directive.assertiveness).toBeGreaterThan(6); // Base 6 + 1
    expect(directive.styleMarkers).toContain("spark");
  });

  test("Accountability move increases directness and assertiveness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("UnfocusedExplorer");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "accountability");

    expect(directive.directness).toBeGreaterThan(6); // Base 6 + 3
    expect(directive.assertiveness).toBeGreaterThan(5); // Base 5 + 2
    expect(directive.styleMarkers).toContain("firm-kind");
  });

  test("Anchor move increases specificity", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "anchor");

    expect(directive.specificity).toBe(10); // Base 9 + 3, capped at 10
    expect(directive.styleMarkers).toContain("vision-link");
  });

  test("Mirror move slows pacing", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "mirror");

    expect(directive.pacing).toBe("slow"); // Overrides fast base
    expect(directive.styleMarkers).toContain("reflective-tone");
  });

  test("Breaker move increases pacing and directness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "breaker");

    expect(directive.pacing).toBe("fast"); // Overrides slow base
    expect(directive.directness).toBeGreaterThan(5); // Base 5 + 2
    expect(directive.styleMarkers).toContain("pattern-interrupt");
  });
});

describe("ToneModulationEngine - Layering and Priority", () => {
  test("HighAchiever + challenge = very high directness and assertiveness", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "challenge");

    expect(directive.directness).toBe(10); // 9 + 1 = 10
    expect(directive.assertiveness).toBe(10); // 7 + 3 = 10
  });

  test("AnxiousPerfectionist + affirm = maximum warmth", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "affirm");

    expect(directive.warmth).toBe(10); // 9 + 2 = 10 (capped)
  });

  test("Vulnerability + any move softens tone", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({ vulnerability: true });

    const directiveChallenge = engine.modulate(archetype, eq, "challenge");

    // Even with challenge, vulnerability should soften
    expect(directiveChallenge.warmth).toBeGreaterThan(6);
    expect(directiveChallenge.assertiveness).toBeLessThan(10);
    expect(directiveChallenge.pacing).toBe("slow");
  });

  test("High activation overrides base pacing", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist"); // Base slow
    const eq = fakeEQ({ activation: "high" });

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.pacing).toBe("fast"); // EQ overrides archetype
  });

  test("Mirror move overrides activation pacing", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever"); // Base fast
    const eq = fakeEQ({ activation: "high" }); // Would make fast

    const directive = engine.modulate(archetype, eq, "mirror");

    expect(directive.pacing).toBe("slow"); // Move overrides EQ
  });
});

describe("ToneModulationEngine - Range Normalization", () => {
  test("Warmth capped at 10", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist"); // Base 9
    const eq = fakeEQ({ vulnerability: true }); // +3

    const directive = engine.modulate(archetype, eq, "affirm"); // +2

    expect(directive.warmth).toBe(10); // 9 + 3 + 2 = 14, capped at 10
  });

  test("Assertiveness cannot go below 0", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("QuietDeepThinker"); // Base 3
    const eq = fakeEQ({ vulnerability: true, valence: -0.5 }); // -4

    const directive = engine.modulate(archetype, eq, "none");

    expect(directive.assertiveness).toBeGreaterThanOrEqual(0);
  });

  test("All values within 0-10 range", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({
      valence: -0.9,
      cognitiveLoad: "high",
      vulnerability: true,
      activation: "high"
    });

    const directive = engine.modulate(archetype, eq, "challenge");

    expect(directive.warmth).toBeGreaterThanOrEqual(0);
    expect(directive.warmth).toBeLessThanOrEqual(10);
    expect(directive.directness).toBeGreaterThanOrEqual(0);
    expect(directive.directness).toBeLessThanOrEqual(10);
    expect(directive.assertiveness).toBeGreaterThanOrEqual(0);
    expect(directive.assertiveness).toBeLessThanOrEqual(10);
    expect(directive.specificity).toBeGreaterThanOrEqual(0);
    expect(directive.specificity).toBeLessThanOrEqual(10);
  });
});

describe("Conversion Functions", () => {
  test("convertEQStateForTone converts high anxiety to negative valence", () => {
    const eqRuntime: EQRuntimeState = {
      stage: "diagnostic-probing",
      archetype: "high-achiever-anxious",
      anxietyLevel: "high",
      confidenceSignal: 0,
      lastDirectives: null,
      messageCountInStage: 0,
      totalMessages: 0,
      sessionStartTime: Date.now(),
      confidenceHistory: []
    };

    const toneState = convertEQStateForTone(eqRuntime);

    expect(toneState.valence).toBeLessThan(0);
    expect(toneState.vulnerability).toBe(true);
  });

  test("convertEQStateForTone converts high confidence to high activation", () => {
    const eqRuntime: EQRuntimeState = {
      stage: "rapport-building",
      archetype: "unknown",
      anxietyLevel: "low",
      confidenceSignal: 5,
      lastDirectives: null,
      messageCountInStage: 0,
      totalMessages: 0,
      sessionStartTime: Date.now(),
      confidenceHistory: [5]
    };

    const toneState = convertEQStateForTone(eqRuntime);

    expect(toneState.activation).toBe("high");
    expect(toneState.valence).toBeGreaterThan(0);
  });

  test("convertArchetypeToProfile maps EQ archetypes correctly", () => {
    expect(convertArchetypeToProfile("high-achiever-anxious").type).toBe("HighAchiever");
    expect(convertArchetypeToProfile("low-confidence-builder").type).toBe("AnxiousPerfectionist");
    expect(convertArchetypeToProfile("overconfident-spiky").type).toBe("ReluctantPragmatist");
    expect(convertArchetypeToProfile("late-starter").type).toBe("UnfocusedExplorer");
    expect(convertArchetypeToProfile("underdog-high-ceiling").type).toBe("QuietDeepThinker");
    expect(convertArchetypeToProfile("unknown").type).toBe("Unknown");
  });
});

describe("Helper Functions", () => {
  test("buildToneHints creates readable guidance", () => {
    const directive: ToneDirective = {
      warmth: 8,
      directness: 6,
      assertiveness: 5,
      pacing: "medium",
      specificity: 7,
      styleMarkers: ["validation", "warm-grounding"],
      rationale: "Test rationale"
    };

    const hints = buildToneHints(directive);

    expect(hints).toContain("TONE DIRECTIVE");
    expect(hints).toContain("Warmth: 8/10");
    expect(hints).toContain("Directness: 6/10");
    expect(hints).toContain("Pacing: medium");
    expect(hints).toContain("validation");
    expect(hints).toContain("warm-grounding");
  });

  test("getToneSummary creates concise summary", () => {
    const directive: ToneDirective = {
      warmth: 8,
      directness: 6,
      assertiveness: 5,
      pacing: "slow",
      specificity: 7,
      styleMarkers: [],
      rationale: ""
    };

    const summary = getToneSummary(directive);

    expect(summary).toContain("8");
    expect(summary).toContain("6");
    expect(summary).toContain("5");
    expect(summary).toContain("slow");
    expect(summary).toContain("7");
  });
});

describe("ToneModulationEngine - Integration Scenarios", () => {
  test("Scenario: High achiever student hits wall (vulnerable), gets affirmed", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({ valence: -0.6, vulnerability: true });

    const directive = engine.modulate(archetype, eq, "affirm");

    // Should soften the typical high-achiever tone
    expect(directive.warmth).toBeGreaterThan(7); // Significantly warmer
    expect(directive.assertiveness).toBeLessThan(7); // Less assertive than base
    expect(directive.pacing).toBe("slow");
    expect(directive.rationale).toContain("vulnerability");
    expect(directive.rationale).toContain("affirm");
  });

  test("Scenario: Anxious student gets clarity (reframe)", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("AnxiousPerfectionist");
    const eq = fakeEQ({ cognitiveLoad: "high" });

    const directive = engine.modulate(archetype, eq, "reframe");

    // Should increase clarity while maintaining warmth
    expect(directive.warmth).toBeGreaterThanOrEqual(8); // Maintain high warmth
    expect(directive.directness).toBeGreaterThan(5); // Increase for clarity
    expect(directive.specificity).toBeGreaterThan(8); // Very specific
    expect(directive.styleMarkers).toContain("clarity-blade");
    expect(directive.styleMarkers).toContain("reduce-information-density");
  });

  test("Scenario: Energized student gets challenged", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("HighAchiever");
    const eq = fakeEQ({ activation: "high", valence: 0.5 });

    const directive = engine.modulate(archetype, eq, "challenge");

    // Should match energy and push hard
    expect(directive.directness).toBe(10);
    expect(directive.assertiveness).toBe(10);
    expect(directive.pacing).toBe("fast");
    expect(directive.styleMarkers).toContain("gentle-push");
  });

  test("Scenario: Overscheduled student in loop gets breaker", () => {
    const engine = new ToneModulationEngine();
    const archetype = fakeArchetype("OverscheduledOverachiever");
    const eq = fakeEQ();

    const directive = engine.modulate(archetype, eq, "breaker");

    // Should interrupt pattern while staying empathetic
    expect(directive.warmth).toBeGreaterThanOrEqual(7); // Maintain baseline warmth
    expect(directive.pacing).toBe("fast"); // Pattern interrupt
    expect(directive.directness).toBeGreaterThan(7);
    expect(directive.styleMarkers).toContain("pattern-interrupt");
  });
});
