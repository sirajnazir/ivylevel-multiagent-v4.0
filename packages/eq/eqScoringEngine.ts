/**
 * EQ Scoring Engine v4.0
 *
 * The quantitative backbone that gives the Assessment Agent self-awareness
 * about whether its tone matches Jenny's EQ blueprint.
 *
 * Purpose:
 * - Measure how Jenny-like a response is (0-100 score)
 * - Detect where it deviates from required style
 * - Trigger drift correction when score < threshold
 * - Provide dimensional breakdown for debugging
 *
 * This runs BEFORE drift detection to decide if rewriting is needed.
 *
 * Scoring Dimensions:
 * 1. Warmth - emotional warmth and validation
 * 2. Empathy - reflective listening and mirroring
 * 3. Firmness - boundaries and directness
 * 4. Cheer - motivational energy
 * 5. Pace - sentence length and rhythm
 * 6. Specificity - concrete vs. generic advice
 * 7. Jenny-isms - signature linguistic markers
 */

import { StyleDirectives } from "./styleMixer";
import { JENNY_TONE_RUBRIC } from "./toneRubrics";

/**
 * EQ Score
 *
 * Score for a single dimension.
 */
export interface EQScore {
  dimension: string; // What we're measuring
  expected: string | number; // What style directives require
  detected: string | number; // What we found in response
  score: number; // 0-100 score for this dimension
  notes: string[]; // Specific observations
}

/**
 * EQ Score Report
 *
 * Complete scoring breakdown for a response.
 */
export interface EQScoreReport {
  scores: EQScore[]; // Per-dimension scores
  overallEQScore: number; // Weighted average (0-100)
  passingThreshold: number; // Minimum score to pass
  isPassing: boolean; // Whether response meets quality bar
  recommendations: string[]; // What to improve
}

/**
 * Scoring Config
 *
 * Configuration for scoring behavior.
 */
export interface ScoringConfig {
  passingThreshold?: number; // Minimum overall score (default: 75)
  strictMode?: boolean; // More aggressive scoring (default: false)
  weights?: Partial<Record<string, number>>; // Custom dimension weights
}

/**
 * Default Config
 */
const DEFAULT_CONFIG: Required<ScoringConfig> = {
  passingThreshold: 70,
  strictMode: false,
  weights: {
    warmth: 1.5, // Most important for Jenny's style
    empathy: 1.5,
    firmness: 1.0,
    cheer: 1.0,
    pace: 0.8,
    specificity: 1.2,
    jennyisms: 1.3 // High weight for authentic markers
  }
};

/**
 * Score EQ
 *
 * Main scoring function.
 * Analyzes response against required style directives.
 *
 * @param response - Generated response text
 * @param style - Required style directives
 * @param config - Optional configuration
 * @returns Complete EQ score report
 */
