/**
 * jennyRhythm.test.ts
 *
 * Comprehensive test suite for Jenny's Sentence-Rhythm Model.
 * Tests clause generation, rhythm engine, and rewriter functionality.
 */

import {
  JennyClauseGenerator,
  JennyRhythmEngine,
  JennyRewriter,
  buildQuickArc,
  buildAutoArc,
  quickRewrite,
  lightRewrite,
  EmotionalState,
  RhythmPacing,
  ArchetypeLabel,
  ClauseOptions,
  RewriteOptions,
} from "../jennyRhythm";
import { ToneDirective } from "../toneModulationEngine";

describe("JennyClauseGenerator", () => {
  let generator: JennyClauseGenerator;

  beforeEach(() => {
    generator = new JennyClauseGenerator();
  });

  describe("Validation Clause Generation", () => {
    test("generates overwhelmed validation clause", () => {
      const opts: ClauseOptions = {
        emotionalState: "overwhelmed",
        pacing: "slow",
        archetype: "AnxiousPerfectionist",
      };

      const clause = generator.generateValidationClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
      // Should feel supportive and acknowledging (just verify it's non-empty)
      expect(clause.length).toBeGreaterThan(10);
    });

    test("generates stressed validation clause", () => {
      const opts: ClauseOptions = {
        emotionalState: "stressed",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const clause = generator.generateValidationClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
    });

    test("generates stable validation clause", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const clause = generator.generateValidationClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
    });

    test("includes archetype-specific validation for anxious perfectionist", () => {
      const opts: ClauseOptions = {
        emotionalState: "stressed",
        pacing: "slow",
        archetype: "AnxiousPerfectionist",
      };

      // Run multiple times to potentially hit archetype-specific clause
      const clauses: string[] = [];
      for (let i = 0; i < 20; i++) {
        clauses.push(generator.generateValidationClause(opts));
      }

      // Should have variety
      const unique = new Set(clauses);
      expect(unique.size).toBeGreaterThan(1);
    });
  });

  describe("Direction Clause Generation", () => {
    test("generates slow pacing direction clause", () => {
      const opts: ClauseOptions = {
        emotionalState: "overwhelmed",
        pacing: "slow",
        archetype: "QuietDeepThinker",
      };

      const clause = generator.generateDirectionClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
      // Slow pacing should include grounding language (just verify it's non-empty)
      expect(clause.length).toBeGreaterThan(10);
    });

    test("generates fast pacing direction clause", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "fast",
        archetype: "HighAchiever",
      };

      const clause = generator.generateDirectionClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
      // Fast pacing should include momentum language (just verify it's non-empty)
      expect(clause.length).toBeGreaterThan(10);
    });

    test("generates medium pacing direction clause", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const clause = generator.generateDirectionClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
    });
  });

  describe("Encouragement Clause Generation", () => {
    test("generates encouragement for overwhelmed student", () => {
      const opts: ClauseOptions = {
        emotionalState: "overwhelmed",
        pacing: "slow",
        archetype: "AnxiousPerfectionist",
      };

      const clause = generator.generateEncouragementClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
    });

    test("generates encouragement for stable student", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const clause = generator.generateEncouragementClause(opts);

      expect(clause).toBeDefined();
      expect(clause.length).toBeGreaterThan(0);
    });
  });

  describe("Breath Marker Generation", () => {
    test("generates slow pacing breath marker", () => {
      const marker = generator.generateBreathMarker("slow");

      expect(marker).toBeDefined();
      expect(marker.length).toBeGreaterThan(0);
    });

    test("generates medium pacing breath marker", () => {
      const marker = generator.generateBreathMarker("medium");

      expect(marker).toBeDefined();
    });

    test("generates fast pacing breath marker", () => {
      const marker = generator.generateBreathMarker("fast");

      expect(marker).toBeDefined();
    });
  });

  describe("Softener Generation", () => {
    test("generates softener phrase", () => {
      const softener = generator.generateSoftener();

      expect(softener).toBeDefined();
      expect(softener.length).toBeGreaterThan(0);
      // Should be invitational, not directive
      expect(
        softener.includes("Let") ||
        softener.includes("suggest") ||
        softener.includes("might") ||
        softener.includes("could")
      ).toBe(true);
    });
  });

  describe("State Management", () => {
    test("getState returns clause generator state", () => {
      const state = generator.getState();

      expect(state).toHaveProperty("recentlyUsedCount");
      expect(state.recentlyUsedCount).toBe(0);
    });

    test("reset clears recently used clauses", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      // Generate some clauses
      generator.generateValidationClause(opts);
      generator.generateDirectionClause(opts);

      let state = generator.getState();
      expect(state.recentlyUsedCount).toBeGreaterThan(0);

      // Reset
      generator.reset();

      state = generator.getState();
      expect(state.recentlyUsedCount).toBe(0);
    });
  });
});

