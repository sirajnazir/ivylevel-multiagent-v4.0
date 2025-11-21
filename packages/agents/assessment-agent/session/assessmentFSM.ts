/**
 * assessmentFSM.ts
 *
 * Component 46 - Assessment Session State Machine (AssessmentSessionFSM_v1)
 * Deterministic control plane for assessment conversations
 */

import {
  AssessmentFSMState,
  AssessmentStage,
  StageRequirements,
  SlotCollectionResult,
  StageTransitionResult,
  FSMMetadata
} from './types';

/**
 * Assessment Session Finite State Machine
 *
 * Guarantees:
 * - Predictable stage transitions
 * - Correct prompting context
 * - No skipping stages
 * - No infinite loops
 * - No missing diagnostic data
 * - Correct shutdown into "completion mode"
 * - Graceful failure recovery
 *
 * The FSM enforces Jenny's canonical assessment flow:
 * 1. rapport → 2. current_state → 3. diagnostic → 4. preview → 5. complete
 */
export class AssessmentSessionFSM {
  private state: AssessmentFSMState;
  private metadata: FSMMetadata;

  constructor() {
    const now = new Date().toISOString();

    this.state = {
      stage: "rapport",
      requiredSlots: [...StageRequirements["rapport"]],
      collectedSlots: [],
      history: []
    };

    this.metadata = {
      createdAt: now,
      lastUpdated: now,
      totalTurns: 0,
      stageHistory: [
        {
          stage: "rapport",
          enteredAt: now
        }
      ]
    };

    console.log('[AssessmentFSM] Initialized in rapport stage');
  }

  /**
   * Append Message to History
   *
   * Adds a message turn to the conversation history.
   * Updates metadata.
   *
   * @param role - Message role ('student' or 'coach')
   * @param content - Message content
   */
  public appendMessage(role: string, content: string): void {
    this.state.history.push({ role, content });
    this.metadata.totalTurns++;
    this.metadata.lastUpdated = new Date().toISOString();

    console.log(`[AssessmentFSM] Appended ${role} message (turn ${this.metadata.totalTurns})`);
  }

  /**
   * Mark Slot as Collected
   *
   * Marks a required data slot as collected.
   * Idempotent - marking same slot multiple times is safe.
   *
   * @param slot - Slot name (e.g., 'student_background')
   * @returns Collection result with success status
   */
  public markSlotCollected(slot: string): SlotCollectionResult {
    const alreadyCollected = this.state.collectedSlots.includes(slot);

    if (!alreadyCollected) {
      this.state.collectedSlots.push(slot);
      this.metadata.lastUpdated = new Date().toISOString();

      console.log(`[AssessmentFSM] Collected slot: ${slot}`);
      console.log(`  - Progress: ${this.state.collectedSlots.length}/${this.state.requiredSlots.length} slots`);
    }

    return {
      success: true,
      slot,
      alreadyCollected
    };
  }

  /**
   * Mark Multiple Slots as Collected
   *
   * Convenience method to mark multiple slots at once.
   *
   * @param slots - Array of slot names
   * @returns Array of collection results
   */
  public markSlotsCollected(slots: string[]): SlotCollectionResult[] {
    return slots.map(slot => this.markSlotCollected(slot));
  }

  /**
   * Check if Current Stage is Complete
   *
   * A stage is complete when all required slots have been collected.
   *
   * @param stage - Stage to check (defaults to current stage)
   * @returns True if all required slots are collected
   */
  private isStageComplete(stage?: AssessmentStage): boolean {
    const stageToCheck = stage || this.state.stage;
    const required = StageRequirements[stageToCheck];
    const isComplete = required.every(r => this.state.collectedSlots.includes(r));

    return isComplete;
  }

  /**
   * Get Next Stage
   *
   * Returns the next stage in the canonical flow.
   * Terminal stage returns 'complete'.
   *
   * @param current - Current stage
   * @returns Next stage in the flow
   */
  private nextStage(current: AssessmentStage): AssessmentStage {
    const flow: Record<AssessmentStage, AssessmentStage> = {
      rapport: "current_state",
      current_state: "diagnostic",
      diagnostic: "preview",
      preview: "complete",
      complete: "complete"
    };

    return flow[current];
  }

