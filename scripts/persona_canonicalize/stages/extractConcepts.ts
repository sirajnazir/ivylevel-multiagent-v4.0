/**
 * stages/extractConcepts.ts
 *
 * Stage B: Extract Persona Concepts
 * Mines persona-bearing concepts from normalized text across all channels.
 */

import { log, safeJsonParse, extractJson } from '../util';
import type { StageResult, ExtractedConcepts, PersonaConcept } from '../types';

/**
 * Extract persona concepts from clean text
 *
 * NOTE: In production, this would call OpenAI's API with structured extraction.
 * For now, we use pattern-based extraction.
 */
export async function extractPersonaConcepts(
  cleanText: string
): Promise<StageResult<ExtractedConcepts>> {
  try {
    log('Stage B: Extracting persona concepts', 'info');

    const concepts: ExtractedConcepts = {
      language: extractLanguageConcepts(cleanText),
      eq: extractEQConcepts(cleanText),
      coaching: extractCoachingConcepts(cleanText),
      archetypes: extractArchetypeConcepts(cleanText),
      safety: extractSafetyConcepts(cleanText),
    };

    const totalConcepts = Object.values(concepts).reduce((sum, arr) => sum + arr.length, 0);
    log(`Stage B: Extracted ${totalConcepts} concepts across 5 channels`, 'info');

    return {
      success: true,
      data: concepts,
      stage: 'extract',
    };
  } catch (error) {
    log(`Stage B failed: ${error}`, 'error');
    return {
      success: false,
      error: String(error),
      stage: 'extract',
    };
  }
}

/**
 * Extract language style concepts
 */