export function scoreEQ(
  response: string,
  style: StyleDirectives,
  config?: ScoringConfig
): EQScoreReport {
  console.log(
    `[EQScoring] Scoring response (${response.length} chars) against style: warmth=${style.warmthLevel}, firmness=${style.firmnessLevel}`
  );

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const scores: EQScore[] = [];
  const recommendations: string[] = [];

  // Detect actual values in response
  const detectedWarmth = detectWarmth(response);
  const detectedEmpathy = detectEmpathy(response);
  const detectedFirmness = detectFirmness(response);
  const detectedCheer = detectCheer(response);
  const detectedPace = detectPace(response);
  const detectedSpecificity = detectSpecificity(response);
  const detectedJennyisms = detectJennyisms(response);

  // Score each dimension
  const warmthScore = scoreCategorical(style.warmthLevel, detectedWarmth);
  scores.push({
    dimension: "warmth",
    expected: style.warmthLevel,
    detected: detectedWarmth,
    score: warmthScore,
    notes: warmthScore < 100 ? [`Expected ${style.warmthLevel}, got ${detectedWarmth}`] : []
  });

  const empathyScore = scoreCategorical(style.empathyLevel, detectedEmpathy);
  scores.push({
    dimension: "empathy",
    expected: style.empathyLevel,
    detected: detectedEmpathy,
    score: empathyScore,
    notes:
      empathyScore < 100 ? [`Expected ${style.empathyLevel}, got ${detectedEmpathy}`] : []
  });

  const firmnessScore = scoreCategorical(style.firmnessLevel, detectedFirmness);
  scores.push({
    dimension: "firmness",
    expected: style.firmnessLevel,
    detected: detectedFirmness,
    score: firmnessScore,
    notes:
      firmnessScore < 100 ? [`Expected ${style.firmnessLevel}, got ${detectedFirmness}`] : []
  });

  const cheerScore = scoreCategorical(style.cheerLevel, detectedCheer);
  scores.push({
    dimension: "cheer",
    expected: style.cheerLevel,
    detected: detectedCheer,
    score: cheerScore,
    notes: cheerScore < 100 ? [`Expected ${style.cheerLevel}, got ${detectedCheer}`] : []
  });

  const paceScore = scorePace(style.paceLevel, detectedPace);
  scores.push({
    dimension: "pace",
    expected: style.paceLevel,
    detected: detectedPace,
    score: paceScore,
    notes: paceScore < 100 ? [`Expected ${style.paceLevel}, got ${detectedPace}`] : []
  });

  const specificityScore = scoreSpecificity(detectedSpecificity);
  scores.push({
    dimension: "specificity",
    expected: "high",
    detected: detectedSpecificity,
    score: specificityScore,
    notes: specificityScore < 100 ? ["Add more concrete examples or specific details"] : []
  });

  const jennyismsScore = scoreJennyisms(detectedJennyisms);
  scores.push({
    dimension: "jennyisms",
    expected: ">=2",
    detected: detectedJennyisms,
    score: jennyismsScore,
    notes:
      jennyismsScore < 100
        ? [`Found ${detectedJennyisms} Jenny patterns, expected at least 2`]
        : []
  });

  // Calculate weighted overall score
  const weights = finalConfig.weights!;
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const scoreObj of scores) {
    const weight = weights[scoreObj.dimension] || 1.0;
    totalWeightedScore += scoreObj.score * weight;
    totalWeight += weight;
  }

  const overallEQScore = clamp(totalWeightedScore / totalWeight);
  const isPassing = overallEQScore >= finalConfig.passingThreshold;

  // Generate recommendations only if overall score is failing
  if (!isPassing) {
    if (warmthScore < 80) {
      recommendations.push(`Increase warmth (add validation phrases, warm openings)`);
    }
    if (empathyScore < 80) {
      recommendations.push(`Increase empathy (add reflective listening, emotion mirroring)`);
    }
    if (firmnessScore < 80) {
      recommendations.push(`Adjust firmness (add boundaries or soften directness)`);
    }
    if (cheerScore < 80) {
      recommendations.push(`Adjust motivational energy`);
    }
    if (paceScore < 80) {
      recommendations.push(`Adjust pacing (sentence length and rhythm)`);
    }
    if (specificityScore < 80) {
      recommendations.push(`Add specificity (examples, numbers, concrete details)`);
    }
    if (jennyismsScore < 80) {
      recommendations.push(`Use more Jenny-specific patterns from tone rubrics`);
    }
  }

  console.log(
    `[EQScoring] Overall score: ${overallEQScore.toFixed(1)}/100 (passing: ${isPassing})`
  );

  return {
    scores,
    overallEQScore,
    passingThreshold: finalConfig.passingThreshold,
    isPassing,
    recommendations
  };
}

/**
 * Clamp
 *
 * Ensures score stays within 0-100 range.
 */
function clamp(score: number): number {
  return Math.max(0, Math.min(100, score));
}

/**
 * ==================
 * DETECTION FUNCTIONS
 * ==================
 */

/**
 * Detect Warmth
 *
 * Measures emotional warmth and validation phrases.
 */
function detectWarmth(text: string): "low" | "medium" | "high" {
  const warmthPatterns = [
    /i totally hear you/i,
    /totally hear you/i,
    /i get why that feels/i,
    /this is super normal/i,
    /you're not alone/i,
    /that makes (complete )?sense/i,
    /and here's the good part/i,
    /i'm with you/i,
    /what you're feeling/i,
    /i'm here/i,
    /i get (it|that|why)/i
  ];

  const hits = warmthPatterns.filter(p => p.test(text)).length;

  if (hits >= 3) return "high";
  if (hits >= 1) return "medium";
  return "low";
}

/**
 * Detect Empathy
 *
 * Measures reflective listening and emotion mirroring.
 * Also includes validation phrases as empathy signals.
 */
