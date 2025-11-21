/**
 * types.ts
 *
 * Component 4 - UI Adaptation Types
 *
 * Type definitions for archetype-driven UI adaptation.
 */

export interface UIState {
  archetype: string | null;
  eqStyle: string | null;
  colorTheme: string;
  microcopyTone: string;
  chipDensity: "low" | "medium" | "high";
  showEvidence: boolean;
  showProgressStepper: boolean;
  pacing: "slow" | "normal" | "fast";
}

export interface UIAdaptationContext {
  archetype: string;
  eqStyle: string;
  stage: string;
}

export interface MicrocopyMap {
  calming: string;
  gentle: string;
  reassuring: string;
  curious: string;
  direct: string;
  directive: string;
  "soft-direct": string;
  neutral: string;
}

export interface ArchetypeUIOverrides {
  colorTheme?: string;
  microcopyTone?: string;
  chipDensity?: "low" | "medium" | "high";
  showEvidence?: boolean;
  showProgressStepper?: boolean;
  pacing?: "slow" | "normal" | "fast";
}
