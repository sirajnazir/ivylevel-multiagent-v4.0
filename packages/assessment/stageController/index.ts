/**
 * index.ts
 *
 * Component 5 - Stage Controller Exports
 *
 * Main exports for the assessment stage progression system.
 */

// Main controller
export { StageController } from "./stageController";

// Stage rules
export {
  MIN_TURNS,
  STAGE_DEFINITIONS,
  evaluateStageTransition,
  getStageDefinition,
  getAllStages,
  getStageProgressPercentage,
} from "./stageRules";

// Types
export type {
  AssessmentStage,
  StageState,
  StageTransitionResult,
  StageDefinition,
  StageMetadata,
} from "./types";