  /**
   * Try Advance Stage
   *
   * Attempts to advance to the next stage if current stage is complete.
   * No-op if already in 'complete' stage or if requirements not met.
   *
   * @returns Transition result with success status and details
   */
  public tryAdvanceStage(): StageTransitionResult {
    const fromStage = this.state.stage;

    // Terminal stage - cannot advance
    if (fromStage === "complete") {
      return {
        transitioned: false,
        fromStage,
        toStage: "complete",
        missingSlots: [],
        reason: "Already in terminal stage"
      };
    }

    // Check if stage is complete
    if (!this.isStageComplete()) {
      const missingSlots = this.state.requiredSlots.filter(
        slot => !this.state.collectedSlots.includes(slot)
      );

      return {
        transitioned: false,
        fromStage,
        toStage: fromStage,
        missingSlots,
        reason: `Stage not complete: missing ${missingSlots.length} slots`
      };
    }

    // Advance to next stage
    const toStage = this.nextStage(fromStage);
    const now = new Date().toISOString();

    // Update stage history - close current stage
    const currentStageEntry = this.metadata.stageHistory[this.metadata.stageHistory.length - 1];
    if (currentStageEntry && !currentStageEntry.exitedAt) {
      currentStageEntry.exitedAt = now;
    }

    // Update state
    this.state.stage = toStage;
    this.state.requiredSlots = [...StageRequirements[toStage]];
    this.state.collectedSlots = []; // Reset collected slots for new stage
    this.metadata.lastUpdated = now;

    // Add new stage to history
    this.metadata.stageHistory.push({
      stage: toStage,
      enteredAt: now
    });

    console.log(`[AssessmentFSM] Stage transition: ${fromStage} → ${toStage}`);
    console.log(`  - New required slots: ${this.state.requiredSlots.join(', ')}`);

    return {
      transitioned: true,
      fromStage,
      toStage,
      missingSlots: [],
      reason: "Stage complete - transitioned successfully"
    };
  }

  /**
   * Get Current Stage
   *
   * @returns Current assessment stage
   */
  public getStage(): AssessmentStage {
    return this.state.stage;
  }

  /**
   * Get FSM State
   *
   * Returns full state (stage, slots, history).
   *
   * @returns Complete FSM state
   */
  public getState(): AssessmentFSMState {
    return {
      ...this.state,
      requiredSlots: [...this.state.requiredSlots],
      collectedSlots: [...this.state.collectedSlots],
      history: [...this.state.history]
    };
  }

  /**
   * Get FSM Metadata
   *
   * Returns metadata (timestamps, turn count, stage history).
   *
   * @returns FSM metadata
   */
  public getMetadata(): FSMMetadata {
    return {
      ...this.metadata,
      stageHistory: [...this.metadata.stageHistory]
    };
  }

  /**
   * Get Required Slots
   *
   * Returns slots required for current stage.
   *
   * @returns Array of required slot names
   */
  public getRequiredSlots(): string[] {
    return [...this.state.requiredSlots];
  }

  /**
   * Get Collected Slots
   *
   * Returns slots already collected for current stage.
   *
   * @returns Array of collected slot names
   */
  public getCollectedSlots(): string[] {
    return [...this.state.collectedSlots];
  }

  /**
   * Get Missing Slots
   *
   * Returns slots still needed to complete current stage.
   *
   * @returns Array of missing slot names
   */
  public getMissingSlots(): string[] {
    return this.state.requiredSlots.filter(
      slot => !this.state.collectedSlots.includes(slot)
    );
  }

  /**
   * Get Stage Progress
   *
   * Returns completion percentage for current stage.
   *
   * @returns Progress as decimal (0.0 - 1.0)
   */
  public getStageProgress(): number {
    if (this.state.requiredSlots.length === 0) {
      return 1.0;
    }
    return this.state.collectedSlots.length / this.state.requiredSlots.length;
  }

