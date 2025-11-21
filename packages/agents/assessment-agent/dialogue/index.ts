/**
 * index.ts
 *
 * Main exports for Component 45 - Assessment Session Dialogue Engine
 */

export {
  generateAssessmentTurn,
  getPhaseObjectives,
  createInitialDataStatus
} from './assessmentDialogueEngine.llm';

export type {
  AssessmentPhase,
  MessageTurn,
  DataCollectionStatus,
  DialogueEngineInput,
  DialogueEngineOutput,
  AssessmentProcedure
} from './types';

export {
  fsmStageToDialoguePhase,
  dialoguePhaseToFSMStage
} from './types';
