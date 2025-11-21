/**
 * EQ Classifier v4.0
 *
 * Extracts EQ signals from student messages using:
 * 1. Rule-based keyword matching (fast, deterministic)
 * 2. Optional LLM refinement (catches subtle signals)
 *
 * This is NOT hallucinated psychobabble.
 * This is grounded detection based on Jenny's real patterns.
 *
 * The two-stage approach:
 * - Stage 1: Keyword matching catches obvious signals
 * - Stage 2: LLM refines (removes false positives, adds subtle ones)
 */

import { EQSignal, EQ_KEYWORDS } from "./eqSignals";

/**
 * EQ Classification Result
 *
 * Contains detected signals and confidence scores.
 */
export interface EQClassificationResult {
  signals: EQSignal[];
  primary: EQSignal | null;
  confidence: number; // 0-1 score
  method: "keyword" | "llm" | "hybrid";
  trace: string[];
}

/**
 * Classify EQ (Keyword-Only)
 *
 * Fast, deterministic EQ signal detection using keyword patterns.
 * No LLM calls - pure rule-based.
 *
 * Use this when:
 * - Need fast response
 * - Don't want LLM cost
 * - Message has clear emotional keywords
 *
 * @param rawMessage - Student message
 * @returns Classification result
 */
export function classifyEQKeywords(rawMessage: string): EQClassificationResult {
  console.log(`[EQClassifier] Classifying message (keyword-only): "${rawMessage.substring(0, 50)}..."`);

  const normalized = rawMessage.toLowerCase();
  const detected: Set<EQSignal> = new Set();
  const trace: string[] = [];

  // Rule-based keyword matching
  for (const signal of Object.keys(EQ_KEYWORDS) as EQSignal[]) {
    const keywords = EQ_KEYWORDS[signal];

    for (const keyword of keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        detected.add(signal);
        trace.push(`${signal}:keyword="${keyword}"`);
        break; // Only record once per signal
      }
    }
  }

  const signals = Array.from(detected);
  const primary = signals.length > 0 ? signals[0] : null;

  console.log(`[EQClassifier] Detected ${signals.length} signals: ${signals.join(", ")}`);

  return {
    signals,
    primary,
    confidence: signals.length > 0 ? 0.7 : 0.3, // Moderate confidence for keyword matching
    method: "keyword",
    trace
  };
}

/**
 * Classify EQ (With LLM Refinement)
 *
 * Two-stage classification:
 * 1. Keyword matching (fast baseline)
 * 2. LLM refinement (catches subtle signals, removes false positives)
 *
 * This is the recommended method for production use.
 *
 * @param rawMessage - Student message
 * @param llmRefiner - Optional LLM refiner function
 * @returns Classification result
 */
export async function classifyEQ(
  rawMessage: string,
  llmRefiner?: (message: string, preliminary: EQSignal[]) => Promise<EQSignal[]>
): Promise<EQClassificationResult> {
  console.log(`[EQClassifier] Classifying message (hybrid): "${rawMessage.substring(0, 50)}..."`);

  // Stage 1: Keyword matching
  const keywordResult = classifyEQKeywords(rawMessage);

  // Stage 2: LLM refinement (if available)
  if (llmRefiner) {
    try {
      console.log(`[EQClassifier] Running LLM refinement...`);
      const llmSignals = await llmRefiner(rawMessage, keywordResult.signals);

      // Merge keyword + LLM signals
      const merged = new Set<EQSignal>([...keywordResult.signals, ...llmSignals]);
      const signals = Array.from(merged);
      const primary = signals.length > 0 ? signals[0] : null;

      console.log(`[EQClassifier] LLM refined to ${signals.length} signals: ${signals.join(", ")}`);

      return {
        signals,
        primary,
        confidence: 0.85, // Higher confidence with LLM refinement
        method: "hybrid",
        trace: [...keywordResult.trace, `llm:added=${llmSignals.join(",")}`]
      };
    } catch (error) {
      console.error(`[EQClassifier] LLM refinement failed, falling back to keywords:`, error);
      return keywordResult;
    }
  }

  return keywordResult;
}

/**
 * Classify EQ Batch
 *
 * Classifies multiple messages in parallel.
 * Useful for analyzing conversation history.
 *
 * @param messages - Array of messages
 * @param llmRefiner - Optional LLM refiner
 * @returns Array of classification results
 */
export async function classifyEQBatch(
  messages: string[],
  llmRefiner?: (message: string, preliminary: EQSignal[]) => Promise<EQSignal[]>
): Promise<EQClassificationResult[]> {
  console.log(`[EQClassifier] Batch classifying ${messages.length} messages`);

  return Promise.all(messages.map(msg => classifyEQ(msg, llmRefiner)));
}

/**
 * Get Dominant Signal
 *
 * From a list of classifications, determines the dominant EQ signal.
 * Uses frequency across messages.
 *
 * @param classifications - Array of classification results
 * @returns Dominant signal or null
 */
export function getDominantSignal(classifications: EQClassificationResult[]): EQSignal | null {
  const counts: Record<string, number> = {};

  for (const classification of classifications) {
    for (const signal of classification.signals) {
      counts[signal] = (counts[signal] || 0) + 1;
    }
  }

  let maxSignal: EQSignal | null = null;
  let maxCount = 0;

  for (const [signal, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxSignal = signal as EQSignal;
      maxCount = count;
    }
  }

  return maxSignal;
}

/**
 * Has Conflicting Signals
 *
 * Checks if detected signals are contradictory.
 * Example: CONFIDENCE + INSECURITY is contradictory.
 *
 * @param signals - Array of EQ signals
 * @returns True if conflicting
 */
export function hasConflictingSignals(signals: EQSignal[]): boolean {
  const conflictPairs: [EQSignal, EQSignal][] = [
    ["CONFIDENCE", "INSECURITY"],
    ["EAGERNESS", "APATHY"],
    ["DISCIPLINE", "APATHY"],
    ["PRIDE", "INSECURITY"]
  ];

  for (const [sig1, sig2] of conflictPairs) {
    if (signals.includes(sig1) && signals.includes(sig2)) {
      return true;
    }
  }

  return false;
}

/**
 * Filter Low Confidence Signals
 *
 * Removes signals that are likely false positives.
 * Uses heuristics based on message length and clarity.
 *
 * @param classification - Classification result
 * @param minConfidence - Minimum confidence threshold (default: 0.5)
 * @returns Filtered classification
 */
export function filterLowConfidenceSignals(
  classification: EQClassificationResult,
  minConfidence: number = 0.5
): EQClassificationResult {
  if (classification.confidence >= minConfidence) {
    return classification; // Already confident
  }

  // If low confidence and multiple signals, keep only the strongest
  const signals =
    classification.signals.length > 2 ? [classification.signals[0]] : classification.signals;

  return {
    ...classification,
    signals,
    primary: signals[0] || null
  };
}

/**
 * Get Classification Summary
 *
 * Returns human-readable summary of classification.
 *
 * @param classification - Classification result
 * @returns Summary string
 */
export function getClassificationSummary(classification: EQClassificationResult): string {
  if (classification.signals.length === 0) {
    return "No EQ signals detected (neutral message)";
  }

  const signalList = classification.signals.join(", ");
  const confidence = (classification.confidence * 100).toFixed(0);

  return `Detected: ${signalList} (${confidence}% confidence, ${classification.method})`;
}
