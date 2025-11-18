import { z } from 'zod';

/**
 * Safe JSON Parser
 * Handles Claude LLM response quirks and ensures deterministic parsing
 */

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  rawInput?: string;
}

export interface ParseOptions {
  logErrors?: boolean;
  stripMarkdown?: boolean;
}

/**
 * Clean LLM response text before JSON parsing
 * Handles common Claude output patterns that break standard JSON.parse()
 */
function cleanLLMResponse(rawText: string): string {
  let cleaned = rawText.trim();

  // Step 1: Remove markdown code fences (```json ... ``` or ``` ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/gm, '');
  cleaned = cleaned.replace(/\n?```\s*$/gm, '');

  // Step 2: Remove any leading/trailing prose or commentary
  // Look for first { and last } to extract just the JSON object
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Step 3: Fix trailing commas (common LLM hallucination)
  // Match: ,\s*} or ,\s*]
  cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');

  // Step 4: Remove any remaining non-JSON text before/after
  cleaned = cleaned.trim();

  // Step 5: Normalize whitespace
  cleaned = cleaned.replace(/\r\n/g, '\n');

  return cleaned;
}

/**
 * Strip common Claude hallucination patterns
 */
function stripHallucinations(text: string): string {
  let stripped = text;

  // Remove "Here's the JSON:" or similar preambles
  const preamblePatterns = [
    /^Here'?s? the (?:extracted )?(?:JSON|json|data|result)[:\s]*/i,
    /^Based on (?:the|your) (?:transcript|conversation)[,:\s]*/i,
    /^(?:The|This) (?:extracted|parsed) (?:JSON|data) is[:\s]*/i,
  ];

  preamblePatterns.forEach((pattern) => {
    stripped = stripped.replace(pattern, '');
  });

  // Remove "I hope this helps!" or similar postambles
  const postamblePatterns = [
    /\n*(?:I )?hope this helps!?\s*$/i,
    /\n*Let me know if .*$/i,
    /\n*Is there anything .*$/i,
  ];

  postamblePatterns.forEach((pattern) => {
    stripped = stripped.replace(pattern, '');
  });

  return stripped;
}

/**
 * Validate and parse JSON with Zod schema
 */
export function safeJsonParse<T>(
  rawText: string,
  schema: z.ZodSchema<T>,
  options: ParseOptions = {}
): ParseResult<T> {
  const { logErrors = true, stripMarkdown = true } = options;

  try {
    // Step 1: Strip hallucinations
    let cleaned = stripHallucinations(rawText);

    // Step 2: Clean LLM-specific patterns
    if (stripMarkdown) {
      cleaned = cleanLLMResponse(cleaned);
    }

    // Step 3: Parse JSON
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch (jsonError) {
      if (logErrors) {
        console.error('[SafeJsonParse] JSON parsing failed:', jsonError);
        console.error('[SafeJsonParse] Cleaned text:', cleaned.substring(0, 200));
      }
      return {
        success: false,
        error: `Invalid JSON: ${(jsonError as Error).message}`,
        rawInput: rawText.substring(0, 500),
      };
    }

    // Step 4: Validate with Zod schema
    const validationResult = schema.safeParse(parsed);

    if (!validationResult.success) {
      if (logErrors) {
        console.error('[SafeJsonParse] Schema validation failed:', validationResult.error);
      }
      return {
        success: false,
        error: `Schema validation failed: ${validationResult.error.message}`,
        rawInput: rawText.substring(0, 500),
      };
    }

    // Success!
    if (logErrors) {
      console.log('[SafeJsonParse] Successfully parsed and validated JSON');
    }

    return {
      success: true,
      data: validationResult.data,
    };
  } catch (error) {
    if (logErrors) {
      console.error('[SafeJsonParse] Unexpected error:', error);
    }
    return {
      success: false,
      error: `Unexpected parsing error: ${(error as Error).message}`,
      rawInput: rawText.substring(0, 500),
    };
  }
}

/**
 * Parse JSON without schema validation (less safe, for backwards compatibility)
 */
export function parseJsonUnsafe(rawText: string): ParseResult<unknown> {
  try {
    const cleaned = cleanLLMResponse(stripHallucinations(rawText));
    const parsed = JSON.parse(cleaned);

    return {
      success: true,
      data: parsed,
    };
  } catch (error) {
    return {
      success: false,
      error: `JSON parsing failed: ${(error as Error).message}`,
      rawInput: rawText.substring(0, 500),
    };
  }
}

/**
 * Diagnostic helper: show cleaning steps
 */
export function debugCleaningSteps(rawText: string): {
  original: string;
  afterHallucinationStrip: string;
  afterLLMClean: string;
  parseSuccess: boolean;
  parseError?: string;
} {
  const afterHallucinationStrip = stripHallucinations(rawText);
  const afterLLMClean = cleanLLMResponse(afterHallucinationStrip);

  let parseSuccess = false;
  let parseError: string | undefined;

  try {
    JSON.parse(afterLLMClean);
    parseSuccess = true;
  } catch (error) {
    parseError = (error as Error).message;
  }

  return {
    original: rawText.substring(0, 200),
    afterHallucinationStrip: afterHallucinationStrip.substring(0, 200),
    afterLLMClean: afterLLMClean.substring(0, 200),
    parseSuccess,
    parseError,
  };
}
