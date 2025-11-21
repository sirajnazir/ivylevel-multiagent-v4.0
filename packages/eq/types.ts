/**
 * types.ts
 *
 * Component 3 - EQ & Archetype Types
 *
 * Type definitions for the EQ adaptation and archetype detection system.
 */

export type Archetype =
  | "OverwhelmedStarter"
  | "QuietHighPotential"
  | "BurntOutAchiever"
  | "Explorer"
  | "LateBloomer"
  | "Hacker"
  | "ReluctantDoer"
  | "HighFlyingGeneralist"
  | "HyperPerfectionist"
  | "AnxiousPlanner"
  | "CreativeBuilder"
  | "DistractedMultitasker"
  | "UnderconfidentStriver"
  | "IndependentThinker"
  | "StructuredExecutor";

export interface EQStyle {
  name: string;
  toneMarkers: string[];
  styleRules: string[];
  pacing: "slow" | "normal" | "fast";
  warmth: number;
  directness: number;
  structureLevel: number;
}

export interface EQState {
  archetype: Archetype | null;
  style: EQStyle | null;
  lastUpdated: number;
}

export interface ArchetypeDetectionResult {
  archetype: Archetype;
  confidence: number;
  reasoning?: string;
}

export interface EQModulationContext {
  studentMessage: string;
  conversationHistory: string;
  currentStage: string;
  detectedEmotions?: string[];
  hesitationLevel?: number;
  verbosityLevel?: number;
  overwhelmLevel?: number;
}
