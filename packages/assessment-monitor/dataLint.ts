/**
 * dataLint.ts
 *
 * DataLint_v1 - Structural cleanliness checker (LLM-free)
 *
 * Checks for:
 * - Malformed JSON
 * - Stray markdown fences
 * - Weird unicode
 * - Empty messages
 * - Slot duplication
 * - Overlong messages (>3000 chars)
 * - Hallucination trigger phrases ("as an AI...")
 */

import type { TelemetryEvent, CleanlinessDetails, TelemetryFlag } from './types';

/**
 * Run Data Lint
 *
 * Performs structural cleanliness checks on messages.
 * Returns score 0-100 (higher is better).
 *
 * @param event - Telemetry event to check
 * @returns Cleanliness score (0-100)
 */
export function runDataLint(event: TelemetryEvent): number {
  let score = 100;
  const penaltyReasons: string[] = [];

  // Combine all text content
  const txt = (event.studentMessage || '') + (event.assistantMessage || '');

  // Check 1: Markdown code fences (````)
  if (/```/.test(txt)) {
    score -= 20;
    penaltyReasons.push('Markdown code fences detected');
  }

  // Check 2: Hallucination markers
  const hallucinationPatterns = [
    /as an ai/i,
    /i('m| am) (an? )?ai/i,
    /i don't have personal/i,
    /i don't have feelings/i,
    /i('m| am) a language model/i,
    /i('m| am) not capable of/i,
    /i don't have the ability/i,
    /i cannot actually/i
  ];

  for (const pattern of hallucinationPatterns) {
    if (pattern.test(txt)) {
      score -= 40;
      penaltyReasons.push('Hallucination markers detected');
      break;
    }
  }

  // Check 3: Unicode issues (replacement characters, zero-width spaces, etc.)
  const unicodeIssues = [
    /�/,                    // Replacement character
    /[\u200B-\u200D\uFEFF]/, // Zero-width spaces
    /[\u0000-\u001F]/       // Control characters (except tab, newline, carriage return)
  ];

  for (const pattern of unicodeIssues) {
    if (pattern.test(txt)) {
      score -= 15;
      penaltyReasons.push('Unicode issues detected');
      break;
    }
  }

  // Check 4: Empty or too-short messages
  if (txt.trim().length < 3) {
    score -= 20;
    penaltyReasons.push('Empty or too-short message');
  }

  // Check 5: Overlong messages (>3000 chars)
  if (txt.length > 3000) {
    score -= 10;
    penaltyReasons.push(`Overlong message (${txt.length} chars)`);
  }

  // Check 6: Slot duplication (same slot collected multiple times)
  if (event.extractedSlots && event.extractedSlots.length > 0) {
    const uniqueSlots = new Set(event.extractedSlots);
    if (uniqueSlots.size < event.extractedSlots.length) {
      score -= 15;
      penaltyReasons.push('Duplicate slots detected');
    }
  }

  // Check 7: Malformed JSON (if message looks like it's trying to be JSON)
  if (txt.includes('{') && txt.includes('}')) {
    try {
      // Try to extract JSON-like content
      const jsonMatch = txt.match(/\{[^}]*\}/);
      if (jsonMatch) {
        JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      score -= 10;
      penaltyReasons.push('Malformed JSON detected');
    }
  }

  // Check 8: Excessive punctuation or caps
  const excessiveCaps = (txt.match(/[A-Z]/g) || []).length / Math.max(txt.length, 1);
  if (excessiveCaps > 0.3 && txt.length > 50) {
    score -= 5;
    penaltyReasons.push('Excessive capitalization');
  }

  const excessivePunctuation = (txt.match(/[!?]{2,}/g) || []).length;
  if (excessivePunctuation > 2) {
    score -= 5;
    penaltyReasons.push('Excessive punctuation');
  }

  // Ensure score stays in valid range
  return Math.max(0, Math.min(100, score));
}

/**
 * Get Cleanliness Details
 *
 * Returns detailed breakdown of cleanliness checks.
 *
 * @param event - Telemetry event to check
 * @returns Detailed cleanliness breakdown
 */
export function getCleanlinessDetails(event: TelemetryEvent): CleanlinessDetails {
  const txt = (event.studentMessage || '') + (event.assistantMessage || '');

  const hasMarkdownFences = /```/.test(txt);

  const hallucinationPatterns = [
    /as an ai/i,
    /i('m| am) (an? )?ai/i,
    /i don't have personal/i,
    /i('m| am) a language model/i
  ];
  const hasHallucinationMarkers = hallucinationPatterns.some(p => p.test(txt));

  const unicodeIssues = [/�/, /[\u200B-\u200D\uFEFF]/, /[\u0000-\u001F]/];
  const hasUnicodeIssues = unicodeIssues.some(p => p.test(txt));

  const isEmpty = txt.trim().length < 3;
  const isOverlong = txt.length > 3000;

  const penaltyReasons: string[] = [];
  if (hasMarkdownFences) penaltyReasons.push('Markdown fences');
  if (hasHallucinationMarkers) penaltyReasons.push('Hallucination markers');
  if (hasUnicodeIssues) penaltyReasons.push('Unicode issues');
  if (isEmpty) penaltyReasons.push('Empty message');
  if (isOverlong) penaltyReasons.push('Overlong message');

  return {
    hasMarkdownFences,
    hasHallucinationMarkers,
    hasUnicodeIssues,
    isEmpty,
    isOverlong,
    messageLength: txt.length,
    penaltyReasons
  };
}

/**
 * Get Cleanliness Flags
 *
 * Returns specific telemetry flags based on cleanliness issues.
 *
 * @param event - Telemetry event to check
 * @param score - Cleanliness score
 * @returns Array of telemetry flags
 */
export function getCleanlinessFlags(event: TelemetryEvent, score: number): TelemetryFlag[] {
  const flags: TelemetryFlag[] = [];
  const details = getCleanlinessDetails(event);

  if (score < 70) {
    flags.push('low_cleanliness');
  }

  if (details.hasMarkdownFences) {
    flags.push('markdown_fences');
  }

  if (details.hasHallucinationMarkers) {
    flags.push('hallucination_markers');
  }

  if (details.hasUnicodeIssues) {
    flags.push('unicode_issues');
  }

  if (details.isEmpty) {
    flags.push('empty_message');
  }

  if (details.isOverlong) {
    flags.push('overlong_message');
  }

  // Check for slot duplication
  if (event.extractedSlots && event.extractedSlots.length > 0) {
    const uniqueSlots = new Set(event.extractedSlots);
    if (uniqueSlots.size < event.extractedSlots.length) {
      flags.push('slot_duplication');
    }
  }

  return flags;
}
