/**
 * classifyArchetype.llm.ts
 *
 * LLM-powered archetype classifier for Component 44
 * Uses Claude 3.5 Sonnet with Jenny-EQ driven classification
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ExtractedProfile_v2 } from '../../schema/extractedProfile_v2';
import type { ArchetypeClassification, ClassificationInput } from './types';

/**
 * Classify student archetype using LLM
 *
 * This is the high-fidelity, data-driven, sentiment-aware classifier
 * that replaces Component 43's rule-based heuristics.
 *
 * @param input - Classification input (transcript, profile, EQ chips)
 * @returns Archetype classification with evidence
 */
export async function classifyArchetypeLLM(
  input: ClassificationInput
): Promise<ArchetypeClassification> {
  const { transcript, profile, eqChips = [], intakeForm } = input;

  // Load system prompt
  const systemPrompt = fs.readFileSync(
    path.join(__dirname, 'archetypePrompt.md'),
    'utf8'
  );

  // Build user prompt with all available signals
  const userPrompt = buildUserPrompt(transcript, profile, eqChips, intakeForm);

  // Call LLM (in production, this would use runClaude from anthropicClient)
  // For now, we'll use a mock implementation
  const rawResponse = await callLLMClassifier(systemPrompt, userPrompt);

  // Parse JSON response
  try {
    const classification = JSON.parse(rawResponse) as ArchetypeClassification;

    // Validate
    if (!validateClassification(classification)) {
      throw new Error('Invalid classification structure');
    }

    return classification;
  } catch (error) {
    console.error('[ArchetypeClassifier] Failed to parse LLM response:', error);
    throw new Error(`Failed to parse archetype classification: ${error}`);
  }
}

/**
 * Build comprehensive user prompt from all available signals
 */
function buildUserPrompt(
  transcript: string,
  profile: ExtractedProfile_v2,
  eqChips: string[],
  intakeForm?: Record<string, any>
): string {
  let prompt = ``;

  // Add transcript
  prompt += `<<<TRANSCRIPT>>>\n${transcript}\n<<<END_TRANSCRIPT>>>\n\n`;

  // Add extracted profile
  prompt += `<<<EXTRACTED_PROFILE_V2>>>\n`;
  prompt += `${JSON.stringify(profile, null, 2)}\n`;
  prompt += `<<<END_PROFILE>>>\n\n`;

  // Add EQ chips if available
  if (eqChips.length > 0) {
    prompt += `<<<JENNY_EQ_CHIPS>>>\n`;
    prompt += eqChips.map(chip => `- ${chip}`).join('\n');
    prompt += `\n<<<END_EQ_CHIPS>>>\n\n`;
  }

  // Add intake form if available
  if (intakeForm) {
    prompt += `<<<INTAKE_FORM>>>\n`;
    prompt += `${JSON.stringify(intakeForm, null, 2)}\n`;
    prompt += `<<<END_INTAKE_FORM>>>\n\n`;
  }

  prompt += `\nClassify this student's archetype and return the JSON classification object.`;

  return prompt;
}

/**
 * Call LLM classifier
 *
 * In production, this would use:
 * import { runClaude } from '../../llm/anthropicClient';
 *
 * For now, we provide a mock implementation that demonstrates
 * the classification logic.
 */
async function callLLMClassifier(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // In production:
  // const response = await runClaude({
  //   model: 'claude-3-5-sonnet-20241022',
  //   system: systemPrompt,
  //   messages: [{ role: 'user', content: userPrompt }],
  //   temperature: 0.3, // Lower temperature for more consistent classification
  //   max_tokens: 2000
  // });
  // return response.content[0].text;

  // Mock implementation for testing
  return mockClassify(userPrompt);
}

/**
 * Mock classification for testing
 *
 * This simulates what the LLM would return based on simple pattern matching.
 * In production, this is replaced by actual LLM call.
 */
