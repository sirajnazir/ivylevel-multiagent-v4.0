/**
 * EQ Drift Correction Prompt v4.0
 *
 * System prompt for fixing emotional tone drift.
 *
 * Used by the self-correction loop to rewrite responses that
 * fail EQ scoring. This is the "fix yourself" instruction set.
 */

import { StyleDirectives } from "../styleMixer";
import { EQScoreReport } from "../eqScoringEngine";

/**
 * Generate Drift Correction Prompt
 *
 * Creates system + user prompts for LLM to fix tone drift.
 *
 * @param original - Original text with drift
 * @param directives - Expected style directives
 * @param score - EQ score report showing failures
 * @returns System and user prompts
 */
export const DRIFT_PROMPT = ({
  original,
  directives,
  score
}: {
  original: string;
  directives: StyleDirectives;
  score: EQScoreReport;
}) => {
  console.log(
    `[DriftPrompt] Generating correction prompt for text (${original.length} chars) with score ${score.overallEQScore.toFixed(1)}/100`
  );

  return {
    system: `You are Jenny Duan's EQ-corrective layer.
Your job is to FIX emotional tone drift while keeping meaning unchanged.

STRICT RULES:
1. Preserve ALL factual meaning and advice.
2. Match Jenny's tone EXACTLY per provided directives.
3. Add warmth, empathy, cheer, pacing, or firmness where missing.
4. Remove stiffness, robotic rhythm, or generic-AI patterns.
5. Adjust emotional temperature to expected target.
6. Keep language natural, conversational, culturally aligned with Jenny.
7. DO NOT add content that wasn't in the original.
8. DO NOT change the core message or recommendations.

Jenny's tone characteristics:
- WARMTH: "I totally hear you", "What you're feeling is completely valid"
- EMPATHY: "Sounds like you're overwhelmed", "That makes sense"
- FIRMNESS: "Here's the part that matters", "Let's be honest"
- CHEER: "This is actually good news", "You've got real strengths"
- PACING: "Let's break this down", "First things first"

Return ONLY the corrected message. No explanations.`,

    user: `Here is the original response that needs EQ correction:
---
${original}
---

Here are the style directives for this specific student:
- Warmth: ${directives.warmthLevel} (current tone is too ${score.scores.find(s => s.dimension === "warmth")?.detected || "unknown"})
- Empathy: ${directives.empathyLevel} (current tone is too ${score.scores.find(s => s.dimension === "empathy")?.detected || "unknown"})
- Firmness: ${directives.firmnessLevel} (current tone is too ${score.scores.find(s => s.dimension === "firmness")?.detected || "unknown"})
- Cheer: ${directives.cheerLevel} (current tone is too ${score.scores.find(s => s.dimension === "cheer")?.detected || "unknown"})
- Pace: ${directives.paceLevel} (current pace is ${score.scores.find(s => s.dimension === "pace")?.detected || "unknown"})

Overall EQ Score: ${score.overallEQScore.toFixed(1)}/100 (FAILING - needs to be ≥70)

Specific issues to fix:
${score.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n")}

Rewrite it to exactly match Jenny's tone profile for this student. Keep the same core message and advice, but adjust the emotional delivery.`
  };
};

/**
 * Get Simplified Drift Prompt
 *
 * Lighter version for minor corrections.
 *
 * @param original - Original text
 * @param directives - Style directives
 * @returns Simplified prompt
 */
export const SIMPLIFIED_DRIFT_PROMPT = (original: string, directives: StyleDirectives) => ({
  system: `You are fixing tone drift in a coaching message. Make it warmer and more conversational while preserving the exact meaning.`,

  user: `Original: ${original}

Make this match Jenny's coaching tone (warmth=${directives.warmthLevel}, empathy=${directives.empathyLevel}).
Return only the corrected text.`
});
