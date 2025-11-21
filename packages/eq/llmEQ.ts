/**
 * LLM EQ Refinement v4.0
 *
 * Uses Claude to refine keyword-based EQ detections.
 *
 * Purpose:
 * - Catch subtle emotional signals that keywords miss
 * - Remove false positives from keyword matching
 * - Improve classification precision
 *
 * This is NOT for hallucinating emotional states.
 * This is ONLY for refining preliminary keyword detections.
 *
 * The LLM is constrained to:
 * - Only work with signals already detected OR closely related ones
 * - Never invent emotions not justified by message
 * - Return ONLY signal names, no prose
 */

import Anthropic from "@anthropic-ai/sdk";
import { EQSignal } from "./eqSignals";

/**
 * LLM Refinement Config
 *
 * Configuration for LLM-based EQ refinement.
 */
export interface LLMRefinementConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

/**
 * Default Config
 */
const DEFAULT_CONFIG: Required<LLMRefinementConfig> = {
  apiKey: process.env.ANTHROPIC_KEY || "",
  model: "claude-3-5-sonnet-20241022",
  maxTokens: 128,
  temperature: 0.3, // Low temperature for precision
  timeout: 5000
};

/**
 * Run EQ Refinement LLM
 *
 * Uses Claude to refine preliminary EQ signal detections.
 *
 * Workflow:
 * 1. Take message + preliminary keyword detections
 * 2. Ask Claude to refine (remove false positives, add subtle ones)
 * 3. Parse response back to signal list
 * 4. Return refined signals
 *
 * @param message - Student message
 * @param preliminarySignals - Signals detected by keyword matching
 * @param config - Optional configuration
 * @returns Refined array of EQ signals
 */
