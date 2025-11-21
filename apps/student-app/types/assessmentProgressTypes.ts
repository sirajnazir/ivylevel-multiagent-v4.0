/**
 * assessmentProgressTypes.ts
 *
 * Component 2 - Progress Types
 *
 * Type definitions for the assessment progress tracking system.
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

export interface ProgressMilestone {
  id: string;
  stage: AssessmentStage;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface SessionProgressState {
  sessionId: string;
  currentStage: AssessmentStage;
  progress: number;
  stageDescription: string;
  milestones: ProgressMilestone[];
  startedAt: string;
  lastUpdatedAt: string;
}
