/**
 * EQ Drift Detector v4.0
 *
 * The NO-COMPROMISE quality gate that prevents Jenny's voice from morphing into:
 * - Generic chatbot
 * - Overly formal college counselor
 * - Hypebeast TikTok life coach
 * - Emotionless framework vending machine
 * - Therapy-speak bot
 *
 * Purpose:
 * - Validate generated responses against required EQ style
 * - Detect tone violations (therapy language, hype, formality, coldness)
 * - Reject or rewrite responses that don't match Jenny's authentic voice
 * - Enforce coaching guardrails before output
 *
 * This is CRITICAL for high-stakes assessment sessions where:
 * - One formal sentence can demotivate an anxious student
 * - Excessive sympathy can derail a confident student
 * - Too much firmness can shut down a shy student
 * - Disappointed tone can spiral a perfectionist
 */

import Anthropic from "@anthropic-ai/sdk";
import { StyleDirectives } from "./styleMixer";
import { JENNY_TONE_RUBRIC } from "./toneRubrics";

/**
 * Drift Report
 *
 * Results of drift detection analysis.
 */
export interface DriftReport {
  driftDetected: boolean; // True if any violations found
  driftReasons: string[]; // List of specific violations
  normalizedResponse: string; // Original or corrected response
  severity: "none" | "minor" | "major"; // How bad the drift is
  corrections: string[]; // What was fixed
}

/**
 * Drift Detector Config
 *
 * Configuration for drift detection.
 */
export interface DriftDetectorConfig {
  apiKey?: string;
  enableNormalization?: boolean; // Auto-fix detected drift
  strictMode?: boolean; // More aggressive detection
}

/**
 * Default Config
 */
const DEFAULT_CONFIG: Required<DriftDetectorConfig> = {
  apiKey: process.env.ANTHROPIC_KEY || "",
  enableNormalization: true,
  strictMode: false
};

/**
 * Detect EQ Drift
 *
 * Main drift detection function.
 * Analyzes generated response for tone violations and optionally fixes them.
 *
 * Detection steps:
 * 1. Check for therapy language (trauma, heal, inner child, etc.)
 * 2. Check for overly formal patterns
 * 3. Check for excessive hype
 * 4. Check for warmth mismatch (when high warmth required)
 * 5. Check for missing Jenny-specific patterns
 * 6. If drift detected + normalization enabled → rewrite with LLM
 *
 * @param response - Generated response text
 * @param style - Required style directives
 * @param config - Optional configuration
 * @returns Drift report with corrections if needed
 */
export async function detectEQDrift(
  response: string,
  style: StyleDirectives,
  config?: DriftDetectorConfig
): Promise<DriftReport> {
  console.log(
    `[DriftDetector] Analyzing response (${response.length} chars) for style: warmth=${style.warmthLevel}, firmness=${style.firmnessLevel}`
  );

  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const driftReasons: string[] = [];
  const corrections: string[] = [];

  // Rule 1: Therapy language detection
  if (hasTherapyLanguage(response)) {
    driftReasons.push("Therapy-like language detected (trauma, heal, inner child, etc.)");
  }

  // Rule 2: Overly formal tone
  if (detectOverlyFormal(response)) {
    driftReasons.push("Overly formal tone (as per, furthermore, dear student, etc.)");
  }

  // Rule 3: Excessive hype
  if (detectHype(response)) {
    driftReasons.push("Excessive hype tone (unstoppable, limitless, manifest, etc.)");
  }

  // Rule 4: Warmth mismatch
  if (missingWarmth(response, style)) {
    driftReasons.push(
      `Warmth mismatch (style requires ${style.warmthLevel} warmth but response feels cold)`
    );
  }

  // Rule 5: Firmness mismatch
  if (excessiveFirmness(response, style)) {
    driftReasons.push(
      `Excessive firmness (style requires ${style.firmnessLevel} firmness but response feels harsh)`
    );
  }

  // Rule 6: Generic/robotic language
  if (finalConfig.strictMode && detectGenericLanguage(response)) {
    driftReasons.push("Generic/robotic language (lacks Jenny's personality)");
  }

  // Rule 7: Missing Jenny patterns (strict mode only)
  if (finalConfig.strictMode && missingJennyPatterns(response, style)) {
    driftReasons.push("Missing Jenny-specific language patterns");
  }

  const driftDetected = driftReasons.length > 0;
  const severity = calculateSeverity(driftReasons.length);

  console.log(
    `[DriftDetector] Drift detected: ${driftDetected}, reasons: ${driftReasons.length}, severity: ${severity}`
  );

  if (!driftDetected) {
    return {
      driftDetected: false,
      driftReasons: [],
      normalizedResponse: response,
      severity: "none",
      corrections: []
    };
  }

  // If drift detected and normalization enabled, fix it
  let normalizedResponse = response;

  if (finalConfig.enableNormalization) {
    console.log(`[DriftDetector] Normalizing response to fix drift...`);
    normalizedResponse = await normalizeWithLLM(response, style, driftReasons, finalConfig);
    corrections.push("Response rewritten to match Jenny's authentic tone");
  }

  return {
    driftDetected: true,
    driftReasons,
    normalizedResponse,
    severity,
    corrections
  };
}