  /**
   * Is Stage Complete
   *
   * Public method to check if current stage is complete.
   *
   * @returns True if all required slots are collected
   */
  public isCurrentStageComplete(): boolean {
    return this.isStageComplete();
  }

  /**
   * Is Assessment Complete
   *
   * @returns True if FSM is in terminal 'complete' stage
   */
  public isComplete(): boolean {
    return this.state.stage === "complete";
  }

  /**
   * Get History
   *
   * Returns conversation history.
   *
   * @returns Array of message turns
   */
  public getHistory(): Array<{ role: string; content: string }> {
    return [...this.state.history];
  }

  /**
   * Get Turn Count
   *
   * @returns Total number of turns in conversation
   */
  public getTurnCount(): number {
    return this.metadata.totalTurns;
  }

  /**
   * Get Stage Duration
   *
   * Returns how long (in milliseconds) the FSM has been in current stage.
   *
   * @returns Duration in milliseconds
   */
  public getCurrentStageDuration(): number {
    const currentStageEntry = this.metadata.stageHistory[this.metadata.stageHistory.length - 1];
    if (!currentStageEntry) return 0;

    const entered = new Date(currentStageEntry.enteredAt).getTime();
    const now = Date.now();
    return now - entered;
  }

  /**
   * Get Summary
   *
   * Returns human-readable summary of FSM state.
   *
   * @returns Summary string
   */
  public getSummary(): string {
    const progress = (this.getStageProgress() * 100).toFixed(0);
    const missing = this.getMissingSlots();
    const duration = Math.round(this.getCurrentStageDuration() / 1000); // seconds

    return `Stage: ${this.state.stage} | Progress: ${progress}% | Missing: ${missing.length} slots | Duration: ${duration}s | Turns: ${this.metadata.totalTurns}`;
  }

  /**
   * Reset FSM
   *
   * Resets FSM to initial state (rapport stage, no collected slots).
   * Useful for testing or starting a new assessment session.
   */
  public reset(): void {
    const now = new Date().toISOString();

    this.state = {
      stage: "rapport",
      requiredSlots: [...StageRequirements["rapport"]],
      collectedSlots: [],
      history: []
    };

    this.metadata = {
      createdAt: now,
      lastUpdated: now,
      totalTurns: 0,
      stageHistory: [
        {
          stage: "rapport",
          enteredAt: now
        }
      ]
    };

    console.log('[AssessmentFSM] Reset to initial state');
  }

  /**
   * Validate FSM State
   *
   * Checks for consistency issues in FSM state.
   * Useful for debugging and testing.
   *
   * @returns Validation result with any issues found
   */
  public validate(): { valid: boolean; issues: string[] } {
    const issues: string[] = [];

    // Check stage is valid
    const validStages: AssessmentStage[] = ["rapport", "current_state", "diagnostic", "preview", "complete"];
    if (!validStages.includes(this.state.stage)) {
      issues.push(`Invalid stage: ${this.state.stage}`);
    }

    // Check requiredSlots matches stage requirements
    const expectedSlots = StageRequirements[this.state.stage];
    if (JSON.stringify(this.state.requiredSlots.sort()) !== JSON.stringify(expectedSlots.sort())) {
      issues.push(`Required slots don't match stage requirements for ${this.state.stage}`);
    }

    // Check collected slots are subset of required (or from previous stages)
    const allValidSlots = Object.values(StageRequirements).flat();
    const invalidCollected = this.state.collectedSlots.filter(slot => !allValidSlots.includes(slot));
    if (invalidCollected.length > 0) {
      issues.push(`Invalid collected slots: ${invalidCollected.join(', ')}`);
    }

    // Check history has expected structure
    for (const msg of this.state.history) {
      if (!msg.role || !msg.content) {
        issues.push('History message missing role or content');
        break;
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}