export async function runEQRefinementLLM(
  message: string,
  preliminarySignals: EQSignal[],
  config?: LLMRefinementConfig
): Promise<EQSignal[]> {
  console.log(
    `[LLMRefinement] Refining EQ signals for message: "${message.substring(0, 50)}..."`
  );
  console.log(`[LLMRefinement] Preliminary signals: ${preliminarySignals.join(", ") || "none"}`);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.apiKey) {
    console.warn(`[LLMRefinement] No API key provided, skipping LLM refinement`);
    return preliminarySignals;
  }

  try {
    const client = new Anthropic({ apiKey: finalConfig.apiKey });

    const systemPrompt = buildSystemPrompt(preliminarySignals);
    const userPrompt = buildUserPrompt(message);

    console.log(`[LLMRefinement] Calling Claude for refinement...`);

    const response = await client.messages.create({
      model: finalConfig.model,
      max_tokens: finalConfig.maxTokens,
      temperature: finalConfig.temperature,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "";

    console.log(`[LLMRefinement] Raw response: "${responseText}"`);

    const refined = parseRefinedSignals(responseText);

    console.log(`[LLMRefinement] Refined signals: ${refined.join(", ") || "none"}`);

    return refined;
  } catch (error) {
    console.error(`[LLMRefinement] Error during refinement:`, error);
    // Fall back to preliminary signals if LLM fails
    return preliminarySignals;
  }
}

/**
 * Build System Prompt
 *
 * Creates the system prompt that constrains the LLM to only refine,
 * not hallucinate new emotional states.
 *
 * @param preliminarySignals - Signals detected by keywords
 * @returns System prompt
 */
function buildSystemPrompt(preliminarySignals: EQSignal[]): string {
  const allSignals: EQSignal[] = [
    "ANXIETY",
    "INSECURITY",
    "CONFUSION",
    "OVERWHELM",
    "APATHY",
    "EAGERNESS",
    "CONFIDENCE",
    "CURIOSITY",
    "PRIDE",
    "DISCIPLINE",
    "FRUSTRATION",
    "RESISTANCE"
  ];

  return `You are an EQ detection assistant for IvyLevel, a college admissions coaching platform.

Your job is to REFINE preliminary EQ signal detections from keyword matching.

DO NOT guess emotions.
DO NOT hallucinate emotional states.
DO NOT invent signals that aren't justified by the message.

ONLY:
- Confirm signals that are genuinely present
- Remove false positives from keyword matching
- Add subtle signals that keywords missed (but only if clearly implied)

Preliminary keyword detections: ${preliminarySignals.join(", ") || "NONE"}

Allowed EQ signals (use EXACTLY these names):
${allSignals.join(", ")}

Return ONLY signal names, comma-separated, no prose.
If no signals are justified, return "NONE".

Examples:
- "ANXIETY, OVERWHELM"
- "EAGERNESS"
- "NONE"`;
}

/**
 * Build User Prompt
 *
 * Creates the user prompt with the message to analyze.
 *
 * @param message - Student message
 * @returns User prompt
 */
function buildUserPrompt(message: string): string {
  return `Analyze this student message for EQ signals:

"${message}"

Return only the justified EQ signal names (comma-separated), or "NONE".`;
}

/**
 * Parse Refined Signals
 *
 * Parses LLM response back into array of EQ signals.
 * Handles various response formats gracefully.
 *
 * @param responseText - LLM response
 * @returns Array of EQ signals
 */
function parseRefinedSignals(responseText: string): EQSignal[] {
  const normalized = responseText.trim().toUpperCase();

  // Handle "NONE" response
  if (normalized === "NONE" || normalized === "") {
    return [];
  }

  // Split by comma, newline, or semicolon
  const parts = normalized.split(/[,\n;]+/).map(s => s.trim());

  const validSignals: EQSignal[] = [
    "ANXIETY",
    "INSECURITY",
    "CONFUSION",
    "OVERWHELM",
    "APATHY",
    "EAGERNESS",
    "CONFIDENCE",
    "CURIOSITY",
    "PRIDE",
    "DISCIPLINE",
    "FRUSTRATION",
    "RESISTANCE"
  ];

  // Filter to only valid signals
  const refined: EQSignal[] = [];

  for (const part of parts) {
    const signal = part as EQSignal;
    if (validSignals.includes(signal) && !refined.includes(signal)) {
      refined.push(signal);
    }
  }

  return refined;
}

/**
 * Mock LLM Refiner
 *
 * Mock implementation for testing without API calls.
 * Simulates reasonable refinement behavior.
 *
 * @param message - Student message
 * @param preliminarySignals - Preliminary signals
 * @returns Refined signals
 */
export async function mockEQRefinementLLM(
  message: string,
  preliminarySignals: EQSignal[]
): Promise<EQSignal[]> {
  console.log(`[MockLLMRefinement] Refining: "${message.substring(0, 50)}..."`);

  const lower = message.toLowerCase();

  // If message is clearly anxious/overwhelmed
  if (
    lower.includes("so stressed") ||
    lower.includes("freaking out") ||
    lower.includes("too much")
  ) {
    const signals = new Set<EQSignal>(preliminarySignals);
    signals.add("ANXIETY");
    if (lower.includes("too much")) signals.add("OVERWHELM");
    return Array.from(signals);
  }

  // If message is clearly eager/confident
  if (
    lower.includes("excited") ||
    lower.includes("ready") ||
    lower.includes("can't wait") ||
    lower.includes("let's do this")
  ) {
    const signals = new Set<EQSignal>(preliminarySignals);
    signals.add("EAGERNESS");
    if (lower.includes("i can") || lower.includes("i got")) signals.add("CONFIDENCE");
    return Array.from(signals);
  }

  // If message is clearly resistant
  if (
    lower.includes("don't want") ||
    lower.includes("not doing") ||
    lower.includes("won't")
  ) {
    const signals = new Set<EQSignal>(preliminarySignals);
    signals.add("RESISTANCE");
    return Array.from(signals);
  }

  // If message shows curiosity
  if (
    lower.includes("why") ||
    lower.includes("how does") ||
    lower.includes("can you explain") ||
    lower.includes("tell me more")
  ) {
    const signals = new Set<EQSignal>(preliminarySignals);
    signals.add("CURIOSITY");
    return Array.from(signals);
  }

  // If message shows confusion
  if (
    lower.includes("confused") ||
    lower.includes("don't understand") ||
    lower.includes("not sure")
  ) {
    const signals = new Set<EQSignal>(preliminarySignals);
    signals.add("CONFUSION");
    return Array.from(signals);
  }

  // Default: return preliminary signals (no refinement)
  return preliminarySignals;
}

/**
 * Validate Refinement
 *
 * Checks if refined signals are reasonable compared to preliminary.
 * Warns if LLM added too many new signals (possible hallucination).
 *
 * @param preliminary - Preliminary signals
 * @param refined - Refined signals
 * @returns Validation result
 */
export function validateRefinement(
  preliminary: EQSignal[],
  refined: EQSignal[]
): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Warn if LLM removed ALL signals (might be too aggressive)
  if (preliminary.length > 0 && refined.length === 0) {
    warnings.push("LLM removed all signals - might be too aggressive");
  }

  // Warn if LLM added >3 new signals (possible hallucination)
  const added = refined.filter(s => !preliminary.includes(s));
  if (added.length > 3) {
    warnings.push(
      `LLM added ${added.length} new signals (${added.join(", ")}) - possible hallucination`
    );
  }

  // Warn if refined has >5 signals total (unlikely to be accurate)
  if (refined.length > 5) {
    warnings.push(`Refined has ${refined.length} signals - might be over-detecting`);
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}

/**
 * Get Refinement Stats
 *
 * Returns statistics about the refinement operation.
 *
 * @param preliminary - Preliminary signals
 * @param refined - Refined signals
 * @returns Stats object
 */
export function getRefinementStats(preliminary: EQSignal[], refined: EQSignal[]): {
  preliminaryCount: number;
  refinedCount: number;
  added: EQSignal[];
  removed: EQSignal[];
  unchanged: EQSignal[];
} {
  const added = refined.filter(s => !preliminary.includes(s));
  const removed = preliminary.filter(s => !refined.includes(s));
  const unchanged = refined.filter(s => preliminary.includes(s));

  return {
    preliminaryCount: preliminary.length,
    refinedCount: refined.length,
    added,
    removed,
    unchanged
  };
}
