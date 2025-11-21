import { FlowState, FlowPhase, initializeFlowState } from "./flowState";
import { stepCatalog, getStep } from "./stepCatalog";
import { PersonaInstruction_v3 } from "../../../../schema/coachPersona_v3";
import { EmotionalSignals } from "../../../../schema/conversationMemory_v1";
import { ToneInstruction_v1 } from "../../../../schema/toneInstruction_v1";
import { buildJennyPersonaInstruction } from "../../src/personaComposer";
import { generateToneInstruction } from "../../src/eqFeedbackLoop";
import { extractMemorySignalsHeuristic } from "../../src/memorySignalExtractor";

/**
 * Session Flow Orchestrator v1.0
 *
 * The "Session Brain" that runs a Jenny-grade assessment end-to-end.
 *
 * Responsibilities:
 * - Manage session state and phase transitions
 * - Apply persona composition each turn
 * - Execute step logic (collect data, transition)
 * - Ensure structured, intentional flow
 * - Prevent loops, tangents, runaway chit-chat
 *
 * This makes the agent stop acting like a passive Q&A bot
 * and start running the room the way Jenny does.
 */

export class SessionFlowOrchestrator {
  constructor() {}

  /**
   * Initialize Session
   *
   * Creates a new session with initial flow state.
   */
  initializeSession(basePersona: PersonaInstruction_v3): FlowState {
    console.log("[FlowOrchestrator] Initializing new session");
    const state = initializeFlowState(basePersona);
    console.log(`[FlowOrchestrator] Session started - Phase: ${state.phase}, Step: ${state.step}`);
    return state;
  }

  /**
   * Run Turn
   *
   * Main orchestration logic for a single turn.
   *
   * Steps:
   * 1. Update emotional signals from user message
   * 2. Build persona for this turn (4-layer composition)
   * 3. Lookup current step and instruction
   * 4. Collect structured data from user message
   * 5. Determine next step via transition logic
   * 6. Update phase boundaries
   * 7. Return updated state
   *
   * Note: LLM generation happens externally (in AssessmentAgent).
   * This orchestrator focuses on flow control and data collection.
   */
  runTurn(userMessage: string, state: FlowState): FlowState {
    console.log("[FlowOrchestrator] Running turn");
    console.log(`  - Current phase: ${state.phase}`);
    console.log(`  - Current step: ${state.step}`);

    try {
      // 1. Update emotional signals
      const signals = extractMemorySignalsHeuristic(userMessage);
      state.emotionalSignals.frustration = Math.max(0, Math.min(5, state.emotionalSignals.frustration + signals.frustrationDelta));
      state.emotionalSignals.confidence = Math.max(0, Math.min(5, state.emotionalSignals.confidence + signals.confidenceDelta));
      state.emotionalSignals.overwhelm = Math.max(0, Math.min(5, state.emotionalSignals.overwhelm + signals.overwhelmDelta));
      state.emotionalSignals.motivation = Math.max(0, Math.min(5, state.emotionalSignals.motivation + signals.motivationDelta));
      state.emotionalSignals.agency = Math.max(0, Math.min(5, state.emotionalSignals.agency + signals.agencyDelta));

      console.log(`  - Emotional signals updated: frustration=${state.emotionalSignals.frustration}, confidence=${state.emotionalSignals.confidence}`);

      // 2. Build persona for this turn
      const toneInstruction = this.generateToneInstructionForTurn(state);
      state.persona = buildJennyPersonaInstruction(state.emotionalSignals, toneInstruction);

      console.log(`  - Persona composed: warmth=${state.persona.tone.warmth}, empathy=${state.persona.tone.empathyType}`);

      // 3. Lookup current step
      const step = getStep(state.step);
      if (!step) {
        console.error(`[FlowOrchestrator] Step not found: ${state.step}`);
        throw new Error(`Step not found: ${state.step}`);
      }

      console.log(`  - Current step instruction: ${step.instruction.substring(0, 100)}...`);

      // 4. Store user message in history
      state.history.push({
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString()
      });

      // 5. Run collector
      if (step.collect) {
        step.collect(userMessage, state);
        console.log(`  - Data collected for step: ${state.step}`);
      }

      // 6. Determine next step
      const nextStep = step.transition(state);
      console.log(`  - Transition: ${state.step} → ${nextStep}`);

      state.step = nextStep;

      // 7. Update phase boundaries
      this.updatePhase(state);

      // 8. Increment turn count and update metadata
      state.turnCount++;
      state.metadata.lastUpdatedAt = new Date().toISOString();

      console.log(`[FlowOrchestrator] Turn complete - New phase: ${state.phase}, New step: ${state.step}`);

      return state;
    } catch (error) {
      console.error("[FlowOrchestrator] Error running turn:", error);
      throw error;
    }
  }

