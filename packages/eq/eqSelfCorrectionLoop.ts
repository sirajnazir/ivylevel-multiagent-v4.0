/**
 * EQ Self-Correction Loop v4.0
 *
 * The "if you mess up, fix yourself instantly" engine.
 *
 * This is the emotional airbag that guarantees Jenny-tone safety
 * before anything hits the student.
 *
 * Flow:
 * 1. Take LLM's raw response
 * 2. Score it against EQ expectations
 * 3. If score < 70 → rewrite with drift correction
 * 4. Re-score the rewrite
 * 5. If still bad → retry up to MAX_ATTEMPTS
 * 6. Either approve or escalate
 *
 * This ensures ZERO chance of robotic/formal/cold responses
 * reaching students in production.
 */

import { scoreEQ, EQScoreReport } from "./eqScoringEngine";
import { StyleDirectives } from "./styleMixer";
import { rerankJennyTone } from "./toneReranker";
import { DRIFT_PROMPT } from "./prompts/eqDriftPrompt";
import { callOpenAI } from "../llm/openaiClient";

/**
 * Self-Correction Result
 *
 * Complete audit trail of the correction process.
 */
export interface SelfCorrectionResult {
  finalText: string; // Final approved text
  attempts: number; // How many correction attempts were made
  initialScore: EQScoreReport; // Score before any corrections
  finalScore: EQScoreReport; // Score after corrections
  driftFixed: boolean; // True if drift was detected and fixed
  notes: string[]; // Audit trail of what happened
}

/**
 * Configuration
 */
const MIN_ACCEPTABLE_EQ = 70; // Passing threshold for EQ score
const MAX_ATTEMPTS = 3; // Maximum correction attempts before escalation

/**
 * Run EQ Self-Correction Loop
 *
 * Main entry point for the self-correction system.
 *
 * Takes a raw LLM response and iteratively improves it until
 * it passes EQ quality gates or reaches max attempts.
 *
 * @param rawResponse - Raw text from LLM
 * @param directives - Expected style directives for this student
 * @param config - Optional configuration overrides
 * @returns Self-correction result with audit trail
 */
export async function runEQSelfCorrectionLoop(
  rawResponse: string,
  directives: StyleDirectives,
  config?: {
    minAcceptableEQ?: number;
    maxAttempts?: number;
    skipReranking?: boolean;
  }
): Promise<SelfCorrectionResult> {
  const minEQ = config?.minAcceptableEQ || MIN_ACCEPTABLE_EQ;
  const maxAttempts = config?.maxAttempts || MAX_ATTEMPTS;
  const skipReranking = config?.skipReranking || false;

  console.log(
    `[SelfCorrectionLoop] Starting correction loop for ${rawResponse.length} chars (min EQ: ${minEQ})`
  );

  const notes: string[] = [];

  // Step 1: Score the initial response
  const initialScore = scoreEQ(rawResponse, directives);

  console.log(
    `[SelfCorrectionLoop] Initial score: ${initialScore.overallEQScore.toFixed(1)}/100 (passing: ${initialScore.isPassing})`
  );

  notes.push(
    `Initial EQ score: ${initialScore.overallEQScore.toFixed(1)}/100 (threshold: ${minEQ})`
  );

  // Step 2: Check if already passing
  if (initialScore.overallEQScore >= minEQ) {
    console.log(`[SelfCorrectionLoop] Response already passes EQ requirements`);
    notes.push("No drift detected. Response already within EQ spec.");

    return {
      finalText: rawResponse,
      attempts: 0,
      initialScore,
      finalScore: initialScore,
      driftFixed: false,
      notes
    };
  }

  // Step 3: Iterative correction loop
  let currentText = rawResponse;
  let currentScore = initialScore;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      `[SelfCorrectionLoop] Attempt ${attempt}/${maxAttempts}: Drift detected, initiating correction`
    );

    notes.push(
      `Attempt ${attempt}: Score ${currentScore.overallEQScore.toFixed(1)}/100 - Rewriting...`
    );

    // Step 3a: Generate correction prompt
    const prompt = DRIFT_PROMPT({
      original: currentText,
      directives,
      score: currentScore
    });

    // Step 3b: Call LLM to rewrite
    const rewritten = await callOpenAI({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt.system },
        { role: "user", content: prompt.user }
      ]
    });

    if (!rewritten) {
      console.warn(`[SelfCorrectionLoop] LLM rewrite failed on attempt ${attempt}`);
      notes.push(`Attempt ${attempt}: LLM call failed, keeping previous version`);
      continue;
    }

    console.log(`[SelfCorrectionLoop] LLM rewrote ${currentText.length} → ${rewritten.length} chars`);

    // Step 3c: Apply tone reranking (post-processing)
    let finalText = rewritten;
    if (!skipReranking) {
      finalText = rerankJennyTone(rewritten, directives);
      console.log(`[SelfCorrectionLoop] Reranked ${rewritten.length} → ${finalText.length} chars`);
    }

    // Step 3d: Re-score the improved version
    const newScore = scoreEQ(finalText, directives);

    console.log(
      `[SelfCorrectionLoop] New score: ${newScore.overallEQScore.toFixed(1)}/100 (${newScore.isPassing ? "PASS" : "FAIL"})`
    );

    notes.push(
      `Attempt ${attempt}: Rewrote and rescored → ${newScore.overallEQScore.toFixed(1)}/100`
    );

    // Update current state
    currentText = finalText;
    currentScore = newScore;

    // Step 3e: Check if now passing
    if (currentScore.overallEQScore >= minEQ) {
      console.log(
        `[SelfCorrectionLoop] SUCCESS! Response now passes after ${attempt} attempt(s)`
      );
      notes.push(`✓ Drift corrected successfully after ${attempt} attempt(s)`);

      return {
        finalText: currentText,
        attempts: attempt,
        initialScore,
        finalScore: currentScore,
        driftFixed: true,
        notes
      };
    }

    // Otherwise, loop continues...
    console.log(`[SelfCorrectionLoop] Still failing (${currentScore.overallEQScore.toFixed(1)}/100), continuing...`);
  }

  // Step 4: Max attempts reached without passing
  console.warn(
    `[SelfCorrectionLoop] ESCALATION: Max attempts (${maxAttempts}) reached. Final score: ${currentScore.overallEQScore.toFixed(1)}/100`
  );

  notes.push(
    `✗ Max attempts reached. Response flagged for manual override or higher-level rewrite agent.`
  );
  notes.push(
    `Final score: ${currentScore.overallEQScore.toFixed(1)}/100 (still below ${minEQ})`
  );

  return {
    finalText: currentText,
    attempts: maxAttempts,
    initialScore,
    finalScore: currentScore,
    driftFixed: false, // Did not successfully fix
    notes
  };
}