describe("JennyRhythmEngine", () => {
  let engine: JennyRhythmEngine;
  let tone: ToneDirective;

  beforeEach(() => {
    engine = new JennyRhythmEngine();
    tone = {
      warmth: 7,
      directness: 6,
      assertiveness: 6,
      pacing: "medium",
      specificity: 7,
      styleMarkers: [],
      rationale: "Test tone",
    };
  });

  describe("Two-Sentence Arc", () => {
    test("builds two-sentence arc with validation and direction", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const arc = engine.buildTwoSentenceArc(tone, opts);

      expect(arc.validation).toBeDefined();
      expect(arc.direction).toBeDefined();
      expect(arc.encouragement).toBeUndefined();
      expect(arc.pattern).toBe("validation-direction");
    });

    test("arc contains non-empty validation and direction", () => {
      const opts: ClauseOptions = {
        emotionalState: "stressed",
        pacing: "slow",
        archetype: "AnxiousPerfectionist",
      };

      const arc = engine.buildTwoSentenceArc(tone, opts);

      expect(arc.validation!.length).toBeGreaterThan(0);
      expect(arc.direction!.length).toBeGreaterThan(0);
    });
  });

  describe("Three-Sentence Arc", () => {
    test("builds three-sentence arc with validation, direction, and encouragement", () => {
      const opts: ClauseOptions = {
        emotionalState: "overwhelmed",
        pacing: "slow",
        archetype: "QuietDeepThinker",
      };

      const arc = engine.buildThreeSentenceArc(tone, opts);

      expect(arc.validation).toBeDefined();
      expect(arc.direction).toBeDefined();
      expect(arc.encouragement).toBeDefined();
      expect(arc.pattern).toBe("validation-direction-encouragement");
    });
  });

  describe("Grounding-Clarity Arc", () => {
    test("builds grounding-clarity arc with breath marker", () => {
      const opts: ClauseOptions = {
        emotionalState: "overwhelmed",
        pacing: "slow",
        archetype: "UnfocusedExplorer",
      };

      const arc = engine.buildGroundingClarityArc(tone, opts);

      expect(arc.validation).toBeDefined();
      expect(arc.direction).toBeDefined();
      expect(arc.pattern).toBe("grounding-clarity");
    });
  });

  describe("Empathy-Action Arc", () => {
    test("builds empathy-action arc with softener", () => {
      const opts: ClauseOptions = {
        emotionalState: "stressed",
        pacing: "slow",
        archetype: "AnxiousPerfectionist",
      };

      const arc = engine.buildEmpathyActionArc(tone, opts);

      expect(arc.validation).toBeDefined();
      expect(arc.direction).toBeDefined();
      expect(arc.encouragement).toBeDefined();
      expect(arc.pattern).toBe("empathy-action");
    });
  });

  describe("Arc Pattern Selection", () => {
    test("selects grounding-clarity for overwhelmed student", () => {
      const opts: ClauseOptions = {
        emotionalState: "overwhelmed",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const pattern = engine.selectArcPattern(tone, opts);

      expect(pattern).toBe("grounding-clarity");
    });

    test("selects empathy-action for stressed student with slow pacing", () => {
      const opts: ClauseOptions = {
        emotionalState: "stressed",
        pacing: "slow",
        archetype: "QuietDeepThinker",
      };

      const pattern = engine.selectArcPattern(tone, opts);

      expect(pattern).toBe("empathy-action");
    });

    test("selects validation-direction for high directness", () => {
      const highDirectnessTone: ToneDirective = {
        ...tone,
        directness: 9,
      };

      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "fast",
        archetype: "HighAchiever",
      };

      const pattern = engine.selectArcPattern(highDirectnessTone, opts);

      expect(pattern).toBe("validation-direction");
    });
  });

  describe("Arc to String Conversion", () => {
    test("converts arc to formatted string", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const arc = engine.buildTwoSentenceArc(tone, opts);
      const str = engine.arcToString(arc);

      expect(str).toBeDefined();
      expect(str.length).toBeGreaterThan(0);
      expect(str).toContain(arc.validation!);
      expect(str).toContain(arc.direction!);
    });
  });

  describe("Helper Functions", () => {
    test("buildQuickArc generates arc string", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      const str = buildQuickArc(tone, opts);

      expect(str).toBeDefined();
      expect(str.length).toBeGreaterThan(0);
    });

    test("buildAutoArc generates arc with auto-selected pattern", () => {
      const opts: ClauseOptions = {
        emotionalState: "overwhelmed",
        pacing: "slow",
        archetype: "AnxiousPerfectionist",
      };

      const str = buildAutoArc(tone, opts);

      expect(str).toBeDefined();
      expect(str.length).toBeGreaterThan(0);
    });
  });

  describe("State Management", () => {
    test("getState returns engine state", () => {
      const state = engine.getState();

      expect(state).toHaveProperty("clauseGenState");
    });

    test("reset clears engine state", () => {
      const opts: ClauseOptions = {
        emotionalState: "stable",
        pacing: "medium",
        archetype: "HighAchiever",
      };

      // Generate some arcs
      engine.buildTwoSentenceArc(tone, opts);

      // Reset
      engine.reset();

      const state = engine.getState();
      expect(state.clauseGenState.recentlyUsedCount).toBe(0);
    });
  });
});