function extractLanguageConcepts(text: string): PersonaConcept[] {
  const concepts: PersonaConcept[] = [];

  // Look for quoted phrases (signature language)
  const quoteMatches = text.match(/"([^"]+)"/g);
  if (quoteMatches) {
    const phrases = quoteMatches.slice(0, 20); // Limit to prevent overwhelming
    concepts.push({
      type: 'signature_phrases',
      examples: phrases.map(p => p.replace(/"/g, '')),
      context: 'Common phrases used by Jenny',
    });
  }

  // Look for idiom/style markers
  if (text.match(/idiom|phrase|language|voice|tone|style/i)) {
    concepts.push({
      type: 'language_style',
      rules: [
        'Use conversational, warm language',
        'Avoid corporate jargon',
        'Keep sentences concise',
      ],
      context: 'Overall language style guidelines',
    });
  }

  // Look for rhythm/pacing markers
  if (text.match(/pace|pacing|rhythm|speed|slow|fast/i)) {
    concepts.push({
      type: 'pacing_pattern',
      rules: ['Adjust pacing based on student emotional state'],
      examples: ['Slow pace for anxious students', 'Faster pace for confident students'],
      context: 'Rhythm and pacing adjustments',
    });
  }

  return concepts;
}

/**
 * Extract EQ behavior concepts
 */
function extractEQConcepts(text: string): PersonaConcept[] {
  const concepts: PersonaConcept[] = [];

  // Look for validation patterns
  if (text.match(/validat|affirm|acknowledg|makes sense|legitimate/i)) {
    concepts.push({
      type: 'validation_pattern',
      examples: [
        "That's a legitimate concern",
        'Your reaction makes sense',
        "You're tracking the right thing",
      ],
      context: 'Emotional validation strategies',
      rules: ['Validate before advising', 'Name emotions explicitly'],
    });
  }

  // Look for empathy cues
  if (text.match(/empathy|emotional|feeling|nervous system|anxiety|stress/i)) {
    concepts.push({
      type: 'empathy_response',
      examples: [
        'Your nervous system is doing its thing',
        'This is a natural reaction',
      ],
      context: 'Empathetic responses to student distress',
      rules: ['Normalize emotional responses', 'Use nervous system language'],
    });
  }

  // Look for reframe patterns
  if (text.match(/reframe|perspective|lens|signal|pattern/i)) {
    concepts.push({
      type: 'reframe_strategy',
      examples: [
        "This isn't a failure; it's a signal",
        "You're closer than it feels",
      ],
      context: 'Reframing negative interpretations',
      rules: ['Offer alternative perspective', 'Maintain reality-based optimism'],
    });
  }

  return concepts;
}

/**
 * Extract coaching heuristics
 */
function extractCoachingConcepts(text: string): PersonaConcept[] {
  const concepts: PersonaConcept[] = [];

  // Look for decision heuristics
  if (text.match(/heuristic|principle|framework|approach|strategy/i)) {
    concepts.push({
      type: 'coaching_heuristic',
      rules: [
        'Start with validation before strategy',
        'One clean move principle',
        'Identity over achievement',
      ],
      context: 'Core coaching decision principles',
    });
  }

  // Look for pattern detection language
  if (text.match(/I'm noticing|pattern|through-line|underneath|signal/i)) {
    concepts.push({
      type: 'pattern_detection',
      examples: [
        "I'm noticing a pattern here",
        "There's a through-line in your story",
        'Let me connect these dots',
      ],
      context: 'Pattern recognition and surfacing',
      rules: ['Surface systemic issues', 'Connect multiple data points'],
    });
  }

  return concepts;
}

/**
 * Extract archetype-specific concepts
 */
function extractArchetypeConcepts(text: string): PersonaConcept[] {
  const concepts: PersonaConcept[] = [];

  // Look for archetype mentions
  const archetypes = [
    'AnxiousPerfectionist',
    'HighAchiever',
    'UnfocusedExplorer',
    'ReluctantPragmatist',
    'QuietDeepThinker',
    'OverscheduledOverachiever',
  ];

  for (const archetype of archetypes) {
    if (text.includes(archetype)) {
      concepts.push({
        type: 'archetype_adaptation',
        context: `Specific adaptations for ${archetype}`,
        rules: [`Tailor approach for ${archetype} characteristics`],
      });
    }
  }

  return concepts;
}

/**
 * Extract safety/boundary concepts
 */
function extractSafetyConcepts(text: string): PersonaConcept[] {
  const concepts: PersonaConcept[] = [];

  // Look for "never" or "avoid" patterns
  const neverPatterns = text.match(/never (?:say|do|use)[^.!?]*/gi);
  if (neverPatterns) {
    concepts.push({
      type: 'safety_boundary',
      never_do: neverPatterns,
      context: 'What Jenny never says or does',
      rules: ['Maintain professional boundaries', 'Avoid therapy overreach'],
    });
  }

  // Look for toxic positivity warnings
  if (text.match(/toxic positivity|false optimism|spiritual bypassing/i)) {
    concepts.push({
      type: 'anti_pattern',
      never_do: [
        'Everything happens for a reason',
        'Just think positive',
        'Good vibes only',
      ],
      context: 'Avoid toxic positivity',
      rules: ['Use reality-based optimism only', 'Acknowledge real constraints'],
    });
  }

  return concepts;
}

/**
 * LLM-based concept extraction prompt (for production use)
 */
export const EXTRACTION_PROMPT = `
You are an expert persona-mining LLM specialized in coaching and EQ analysis.

Extract ALL persona-bearing concepts from the provided text using these categories:

1. LANGUAGE STYLE
   - idioms and signature phrases
   - rhythm and pacing patterns
   - sentence templates
   - vocabulary choices

2. EQ BEHAVIOR
   - emotional regulation patterns
   - empathy cues and responses
   - reassurance strategies
   - self-worth reframes
   - nervous system language

3. COACHING HEURISTICS
   - decision frameworks
   - coaching principles
   - pattern detection strategies
   - diagnostic approaches
   - intervention patterns

4. ARCHETYPE VARIANTS
   - different communication styles per student type
   - archetype-specific adaptations
   - tailored approaches

5. ETHICAL BOUNDARIES & SAFETY
   - what is never said or done
   - disclaimers and limitations
   - safety behaviors
   - anti-patterns to avoid

Return structured JSON in this exact format:

{
  "language": [
    {
      "type": "concept_type",
      "rules": ["rule 1", "rule 2"],
      "examples": ["example 1", "example 2"],
      "context": "when/how to use this"
    }
  ],
  "eq": [...],
  "coaching": [...],
  "archetypes": [...],
  "safety": [...]
}

Extract EVERYTHING relevant. Be thorough and precise.
`;

/**
 * Mock LLM extraction (simulates API call)
 */
export async function extractConceptsLLM(
  cleanText: string,
  model: string = 'gpt-4o-mini'
): Promise<ExtractedConcepts> {
  // In production:
  // const response = await openai.chat.completions.create({
  //   model,
  //   messages: [
  //     { role: 'system', content: EXTRACTION_PROMPT },
  //     { role: 'user', content: cleanText }
  //   ]
  // });
  // const jsonText = extractJson(response.choices[0].message.content!);
  // return safeJsonParse(jsonText, defaultConcepts);

  // For now, use pattern-based extraction
  const result = await extractPersonaConcepts(cleanText);
  return result.data || {
    language: [],
    eq: [],
    coaching: [],
    archetypes: [],
    safety: [],
  };
}