function detectEmpathy(text: string): "low" | "medium" | "high" {
  const mirrorPatterns = [
    /sounds like/i,
    /so what i'm hearing is/i,
    /it seems like/i,
    /i hear/i,
    /what you're saying/i,
    /makes sense that/i,
    /what you're feeling/i,
    /i get why/i,
    /i see why/i,
    /completely valid/i,
    /makes (complete )?sense/i
  ];

  const hits = mirrorPatterns.filter(p => p.test(text)).length;

  if (hits >= 2) return "high";
  if (hits === 1) return "medium";
  return "low";
}

/**
 * Detect Firmness
 *
 * Measures boundaries and directness.
 */
function detectFirmness(text: string): "low" | "medium" | "high" {
  const firmPatterns = [
    /here's the part that matters/i,
    /let's make sure/i,
    /the move now is/i,
    /here's what i'd do/i,
    /non-negotiable/i,
    /reality check/i,
    /let's be honest/i,
    /here's what we can't ignore/i
  ];

  const hits = firmPatterns.filter(p => p.test(text)).length;

  if (hits >= 2) return "high";
  if (hits === 1) return "medium";
  return "low";
}

/**
 * Detect Cheer
 *
 * Measures motivational energy and optimism.
 */
function detectCheer(text: string): "low" | "medium" | "high" {
  const cheerPatterns = [
    /this is actually good news/i,
    /you're more capable than you think/i,
    /we've totally got this/i,
    /this is fixable/i,
    /you've got real strengths/i,
    /this is solid/i,
    /you're doing the right work/i
  ];

  const hits = cheerPatterns.filter(p => p.test(text)).length;

  if (hits >= 2) return "high";
  if (hits === 1) return "medium";
  return "low";
}

/**
 * Detect Pace
 *
 * Measures sentence length and rhythm.
 */
function detectPace(text: string): "slow" | "normal" | "fast" {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (sentences.length === 0) return "normal";

  const totalWords = sentences.reduce((sum, s) => {
    return sum + s.trim().split(/\s+/).length;
  }, 0);

  const avgSentenceLength = totalWords / sentences.length;

  // Slow pace: long, complex sentences (>15 words)
  if (avgSentenceLength > 15) return "slow";

  // Fast pace: short, punchy sentences (<=4 words on average)
  if (avgSentenceLength <= 4) return "fast";

  return "normal";
}

/**
 * Detect Specificity
 *
 * Measures concrete vs. generic advice.
 */
function detectSpecificity(text: string): "low" | "high" {
  const numbers = (text.match(/\d+/g) || []).length;
  const hasConcreteMarkers = /(example|specifically|for instance|here's how|step \d)/i.test(
    text
  );

  return numbers > 0 || hasConcreteMarkers ? "high" : "low";
}

/**
 * Detect Jennyisms
 *
 * Counts signature Jenny linguistic markers.
 * Uses both exact substring matching and common variations.
 */
function detectJennyisms(text: string): number {
  const lowerText = text.toLowerCase();

  // Check all Jenny tone rubric categories for matches
  let count = 0;

  // Check exact matches first
  for (const opening of JENNY_TONE_RUBRIC.openings) {
    if (lowerText.includes(opening.toLowerCase())) count++;
  }

  for (const validation of JENNY_TONE_RUBRIC.validations) {
    if (lowerText.includes(validation.toLowerCase())) count++;
  }

  for (const cue of JENNY_TONE_RUBRIC.pacingCues) {
    if (lowerText.includes(cue.toLowerCase())) count++;
  }

  for (const encouragement of JENNY_TONE_RUBRIC.microEncouragements) {
    if (lowerText.includes(encouragement.toLowerCase())) count++;
  }

  for (const pattern of JENNY_TONE_RUBRIC.firmnessPatterns) {
    if (lowerText.includes(pattern.toLowerCase())) count++;
  }

  for (const reframe of JENNY_TONE_RUBRIC.reframes) {
    if (lowerText.includes(reframe.toLowerCase())) count++;
  }

  for (const closure of JENNY_TONE_RUBRIC.closures) {
    if (lowerText.includes(closure.toLowerCase())) count++;
  }

  // Check for common Jenny pattern variations
  const jennyVariations = [
    /here's the part that matters/i,
    /let's break this down/i,
    /step by step/i,
    /we've got this/i,
    /totally got this/i,
    /this is (actually |really )?good news/i,
    /you're on the right track/i,
    /this is solid/i,
    /let's take this one/i,
    /one step at a time/i,
    /this is fixable/i,
    /you've got (this|real strengths)/i,
    /let's work (on|through|this)/i,
    /sounds like you're/i,
    /(let's|we'll) (work|tackle|handle) (this|it) together/i
  ];

  for (const pattern of jennyVariations) {
    if (pattern.test(lowerText)) count++;
  }

  return count;
}