function mockClassify(userPrompt: string): string {
  const lowerPrompt = userPrompt.toLowerCase();

  // Count different signal types
  const anxietyScore = (lowerPrompt.match(/what if|anxiety|worry|stress|nervous/g) || []).length;
  const perfectionScore = (lowerPrompt.match(/perfect|can't mess|all a|4\.|maintain.*gpa/g) || []).length;
  const burnoutScore = (lowerPrompt.match(/tired|too much|can't keep up|exhausted|overwhelm/g) || []).length;
  const uncertaintyScore = (lowerPrompt.match(/don't know|unclear|confused|uncertain|not sure/g) || []).length;

  // Detect burnout (prioritize if strong signals)
  if (burnoutScore >= 2) {
    return JSON.stringify({
      primaryArchetype: 'burnt_out_overloader',
      secondaryArchetype: anxietyScore > 0 ? 'anxious_overthinker' : null,
      confidence: 0.80,
      evidence: [
        'Exhaustion and overload language detected',
        'Too much language markers',
        'Energy depletion signals'
      ],
      toneOverrides: {
        tone: 'soothing_reassuring',
        pacing: 'slow',
        structure: 'high',
        warmth: 'high'
      },
      styleConstraints: {
        avoidPhrases: [
          'you need to',
          'add more',
          'push through'
        ],
        increasePhrases: [
          "let's drop something",
          'rest is strategy',
          'you are not lazy'
        ]
      }
    });
  }

  // Detect high-achieving robot (requires perfect markers, not just anxiety)
  if (perfectionScore >= 1 && anxietyScore >= 1) {
    return JSON.stringify({
      primaryArchetype: 'high_achieving_robot',
      secondaryArchetype: 'anxious_overthinker',
      confidence: 0.82,
      evidence: [
        'Perfectionism language detected',
        'High GPA with high rigor',
        'Achievement-focused identity markers'
      ],
      toneOverrides: {
        tone: 'calm_anchoring',
        pacing: 'slow',
        structure: 'high',
        warmth: 'medium_high'
      },
      styleConstraints: {
        avoidPhrases: [
          'you need to',
          'work harder',
          'push yourself'
        ],
        increasePhrases: [
          "let's slow this down",
          'you are not your GPA',
          'permission to rest'
        ]
      }
    });
  }

  // Detect anxious overthinker (strong anxiety without perfection)
  if (anxietyScore >= 2) {
    return JSON.stringify({
      primaryArchetype: 'anxious_overthinker',
      secondaryArchetype: null,
      confidence: 0.85,
      evidence: [
        'Frequent anxiety-related language detected in transcript',
        'Worry patterns identified',
        'Stress markers present in personality profile'
      ],
      toneOverrides: {
        tone: 'soothing_reassuring',
        pacing: 'gentle',
        structure: 'medium',
        warmth: 'high'
      },
      styleConstraints: {
        avoidPhrases: [
          'you should',
          'just decide',
          'stop worrying'
        ],
        increasePhrases: [
          "let's slow this down",
          'one step at a time',
          'your nervous system is doing its thing'
        ]
      }
    });
  }

  // Detect lost dreamer (uncertainty markers)
  if (uncertaintyScore >= 1) {
    return JSON.stringify({
      primaryArchetype: 'lost_dreamer',
      secondaryArchetype: null,
      confidence: uncertaintyScore >= 2 ? 0.72 : 0.65,
      evidence: [
        'Lack of clarity on direction',
        'Uncertainty markers in transcript',
        'Exploration mode detected'
      ],
      toneOverrides: {
        tone: 'compassionate_exploratory',
        pacing: 'gentle',
        structure: 'medium',
        warmth: 'high'
      },
      styleConstraints: {
        avoidPhrases: [
          'you should know',
          'decide now',
          'pick one'
        ],
        increasePhrases: [
          "let's try something small",
          "you don't need to know right now",
          'confusion is signal'
        ]
      }
    });
  }

  // Default to lost dreamer with low confidence
  return JSON.stringify({
    primaryArchetype: 'lost_dreamer',
    secondaryArchetype: null,
    confidence: 0.55,
    evidence: [
      'Insufficient specific markers for clear classification',
      'Defaulting to exploratory approach'
    ],
    toneOverrides: {
      tone: 'compassionate_exploratory',
      pacing: 'gentle',
      structure: 'medium',
      warmth: 'high'
    },
    styleConstraints: {
      avoidPhrases: [],
      increasePhrases: []
    }
  });
}

/**
 * Validate archetype classification
 */
export function validateClassification(
  classification: ArchetypeClassification
): boolean {
  // Check required fields
  if (!classification.primaryArchetype) return false;
  if (typeof classification.confidence !== 'number') return false;
  if (!Array.isArray(classification.evidence)) return false;

  // Check confidence range
  if (classification.confidence < 0 || classification.confidence > 1) return false;

  // Check tone overrides
  if (!classification.toneOverrides) return false;
  if (!classification.toneOverrides.tone) return false;
  if (!classification.toneOverrides.pacing) return false;

  // Check style constraints
  if (!classification.styleConstraints) return false;
  if (!Array.isArray(classification.styleConstraints.avoidPhrases)) return false;
  if (!Array.isArray(classification.styleConstraints.increasePhrases)) return false;

  return true;
}
