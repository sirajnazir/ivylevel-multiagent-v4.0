/**
 * Component 23 Tests - EQ-Aware Retrieval Fusion Engine
 *
 * Tests cover:
 * - Retrieval weight blending per EQ mode
 * - Archetype overrides for weights
 * - EQ-aware reranking accuracy
 * - Bland chip filtering
 * - Diversity constraints
 * - Weight normalization
 */

import {
  blendRetrievalWeights,
  getDominantWeight,
  validateWeights,
  getWeightExplanation
} from "../blendWeights";
import {
  calculateEQMetrics,
  rerankWithEQ,
  filterBlandChips,
  diversityRerank,
  boostNarrativeChips
} from "../rerankStrategies";
import { getRetrievalSummary, validateRetrievalResult } from "../eqAwareRetrieval";
import { RankedChunk } from "../ragTypes";

// Mock chips for testing
const mockChips: RankedChunk[] = [
  {
    id: "1",
    text: "I get it. This is overwhelming. Let's take it one step at a time.",
    semanticType: "eq",
    eqSignals: ["supportive", "empathetic"],
    score: 0.9,
    trace: []
  },
  {
    id: "2",
    text: "Here's the key thing: you need to focus on depth over breadth. Step 1 is to pick your spike.",
    semanticType: "framework",
    eqSignals: ["straight", "tactical"],
    score: 0.85,
    trace: []
  },
  {
    id: "3",
    text: "You absolutely can do this. I've seen students with less accomplish more.",
    semanticType: "narrative",
    eqSignals: ["uplifting", "encouraging"],
    score: 0.8,
    trace: []
  },
  {
    id: "4",
    text: "In my experience, students who focus on one thing deeply outperform those who spread thin.",
    semanticType: "framework",
    eqSignals: ["guiding", "experienced"],
    score: 0.75,
    trace: []
  },
  {
    id: "5",
    text: "Make sure to submit your application on time.",
    semanticType: "general",
    eqSignals: [],
    score: 0.5,
    trace: []
  }
];

