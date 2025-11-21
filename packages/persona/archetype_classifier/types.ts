/**
 * types.ts
 *
 * Type definitions for Component 44 - LLM-Powered Archetype Classifier
 */

import type { StudentArchetype } from '../archetype_modulation/types';

/**
 * LLM-based archetype classification result
 */
export interface ArchetypeClassification {
  primaryArchetype: StudentArchetype;
  secondaryArchetype: StudentArchetype | null;
  confidence: number; // 0.0 - 1.0
  evidence: string[]; // Evidence from transcript + profile
  toneOverrides: {
    tone: string;
    pacing: string;
    structure: string;
    warmth: string;
  };
  styleConstraints: {
    avoidPhrases: string[];
    increasePhrases: string[];
  };
}

/**
 * Input for archetype classification
 */
export interface ClassificationInput {
  transcript: string;
  profile: any; // ExtractedProfile_v2
  eqChips?: string[]; // Optional EQ chips from Component 41
  intakeForm?: Record<string, any>; // Optional intake survey
}

/**
 * Classification metadata
 */
export interface ClassificationMetadata {
  timestamp: string;
  model: string;
  processingTime: number;
  signalsDetected: {
    emotional: string[];
    behavioral: string[];
    linguistic: string[];
    motivational: string[];
  };
}