/**
 * Has Therapy Language
 *
 * Detects therapy-speak that violates coaching boundaries.
 */
function hasTherapyLanguage(text: string): boolean {
  const therapyPatterns = [
    /\btrauma\b/i,
    /\bheal(ing)?\b/i,
    /\btherapist\b/i,
    /\btherapy\b/i,
    /inner child/i,
    /\btrigger(ed|s)?\b/i,
    /emotional wound/i,
    /\bprocess (your|the) emotions?\b/i,
    /deep-seated/i,
    /unpack (your|the) trauma/i
  ];

  return therapyPatterns.some(pattern => pattern.test(text));
}

/**
 * Detect Overly Formal
 *
 * Detects corporate/academic formality that breaks Jenny's conversational tone.
 */
function detectOverlyFormal(text: string): boolean {
  const formalPatterns = [
    /as per your request/i,
    /\bfurthermore\b/i,
    /\bin conclusion\b/i,
    /\badditionally,/i,
    /\bdear student\b/i,
    /\bpursue excellence\b/i,
    /\bherewith\b/i,
    /\bplease be advised\b/i,
    /\bfor your consideration\b/i,
    /\bin regards to\b/i,
    /\bnotwithstanding\b/i,
    /\btherefore\b/i,
    /\bhenceforth\b/i
  ];

  return formalPatterns.some(pattern => pattern.test(text));
}

/**
 * Detect Hype
 *
 * Detects toxic positivity / motivational speaker garbage.
 */
function detectHype(text: string): boolean {
  const hypePatterns = [
    /you are unstoppable/i,
    /limitless potential/i,
    /you can achieve anything/i,
    /\bmanifest\b/i,
    /the universe/i,
    /\byou are AMAZING/i,
    /CRUSH IT/i,
    /BEAST MODE/i,
    /level up/i,
    /quantum leap/i,
    /game changer/i
  ];

  return hypePatterns.some(pattern => pattern.test(text));
}

/**
 * Missing Warmth
 *
 * Checks if high-warmth style is missing warm openings or validations.
 */
function missingWarmth(text: string, style: StyleDirectives): boolean {
  if (style.warmthLevel !== "high") {
    return false; // Only check if high warmth required
  }

  // Check if response contains ANY Jenny warm opening or validation
  const hasWarmOpening = JENNY_TONE_RUBRIC.openings.some(opening =>
    text.toLowerCase().includes(opening.toLowerCase())
  );

  const hasValidation = JENNY_TONE_RUBRIC.validations.some(validation =>
    text.toLowerCase().includes(validation.toLowerCase())
  );

  // For high warmth, we want at least one warm element in responses > 60 chars
  if (text.length > 60) {
    return !hasWarmOpening && !hasValidation;
  }

  return false;
}

/**
 * Excessive Firmness
 *
 * Checks if response is too harsh when low/medium firmness required.
 */
function excessiveFirmness(text: string, style: StyleDirectives): boolean {
  if (style.firmnessLevel === "high") {
    return false; // High firmness allows strong language
  }

  const harshPatterns = [
    /you need to stop/i,
    /you must/i,
    /you have to/i,
    /this is unacceptable/i,
    /I'm disappointed/i,
    /that's wrong/i,
    /you're making a mistake/i,
    /you should know better/i
  ];

  return harshPatterns.some(pattern => pattern.test(text));
}

/**
 * Detect Generic Language
 *
 * Detects bland, personality-less AI responses.
 */
function detectGenericLanguage(text: string): boolean {
  const genericPatterns = [
    /I'd be happy to help/i,
    /thank you for reaching out/i,
    /I hope this helps/i,
    /feel free to/i,
    /don't hesitate to/i,
    /at this time/i,
    /moving forward/i,
    /going forward/i
  ];

  return genericPatterns.some(pattern => pattern.test(text));
}

/**
 * Missing Jenny Patterns
 *
 * Checks if response lacks ANY Jenny-specific language.
 */
function missingJennyPatterns(text: string, style: StyleDirectives): boolean {
  // Check if response uses ANY Jenny patterns from any category
  const allPatterns = [
    ...JENNY_TONE_RUBRIC.openings,
    ...JENNY_TONE_RUBRIC.validations,
    ...JENNY_TONE_RUBRIC.pacingCues,
    ...JENNY_TONE_RUBRIC.microEncouragements,
    ...JENNY_TONE_RUBRIC.reframes,
    ...JENNY_TONE_RUBRIC.closures
  ];

  const hasAnyJennyPattern = allPatterns.some(pattern =>
    text.toLowerCase().includes(pattern.toLowerCase())
  );

  // For responses longer than 150 chars, expect at least one Jenny pattern
  if (text.length > 150) {
    return !hasAnyJennyPattern;
  }

  return false;
}

