/**
 * assessmentProgressEngine.ts
 *
 * Component 2 - Backend Progress Engine
 *
 * This is the centralized truth of the assessment session progress.
 * It maps assessment stages to progress percentages and descriptions.
 *
 * This engine:
 * - Provides deterministic progress values for each stage
 * - Generates stage descriptions
 * - Tracks milestones
 * - Prevents flow drift (the v3 disaster)
 */

import type { AssessmentStage, ProgressPayload, StageDefinition } from "../types/assessmentProgressTypes";

export class AssessmentProgressEngine {
  /**
   * Stage Map
   *
   * Maps each assessment stage to a progress percentage (0-100).
   * These values represent key milestones in the assessment journey.
   */
  private static STAGE_MAP: Record<AssessmentStage, number> = {
    intake: 10,          // Initial background gathering
    diagnostic: 30,      // Deep dive into academics/activities/gaps
    narrative: 60,       // Identity threads and positioning
    strategy: 85,        // Roadmap and target planning
    wrap_up: 100,        // Final summary preparation
  };

  /**
   * Stage Descriptions
   *
   * Human-readable descriptions of what happens in each stage.
   * Displayed to students in the UI.
   */
  private static STAGE_DESCRIPTIONS: Record<AssessmentStage, string> = {
    intake: "Understanding your background, context, and goals",
    diagnostic: "Evaluating your academics, activities, and growth areas",
    narrative: "Identifying your unique story, themes, and positioning",
    strategy: "Planning your personalized roadmap and target list",
    wrap_up: "Preparing your complete assessment summary",
  };

  /**
   * Expected Durations
   *
   * Approximate time spent in each stage (for planning purposes).
   */
  private static EXPECTED_DURATIONS: Record<AssessmentStage, string> = {
    intake: "5-10 minutes",
    diagnostic: "15-20 minutes",
    narrative: "10-15 minutes",
    strategy: "10-15 minutes",
    wrap_up: "5 minutes",
  };

  /**
   * Get Progress
   *
   * Returns a complete progress payload for a given stage.
   *
   * @param stage - The current assessment stage
   * @returns Progress payload with stage, progress %, description, and milestone
   */
  static getProgress(stage: AssessmentStage): ProgressPayload {
    return {
      stage,
      progress: this.STAGE_MAP[stage],
      description: this.STAGE_DESCRIPTIONS[stage],
      milestone: `Entered ${stage.replace('_', ' ')} stage`,
    };
  }

  /**
   * Get Stage Definition
   *
   * Returns the complete definition for a stage.
   *
   * @param stage - The assessment stage
   * @returns Stage definition with all metadata
   */
  static getStageDefinition(stage: AssessmentStage): StageDefinition {
    return {
      stage,
      progressValue: this.STAGE_MAP[stage],
      description: this.STAGE_DESCRIPTIONS[stage],
      expectedDuration: this.EXPECTED_DURATIONS[stage],
    };
  }

  /**
   * Calculate Granular Progress
   *
   * Calculates more granular progress within a stage based on substeps.
   *
   * Example: If diagnostic stage (30%) has 5 substeps, and 2 are complete,
   * progress would be 20% + (2/5 * 10%) = 24%
   *
   * @param stage - Current stage
   * @param substepsCompleted - Number of substeps completed
   * @param totalSubsteps - Total number of substeps in this stage
   * @returns Granular progress value
   */
  static calculateGranularProgress(
    stage: AssessmentStage,
    substepsCompleted: number,
    totalSubsteps: number
  ): number {
    if (totalSubsteps === 0) return this.STAGE_MAP[stage];

    const stageBaseProgress = this.STAGE_MAP[stage];
    const nextStage = this.getNextStage(stage);
    const nextStageProgress = nextStage ? this.STAGE_MAP[nextStage] : 100;

    const stageProgressRange = nextStageProgress - stageBaseProgress;
    const substepProgress = (substepsCompleted / totalSubsteps) * stageProgressRange;

    return Math.min(100, stageBaseProgress + substepProgress);
  }

  /**
   * Get Next Stage
   *
   * Returns the next stage in the assessment flow.
   *
   * @param currentStage - Current assessment stage
   * @returns Next stage, or null if at wrap_up
   */
  static getNextStage(currentStage: AssessmentStage): AssessmentStage | null {
    const stageOrder: AssessmentStage[] = [
      "intake",
      "diagnostic",
      "narrative",
      "strategy",
      "wrap_up",
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
      return null;
    }

    return stageOrder[currentIndex + 1];
  }

  /**
   * Get Previous Stage
   *
   * Returns the previous stage in the assessment flow.
   *
   * @param currentStage - Current assessment stage
   * @returns Previous stage, or null if at intake
   */
  static getPreviousStage(currentStage: AssessmentStage): AssessmentStage | null {
    const stageOrder: AssessmentStage[] = [
      "intake",
      "diagnostic",
      "narrative",
      "strategy",
      "wrap_up",
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex <= 0) {
      return null;
    }

    return stageOrder[currentIndex - 1];
  }

  /**
   * Validate Stage Transition
   *
   * Validates that a stage transition is valid (no skipping stages).
   *
   * @param fromStage - Current stage
   * @param toStage - Proposed next stage
   * @returns True if transition is valid
   */
  static validateStageTransition(
    fromStage: AssessmentStage,
    toStage: AssessmentStage
  ): boolean {
    const nextStage = this.getNextStage(fromStage);
    return nextStage === toStage;
  }

  /**
   * Get All Stages
   *
   * Returns all stages in order.
   *
   * @returns Array of all assessment stages
   */
  static getAllStages(): AssessmentStage[] {
    return ["intake", "diagnostic", "narrative", "strategy", "wrap_up"];
  }

  /**
   * Get Progress Percentage
   *
   * Returns just the progress percentage for a stage.
   *
   * @param stage - Assessment stage
   * @returns Progress percentage (0-100)
   */
  static getProgressPercentage(stage: AssessmentStage): number {
    return this.STAGE_MAP[stage];
  }

  /**
   * Get Stage Description
   *
   * Returns just the description for a stage.
   *
   * @param stage - Assessment stage
   * @returns Stage description
   */
  static getStageDescription(stage: AssessmentStage): string {
    return this.STAGE_DESCRIPTIONS[stage];
  }
}
