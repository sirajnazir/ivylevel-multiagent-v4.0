/**
 * index.ts
 *
 * Main exports for Component 43 - Persona-Archetype Adaptive Modulation Layer
 */

// Main functions
export {
  detectStudentArchetype,
  batchDetectArchetypes,
  getArchetypeName
} from './detectArchetype';

export {
  detectStudentArchetypeLLM,
  detectArchetypeHybrid
} from './detectArchetypeLLM';

export {
  buildModulationEnvelope,
  buildModulationPromptBlock,
  getModulationSummary,
  validateEnvelope
} from './buildEnvelope';

export {
  MODULATION_PROFILES,
  getModulationProfile,
  getArchetypeExamples
} from './modulationProfiles';

// Types
export type {
  StudentArchetype,
  DetectedArchetype,
  ToneStyle,
  StructureLevel,
  WarmthLevel,
  PacingStyle,
  ModulationDirectives,
  ModulationProfile,
  ModulationEnvelope,
  ArchetypeSignals
} from './types';
