/**
 * detectArchetypeLLM.ts
 *
 * LLM-powered archetype detection (Component 44 integration)
 * Replaces rule-based heuristics with Jenny-EQ driven classification
 */

import type { ExtractedProfile_v2 } from '../../schema/extractedProfile_v2';
import type { DetectedArchetype } from './types';
import { classifyArchetypeLLM, type ClassificationInput } from '../archetype_classifier';

/**
 * Detect student archetype using LLM classifier
 *
 * This is the high-fidelity Component 44 version that uses
 * full transcript analysis + EQ chips for classification.
 *
 * @param profile - Extracted student profile
 * @param transcript - Full assessment transcript
 * @param eqChips - Optional EQ chips from Component 41
 * @returns Detected archetype with confidence and evidence
 */
export async function detectStudentArchetypeLLM(
  profile: ExtractedProfile_v2,
  transcript: string,
  eqChips?: string[]
): Promise<DetectedArchetype> {
  // Build classification input
  const input: ClassificationInput = {
    transcript,
    profile,
    eqChips
  };

  // Call LLM classifier
  const classification = await classifyArchetypeLLM(input);

  // Convert to DetectedArchetype format
  return {
    primary: classification.primaryArchetype,
    secondary: classification.secondaryArchetype,
    confidence: classification.confidence,
    signals: classification.evidence
  };
}

/**
 * Hybrid archetype detection
 *
 * Uses LLM if transcript is available, falls back to rule-based if not.
 *
 * @param profile - Extracted student profile
 * @param transcript - Optional assessment transcript
 * @param eqChips - Optional EQ chips
 * @returns Detected archetype
 */
export async function detectArchetypeHybrid(
  profile: ExtractedProfile_v2,
  transcript?: string,
  eqChips?: string[]
): Promise<DetectedArchetype> {
  // If transcript available, use LLM classifier
  if (transcript && transcript.length > 100) {
    return await detectStudentArchetypeLLM(profile, transcript, eqChips);
  }

  // Otherwise, fall back to rule-based (Component 43)
  const { detectStudentArchetype } = await import('./detectArchetype');
  return detectStudentArchetype(profile);
}
