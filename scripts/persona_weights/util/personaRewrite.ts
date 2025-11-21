/**
 * util/personaRewrite.ts
 *
 * LLM-powered persona style rewriter for drift correction
 */

import { getSignatureElements } from './loadPersona';
import type { RewriteOptions } from '../types';

/**
 * Rewrite text to match persona style
 *
 * NOTE: In production, this would call OpenAI's API:
 * const response = await openai.chat.completions.create({
 *   model: 'gpt-4o-mini',
 *   messages: [
 *     { role: 'system', content: PERSONA_REWRITE_PROMPT },
 *     { role: 'user', content: text }
 *   ]
 * });
 *
 * For now, we provide the prompt and a mock implementation.
 *
 * @param text - Text to rewrite
 * @param options - Rewrite options
 * @param modulationEnvelope - Optional Component 43 modulation envelope
 */
export async function rewriteToPersonaStyle(
  text: string,
  options: RewriteOptions = {},
  modulationEnvelope?: any // ModulationEnvelope from Component 43
): Promise<string> {
  const {
    force = false,
    preserve_length = false,
    target_similarity = 0.9,
    max_iterations = 3,
  } = options;

  // Get signature elements from canonical blocks
  const signatureElements = getSignatureElements(30);

  // Build rewrite prompt with optional archetype modulation
  const prompt = buildRewritePrompt(
    text,
    signatureElements,
    preserve_length,
    modulationEnvelope
  );

  // In production, call LLM API here
  // const rewritten = await callLLMRewrite(prompt);

  // For now, return mock rewrite
  const rewritten = mockRewrite(text, signatureElements, modulationEnvelope);

  return rewritten;
}

/**
 * Build persona rewrite prompt
 */
function buildRewritePrompt(
  text: string,
  signatureElements: string[],
  preserveLength: boolean,
  modulationEnvelope?: any
): string {
  const blockSummary = signatureElements
    .map(element => `• ${element}`)
    .join('\n');

  // Build archetype modulation block if provided
  let archetypeBlock = '';
  if (modulationEnvelope) {
    const { archetype, toneProfile, constraints, confidence } = modulationEnvelope;

    archetypeBlock = `

<<ARCHETYPE_MODULATION_PROFILE>>

student_archetype: ${archetype}
confidence: ${confidence.toFixed(2)}

tone_directives:
  tone_style: ${toneProfile.tone}
  structure: ${toneProfile.structure}
  warmth: ${toneProfile.warmth}
  pacing: ${toneProfile.pacing}

reduce_these:
${toneProfile.directives.reduce.map((d: string) => `  - ${d}`).join('\n')}

increase_these:
${toneProfile.directives.increase.map((d: string) => `  - ${d}`).join('\n')}

emphasize_these:
${toneProfile.directives.emphasize.map((d: string) => `  - ${d}`).join('\n')}

strategy_language: ${toneProfile.strategyLanguage}

example_signature_phrases:
${toneProfile.examplePhrases.slice(0, 3).map((p: string) => `  - "${p}"`).join('\n')}

constraints:
  drift_tolerance: ${constraints.driftTolerance}
  creativity_level: ${constraints.creativityLevel}
  grounding_required: ${constraints.groundingRequired}

<<END_MODULATION_PROFILE>>
`;
  }

  return `
You are the Persona Stabilizer for Jenny, IvyLevel's Head Coach.

Your ONLY job is to rewrite the following text EXACTLY in Jenny's authentic voice.
${archetypeBlock}
ABSOLUTE RULES:
1. Preserve meaning 100% - do not change content or advice
2. Keep her EQ tone: validating, warm, structured, hopeful, reality-based
3. Use her signature phrasing patterns (from examples below)
4. Apply her coaching heuristics: identity reframe + concrete next steps
5. Sound like a real person, not an AI assistant
6. DO NOT add fluff, emojis, clichés, or generic AI tone
7. Keep immigrant-upward-mobility relatability
8. Avoid therapy jargon, corporate speak, toxic positivity
${preserveLength ? '9. Maintain similar length to original' : ''}
${modulationEnvelope ? `10. APPLY THE ARCHETYPE MODULATION PROFILE ABOVE - adapt tone, pacing, and language for ${modulationEnvelope.archetype}` : ''}

JENNY'S SIGNATURE ELEMENTS:
${blockSummary}

KEY PRINCIPLES:
- Identity over achievement ("who you're becoming" not just "what you're doing")
- Nervous system literacy ("your nervous system is doing its thing")
- Pattern recognition ("I'm noticing a pattern here")
- Reality-based optimism (acknowledge constraints, find leverage)
- One clean move (concrete, specific next step)
- Validation before strategy ("that makes sense" → then guide)

TEXT TO REWRITE:
"""
${text}
"""

Return ONLY the rewritten message. No explanations, no meta-commentary.
`;
}