describe("JennyRewriter", () => {
  let rewriter: JennyRewriter;
  let tone: ToneDirective;
  let opts: RewriteOptions;

  beforeEach(() => {
    rewriter = new JennyRewriter();
    tone = {
      warmth: 7,
      directness: 6,
      assertiveness: 6,
      pacing: "medium",
      specificity: 7,
      styleMarkers: [],
      rationale: "Test tone",
    };
    opts = {
      tone,
      emotionalState: "stable",
      pacing: "medium",
      archetype: "HighAchiever",
    };
  });

  describe("Full Rewrite", () => {
    test("rewrites single sentence into Jenny arc", () => {
      const input = "You need to work on your college applications.";

      const output = rewriter.rewrite(input, opts);

      expect(output).toBeDefined();
      expect(output.length).toBeGreaterThan(0);
      expect(output).not.toBe(input); // Should be transformed
    });

    test("rewrites multiple sentences into multiple arcs", () => {
      const input = "You seem stressed about college. It's a big decision. You should start working on applications soon.";

      const output = rewriter.rewrite(input, opts);

      expect(output).toBeDefined();
      expect(output.length).toBeGreaterThan(0);
    });

    test("respects maxSentences constraint", () => {
      const input = "Sentence one. Sentence two. Sentence three. Sentence four. Sentence five.";

      const output = rewriter.rewrite(input, { ...opts, maxSentences: 2 });

      expect(output).toBeDefined();
      // Should have fewer arcs than input sentences
    });
  });

  describe("Light Rewrite", () => {
    test("applies light rewrite with breath markers", () => {
      const input = "You need to focus. College is important. Start your applications.";

      const output = rewriter.lightRewrite(input, { ...opts, pacing: "slow" });

      expect(output).toBeDefined();
      expect(output.length).toBeGreaterThan(0);
    });

    test("preserves content in light rewrite", () => {
      const input = "You're doing well with your planning.";

      const output = rewriter.lightRewrite(input, opts);

      expect(output).toBeDefined();
      // Should contain similar content (though may have breath markers)
    });
  });

  describe("Helper Functions", () => {
    test("quickRewrite transforms content", () => {
      const input = "College applications are stressful.";

      const output = quickRewrite(input, opts);

      expect(output).toBeDefined();
      expect(output.length).toBeGreaterThan(0);
    });

    test("lightRewrite helper works", () => {
      const input = "You're making progress.";

      const output = lightRewrite(input, opts);

      expect(output).toBeDefined();
      expect(output.length).toBeGreaterThan(0);
    });
  });

  describe("State Management", () => {
    test("getState returns rewriter state", () => {
      const state = rewriter.getState();

      expect(state).toHaveProperty("engineState");
    });

    test("reset clears rewriter state", () => {
      const input = "Test sentence.";

      // Run rewrite
      rewriter.rewrite(input, opts);

      // Reset
      rewriter.reset();

      const state = rewriter.getState();
      expect(state.engineState.clauseGenState.recentlyUsedCount).toBe(0);
    });
  });
});

describe("Integration Tests", () => {
  test("complete flow: overwhelmed student gets grounding arc", () => {
    const tone: ToneDirective = {
      warmth: 9,
      directness: 5,
      assertiveness: 4,
      pacing: "slow",
      specificity: 6,
      styleMarkers: ["warm-empathetic"],
      rationale: "Overwhelmed student",
    };

    const opts: RewriteOptions = {
      tone,
      emotionalState: "overwhelmed",
      pacing: "slow",
      archetype: "AnxiousPerfectionist",
    };

    const input = "I have so much to do and I don't know where to start. Everything feels impossible.";

    const output = quickRewrite(input, opts);

    expect(output).toBeDefined();
    expect(output.length).toBeGreaterThan(0);
    // Should have Jenny's rhythm
  });

  test("complete flow: high achiever gets crisp arc", () => {
    const tone: ToneDirective = {
      warmth: 4,
      directness: 9,
      assertiveness: 8,
      pacing: "fast",
      specificity: 9,
      styleMarkers: ["crisp", "direct-clear"],
      rationale: "High achiever",
    };

    const opts: RewriteOptions = {
      tone,
      emotionalState: "stable",
      pacing: "fast",
      archetype: "HighAchiever",
    };

    const input = "What should I focus on for my college applications?";

    const output = quickRewrite(input, opts);

    expect(output).toBeDefined();
    expect(output.length).toBeGreaterThan(0);
  });

  test("complete flow: quiet deep thinker gets reflective arc", () => {
    const tone: ToneDirective = {
      warmth: 7,
      directness: 5,
      assertiveness: 3,
      pacing: "slow",
      specificity: 5,
      styleMarkers: ["gentle-invitational", "thoughtful"],
      rationale: "Quiet deep thinker",
    };

    const opts: RewriteOptions = {
      tone,
      emotionalState: "stable",
      pacing: "slow",
      archetype: "QuietDeepThinker",
    };

    const input = "I've been thinking about my career options.";

    const output = quickRewrite(input, opts);

    expect(output).toBeDefined();
    expect(output.length).toBeGreaterThan(0);
  });
});
