/**
 * stages/normalize.ts
 *
 * Stage A: Normalize Raw Text
 * Removes formatting, special characters, timestamps, and noise while preserving meaning.
 */

import { cleanWhitespace, log } from '../util';
import type { StageResult } from '../types';

/**
 * Normalize raw text
 *
 * NOTE: In production, this would call OpenAI's API:
 * const response = await openai.chat.completions.create({
 *   model: 'gpt-4o-mini',
 *   messages: [
 *     { role: 'system', content: NORMALIZATION_PROMPT },
 *     { role: 'user', content: raw }
 *   ]
 * });
 *
 * For now, we use rule-based normalization.
 */
export async function normalizeRawText(raw: string): Promise<StageResult<string>> {
  try {
    log('Stage A: Normalizing raw text', 'info');

    let normalized = raw;

    // Remove timestamps (common formats)
    normalized = normalized.replace(/\[\d{2}:\d{2}:\d{2}\]/g, '');
    normalized = normalized.replace(/\d{1,2}\/\d{1,2}\/\d{2,4}\s+\d{1,2}:\d{2}/g, '');

    // Remove iMessage/chat artifacts
    normalized = normalized.replace(/^>+\s*/gm, ''); // Quote markers
    normalized = normalized.replace(/\[Read\]/g, '');
    normalized = normalized.replace(/\[Delivered\]/g, '');

    // Remove emoji/reaction artifacts
    normalized = normalized.replace(/[\u{1F600}-\u{1F64F}]/gu, ''); // Emoticons
    normalized = normalized.replace(/[\u{1F300}-\u{1F5FF}]/gu, ''); // Symbols
    normalized = normalized.replace(/[\u{1F680}-\u{1F6FF}]/gu, ''); // Transport
    normalized = normalized.replace(/[\u{2600}-\u{26FF}]/gu, ''); // Misc symbols

    // Fix bullet structures
    normalized = normalized.replace(/^[•·∙○●]\s*/gm, '- ');
    normalized = normalized.replace(/^[\*\+]\s*/gm, '- ');

    // Unify quotes
    normalized = normalized.replace(/[""]/g, '"');
    normalized = normalized.replace(/['']/g, "'");

    // Remove special characters (preserve basic punctuation)
    normalized = normalized.replace(/[^\w\s\-.,!?'"():;\n]/g, '');

    // Fix doubled spacing
    normalized = cleanWhitespace(normalized);

    // Remove lines that are just whitespace or single characters
    normalized = normalized
      .split('\n')
      .filter(line => line.trim().length > 1)
      .join('\n');

    log(`Stage A: Normalized ${raw.length} → ${normalized.length} chars`, 'info');

    return {
      success: true,
      data: normalized,
      stage: 'normalize',
    };
  } catch (error) {
    log(`Stage A failed: ${error}`, 'error');
    return {
      success: false,
      error: String(error),
      stage: 'normalize',
    };
  }
}

/**
 * LLM-based normalization prompt (for production use)
 */
export const NORMALIZATION_PROMPT = `
You are a text-normalization engine specialized in coaching and persona data.

Input is raw coaching/EQ/coaching heuristics data that may contain:
- inconsistent bullets (•, *, +, -, etc.)
- PDF artifacts and formatting
- invisible unicode characters
- doubled or excessive spacing
- chat timestamps and metadata
- iMessage/Slack formatting
- emojis and reactions
- inconsistent casing
- corrupted punctuation
- special characters

Your job:
1. Preserve meaning EXACTLY - do not change content
2. Remove all distractions, special characters, timestamps, metadata
3. Convert to clean paragraphs + standardized bullet lists (using -)
4. Normalize quotes to standard " and '
5. Fix spacing and line breaks
6. No rewriting tone, no shortening, no summarizing, no interpretation

Return ONLY the cleaned text with preserved structure and meaning.
`;

/**
 * Mock LLM normalization (simulates API call)
 */
export async function normalizeLLM(raw: string, model: string = 'gpt-4o-mini'): Promise<string> {
  // In production, this would be:
  // const response = await openai.chat.completions.create({
  //   model,
  //   messages: [
  //     { role: 'system', content: NORMALIZATION_PROMPT },
  //     { role: 'user', content: raw }
  //   ]
  // });
  // return response.choices[0].message.content!;

  // For now, use rule-based normalization
  const result = await normalizeRawText(raw);
  return result.data || raw;
}