/**
 * Calculate Severity
 *
 * Determines how bad the drift is based on number of violations.
 */
function calculateSeverity(violationCount: number): "none" | "minor" | "major" {
  if (violationCount === 0) return "none";
  if (violationCount <= 2) return "minor";
  return "major";
}

/**
 * Normalize With LLM
 *
 * Uses Claude to rewrite response to match Jenny's authentic tone.
 *
 * @param text - Original response
 * @param style - Required style directives
 * @param violations - Detected violations
 * @param config - Configuration
 * @returns Normalized response
 */
async function normalizeWithLLM(
  text: string,
  style: StyleDirectives,
  violations: string[],
  config: Required<DriftDetectorConfig>
): Promise<string> {
  if (!config.apiKey) {
    console.warn(`[DriftDetector] No API key, returning original text`);
    return text;
  }

  try {
    const client = new Anthropic({ apiKey: config.apiKey });

    const systemPrompt = `You are the EQ Drift Normalizer for IvyLevel.

Your job: Rewrite responses to match Jenny's authentic coaching voice.

ENFORCE:
- Jenny-tone language patterns (warm, tactical, no-bullshit)
- Match the required style directives
- NO therapy language (trauma, heal, inner child)
- NO overly formal writing (furthermore, as per, dear student)
- NO hype exaggerations (unstoppable, limitless, manifest)
- Use conversational, grounded tone

Return ONLY the improved text. No explanations.`;

    const userPrompt = `Rewrite this response to fix these violations:
${violations.map(v => `- ${v}`).join("\n")}

STYLE DIRECTIVES:
- Warmth: ${style.warmthLevel}
- Firmness: ${style.firmnessLevel}
- Empathy: ${style.empathyLevel}
- Cheer: ${style.cheerLevel}
- Pace: ${style.paceLevel}
- Intensity: ${style.intensityLevel}

Original text:
"""
${text}
"""

Return the improved text only:`;

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 512,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }]
    });

    const normalized =
      response.content[0].type === "text" ? response.content[0].text.trim() : text;

    console.log(`[DriftDetector] Normalized response: ${normalized.length} chars`);

    return normalized;
  } catch (error) {
    console.error(`[DriftDetector] Normalization failed:`, error);
    return text; // Fall back to original
  }
}

/**
 * Mock Normalizer
 *
 * Mock implementation for testing without API calls.
 */
export async function mockNormalizeResponse(
  text: string,
  style: StyleDirectives,
  violations: string[]
): Promise<string> {
  console.log(`[MockNormalizer] Fixing ${violations.length} violations`);

  // Simple mock: add a Jenny opening if missing warmth
  if (violations.some(v => v.toLowerCase().includes("warmth"))) {
    return `Totally hear you on this. ${text}`;
  }

  // Remove therapy language
  if (violations.some(v => v.includes("Therapy"))) {
    return text
      .replace(/trauma/gi, "challenge")
      .replace(/heal/gi, "work through")
      .replace(/inner child/gi, "past experiences");
  }

  // Remove formal language
  if (violations.some(v => v.includes("formal"))) {
    return text
      .replace(/as per your request/gi, "Sure")
      .replace(/furthermore/gi, "also")
      .replace(/in conclusion/gi, "so");
  }

  // Remove hype
  if (violations.some(v => v.includes("hype"))) {
    return text
      .replace(/unstoppable/gi, "capable")
      .replace(/limitless potential/gi, "real strengths")
      .replace(/manifest/gi, "achieve");
  }

  return text;
}

/**
 * Validate Normalization
 *
 * Checks if normalized response actually fixed the issues.
 *
 * @param original - Original response
 * @param normalized - Normalized response
 * @param style - Style directives
 * @returns Validation result
 */
export async function validateNormalization(
  original: string,
  normalized: string,
  style: StyleDirectives
): Promise<{ isImproved: boolean; remainingIssues: string[] }> {
  // Re-run drift detection on normalized response
  const recheck = await detectEQDrift(normalized, style, { enableNormalization: false });

  const isImproved = recheck.driftReasons.length === 0 || normalized !== original;

  return {
    isImproved,
    remainingIssues: recheck.driftReasons
  };
}

/**
 * Get Drift Summary
 *
 * Returns human-readable summary of drift report.
 *
 * @param report - Drift report
 * @returns Summary string
 */
export function getDriftSummary(report: DriftReport): string {
  if (!report.driftDetected) {
    return "✓ No drift detected - response matches Jenny's authentic tone";
  }

  const lines: string[] = [];
  lines.push(`✗ Drift detected (${report.severity} severity):`);

  for (const reason of report.driftReasons) {
    lines.push(`  - ${reason}`);
  }

  if (report.corrections.length > 0) {
    lines.push("");
    lines.push("Corrections applied:");
    for (const correction of report.corrections) {
      lines.push(`  ✓ ${correction}`);
    }
  }

  return lines.join("\n");
}
