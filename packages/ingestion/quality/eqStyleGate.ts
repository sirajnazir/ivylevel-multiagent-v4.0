import { QualityGateInput, GateResult } from "./quality.types";

/**
 * EQ Style Matching Gate v1.0
 *
 * Enforces: "Does this sound like Jenny?"
 *
 * Checks for:
 * - Jenny's conversational warmth
 * - Cognitive empathy patterns
 * - Direct but supportive tone
 * - Natural language (not robotic/corporate)
 * - Question-based engagement
 *
 * FUTURE: Use embeddings from jenny_eq_session_w008_extract.json
 *          and compute cosine similarity with OpenAI text-embedding-3-large
 * CURRENT: Uses Jenny signature pattern matching as MVP
 *
 * If it doesn't sound like Jenny → it doesn't belong in the KB.
 */

/**
 * EQ Style Match Gate
 *
 * Main entry point for EQ style validation.
 */
export async function eqStyleMatchGate(
  input: QualityGateInput
): Promise<GateResult> {
  console.log("[EQStyleGate] Checking EQ style match");
  console.log(`  - Source: ${input.sourcePath}`);
  console.log(`  - Coach ID: ${input.metadata.coachId}`);

  // For now, only validate Jenny's style
  if (input.metadata.coachId !== "jenny") {
    console.log("[EQStyleGate] Non-Jenny coach - skipping EQ validation");
    return {
      passed: true,
      errors: [],
      warnings: ["EQ validation only available for Jenny"],
      score: 100
    };
  }

  // MVP: Pattern-based Jenny style matching
  // TODO: Replace with embedding-based similarity check
  const styleScore = await checkJennyStylePatterns(input.rawText);

  const passed = styleScore.similarity > 0.75;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (styleScore.similarity < 0.70) {
    errors.push("Strong EQ mismatch: does not resemble Jenny's coaching style");
  } else if (styleScore.similarity < 0.75) {
    warnings.push("Slight EQ deviation from Jenny's typical style");
  }

  // Add specific pattern violations
  if (styleScore.violations.length > 0) {
    if (passed) {
      warnings.push(...styleScore.violations);
    } else {
      errors.push(...styleScore.violations);
    }
  }

  console.log("[EQStyleGate] Check complete");
  console.log(`  - Similarity: ${Math.round(styleScore.similarity * 100)}%`);
  console.log(`  - Passed: ${passed}`);
  console.log(`  - Violations: ${styleScore.violations.length}`);

  return {
    passed,
    errors,
    warnings,
    score: Math.round(styleScore.similarity * 100),
    metadata: {
      signatureMatches: styleScore.matches,
      violations: styleScore.violations
    }
  };
}

/**
 * Jenny Style Score
 */
interface JennyStyleScore {
  similarity: number; // 0-1
  matches: string[]; // Positive indicators
  violations: string[]; // Negative indicators
}

/**
 * Check Jenny Style Patterns
 *
 * Analyzes text for Jenny's signature coaching patterns.
 *
 * FUTURE: Replace with:
 * ```
 * const targetEmbedding = await loadJennyStyleEmbedding();
 * const textEmbedding = await embed(text);
 * const similarity = cosineSimilarity(targetEmbedding, textEmbedding);
 * ```
 */
async function checkJennyStylePatterns(text: string): Promise<JennyStyleScore> {
  const matches: string[] = [];
  const violations: string[] = [];

  // Jenny Signature Patterns (Positive Indicators)

  // 1. Warm conversational tone
  if (/\b(hey|totally|yeah|like|so)\b/i.test(text)) {
    matches.push("Conversational warmth detected");
  }

  // 2. Direct questions (Jenny's engagement style)
  const questionCount = (text.match(/\?/g) || []).length;
  const sentences = text.split(/[.!?]+/).length;
  if (questionCount > sentences * 0.15) {
    matches.push("High question rate (Jenny's style)");
  }

  // 3. Cognitive empathy patterns
  if (/\b(makes sense|I get|I hear|interesting|cool|got it)\b/i.test(text)) {
    matches.push("Cognitive empathy markers");
  }

  // 4. Direct but supportive phrasing
  if (/\b(let's|we|together|you can|you will)\b/i.test(text)) {
    matches.push("Supportive directive language");
  }

  // 5. Micro-validations
  if (/\b(that's valid|fair|legit|real)\b/i.test(text)) {
    matches.push("Jenny-style micro-validations");
  }

  // 6. Reframing patterns
  if (/\b(the real question|what if|here's the thing|let me|think of it)\b/i.test(text)) {
    matches.push("Reframing language");
  }

  // Anti-Patterns (Violations)

  // 1. Corporate speak
  if (/\b(leverage|optimize|synergy|facilitate|utilize|strategic)\b/i.test(text)) {
    violations.push("Corporate language detected (not Jenny's style)");
  }

  // 2. Robotic/AI phrasing
  if (/\b(as an ai|i'm an ai|language model|i don't have|i cannot)\b/i.test(text)) {
    violations.push("Robotic AI phrasing detected");
  }

  // 3. Over-formal academic language
  if (/\b(furthermore|moreover|thus|hence|thereby|notwithstanding)\b/i.test(text)) {
    violations.push("Over-formal academic language");
  }

  // 4. Lecturing tone (you should/must/need to)
  const lecturingCount = (text.match(/\b(you should|you must|you need to|you have to)\b/gi) || []).length;
  if (lecturingCount > 5) {
    violations.push("Lecturing tone detected (Jenny is more invitational)");
  }

  // 5. Excessive hedging
  if (/\b(maybe|perhaps|possibly|potentially|might want to consider)\b/gi.test(text) && text.length < 500) {
    const hedgeCount = (text.match(/\b(maybe|perhaps|possibly|potentially|might want to consider)\b/gi) || []).length;
    if (hedgeCount > 8) {
      violations.push("Excessive hedging (Jenny is more direct)");
    }
  }

  // 6. Generic coaching fluff
  if (/\b(reach out|circle back|touch base|let me know if you have questions)\b/i.test(text)) {
    violations.push("Generic coaching phrases");
  }

  // Calculate similarity score
  let similarity = 0.5; // Baseline

  // Add points for matches
  similarity += Math.min(0.4, matches.length * 0.08);

  // Deduct points for violations
  similarity -= violations.length * 0.15;

  // Clamp to 0-1
  similarity = Math.max(0, Math.min(1, similarity));

  return {
    similarity,
    matches,
    violations
  };
}

/**
 * Load Jenny Style Embedding
 *
 * FUTURE: Load reference embedding from KB chips:
 * - jenny_eq_session_w008_extract.json
 * - jenny_eq_extract_imsg_5.json
 *
 * Returns average embedding representing Jenny's EQ signature.
 */
async function loadJennyStyleEmbedding(): Promise<number[]> {
  // TODO: Implement actual embedding loading from jenny_eq chips
  // For now, return placeholder
  return new Array(1536).fill(0);
}

/**
 * Embed Text
 *
 * FUTURE: Use OpenAI text-embedding-3-large
 */
async function embed(text: string): Promise<number[]> {
  // TODO: Call OpenAI embedding API
  return new Array(1536).fill(0);
}

/**
 * Cosine Similarity
 *
 * Calculate cosine similarity between two embeddings.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
