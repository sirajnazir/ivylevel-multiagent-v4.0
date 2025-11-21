/**
 * Component 21 Tests - Adaptive RAG Retrieval Engine v4.0
 *
 * Tests cover:
 * - Intent detection accuracy
 * - EQ weighting logic
 * - Coach style scoring
 * - Unified chunk ranking
 * - Trace generation
 * - Full pipeline integration
 */

import { detectIntent, getIntentConfidence } from "../intentDetector";
import { applyEQWeight, getEQSignalMatchCount, isEQCompatible } from "../eqWeighting";
import { coachFit, getJennyStyleMatchCount, isJennyAuthentic } from "../coachFitScorer";
import { rankChunk, isRelatedIntent, filterLowQualityChunks } from "../chunkRanker";
import { buildTrace, formatTraceForDisplay, compareTraces } from "../chipTrace";
import { ChipMetadata, IntentType, EQMode } from "../ragTypes";

// Mock chip data for testing
const mockChipAcademics: ChipMetadata = {
  text: "Your GPA is solid at 3.8 unweighted. The real question is: what's the rigor story? How many APs did you take?",
  coachId: "jenny",
  sourcePath: "/test/academics.txt",
  semanticType: "academics",
  eqSignals: ["straight", "tactical"],
  order: 0,
  size: 113
};

const mockChipEQ: ChipMetadata = {
  text: "What excites you most about robotics? Is it the engineering? The teamwork? The competition? Your passion will shine through.",
  coachId: "jenny",
  sourcePath: "/test/eq.txt",
  semanticType: "eq",
  eqSignals: ["passion", "supportive"],
  order: 1,
  size: 126
};

const mockChipFramework: ChipMetadata = {
  text: "Here's the framework I use: colleges want to see you challenged yourself. Step 1: depth over breadth. Step 2: impact over participation.",
  coachId: "jenny",
  sourcePath: "/test/framework.txt",
  semanticType: "framework",
  eqSignals: ["tactical"],
  order: 2,
  size: 145
};

const mockChipActivities: ChipMetadata = {
  text: "You mentioned leading the debate team—cool. But I need specifics. How many hours per week? What tournaments did you win?",
  coachId: "jenny",
  sourcePath: "/test/activities.txt",
  semanticType: "activities",
  eqSignals: ["straight", "challenger"],
  order: 3,
  size: 125
};

const mockChipGeneric: ChipMetadata = {
  text: "Make sure to submit your application on time. Don't forget to proofread. Best of luck!",
  coachId: "jenny",
  sourcePath: "/test/generic.txt",
  semanticType: "general",
  eqSignals: [],
  order: 4,
  size: 88
};

