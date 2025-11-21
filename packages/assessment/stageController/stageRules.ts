/**
 * stageRules.ts
 *
 * Component 5 - Stage Transition Rules
 *
 * Hard-coded guardrails that prevent the assessment from skipping ahead.
 * These rules enforce Jenny's actual assessment process.
 */

import type {
  AssessmentStage,
  StageTransitionResult,
  StageState,
  StageDefinition,
} from "./types";

/**
 * Minimum Turns Per Stage
 *
 * Enforces minimum conversation depth for each stage.
 * Prevents the LLM from rushing through the assessment.
 */
export const MIN_TURNS: Record<AssessmentStage, number> = {
  warmup: 2,
  academics: 4,
  activities: 4,
  narrative: 3,
  synthesis: 2,
  complete: 0,
};

/**
 * Stage Definitions
 *
 * Complete definitions for each assessment stage.
 */
export const STAGE_DEFINITIONS: Record<AssessmentStage, StageDefinition> = {
  warmup: {
    stage: "warmup",
    displayName: "Warm-Up Calibration",
    description: "Building rapport and understanding initial context",
    minTurns: 2,
    objectives: [
      "Establish comfortable rapport",
      "Understand student's immediate concerns",
      "Gauge communication style and energy level",
      "Set expectations for the session",
    ],
  },

  academics: {
    stage: "academics",
    displayName: "Academic Deep Dive",
    description: "Exploring academic profile, rigor, and trajectory",
    minTurns: 4,
    objectives: [
      "Understand GPA, test scores, and class rank",
      "Evaluate course rigor and academic trajectory",
      "Identify academic strengths and challenges",
      "Assess intellectual interests and passions",
      "Gather evidence for academic positioning",
    ],
  },

  activities: {
    stage: "activities",
    displayName: "EC + Narrative Discovery",
    description: "Understanding extracurriculars, leadership, and personal narrative",
    minTurns: 4,
    objectives: [
      "Map all extracurricular activities and commitments",
      "Identify leadership roles and impact",
      "Discover passion projects and initiatives",
      "Understand time allocation and priorities",
      "Extract narrative threads and identity signals",
    ],
  },

  narrative: {
    stage: "narrative",
    displayName: "Narrative Synthesis",
    description: "Identifying themes, positioning, and unique story",
    minTurns: 3,
    objectives: [
      "Synthesize academic + EC data into coherent narrative",
      "Identify unique positioning and standout qualities",
      "Detect archetype and communication preferences",
      "Map identity threads and personal values",
      "Assess college readiness and fit preferences",
    ],
  },

  synthesis: {
    stage: "synthesis",
    displayName: "Strategic Synthesis",
    description: "Creating preliminary roadmap and strategic direction",
    minTurns: 2,
    objectives: [
      "Provide preliminary standout assessment",
      "Suggest strategic directions and opportunities",
      "Identify immediate action items",
      "Set expectations for full assessment output",
    ],
  },

  complete: {
    stage: "complete",
    displayName: "Complete",
    description: "Assessment session completed",
    minTurns: 0,
    objectives: [],
  },
};

/**
 * Evaluate Stage Transition
 *
 * Determines if the assessment should advance to the next stage.
 * Enforces minimum turn requirements and logical progression.
 *
 * @param state - Current stage state
 * @returns Transition result with next stage and reasoning
 */
export function evaluateStageTransition(state: StageState): StageTransitionResult {
  const { stage, turnCount } = state;

  // Already complete
  if (stage === "complete") {
    return {
      nextStage: "complete",
      reason: "Assessment already completed",
      shouldAdvance: false,
    };
  }

  // Check minimum turns requirement
  const minTurns = MIN_TURNS[stage];
  if (turnCount < minTurns) {
    return {
      nextStage: stage,
      reason: `Not enough turns in ${stage} stage (${turnCount}/${minTurns})`,
      shouldAdvance: false,
    };
  }

  // Determine next stage based on current stage
  switch (stage) {
    case "warmup":
      return {
        nextStage: "academics",
        reason: "Warm-up complete, moving to academic deep dive",
        shouldAdvance: true,
      };

    case "academics":
      return {
        nextStage: "activities",
        reason: "Academic exploration complete, moving to EC discovery",
        shouldAdvance: true,
      };

    case "activities":
      return {
        nextStage: "narrative",
        reason: "EC exploration complete, moving to narrative synthesis",
        shouldAdvance: true,
      };

    case "narrative":
      return {
        nextStage: "synthesis",
        reason: "Narrative synthesis complete, moving to strategic synthesis",
        shouldAdvance: true,
      };

    case "synthesis":
      return {
        nextStage: "complete",
        reason: "Strategic synthesis complete, assessment finished",
        shouldAdvance: true,
      };

    default:
      return {
        nextStage: stage,
        reason: "Unknown stage, staying in current stage",
        shouldAdvance: false,
      };
  }
}

/**
 * Get Stage Definition
 *
 * Returns the complete definition for a given stage.
 *
 * @param stage - Assessment stage
 * @returns Stage definition
 */
export function getStageDefinition(stage: AssessmentStage): StageDefinition {
  return STAGE_DEFINITIONS[stage];
}

/**
 * Get All Stages
 *
 * Returns all assessment stages in order.
 *
 * @returns Array of stages
 */
export function getAllStages(): AssessmentStage[] {
  return ["warmup", "academics", "activities", "narrative", "synthesis", "complete"];
}

/**
 * Get Stage Progress Percentage
 *
 * Calculates overall progress percentage based on current stage and turns.
 *
 * @param state - Current stage state
 * @returns Progress percentage (0-100)
 */
export function getStageProgressPercentage(state: StageState): number {
  const stages = getAllStages();
  const currentStageIndex = stages.indexOf(state.stage);

  if (currentStageIndex === -1) return 0;

  // Base progress: which stage we're in
  const stageWeight = 100 / (stages.length - 1); // Exclude 'complete'
  const baseProgress = currentStageIndex * stageWeight;

  // Additional progress within current stage
  const minTurns = MIN_TURNS[state.stage];
  if (minTurns === 0) return baseProgress;

  const withinStageProgress = Math.min(state.turnCount / minTurns, 1) * stageWeight;

  return Math.min(100, baseProgress + withinStageProgress);
}