describe("Component 23 - EQ-Aware Retrieval Fusion Engine", () => {
  /**
   * Test 1: Gentle mode boosts emotional weight
   */
  test("gentle mode prioritizes emotional content", () => {
    const weights = blendRetrievalWeights("gentle", "uncertain");

    expect(weights.emotional).toBeGreaterThan(0.4);
    expect(weights.emotional).toBeGreaterThan(weights.tactical);
  });

  /**
   * Test 2: Direct mode boosts tactical weight
   */
  test("direct mode prioritizes tactical content", () => {
    const weights = blendRetrievalWeights("direct", "uncertain");

    expect(weights.tactical).toBeGreaterThan(0.5);
    expect(weights.tactical).toBeGreaterThan(weights.emotional);
  });

  /**
   * Test 3: Motivational mode boosts emotional weight
   */
  test("motivational mode prioritizes emotional content", () => {
    const weights = blendRetrievalWeights("motivational", "uncertain");

    expect(weights.emotional).toBeGreaterThan(0.3);
    expect(weights.emotional).toBeGreaterThan(weights.tactical);
  });

  /**
   * Test 4: Mentor mode boosts semantic weight
   */
  test("mentor mode prioritizes semantic content", () => {
    const weights = blendRetrievalWeights("mentor", "uncertain");

    expect(weights.semantic).toBeGreaterThan(0.5);
    expect(weights.semantic).toBeGreaterThan(weights.tactical);
    expect(weights.semantic).toBeGreaterThan(weights.emotional);
  });

  /**
   * Test 5: High achiever archetype boosts tactical
   */
  test("high achiever archetype increases tactical weight", () => {
    const baseWeights = blendRetrievalWeights("mentor", "uncertain");
    const achieverWeights = blendRetrievalWeights("mentor", "high_achiever");

    expect(achieverWeights.tactical).toBeGreaterThan(baseWeights.tactical);
  });

  /**
   * Test 6: Burnout archetype boosts emotional
   */
  test("burnout archetype increases emotional weight", () => {
    const baseWeights = blendRetrievalWeights("direct", "uncertain");
    const burnoutWeights = blendRetrievalWeights("direct", "burnout");

    expect(burnoutWeights.emotional).toBeGreaterThan(baseWeights.emotional);
  });

  /**
   * Test 7: Quiet builder archetype boosts semantic
   */
  test("quiet builder archetype increases semantic weight", () => {
    const baseWeights = blendRetrievalWeights("direct", "uncertain");
    const builderWeights = blendRetrievalWeights("direct", "quiet_builder");

    expect(builderWeights.semantic).toBeGreaterThan(baseWeights.semantic);
  });

  /**
   * Test 8: Weights always sum to 1.0
   */
  test("weights are normalized to sum to 1.0", () => {
    const modes = ["gentle", "direct", "motivational", "mentor"];
    const archetypes = ["uncertain", "high_achiever", "burnout", "quiet_builder"];

    for (const mode of modes) {
      for (const archetype of archetypes) {
        const weights = blendRetrievalWeights(mode, archetype);
        const sum = weights.semantic + weights.tactical + weights.emotional;

        expect(sum).toBeCloseTo(1.0, 2);
      }
    }
  });

  /**
   * Test 9: Dominant weight detection
   */
  test("dominant weight is correctly identified", () => {
    const gentleWeights = blendRetrievalWeights("gentle", "uncertain");
    const directWeights = blendRetrievalWeights("direct", "uncertain");
    const mentorWeights = blendRetrievalWeights("mentor", "uncertain");

    expect(getDominantWeight(gentleWeights)).toBe("emotional");
    expect(getDominantWeight(directWeights)).toBe("tactical");
    expect(getDominantWeight(mentorWeights)).toBe("semantic");
  });

  /**
   * Test 10: Weight validation passes for valid weights
   */
  test("weight validation passes for valid weights", () => {
    const weights = blendRetrievalWeights("gentle", "uncertain");
    const warnings = validateWeights(weights);

    expect(warnings.length).toBe(0);
  });

  /**
   * Test 11: EQ metrics calculation for empathy
   */
  test("empathy metrics are calculated from EQ signals", () => {
    const chip = {
      text: "I get it. This is overwhelming. You're not alone in this.",
      metadata: {
        text: "",
        coachId: "jenny",
        sourcePath: "",
        semanticType: "eq",
        eqSignals: ["supportive", "empathetic"],
        order: 0,
        size: 0
      }
    };

    const metrics = calculateEQMetrics(chip);

    expect(metrics.empathy).toBeGreaterThan(0.5);
  });

  /**
   * Test 12: EQ metrics calculation for clarity
   */
  test("clarity metrics are calculated from tactical signals", () => {
    const chip = {
      text: "Here's what you need to do. Step 1: focus. Step 2: execute.",
      metadata: {
        text: "",
        coachId: "jenny",
        sourcePath: "",
        semanticType: "framework",
        eqSignals: ["straight", "tactical"],
        order: 0,
        size: 0
      }
    };

    const metrics = calculateEQMetrics(chip);

    expect(metrics.clarity).toBeGreaterThan(0.5);
  });

  /**
   * Test 13: EQ metrics calculation for energy
   */
  test("energy metrics are calculated from motivational signals", () => {
    const chip = {
      text: "You can do this! Let's go! I'm excited to see what you build.",
      metadata: {
        text: "",
        coachId: "jenny",
        sourcePath: "",
        semanticType: "narrative",
        eqSignals: ["uplifting", "encouraging"],
        order: 0,
        size: 0
      }
    };

    const metrics = calculateEQMetrics(chip);

    expect(metrics.energy).toBeGreaterThan(0.5);
  });

  /**
   * Test 14: EQ metrics calculation for wisdom
   */
  test("wisdom metrics are calculated from mentor signals", () => {
    const chip = {
      text: "In my experience, I've seen this pattern many times. Here's the framework that works.",
      metadata: {
        text: "",
        coachId: "jenny",
        sourcePath: "",
        semanticType: "framework",
        eqSignals: ["guiding", "experienced"],
        order: 0,
        size: 0
      }
    };

    const metrics = calculateEQMetrics(chip);

    expect(metrics.wisdom).toBeGreaterThan(0.5);
  });

  /**
   * Test 15: Gentle mode reranking prioritizes empathetic chips
   */
  test("gentle mode reranking boosts empathetic chips", () => {
    const reranked = rerankWithEQ(mockChips, "gentle");

    // First chip should have high empathy
    const topChip = reranked[0];
    expect(topChip.eqSignals).toContain("supportive");
  });

  /**
   * Test 16: Direct mode reranking prioritizes tactical chips
   */
  test("direct mode reranking boosts tactical chips", () => {
    const reranked = rerankWithEQ(mockChips, "direct");

    // First chip should have tactical signals
    const topChip = reranked[0];
    expect(topChip.eqSignals.some(s => s === "straight" || s === "tactical")).toBe(true);
  });

  /**
   * Test 17: Motivational mode reranking prioritizes energy chips
   */
  test("motivational mode reranking boosts energetic chips", () => {
    const reranked = rerankWithEQ(mockChips, "motivational");

    // First chip should have energy signals
    const topChip = reranked[0];
    expect(topChip.eqSignals.some(s => s === "uplifting" || s === "encouraging")).toBe(true);
  });

  /**
   * Test 18: Mentor mode reranking prioritizes wisdom chips
   */
  test("mentor mode reranking boosts wisdom chips", () => {
    const reranked = rerankWithEQ(mockChips, "mentor");

    // First chip should have wisdom signals
    const topChip = reranked[0];
    expect(topChip.eqSignals.some(s => s === "guiding" || s === "experienced")).toBe(true);
  });

  /**
   * Test 19: Bland chip filtering removes generic content
   */
  test("bland chip filtering removes generic chips", () => {
    const filtered = filterBlandChips(mockChips, 0.3);

    // Generic chip should be filtered out
    const hasGeneric = filtered.some(c => c.id === "5");
    expect(hasGeneric).toBe(false);

    // High-quality chips should remain
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.length).toBeLessThan(mockChips.length);
  });

  /**
   * Test 20: Diversity reranking limits chips per type
   */
  test("diversity reranking limits chips per semantic type", () => {
    const diversified = diversityRerank(mockChips, 1);

    // Count chips by type
    const typeCounts: Record<string, number> = {};
    diversified.forEach(chip => {
      typeCounts[chip.semanticType] = (typeCounts[chip.semanticType] || 0) + 1;
    });

    // No type should have more than 1 chip
    Object.values(typeCounts).forEach(count => {
      expect(count).toBeLessThanOrEqual(1);
    });
  });

  /**
   * Test 21: Narrative boost increases scores
   */
  test("narrative boost increases narrative chip scores", () => {
    const narrativeChip = mockChips.find(c => c.semanticType === "narrative")!;
    const originalScore = narrativeChip.score;

    const boosted = boostNarrativeChips(mockChips, 1.5);
    const boostedChip = boosted.find(c => c.id === narrativeChip.id)!;

    expect(boostedChip.score).toBeGreaterThan(originalScore);
    expect(boostedChip.score).toBeCloseTo(originalScore * 1.5, 2);
  });

  /**
   * Test 22: Weight explanation is generated
   */
  test("weight explanation provides readable summary", () => {
    const weights = blendRetrievalWeights("gentle", "burnout");
    const explanation = getWeightExplanation(weights, "gentle", "burnout");

    expect(explanation).toContain("Retrieval Weight Distribution");
    expect(explanation).toContain("gentle");
    expect(explanation).toContain("burnout");
    expect(explanation.length).toBeGreaterThan(50);
  });

  /**
   * Test 23: Retrieval result validation detects few chips
   */
  test("validation warns when too few chips retrieved", () => {
    const result = {
      chips: [mockChips[0], mockChips[1]], // Only 2 chips
      weights: blendRetrievalWeights("gentle", "uncertain"),
      signal: {
        eqMode: "gentle",
        intent: "academics",
        archetype: "uncertain",
        stage: "diagnose" as any
      },
      trace: [],
      filtered: {
        blandChipsRemoved: 0,
        diversityApplied: false
      }
    };

    const warnings = validateRetrievalResult(result);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("few chips");
  });

  /**
   * Test 24: Retrieval result validation detects lack of diversity
   */
  test("validation warns when all chips are same type", () => {
    const sameTypeChips = [
      { ...mockChips[0], semanticType: "eq" },
      { ...mockChips[1], semanticType: "eq" },
      { ...mockChips[2], semanticType: "eq" }
    ];

    const result = {
      chips: sameTypeChips,
      weights: blendRetrievalWeights("gentle", "uncertain"),
      signal: {
        eqMode: "gentle",
        intent: "eq",
        archetype: "uncertain",
        stage: "warmup" as any
      },
      trace: [],
      filtered: {
        blandChipsRemoved: 0,
        diversityApplied: false
      }
    };

    const warnings = validateRetrievalResult(result);

    expect(warnings.some(w => w.includes("same type"))).toBe(true);
  });

  /**
   * Test 25: Combined EQ mode + archetype produces expected weights
   */
  test("gentle mode + burnout archetype maximizes emotional weight", () => {
    const weights = blendRetrievalWeights("gentle", "burnout");

    // Should have very high emotional weight
    expect(weights.emotional).toBeGreaterThan(0.5);
    expect(weights.emotional).toBeGreaterThan(weights.semantic);
    expect(weights.emotional).toBeGreaterThan(weights.tactical);
  });

  /**
   * Test 26: Direct mode + high achiever maximizes tactical weight
   */
  test("direct mode + high achiever archetype maximizes tactical weight", () => {
    const weights = blendRetrievalWeights("direct", "high_achiever");

    // Should have very high tactical weight
    expect(weights.tactical).toBeGreaterThan(0.6);
    expect(weights.tactical).toBeGreaterThan(weights.semantic);
    expect(weights.tactical).toBeGreaterThan(weights.emotional);
  });
});