/**
 * Mock rewrite implementation (for testing without LLM)
 */
function mockRewrite(
  text: string,
  signatureElements: string[],
  modulationEnvelope?: any
): string {
  let rewritten = text;

  // Apply simple transformations to simulate Jenny's voice
  const substitutions: Record<string, string> = {
    'you should': "what will help here is",
    'you must': "what matters most is",
    'you need to': "let's focus on",
    'try to': "let's",
    "don't worry": "you're not behind",
    'just relax': "let's ground this",
    'everything will be fine': "this is manageable",
    'you can do it': "you have what you need here",
  };

  for (const [pattern, replacement] of Object.entries(substitutions)) {
    const regex = new RegExp(pattern, 'gi');
    rewritten = rewritten.replace(regex, replacement);
  }

  // Apply archetype-specific modulation if envelope provided
  if (modulationEnvelope) {
    const { archetype, toneProfile } = modulationEnvelope;

    // Use archetype-specific signature phrases instead of generic ones
    const archetypePhrases = toneProfile.examplePhrases || [];

    // Add archetype-appropriate opening if text is long enough
    if (rewritten.length > 80 && archetypePhrases.length > 0) {
      const selectedPhrase = archetypePhrases[Math.floor(Math.random() * Math.min(3, archetypePhrases.length))];
      if (selectedPhrase && !rewritten.toLowerCase().includes(selectedPhrase.toLowerCase().slice(0, 20))) {
        // Prepend for certain archetypes, append for others
        if (['high_achieving_robot', 'anxious_overthinker', 'burnt_out_overloader'].includes(archetype)) {
          rewritten = `${selectedPhrase} ${rewritten}`;
        }
      }
    }
  } else {
    // Add occasional signature phrase if text is long enough (original behavior)
    if (rewritten.length > 100 && Math.random() > 0.7) {
      const randomSignature = signatureElements[Math.floor(Math.random() * Math.min(5, signatureElements.length))];
      if (randomSignature && !rewritten.includes(randomSignature)) {
        rewritten = `${randomSignature} ${rewritten}`;
      }
    }
  }

  return rewritten;
}

/**
 * LLM rewrite with OpenAI API (for production)
 */
export async function rewriteWithLLM(
  text: string,
  signatureElements: string[],
  model: string = 'gpt-4o-mini'
): Promise<string> {
  // In production:
  // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  //
  // const prompt = buildRewritePrompt(text, signatureElements, false);
  //
  // const response = await openai.chat.completions.create({
  //   model,
  //   messages: [
  //     { role: 'system', content: prompt },
  //   ],
  //   temperature: 0.7,
  // });
  //
  // return response.choices[0].message.content!;

  // For now, use mock rewrite
  return mockRewrite(text, signatureElements);
}

/**
 * Batch rewrite multiple texts
 */
export async function batchRewrite(
  texts: string[],
  options: RewriteOptions = {}
): Promise<string[]> {
  const signatureElements = getSignatureElements(30);

  const rewrites = await Promise.all(
    texts.map(text => rewriteToPersonaStyle(text, options))
  );

  return rewrites;
}

/**
 * Get rewrite suggestions without applying
 */
export function getRewriteSuggestions(text: string): string[] {
  const suggestions: string[] = [];

  // Check for generic AI patterns
  if (text.match(/you should|you must|you need to/i)) {
    suggestions.push('Replace directive language with invitations (e.g., "what will help here is...")');
  }

  if (text.match(/don't worry|everything will be fine|just relax/i)) {
    suggestions.push('Replace generic reassurance with specific validation (e.g., "you\'re not behind")');
  }

  if (text.match(/as an AI|I think|in my opinion/i)) {
    suggestions.push('Remove AI meta-language - speak directly as Jenny');
  }

  if (!text.match(/you're|your|makes sense|pattern|signal/i)) {
    suggestions.push('Add more identity-focused language and pattern recognition');
  }

  if (text.length > 200 && !text.includes('.')) {
    suggestions.push('Break into shorter sentences for better pacing');
  }

  return suggestions;
}