  /**
   * Get Current Instruction
   *
   * Returns the instruction for the current step.
   * This is what gets fed to the LLM.
   */
  getCurrentInstruction(state: FlowState): string {
    const step = getStep(state.step);
    if (!step) {
      throw new Error(`Step not found: ${state.step}`);
    }
    return step.instruction;
  }

  /**
   * Add Assistant Message
   *
   * Stores the assistant's message in history.
   * Called after LLM generation.
   */
  addAssistantMessage(state: FlowState, message: string): void {
    state.history.push({
      role: "assistant",
      content: message,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Is Session Complete
   *
   * Checks if the session has reached completion.
   */
  isSessionComplete(state: FlowState): boolean {
    return state.step === "session_complete";
  }

  /**
   * Get Progress Summary
   *
   * Returns a human-readable summary of session progress.
   */
  getProgressSummary(state: FlowState): string {
    const lines: string[] = [];

    lines.push(`=== Session Progress ===`);
    lines.push(`Phase: ${state.phase} (${this.getPhaseProgress(state)}%)`);
    lines.push(`Step: ${state.step}`);
    lines.push(`Turn Count: ${state.turnCount}`);
    lines.push("");

    lines.push("Data Collection:");
    lines.push(`  Academics: ${state.collected.academics ? "✓" : "○"}`);
    lines.push(`  ECs: ${state.collected.ecs ? "✓" : "○"}`);
    lines.push(`  Awards: ${state.collected.awards ? "✓" : "○"}`);
    lines.push(`  Personality: ${state.collected.personality ? "✓" : "○"}`);
    lines.push(`  Narrative: ${state.collected.narrative ? "✓" : "○"}`);

    return lines.join("\n");
  }

  /**
   * Generate Tone Instruction for Turn
   *
   * Uses the current history to generate tone instruction.
   */
  private generateToneInstructionForTurn(state: FlowState): ToneInstruction_v1 {
    // Get last assistant message if available
    const lastAssistantMessage = state.history
      .filter(m => m.role === "assistant")
      .slice(-1)[0]?.content || "";

    // Convert flow state emotional signals to conversation memory format
    const mockMemory = {
      emotionalSignals: state.emotionalSignals,
      detectedPatterns: [],
      history: state.history.map(h => ({
        role: h.role === "user" ? "student" as const : "assistant" as const,
        content: h.content,
        timestamp: h.timestamp
      })),
      rollingSummary: undefined,
      lastUpdated: state.metadata.lastUpdatedAt
    };

    return generateToneInstruction(mockMemory as any, lastAssistantMessage);
  }

  /**
   * Update Phase
   *
   * Auto-advance phase boundaries based on step prefix.
   */
  private updatePhase(state: FlowState): void {
    let newPhase: FlowPhase = state.phase;

    if (state.step.startsWith("warmup_")) {
      newPhase = "warmup";
    } else if (state.step.startsWith("diagnostic_")) {
      newPhase = "diagnostic";
    } else if (state.step.startsWith("deep_probe_")) {
      newPhase = "deep_probe";
    } else if (state.step.startsWith("narrative_")) {
      newPhase = "narrative";
    } else if (state.step.startsWith("wrap_")) {
      newPhase = "wrap";
    }

    if (newPhase !== state.phase) {
      console.log(`[FlowOrchestrator] Phase transition: ${state.phase} → ${newPhase}`);
      state.phase = newPhase;
    }
  }

  /**
   * Get Phase Progress
   *
   * Calculates completion percentage for current phase.
   */
  private getPhaseProgress(state: FlowState): number {
    // Simple heuristic based on step count
    const stepOrder = Object.keys(stepCatalog);
    const currentIndex = stepOrder.indexOf(state.step);
    const totalSteps = stepOrder.length;

    if (currentIndex === -1) return 0;

    return Math.round((currentIndex / totalSteps) * 100);
  }
}

/**
 * Create Session Flow Orchestrator
 *
 * Factory function for creating orchestrator instances.
 */
export function createSessionFlowOrchestrator(): SessionFlowOrchestrator {
  return new SessionFlowOrchestrator();
}
