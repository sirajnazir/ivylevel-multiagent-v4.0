/**
 * assessmentProgressTypes.ts
 *
 * Component 2 - Backend Progress Types
 *
 * Type definitions for the backend progress tracking system.
 */

export type AssessmentStage =
  | "intake"
  | "diagnostic"
  | "narrative"
  | "strategy"
  | "wrap_up";

export interface ProgressPayload {
  stage: AssessmentStage;
  progress: number;
  description: string;
  milestone?: string;
}

export interface StageDefinition {
  stage: AssessmentStage;
  progressValue: number;
  description: string;
  expectedDuration?: string;
}