/**
 * ==================
 * SCORING FUNCTIONS
 * ==================
 */

/**
 * Score Categorical
 *
 * Scores low/medium/high dimensions.
 * Perfect match = 100, one off = 60, two off = 20
 */
function scoreCategorical(expected: string, detected: string): number {
  if (expected === detected) return 100;

  const levels = ["low", "medium", "high"];
  const idxExpected = levels.indexOf(expected);
  const idxDetected = levels.indexOf(detected);

  if (idxExpected < 0 || idxDetected < 0) return 0;

  const diff = Math.abs(idxExpected - idxDetected);

  if (diff === 1) return 60; // One level off
  if (diff === 2) return 20; // Two levels off

  return 0;
}

/**
 * Score Pace
 *
 * Scores slow/normal/fast pace.
 */
function scorePace(expected: string, detected: string): number {
  if (expected === detected) return 100;

  // One off is okay (slow↔normal or normal↔fast)
  const levels = ["slow", "normal", "fast"];
  const idxExpected = levels.indexOf(expected);
  const idxDetected = levels.indexOf(detected);

  const diff = Math.abs(idxExpected - idxDetected);

  if (diff === 1) return 70; // Adjacent pace level
  if (diff === 2) return 30; // Opposite pace level

  return 50; // Default partial credit
}

/**
 * Score Specificity
 *
 * Scores low/high specificity.
 */
function scoreSpecificity(detected: string): number {
  return detected === "high" ? 100 : 40;
}

/**
 * Score Jennyisms
 *
 * Scores based on number of Jenny patterns detected.
 */
function scoreJennyisms(count: number): number {
  if (count >= 3) return 100;
  if (count === 2) return 85;
  if (count === 1) return 60;
  return 20;
}

/**
 * Get Score Summary
 *
 * Returns human-readable summary of EQ score report.
 *
 * @param report - EQ score report
 * @returns Summary string
 */
export function getScoreSummary(report: EQScoreReport): string {
  const lines: string[] = [];

  lines.push(`EQ Score Report:`);
  lines.push(`Overall Score: ${report.overallEQScore.toFixed(1)}/100`);
  lines.push(`Status: ${report.isPassing ? "✓ PASSING" : "✗ NEEDS IMPROVEMENT"}`);
  lines.push(``);
  lines.push(`Dimension Breakdown:`);

  for (const score of report.scores) {
    const status = score.score >= 80 ? "✓" : score.score >= 60 ? "~" : "✗";
    lines.push(
      `  ${status} ${score.dimension}: ${score.score.toFixed(0)}/100 (expected: ${score.expected}, detected: ${score.detected})`
    );
  }

  if (report.recommendations.length > 0) {
    lines.push(``);
    lines.push(`Recommendations:`);
    for (const rec of report.recommendations) {
      lines.push(`  • ${rec}`);
    }
  }

  return lines.join("\n");
}

/**
 * Compare Scores
 *
 * Compares two EQ score reports and shows improvements/regressions.
 *
 * @param before - Score report before changes
 * @param after - Score report after changes
 * @returns Comparison summary
 */
export function compareScores(
  before: EQScoreReport,
  after: EQScoreReport
): {
  overallChange: number;
  improved: string[];
  regressed: string[];
  unchanged: string[];
} {
  const improved: string[] = [];
  const regressed: string[] = [];
  const unchanged: string[] = [];

  for (let i = 0; i < before.scores.length; i++) {
    const beforeScore = before.scores[i];
    const afterScore = after.scores.find(s => s.dimension === beforeScore.dimension);

    if (!afterScore) continue;

    const change = afterScore.score - beforeScore.score;

    if (change > 5) {
      improved.push(`${beforeScore.dimension} (+${change.toFixed(0)})`);
    } else if (change < -5) {
      regressed.push(`${beforeScore.dimension} (${change.toFixed(0)})`);
    } else {
      unchanged.push(beforeScore.dimension);
    }
  }

  return {
    overallChange: after.overallEQScore - before.overallEQScore,
    improved,
    regressed,
    unchanged
  };
}