describe("Component 21 - Adaptive RAG Retrieval Engine", () => {
  /**
   * Test 1: Intent detection for academics queries
   */
  test("intent detector identifies academics queries", () => {
    const query1 = "What GPA do I need for Harvard?";
    const query2 = "My SAT score is 1450, is that good enough?";
    const query3 = "How many AP classes should I take?";

    expect(detectIntent(query1)).toBe("academics");
    expect(detectIntent(query2)).toBe("academics");
    expect(detectIntent(query3)).toBe("academics");
  });

  /**
   * Test 2: Intent detection for activities queries
   */
  test("intent detector identifies activities queries", () => {
    const query1 = "What clubs and extracurricular activities should I join?";
    const query2 = "I'm leading a robotics club project";
    const query3 = "Should I do research or volunteer work?";

    expect(detectIntent(query1)).toBe("activities");
    expect(detectIntent(query2)).toBe("activities");
    expect(detectIntent(query3)).toBe("activities");
  });

  /**
   * Test 3: Intent detection for EQ queries
   */
  test("intent detector identifies EQ queries", () => {
    const query1 = "What are my core values?";
    const query2 = "I'm struggling with motivation";
    const query3 = "My immigrant background shaped my identity";

    expect(detectIntent(query1)).toBe("eq");
    expect(detectIntent(query2)).toBe("eq");
    expect(detectIntent(query3)).toBe("eq");
  });

  /**
   * Test 4: Intent detection for framework queries
   */
  test("intent detector identifies framework queries", () => {
    const query1 = "What's your framework for building a spike?";
    const query2 = "What principle or approach should I use for admissions?";
    const query3 = "What's your approach for building a college list?";

    expect(detectIntent(query1)).toBe("framework");
    expect(detectIntent(query2)).toBe("framework");
    expect(detectIntent(query3)).toBe("framework");
  });

  /**
   * Test 5: Intent confidence scoring
   */
  test("intent confidence reflects keyword matches", () => {
    const query = "My GPA is 3.5, SAT is 1400, and I took 8 AP classes";
    const intent = detectIntent(query);

    expect(intent).toBe("academics");

    const confidence = getIntentConfidence(query, intent);
    // Should have high confidence (3+ keywords)
    expect(confidence).toBeGreaterThanOrEqual(0.5);
  });

  /**
   * Test 6: EQ weighting boosts gentle mode chips
   */
  test("EQ weighting boosts supportive chips in gentle mode", () => {
    const weight = applyEQWeight(mockChipEQ, "gentle");

    // mockChipEQ has "supportive" signal → should boost
    expect(weight).toBeGreaterThan(1.0);
    expect(weight).toBeLessThanOrEqual(1.4);
  });

  /**
   * Test 7: EQ weighting boosts direct mode chips
   */
  test("EQ weighting boosts tactical chips in direct mode", () => {
    const weight = applyEQWeight(mockChipAcademics, "direct");

    // mockChipAcademics has "straight" and "tactical" → should boost
    expect(weight).toBeGreaterThan(1.0);
    expect(weight).toBeLessThanOrEqual(1.4);
  });

  /**
   * Test 8: EQ weighting penalizes mismatched modes
   */
  test("EQ weighting penalizes direct chips in gentle mode", () => {
    const weight = applyEQWeight(mockChipActivities, "gentle");

    // mockChipActivities has "challenger" signal → should penalize in gentle mode
    expect(weight).toBeLessThan(1.0);
  });

  /**
   * Test 9: EQ signal match counting
   */
  test("EQ signal match count works correctly", () => {
    const matchesGentle = getEQSignalMatchCount(mockChipEQ, "gentle");
    const matchesDirect = getEQSignalMatchCount(mockChipAcademics, "direct");

    expect(matchesGentle).toBeGreaterThan(0); // "supportive" matches gentle
    expect(matchesDirect).toBeGreaterThan(0); // "straight", "tactical" match direct
  });

  /**
   * Test 10: EQ compatibility filtering
   */
  test("EQ compatibility filters incompatible chips", () => {
    // Gentle mode should reject strongly direct chips
    const isCompatible = isEQCompatible(mockChipActivities, "gentle");

    // mockChipActivities has "challenger" + "straight" → incompatible with gentle
    expect(isCompatible).toBe(false);
  });

  /**
   * Test 11: Coach fit scoring boosts EQ content
   */
  test("coach fit scorer boosts EQ-rich content", () => {
    const score = coachFit(mockChipEQ);

    // mockChipEQ is semantic type "eq" → should boost
    expect(score).toBeGreaterThan(1.0);
    expect(score).toBeLessThanOrEqual(1.3);
  });

  /**
   * Test 12: Coach fit scoring boosts framework language
   */
  test("coach fit scorer boosts framework language", () => {
    const score = coachFit(mockChipFramework);

    // mockChipFramework has "framework", "step", "depth over breadth" → strong boost
    expect(score).toBeGreaterThan(1.0);
  });

  /**
   * Test 13: Coach fit scoring penalizes generic content
   */
  test("coach fit scorer penalizes generic advice", () => {
    const score = coachFit(mockChipGeneric);

    // mockChipGeneric has "make sure to", "don't forget", "best of luck" → penalties
    expect(score).toBeLessThan(1.0);
  });

  /**
   * Test 14: Jenny style marker counting
   */
  test("Jenny style marker counting identifies key phrases", () => {
    const markers = getJennyStyleMatchCount(mockChipFramework);

    // Should detect "framework", "step", "depth over breadth"
    expect(markers).toBeGreaterThan(0);
  });

  /**
   * Test 15: Jenny authenticity check rejects generic content
   */
  test("Jenny authenticity check filters generic content", () => {
    const isAuthentic = isJennyAuthentic(mockChipGeneric);

    // Generic chip with "best of luck" → not authentic Jenny
    expect(isAuthentic).toBe(false);
  });

  /**
   * Test 16: Unified ranking combines all factors
   */
  test("unified ranking combines intent + EQ + coach fit", () => {
    const score = rankChunk(mockChipAcademics, "academics", "direct", 0.95);

    // Perfect intent match + direct mode match + good coach fit + high similarity
    expect(score).toBeGreaterThan(1.0);
  });

  /**
   * Test 17: Related intent detection
   */
  test("related intent detection identifies related pairs", () => {
    expect(isRelatedIntent("activities", "awards")).toBe(true);
    expect(isRelatedIntent("eq", "narrative")).toBe(true);
    expect(isRelatedIntent("framework", "general")).toBe(true);
    expect(isRelatedIntent("academics", "activities")).toBe(false);
  });

  /**
   * Test 18: Ranking prioritizes perfect intent matches
   */
  test("ranking prioritizes perfect intent matches over partial", () => {
    const perfectMatch = rankChunk(mockChipAcademics, "academics", "gentle", 0.9);
    const partialMatch = rankChunk(mockChipFramework, "academics", "gentle", 0.9);

    // Perfect match should score higher than related match
    expect(perfectMatch).toBeGreaterThan(partialMatch);
  });

  /**
   * Test 19: Low quality chunk filtering
   */
  test("low quality chunk filtering removes weak matches", () => {
    const rankedChunks = [
      { metadata: mockChipFramework, score: 1.5 },
      { metadata: mockChipAcademics, score: 1.2 },
      { metadata: mockChipGeneric, score: 0.2 }
    ];

    const filtered = filterLowQualityChunks(rankedChunks, 0.3);

    // Should filter out the generic chip (score 0.2)
    expect(filtered.length).toBe(2);
    expect(filtered.every(c => c.score >= 0.3)).toBe(true);
  });

  /**
   * Test 20: Trace building includes all metadata
   */
  test("trace building includes comprehensive metadata", () => {
    const trace = buildTrace(mockChipAcademics, "academics", "direct", 1.42, 0.95);

    expect(trace).toContain("intent:academics");
    expect(trace).toContain("semantic:academics");
    expect(trace.some(t => t.startsWith("eqSignals:"))).toBe(true);
    expect(trace.some(t => t.startsWith("score:"))).toBe(true);
    expect(trace).toContain("intentMatch:perfect");
  });

  /**
   * Test 21: Trace formatting for display
   */
  test("trace formatting creates readable output", () => {
    const trace = buildTrace(mockChipAcademics, "academics", "direct", 1.42);
    const formatted = formatTraceForDisplay(trace);

    expect(formatted).toContain("Chip Trace:");
    expect(formatted).toContain("intent");
    expect(formatted).toContain("semantic");
    expect(formatted.length).toBeGreaterThan(50);
  });

  /**
   * Test 22: Trace comparison identifies differences
   */
  test("trace comparison identifies ranking differences", () => {
    const trace1 = buildTrace(mockChipAcademics, "academics", "direct", 1.5, 0.95);
    const trace2 = buildTrace(mockChipGeneric, "academics", "direct", 0.3, 0.6);

    const comparison = compareTraces(trace1, trace2);

    expect(comparison.scoreDiff).toBeGreaterThan(0);
    expect(comparison.jennyMarkerDiff).toBeGreaterThan(0);
  });

  /**
   * Test 23: Intent detection returns general for ambiguous queries
   */
  test("intent detection falls back to general for ambiguous queries", () => {
    const query = "Tell me more about college";
    const intent = detectIntent(query);

    expect(intent).toBe("general");
  });

  /**
   * Test 24: EQ compatibility allows neutral chips
   */
  test("EQ compatibility allows chips with no EQ signals", () => {
    const neutralChip: ChipMetadata = {
      ...mockChipGeneric,
      eqSignals: []
    };

    expect(isEQCompatible(neutralChip, "gentle")).toBe(true);
    expect(isEQCompatible(neutralChip, "direct")).toBe(true);
    expect(isEQCompatible(neutralChip, "motivational")).toBe(true);
  });
});
