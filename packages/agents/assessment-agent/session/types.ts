/**
 * types.ts
 *
 * Type definitions for Component 46 - Assessment Session State Machine (FSM)
 */

/**
 * Assessment stage in the session flow
 *
 * The FSM enforces this exact order:
 * 1. rapport → 2. current_state → 3. diagnostic → 4. preview → 5. complete
 */
export type AssessmentStage =
  | "rapport"
  | "current_state"
  | "diagnostic"
  | "preview"
  | "complete";

/**
 * FSM State
 *
 * Tracks current stage, required data slots, collected slots, and conversation history.
 */
export interface AssessmentFSMState {
  /** Current stage in the assessment flow */
  stage: AssessmentStage;

  /** Data slots that must be collected at this stage */
  requiredSlots: string[];

  /** Data slots already collected */
  collectedSlots: string[];

  /** Conversation history */
  history: Array<{ role: string; content: string }>;
}

/**
 * Stage Requirements
 *
 * Defines what data must be collected at each stage before advancing.
 * This maps directly to Jenny's assessment framework.
 */
export const StageRequirements: Record<AssessmentStage, string[]> = {
  /**
   * Rapport Stage (Turns 1-3)
   * Build trust, understand student's emotional state and motivation
   */
  rapport: [
    "student_background",   // Basic context about the student
    "emotional_state",      // How they're feeling about college process
    "motivation_reason"     // Why they're seeking coaching
  ],

  /**
   * Current State Stage (Turns 4-8)
   * Map complete picture of academics, ECs, and early signals
   */
  current_state: [
    "academics_rigor",      // GPA, courseload, test scores, rigor level
    "ec_depth",             // Extracurricular activities and commitment level
    "passion_signals",      // Early indicators of genuine passion
    "service_signals",      // Early indicators of service orientation
    "identity_signals"      // Early indicators of identity threads
  ],

  /**
   * Diagnostic Stage (Turns 9-12)
   * Deep analysis using intelligence oracles and narrative assessment
   */
  diagnostic: [
    "aptitude_score",           // Component 3 aptitude oracle score
    "passion_score",            // Component 4 passion oracle score
    "service_score",            // Component 5 service oracle score
    "narrative_risks",          // Identified narrative gaps/weaknesses
    "narrative_opportunities"   // Identified narrative strengths/angles
  ],

  /**
   * Preview Stage (Turns 13-15)
   * Strategic direction for next 12 months
   */
  preview: [
    "12m_direction_signal",     // Overall 12-month strategic direction
    "summer_direction_signal",  // Summer plans/recommendations
    "awards_direction_signal"   // Awards/recognition strategy
  ],

  /**
   * Complete Stage (Terminal)
   * No additional requirements - assessment is done
   */
  complete: []
};

/**
 * Slot Collection Result
 *
 * Returned when attempting to mark a slot as collected.
 */
export interface SlotCollectionResult {
  success: boolean;
  slot: string;
  alreadyCollected: boolean;
}

/**
 * Stage Transition Result
 *
 * Returned when attempting to advance stage.
 */
export interface StageTransitionResult {
  transitioned: boolean;
  fromStage: AssessmentStage;
  toStage: AssessmentStage;
  missingSlots: string[];
  reason?: string;
}

/**
 * FSM Metadata
 *
 * Additional tracking information for debugging and monitoring.
 */
export interface FSMMetadata {
  createdAt: string;
  lastUpdated: string;
  totalTurns: number;
  stageHistory: Array<{
    stage: AssessmentStage;
    enteredAt: string;
    exitedAt?: string;
  }>;
}
