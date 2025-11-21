/**
 * types.ts
 *
 * Type definitions for Component 45 - Assessment Session Dialogue Engine
 */

import type { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';
import type { ArchetypeClassification } from '../../../persona/archetype_classifier';
import type { ModulationEnvelope } from '../../../persona/archetype_modulation';

/**
 * Assessment session phase
 * 4-step diagnostic arc
 *
 * NOTE: These phases map to AssessmentStage in Component 46 FSM:
 * - rapport_and_safety → rapport
 * - current_state_mapping → current_state
 * - diagnostic_insights → diagnostic
 * - strategic_preview → preview
 */
export type AssessmentPhase =
  | 'rapport_and_safety'     // Step 1: Build trust, set expectations
  | 'current_state_mapping'  // Step 2: Map reality (academics, ECs, stress)
  | 'diagnostic_insights'    // Step 3: Probe deeper (motivation, patterns, gaps)
  | 'strategic_preview';     // Step 4: Preview pathway forward

/**
 * Message turn in assessment conversation
 */
export interface MessageTurn {
  role: 'student' | 'coach';
  content: string;
  timestamp?: string;
}

/**
 * Data collection status
 * Tracks what diagnostic data has been gathered
 */
export interface DataCollectionStatus {
  academicsComplete: boolean;
  extracurricularsComplete: boolean;
  stressLevelMapped: boolean;
  motivationProbed: boolean;
  identityThreadsExplored: boolean;
  gapsIdentified: boolean;
  commitmentLevel: 'high' | 'medium' | 'low' | 'unknown';
  confidence: 'high' | 'medium' | 'low' | 'unknown';
}

/**
 * Input to dialogue engine
 */
export interface DialogueEngineInput {
  /** Current assessment phase */
  phase: AssessmentPhase;

  /** Conversation history (turns) */
  messageHistory: MessageTurn[];

  /** Student profile (may be partial during assessment) */
  profile: Partial<ExtractedProfile_v2>;

  /** Archetype classification from Component 44 */
  archetype: ArchetypeClassification;

  /** Modulation envelope from Component 43 */
  modulation: ModulationEnvelope;

  /** EQ chips from previous turns (optional) */
  eqChips?: string[];

  /** Data collection status */
  dataStatus: DataCollectionStatus;

  /** Intake form responses (if available) */
  intakeForm?: Record<string, any>;
}

/**
 * Output from dialogue engine
 */
export interface DialogueEngineOutput {
  /** Jenny's next message */
  message: string;

  /** Recommended next phase (may stay the same or advance) */
  nextPhase: AssessmentPhase;

  /** Updated data collection status */
  updatedDataStatus: DataCollectionStatus;

  /** Diagnostic notes for internal tracking */
  diagnosticNotes: string[];

  /** Suggested follow-up questions (for agent planning) */
  followUpQuestions?: string[];

  /** Confidence in phase completion (0-1) */
  phaseCompletionConfidence: number;
}

/**
 * Assessment procedure metadata
 * Jenny's internal coaching heuristics
 */
export interface AssessmentProcedure {
  phase: AssessmentPhase;
  objectives: string[];
  keyQuestions: string[];
  completionCriteria: string[];
  typicalTurns: number;
}

/**
 * Map FSM Stage to Dialogue Phase
 *
 * Converts Component 46 FSM stage names to Component 45 dialogue phase names.
 */
export function fsmStageToDialoguePhase(stage: string): AssessmentPhase {
  const mapping: Record<string, AssessmentPhase> = {
    'rapport': 'rapport_and_safety',
    'current_state': 'current_state_mapping',
    'diagnostic': 'diagnostic_insights',
    'preview': 'strategic_preview',
    'complete': 'strategic_preview' // Complete maps to preview (terminal state)
  };

  return mapping[stage] || 'rapport_and_safety';
}

/**
 * Map Dialogue Phase to FSM Stage
 *
 * Converts Component 45 dialogue phase names to Component 46 FSM stage names.
 */
export function dialoguePhaseToFSMStage(phase: AssessmentPhase): string {
  const mapping: Record<AssessmentPhase, string> = {
    'rapport_and_safety': 'rapport',
    'current_state_mapping': 'current_state',
    'diagnostic_insights': 'diagnostic',
    'strategic_preview': 'preview'
  };

  return mapping[phase] || 'rapport';
}
