/**
 * stageController.ts
 *
 * Component 5 - Stage Controller
 *
 * Main stage controller class called before every agent response.
 * Enforces structured, disciplined assessment progression.
 */

import type { AssessmentStage, StageState, StageTransitionResult, StageMetadata } from "./types";
import { evaluateStageTransition, getStageDefinition, getStageProgressPercentage } from "./stageRules";

export class StageController {
  private state: StageState;
  private metadata: Record<AssessmentStage, StageMetadata>;

  constructor(initialStage: AssessmentStage = "warmup") {
    this.state = {
      stage: initialStage,
      turnCount: 0,
    };

    // Initialize metadata for all stages
    this.metadata = {
      warmup: { turnsCompleted: 0, objectivesAchieved: [] },
      academics: { turnsCompleted: 0, objectivesAchieved: [] },
      activities: { turnsCompleted: 0, objectivesAchieved: [] },
      narrative: { turnsCompleted: 0, objectivesAchieved: [] },
      synthesis: { turnsCompleted: 0, objectivesAchieved: [] },
      complete: { turnsCompleted: 0, objectivesAchieved: [] },
    };

    console.log(`[StageController] Initialized at stage: ${initialStage}`);
  }

  /**
   * Record Turn
   *
   * Increments turn count for current stage.
   * Called after each agent-student exchange.
   */
  recordTurn(): void {
    this.state.turnCount += 1;
    this.metadata[this.state.stage].turnsCompleted += 1;

    console.log(
      `[StageController] Turn ${this.state.turnCount} in stage ${this.state.stage}`
    );
  }

  /**
   * Get Stage
   *
   * Returns current assessment stage.
   *
   * @returns Current stage
   */
  getStage(): AssessmentStage {
    return this.state.stage;
  }

  /**
   * Get State
   *
   * Returns complete current state.
   *
   * @returns Current stage state
   */
  getState(): StageState {
    return this.state;
  }

  /**
   * Should Advance
   *
   * Evaluates if the assessment should move to the next stage.
   *
   * @returns Transition result
   */
  shouldAdvance(): StageTransitionResult {
    return evaluateStageTransition(this.state);
  }

  /**
   * Advance Stage
   *
   * Manually advances to the next stage.
   * Resets turn count and updates metadata.
   *
   * @param nextStage - The stage to advance to
   */
  advanceStage(nextStage: AssessmentStage): void {
    const previousStage = this.state.stage;

    // Mark previous stage as complete
    this.metadata[previousStage].completedAt = new Date().toISOString();

    // Mark new stage as started
    this.metadata[nextStage].startedAt = new Date().toISOString();

    // Update state
    this.state = {
      stage: nextStage,
      turnCount: 0,
    };

    console.log(
      `[StageController] Advanced from ${previousStage} → ${nextStage}`
    );
  }

  /**
   * Try Advance
   *
   * Automatically checks and advances stage if ready.
   * Returns true if stage was advanced.
   *
   * @returns True if stage was advanced
   */
  tryAdvance(): boolean {
    const transition = this.shouldAdvance();

    if (transition.shouldAdvance) {
      this.advanceStage(transition.nextStage);
      return true;
    }

    return false;
  }

  /**
   * Get Progress Percentage
   *
   * Returns overall assessment progress (0-100).
   *
   * @returns Progress percentage
   */
  getProgressPercentage(): number {
    return getStageProgressPercentage(this.state);
  }

  /**
   * Get Stage Definition
   *
   * Returns definition for current stage.
   *
   * @returns Stage definition
   */
  getStageDefinition() {
    return getStageDefinition(this.state.stage);
  }

  /**
   * Get Stage Metadata
   *
   * Returns metadata for a specific stage.
   *
   * @param stage - Assessment stage
   * @returns Stage metadata
   */
  getStageMetadata(stage: AssessmentStage): StageMetadata {
    return this.metadata[stage];
  }

  /**
   * Get All Metadata
   *
   * Returns metadata for all stages.
   *
   * @returns All stage metadata
   */
  getAllMetadata(): Record<AssessmentStage, StageMetadata> {
    return this.metadata;
  }

  /**
   * Mark Objective Achieved
   *
   * Records that a specific objective was achieved in current stage.
   *
   * @param objective - Objective description
   */
  markObjectiveAchieved(objective: string): void {
    const currentMetadata = this.metadata[this.state.stage];

    if (!currentMetadata.objectivesAchieved.includes(objective)) {
      currentMetadata.objectivesAchieved.push(objective);
      console.log(
        `[StageController] Objective achieved in ${this.state.stage}: ${objective}`
      );
    }
  }

  /**
   * Get Objectives Status
   *
   * Returns objectives for current stage with achievement status.
   *
   * @returns Array of objectives with completion status
   */
  getObjectivesStatus(): Array<{ objective: string; achieved: boolean }> {
    const definition = this.getStageDefinition();
    const metadata = this.metadata[this.state.stage];

    return definition.objectives.map((objective) => ({
      objective,
      achieved: metadata.objectivesAchieved.includes(objective),
    }));
  }

  /**
   * Is Complete
   *
   * Returns whether the assessment is complete.
   *
   * @returns True if assessment is complete
   */
  isComplete(): boolean {
    return this.state.stage === "complete";
  }

  /**
   * Reset
   *
   * Resets controller to initial state.
   */
  reset(): void {
    this.state = {
      stage: "warmup",
      turnCount: 0,
    };

    this.metadata = {
      warmup: { turnsCompleted: 0, objectivesAchieved: [] },
      academics: { turnsCompleted: 0, objectivesAchieved: [] },
      activities: { turnsCompleted: 0, objectivesAchieved: [] },
      narrative: { turnsCompleted: 0, objectivesAchieved: [] },
      synthesis: { turnsCompleted: 0, objectivesAchieved: [] },
      complete: { turnsCompleted: 0, objectivesAchieved: [] },
    };

    console.log("[StageController] Reset to warmup stage");
  }
}
