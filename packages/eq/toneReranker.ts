/**
 * Tone Reranker v4.0
 *
 * Applies light non-LLM heuristics after a rewrite to ensure
 * the final output still passes tone expectations.
 *
 * This is the final safety layer that adds missing Jenny markers
 * without requiring another full LLM call.
 *
 * Think of this as the "polish" step after drift correction.
 */

import { StyleDirectives } from "./styleMixer";

/**
 * Rerank Jenny Tone
 *
 * Post-processing step to inject missing tone markers.
 * Fast, deterministic, no LLM required.
 *
 * @param text - Text to rerank
 * @param style - Expected style directives
 * @returns Reranked text with tone markers added
 */
export function rerankJennyTone(text: string, style: StyleDirectives): string {
  console.log(`[ToneReranker] Reranking text (${text.length} chars) with style: warmth=${style.warmthLevel}, firmness=${style.firmnessLevel}`);

  let output = text;

  // Rule 1: If high warmth expected, ensure warm opening exists
  if (style.warmthLevel === "high") {
    const hasWarmOpening =
      /i totally hear you|i'm with you|this makes sense|totally hear you/i.test(output);

    if (!hasWarmOpening) {
      console.log(`[ToneReranker] Adding warm opening for high warmth`);
      output = "I totally hear you — " + output;
    }
  }

  // Rule 2: If high firmness expected, ensure anchor phrase exists
  if (style.firmnessLevel === "high") {
    const hasFirmnessAnchor = /here's the part that matters|let's be honest|reality check/i.test(
      output
    );

    if (!hasFirmnessAnchor) {
      console.log(`[ToneReranker] Adding firmness anchor for high firmness`);
      output += "\n\nHere's the part that matters.";
    }
  }

  // Rule 3: If high empathy expected, ensure validation exists
  if (style.empathyLevel === "high") {
    const hasValidation =
      /what you're feeling|makes sense|completely valid|i see why/i.test(output);

    if (!hasValidation) {
      console.log(`[ToneReranker] Adding validation for high empathy`);
      // Insert after first sentence or at end if only one sentence
      const firstPeriod = output.indexOf(".");
      if (firstPeriod !== -1 && firstPeriod < output.length - 1) {
        // Insert after first sentence
        output =
          output.substring(0, firstPeriod + 1) +
          " What you're feeling makes sense." +
          output.substring(firstPeriod + 1);
      } else {
        // Append to end
        output += " What you're feeling makes sense.";
      }
    }
  }

  // Rule 4: If high cheer expected, ensure encouragement exists
  if (style.cheerLevel === "high") {
    const hasCheer =
      /this is (actually )?good news|you've got (real strengths|this)|we've got this|this is fixable/i.test(
        output
      );

    if (!hasCheer) {
      console.log(`[ToneReranker] Adding cheer for high cheer level`);
      output += " You've got real strengths here.";
    }
  }

  // Rule 5: Normalize spacing (consistent sentence spacing)
  output = output.replace(/\.\s+/g, ". ").replace(/\s{2,}/g, " ");

  // Rule 6: Remove double dashes if added by insertion
  output = output.replace(/—\s*—/g, "—");

  console.log(`[ToneReranker] Reranked text: ${output.length} chars`);

  return output.trim();
}

/**
 * Check Tone Markers
 *
 * Returns which tone markers are present in the text.
 * Useful for debugging and validation.
 *
 * @param text - Text to check
 * @returns Object with boolean flags for each marker type
 */
export function checkToneMarkers(text: string): {
  hasWarmOpening: boolean;
  hasFirmnessAnchor: boolean;
  hasValidation: boolean;
  hasCheer: boolean;
  hasJennyPattern: boolean;
} {
  return {
    hasWarmOpening: /i totally hear you|i'm with you|this makes sense|totally hear you/i.test(
      text
    ),
    hasFirmnessAnchor: /here's the part that matters|let's be honest|reality check/i.test(text),
    hasValidation: /what you're feeling|makes sense|completely valid|i see why/i.test(text),
    hasCheer:
      /this is (actually )?good news|you've got (real strengths|this)|we've got this|this is fixable/i.test(
        text
      ),
    hasJennyPattern: /let's|here's|you're|we've|i'm/i.test(text)
  };
}

/**
 * Get Rerank Summary
 *
 * Returns a summary of what was changed during reranking.
 *
 * @param original - Original text
 * @param reranked - Reranked text
 * @returns Summary of changes
 */
export function getRerankSummary(original: string, reranked: string): string {
  const changes: string[] = [];

  if (original.length !== reranked.length) {
    changes.push(`Length changed: ${original.length} → ${reranked.length} chars`);
  }

  if (original !== reranked) {
    if (reranked.startsWith("I totally hear you —") && !original.startsWith("I totally")) {
      changes.push("Added warm opening");
    }

    if (reranked.includes("Here's the part that matters") && !original.includes("Here's the")) {
      changes.push("Added firmness anchor");
    }

    if (
      reranked.includes("What you're feeling makes sense") &&
      !original.includes("What you're feeling")
    ) {
      changes.push("Added validation");
    }

    if (
      reranked.includes("You've got real strengths") &&
      !original.includes("You've got real strengths")
    ) {
      changes.push("Added cheer");
    }
  }

  if (changes.length === 0) {
    return "No changes applied";
  }

  return changes.join(", ");
}
