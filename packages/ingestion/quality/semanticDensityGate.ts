import { QualityGateInput, GateResult } from "./quality.types";

/**
 * Semantic Density Gate v1.0
 *
 * Checks: Does the content contain actionable coaching intel?
 * Or is it just filler, fluff, and noise?
 *
 * Rating scale:
 * 0-30: Useless ("um yeah like hmm", filler words, noise)
 * 31-59: Low value (generic advice, common knowledge)
 * 60-79: Good (specific insights, actionable advice)
 * 80-100: Dense gold (frameworks, deep insights, strategic decisions)
 *
 * FUTURE: Use LLM classifier for semantic value rating
 * CURRENT: Uses heuristic-based density analysis as MVP
 */

/**
 * Semantic Density Gate
 *
 * Main entry point for semantic density validation.
 */
export async function semanticDensityGate(
  input: QualityGateInput
): Promise<GateResult> {
  console.log("[DensityGate] Checking semantic density");
  console.log(`  - Source: ${input.sourcePath}`);
  console.log(`  - Text length: ${input.rawText.length}`);

  // Calculate density rating
  const rating = await callDensityAnalyzer(input.rawText);

  const passed = rating >= 60;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (rating < 30) {
    errors.push(`Semantic density too low (${rating}/100) - mostly filler/noise`);
  } else if (rating < 60) {
    errors.push(`Semantic density below threshold (${rating}/100) - limited actionable value`);
  } else if (rating < 75) {
    warnings.push(`Moderate semantic density (${rating}/100)`);
  }

  console.log("[DensityGate] Check complete");
  console.log(`  - Rating: ${rating}/100`);
  console.log(`  - Passed: ${passed}`);

  return {
    passed,
    errors,
    warnings,
    score: rating
  };
}

/**
 * Call Density Analyzer
 *
 * FUTURE: LLM-based semantic value rating
 * ```
 * Rate semantic value 0-100.
 * 0 = useless ("um yeah like hmm")
 * 100 = dense gold (frameworks, insights, decisions)
 * ```
 *
 * CURRENT: Heuristic-based analysis
 */
async function callDensityAnalyzer(text: string): Promise<number> {
  let score = 50; // Baseline

  // Positive Indicators (add points)

  // 1. Actionable language
  const actionablePatterns = (text.match(/\b(should|need to|must|strategy|plan|approach|framework|method|technique)\b/gi) || []).length;
  score += Math.min(15, actionablePatterns * 0.5);

  // 2. Specific examples
  const specificityMarkers = (text.match(/\b(for example|specifically|in this case|like when|such as)\b/gi) || []).length;
  score += Math.min(10, specificityMarkers * 2);

  // 3. Concrete numbers/data
  const numbersMentioned = (text.match(/\b\d+(\.\d+)?(%|k|points|GPA|score)\b/gi) || []).length;
  score += Math.min(10, numbersMentioned * 1.5);

  // 4. Questions that drive insights
  const insightQuestions = (text.match(/\b(why|how|what if|what would|what's driving|what's behind)\b/gi) || []).length;
  score += Math.min(10, insightQuestions * 1);

  // 5. Framework/structure indicators
  const structureWords = (text.match(/\b(first|second|third|step|phase|stage|principle|pillar)\b/gi) || []).length;
  score += Math.min(10, structureWords * 1.5);

  // Negative Indicators (deduct points)

  // 1. Filler words
  const fillerWords = (text.match(/\b(um|uh|like|you know|I mean|kind of|sort of)\b/gi) || []).length;
  score -= Math.min(20, fillerWords * 0.3);

  // 2. Vague language
  const vagueLanguage = (text.match(/\b(maybe|possibly|perhaps|might|could|somewhat|relatively)\b/gi) || []).length;
  if (vagueLanguage > 10) {
    score -= Math.min(15, (vagueLanguage - 10) * 0.5);
  }

  // 3. Generic platitudes
  const platitudes = (text.match(/\b(believe in yourself|follow your dreams|stay positive|work hard|be yourself)\b/gi) || []).length;
  score -= platitudes * 5;

  // 4. Excessive hedging
  const hedging = (text.match(/\b(it depends|not sure|hard to say|difficult to|can't really)\b/gi) || []).length;
  score -= Math.min(10, hedging * 2);

  // 5. Low information density (word count vs unique words)
  const words = text.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;

  if (lexicalDiversity < 0.3) {
    score -= 15; // Very repetitive
  } else if (lexicalDiversity < 0.4) {
    score -= 5;
  }

  // 6. Empty filler sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const emptyFillers = sentences.filter(s => {
    const words = s.trim().split(/\s+/);
    return words.length < 5 && /\b(yeah|okay|right|sure|got it|makes sense)\b/i.test(s);
  }).length;

  score -= Math.min(15, emptyFillers * 2);

  // Context-based adjustments

  // Short content gets penalized (hard to have density in 100 chars)
  if (text.length < 200) {
    score -= 10;
  }

  // Very long rambling content gets penalized
  if (text.length > 10000 && lexicalDiversity < 0.35) {
    score -= 10;
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Detect Framework Content
 *
 * Checks if text contains structured frameworks or models.
 */
function detectFrameworkContent(text: string): boolean {
  const frameworkIndicators = [
    /\b(framework|model|approach|methodology|system)\b/i,
    /\b(step \d+|phase \d+|principle \d+)\b/i,
    /\b(first.*second.*third)\b/i,
    /\b\d+\s+(pillars|principles|steps|phases|stages)\b/i
  ];

  return frameworkIndicators.some(pattern => pattern.test(text));
}

/**
 * Detect Insight Language
 *
 * Checks for language that indicates insights or revelations.
 */
function detectInsightLanguage(text: string): boolean {
  const insightMarkers = [
    /\b(the key is|what matters is|the real question|here's the thing)\b/i,
    /\b(what I'm seeing is|the pattern is|what's interesting)\b/i,
    /\b(breakthrough|aha|realization|insight|clarity)\b/i
  ];

  return insightMarkers.some(pattern => pattern.test(text));
}
