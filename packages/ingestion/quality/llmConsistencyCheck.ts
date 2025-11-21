import { QualityGateInput, GateResult } from "./quality.types";

/**
 * LLM Structural Consistency Checker v1.0
 *
 * Uses LLM to check:
 * - Are turns in order?
 * - Are sections complete?
 * - Is content logically coherent?
 * - Is anything hallucinated?
 * - Are there disordered segments?
 * - Redundant OCR noise?
 *
 * This catches semantic/structural issues that format validation misses.
 *
 * FUTURE: Connect to Claude/GPT-4 for actual LLM validation
 * CURRENT: Uses sophisticated heuristics as MVP
 */

/**
 * LLM Consistency Response
 *
 * Expected response from LLM consistency check.
 */
interface LLMConsistencyResponse {
  structureScore: number; // 0-100
  issues: string[];
  isConsistent: boolean;
}

/**
 * Check Structure with LLM
 *
 * Main entry point for structural consistency checking.
 */
export async function checkStructureLLM(
  input: QualityGateInput
): Promise<GateResult> {
  console.log("[StructureCheck] Checking structural consistency");
  console.log(`  - Source: ${input.sourcePath}`);
  console.log(`  - Text length: ${input.rawText.length}`);

  // Call LLM consistency checker
  const llmResponse = await callLLMConsistencyCheck(input.rawText, input.metadata.fileType);

  console.log("[StructureCheck] Check complete");
  console.log(`  - Consistent: ${llmResponse.isConsistent}`);
  console.log(`  - Score: ${llmResponse.structureScore}`);
  console.log(`  - Issues: ${llmResponse.issues.length}`);

  return {
    passed: llmResponse.isConsistent,
    errors: llmResponse.isConsistent ? [] : llmResponse.issues,
    warnings: llmResponse.isConsistent ? llmResponse.issues : [],
    score: llmResponse.structureScore
  };
}

/**
 * Call LLM Consistency Check
 *
 * FUTURE: Replace with actual LLM API call to Claude/GPT-4
 * CURRENT: Uses heuristic-based analysis as MVP
 *
 * LLM Prompt (for future implementation):
 * ```
 * You are the QUALITY CONSISTENCY CHECKER for IvyLevel.
 * Input is raw coaching content.
 *
 * Return ONLY JSON.
 *
 * You must check:
 * 1. Missing or truncated ideas
 * 2. Disordered segments
 * 3. Hallucinated patterns
 * 4. Redundant OCR noise
 * 5. Non-coach voices inserted erroneously
 *
 * Response schema:
 * {
 *   "structureScore": number (0-100),
 *   "issues": string[],
 *   "isConsistent": boolean
 * }
 * ```
 */
async function callLLMConsistencyCheck(
  text: string,
  fileType: string
): Promise<LLMConsistencyResponse> {
  // MVP: Heuristic-based consistency checks
  // TODO: Replace with actual LLM API call

  const issues: string[] = [];
  let score = 100;

  // Check 1: Sentence completeness
  const incompleteSentences = detectIncompleteSentences(text);
  if (incompleteSentences > 0.2) {
    issues.push(`High rate of incomplete sentences (${Math.round(incompleteSentences * 100)}%)`);
    score -= 20;
  } else if (incompleteSentences > 0.1) {
    issues.push(`Some incomplete sentences (${Math.round(incompleteSentences * 100)}%)`);
    score -= 10;
  }

  // Check 2: Paragraph coherence
  const coherenceScore = checkParagraphCoherence(text);
  if (coherenceScore < 50) {
    issues.push(`Low paragraph coherence (score: ${coherenceScore})`);
    score -= 20;
  } else if (coherenceScore < 70) {
    issues.push(`Moderate paragraph coherence (score: ${coherenceScore})`);
    score -= 10;
  }

  // Check 3: Conversation flow (for VTT transcripts)
  if (fileType === "vtt") {
    const flowScore = checkConversationFlow(text);
    if (flowScore < 50) {
      issues.push(`Poor conversation flow (score: ${flowScore})`);
      score -= 20;
    }
  }

  // Check 4: Repetition patterns (OCR noise)
  const repetitionScore = detectRepetitionPatterns(text);
  if (repetitionScore > 0.3) {
    issues.push(`High repetition detected (${Math.round(repetitionScore * 100)}%) - likely OCR noise`);
    score -= 15;
  }

  // Check 5: Logical breaks
  const hasLogicalBreaks = checkLogicalBreaks(text);
  if (!hasLogicalBreaks) {
    issues.push("No logical section breaks detected");
    score -= 10;
  }

  const isConsistent = issues.filter(i => i.includes("High") || i.includes("Poor") || i.includes("Low")).length === 0;

  return {
    structureScore: Math.max(0, score),
    issues,
    isConsistent
  };
}

/**
 * Detect Incomplete Sentences
 *
 * Checks for sentences that end abruptly or mid-thought.
 */
function detectIncompleteSentences(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (sentences.length === 0) return 0;

  let incompleteCount = 0;

  sentences.forEach(sentence => {
    const trimmed = sentence.trim();

    // Incomplete indicators
    if (
      trimmed.endsWith(",") ||
      trimmed.endsWith("and") ||
      trimmed.endsWith("but") ||
      trimmed.endsWith("or") ||
      trimmed.length < 10
    ) {
      incompleteCount++;
    }
  });

  return incompleteCount / sentences.length;
}

/**
 * Check Paragraph Coherence
 *
 * Simple heuristic: check if paragraphs have reasonable length and structure.
 */
function checkParagraphCoherence(text: string): number {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  if (paragraphs.length === 0) return 0;

  let coherenceScore = 100;

  // Check for extremely short paragraphs (indicates fragmentation)
  const shortParas = paragraphs.filter(p => p.length < 50).length;
  if (shortParas / paragraphs.length > 0.5) {
    coherenceScore -= 30;
  }

  // Check for extremely long paragraphs (indicates missing breaks)
  const longParas = paragraphs.filter(p => p.length > 2000).length;
  if (longParas / paragraphs.length > 0.3) {
    coherenceScore -= 20;
  }

  return Math.max(0, coherenceScore);
}

/**
 * Check Conversation Flow
 *
 * For transcripts, checks if there's a natural back-and-forth.
 */
function checkConversationFlow(text: string): number {
  // Look for speaker indicators or question/answer patterns
  const questionMarks = (text.match(/\?/g) || []).length;
  const lines = text.split("\n").length;

  // Healthy conversation has questions
  if (questionMarks < lines * 0.05) {
    return 40; // Few questions suggests poor conversation flow
  }

  return 80;
}

/**
 * Detect Repetition Patterns
 *
 * Checks for repeated phrases (OCR artifacts).
 */
function detectRepetitionPatterns(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);

  if (sentences.length < 2) return 0;

  const sentenceSet = new Set(sentences.map(s => s.trim().toLowerCase()));
  const uniqueRatio = sentenceSet.size / sentences.length;

  return 1 - uniqueRatio;
}

/**
 * Check Logical Breaks
 *
 * Checks if text has section markers or logical divisions.
 */
function checkLogicalBreaks(text: string): boolean {
  // Look for section markers
  const hasHeaders = /^#+\s+.+$/m.test(text) || /^[A-Z][A-Za-z\s]+:$/m.test(text);
  const hasParagraphs = text.split(/\n\n+/).length > 2;

  return hasHeaders || hasParagraphs;
}