/**
 * Get Correction Summary
 *
 * Returns a human-readable summary of the correction result.
 *
 * @param result - Self-correction result
 * @returns Summary string
 */
export function getCorrectionSummary(result: SelfCorrectionResult): string {
  const lines: string[] = [];

  lines.push(`=== EQ Self-Correction Summary ===`);
  lines.push(
    `Initial Score: ${result.initialScore.overallEQScore.toFixed(1)}/100 (${result.initialScore.isPassing ? "PASS" : "FAIL"})`
  );
  lines.push(
    `Final Score: ${result.finalScore.overallEQScore.toFixed(1)}/100 (${result.finalScore.isPassing ? "PASS" : "FAIL"})`
  );
  lines.push(`Attempts: ${result.attempts}`);
  lines.push(`Drift Fixed: ${result.driftFixed ? "YES" : "NO"}`);
  lines.push(``);
  lines.push(`Audit Trail:`);

  for (const note of result.notes) {
    lines.push(`  ${note}`);
  }

  return lines.join("\n");
}

/**
 * Compare Correction Results
 *
 * Compares two correction results to see which performed better.
 *
 * @param result1 - First result
 * @param result2 - Second result
 * @returns Comparison summary
 */
export function compareCorrectionResults(
  result1: SelfCorrectionResult,
  result2: SelfCorrectionResult
): {
  better: "result1" | "result2" | "tie";
  scoreDifference: number;
  attemptDifference: number;
} {
  const scoreDiff = result1.finalScore.overallEQScore - result2.finalScore.overallEQScore;
  const attemptDiff = result1.attempts - result2.attempts;

  let better: "result1" | "result2" | "tie" = "tie";

  if (scoreDiff > 5) {
    better = "result1"; // Result1 significantly better
  } else if (scoreDiff < -5) {
    better = "result2"; // Result2 significantly better
  } else if (Math.abs(scoreDiff) <= 5) {
    // Scores are close, prefer fewer attempts
    if (attemptDiff < 0) {
      better = "result1";
    } else if (attemptDiff > 0) {
      better = "result2";
    }
  }

  return {
    better,
    scoreDifference: scoreDiff,
    attemptDifference: attemptDiff
  };
}
