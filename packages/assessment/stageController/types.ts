/**
 * types.ts
 *
 * Component 5 - Stage Controller Types
 *
 * Type definitions for the assessment stage progression system.
 */

export type AssessmentStage =
  | "warmup"
  | "academics"
  | "activities"
  | "narrative"
  | "synthesis"
  | "complete";

export interface StageState {
  stage: AssessmentStage;
  turnCount: number;
}

export interface StageTransitionResult {
  nextStage: AssessmentStage;
  reason: string;
  shouldAdvance: boolean;
}

export interface StageDefinition {
  stage: AssessmentStage;
  displayName: string;
  description: string;
  minTurns: number;
  objectives: string[];
}

export interface StageMetadata {
  startedAt?: string;
  completedAt?: string;
  turnsCompleted: number;
  objectivesAchieved: string[];
}
