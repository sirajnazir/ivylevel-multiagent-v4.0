/**
 * index.ts
 *
 * Main exports for Component 46 - Assessment Session State Machine
 */

export { AssessmentSessionFSM } from './assessmentFSM';

export type {
  AssessmentStage,
  AssessmentFSMState,
  SlotCollectionResult,
  StageTransitionResult,
  FSMMetadata
} from './types';

export { StageRequirements } from './types';
