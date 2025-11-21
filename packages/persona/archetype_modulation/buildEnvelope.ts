/**
 * buildEnvelope.ts
 *
 * Builds modulation envelope from detected archetype
 * This envelope is passed to Component 42 for persona-stabilized rewriting
 */

import type { ExtractedProfile_v2 } from '../../schema/extractedProfile_v2';
import type { ModulationEnvelope } from './types';
import { detectStudentArchetype } from './detectArchetype';
import { getModulationProfile } from './modulationProfiles';

/**
 * Build modulation envelope from student profile
 *
 * @param profile - Extracted student profile
 * @param driftResult - Optional drift detection result from Component 42
 * @returns Complete modulation envelope for persona rewriting
 */
export function buildModulationEnvelope(
  profile: ExtractedProfile_v2,
  driftResult?: any // DriftDetectionResult from Component 42
): ModulationEnvelope {
  // Detect archetype
  const detected = detectStudentArchetype(profile);

  // Get modulation profile
  const toneProfile = getModulationProfile(detected.primary);

  // Determine drift tolerance based on archetype and drift level
  let driftTolerance: ModulationEnvelope['constraints']['driftTolerance'] = 'moderate';
  let creativityLevel: ModulationEnvelope['constraints']['creativityLevel'] = 'medium';
  let groundingRequired = false;

  // Adjust constraints based on archetype
  switch (detected.primary) {
    case 'high_achieving_robot':
    case 'anxious_overthinker':
      driftTolerance = 'strict'; // Need consistent, stable voice
      creativityLevel = 'low';
      groundingRequired = true;
      break;

    case 'chaotic_creative':
    case 'lost_dreamer':
      driftTolerance = 'relaxed'; // Can handle more variation
      creativityLevel = 'high';
      groundingRequired = false;
      break;

    case 'detached_minimalist':
    case 'discouraged_underdog':
      driftTolerance = 'strict'; // Need firm, consistent messaging
      creativityLevel = 'low';
      groundingRequired = true;
      break;

    default:
      driftTolerance = 'moderate';
      creativityLevel = 'medium';
      groundingRequired = false;
  }

  // If drift is detected, enforce stricter modulation
  if (driftResult) {
    const driftLevel = driftResult.drift_level;

    if (driftLevel === 'orange' || driftLevel === 'red') {
      driftTolerance = 'strict';
      creativityLevel = 'low';
      groundingRequired = true;
    }
  }

  return {
    persona: 'jenny',
    archetype: detected.primary,
    secondary: detected.secondary,
    confidence: detected.confidence,
    toneProfile,
    constraints: {
      driftTolerance,
      creativityLevel,
      groundingRequired
    },
    metadata: {
      detectionSignals: detected.signals,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Build system prompt block for modulation
 *
 * This block is injected into the persona rewrite prompt (Component 42)
 */
export function buildModulationPromptBlock(envelope: ModulationEnvelope): string {
  const { archetype, toneProfile, constraints } = envelope;

  return `
<<ARCHETYPE_MODULATION_PROFILE>>

student_archetype: ${archetype}
confidence: ${envelope.confidence.toFixed(2)}

tone_directives:
  tone_style: ${toneProfile.tone}
  structure: ${toneProfile.structure}
  warmth: ${toneProfile.warmth}
  pacing: ${toneProfile.pacing}

reduce_these:
${toneProfile.directives.reduce.map(d => `  - ${d}`).join('\n')}

increase_these:
${toneProfile.directives.increase.map(d => `  - ${d}`).join('\n')}

emphasize_these:
${toneProfile.directives.emphasize.map(d => `  - ${d}`).join('\n')}

strategy_language: ${toneProfile.strategyLanguage}

example_signature_phrases:
${toneProfile.examplePhrases.slice(0, 3).map(p => `  - "${p}"`).join('\n')}

constraints:
  drift_tolerance: ${constraints.driftTolerance}
  creativity_level: ${constraints.creativityLevel}
  grounding_required: ${constraints.groundingRequired}

detection_signals:
${envelope.metadata.detectionSignals.map(s => `  - ${s}`).join('\n')}

<<END_MODULATION_PROFILE>>
`;
}

/**
 * Get modulation summary for logging/debugging
 */
export function getModulationSummary(envelope: ModulationEnvelope): string {
  return `Archetype: ${envelope.archetype} (${(envelope.confidence * 100).toFixed(0)}% confidence) | Tone: ${envelope.toneProfile.tone} | Structure: ${envelope.toneProfile.structure} | Warmth: ${envelope.toneProfile.warmth}`;
}

/**
 * Validate modulation envelope
 */
export function validateEnvelope(envelope: ModulationEnvelope): boolean {
  if (!envelope.archetype) return false;
  if (!envelope.toneProfile) return false;
  if (!envelope.constraints) return false;
  if (envelope.confidence < 0 || envelope.confidence > 1) return false;
  return true;
}
