/**
 * EQ Runtime v4.0
 *
 * Real-time emotional intelligence orchestration for live conversations.
 *
 * This is the glue layer between EQ components and the assessment loop:
 * - Updates archetype detection from each student message
 * - Tracks anxiety and confidence signals
 * - Advances session stage automatically
 * - Computes dynamic EQ curve directives for each response
 *
 * Purpose: Make emotional intelligence work in production - this is the
 * "always-on" emotional calibration system that runs during every exchange.
 */

import { computeDynamicEQCurve, EQCurveParams } from "../../../eq/eqCurveEngine";
import { inferArchetype } from "../../../eq/archetypeInference";
import { detectSessionStage, shouldForceStageAdvancement } from "../../../eq/sessionStageInference";
import { computeConfidenceDelta, classifyConfidenceLevel } from "../../../eq/confidenceSignalModel";
import { StyleDirectives } from "../../../eq/styleMixer";
import { StudentArchetype } from "../../../eq/archetypeModel";
import { SessionStage } from "../../../eq/sessionStageModel";

/**
 * EQ Runtime State
 *
 * Tracks all emotional intelligence state across the conversation.
 */
export interface EQRuntimeState {
  archetype: StudentArchetype | "unknown";
  stage: SessionStage;
  anxietyLevel: "low" | "medium" | "high";
  confidenceSignal: number; // cumulative confidence score
  lastDirectives: StyleDirectives | null;
  messageCountInStage: number;
  totalMessages: number;
  sessionStartTime: number; // timestamp
  confidenceHistory: number[]; // recent deltas
}

/**
 * EQ Runtime
 *
 * Main class for managing real-time EQ state and directive computation.
 *
 * Usage:
 * ```typescript
 * const runtime = new EQRuntime();
 *
 * // On each student message:
 * runtime.updateFromStudentMessage(message);
 *
 * // Before generating response:
 * const directives = runtime.computeDirectives(baseStyle);
 * ```
 */
export class EQRuntime {
  private state: EQRuntimeState;

  constructor() {
    this.state = {
      archetype: "unknown",
      stage: "opening",
      anxietyLevel: "medium",
      confidenceSignal: 0,
      lastDirectives: null,
      messageCountInStage: 0,
      totalMessages: 0,
      sessionStartTime: Date.now(),
      confidenceHistory: []
    };

    console.log("[EQRuntime] Initialized runtime state");
  }

  /**
   * Update From Student Message
   *
   * Processes a student message to update all EQ state:
   * - Archetype detection
   * - Anxiety level inference
   * - Confidence signal tracking
   * - Session stage progression
   *
   * Call this BEFORE generating the agent's response.
   *
   * @param msg - Student message text
   */
  updateFromStudentMessage(msg: string): void {
    console.log(`[EQRuntime] Processing student message (${msg.length} chars)`);

    // 1. Update archetype if detected
    const detectedArchetype = inferArchetype(msg);
    if (detectedArchetype) {
      console.log(`[EQRuntime] Archetype detected: ${detectedArchetype}`);
      this.state.archetype = detectedArchetype;
    }

    // 2. Update anxiety level (heuristic-based)
    this.updateAnxietyLevel(msg);

    // 3. Update confidence signals
    const confidenceDelta = computeConfidenceDelta(msg);
    if (confidenceDelta !== 0) {
      this.state.confidenceSignal += confidenceDelta;
      this.state.confidenceHistory.push(confidenceDelta);
      // Keep only last 10 deltas
      if (this.state.confidenceHistory.length > 10) {
        this.state.confidenceHistory.shift();
      }
      console.log(
        `[EQRuntime] Confidence delta: ${confidenceDelta > 0 ? "+" : ""}${confidenceDelta} (total: ${this.state.confidenceSignal})`
      );
    }

    // 4. Update session stage
    const previousStage = this.state.stage;
    const newStage = detectSessionStage(msg, this.state.stage);

    if (newStage !== previousStage) {
      console.log(`[EQRuntime] Stage transition: ${previousStage} → ${newStage}`);
      this.state.stage = newStage;
      this.state.messageCountInStage = 0;
    } else {
      this.state.messageCountInStage++;

      // Check if we should force stage advancement
      if (shouldForceStageAdvancement(this.state.stage, this.state.messageCountInStage)) {
        const nextStage = this.getNextStage();
        if (nextStage) {
          console.log(
            `[EQRuntime] Forced stage advancement: ${this.state.stage} → ${nextStage} (${this.state.messageCountInStage} messages)`
          );
          this.state.stage = nextStage;
          this.state.messageCountInStage = 0;
        }
      }
    }

    this.state.totalMessages++;
  }

  /**
   * Compute Directives
   *
   * Computes dynamic EQ curve directives based on current state.
   *
   * Takes base style directives and applies EQ curve modulation to
   * create final directives for the response.
   *
   * Call this AFTER updateFromStudentMessage and BEFORE LLM generation.
   *
   * @param base - Base style directives
   * @returns Adjusted style directives with EQ curve applied
   */
  computeDirectives(base: StyleDirectives): StyleDirectives {
    console.log(
      `[EQRuntime] Computing directives for stage=${this.state.stage}, archetype=${this.state.archetype}`
    );

    // Build curve parameters
    const params: EQCurveParams = {
      stage: this.state.stage,
      archetype:
        this.state.archetype === "unknown"
          ? "underdog-high-ceiling" // default archetype
          : this.state.archetype,
      anxietyLevel: this.state.anxietyLevel,
      confidenceSignals: this.state.confidenceSignal
    };

    // Compute dynamic curve
    const adjusted = computeDynamicEQCurve(base, params);
    this.state.lastDirectives = adjusted;

    console.log(
      `[EQRuntime] Directives: warmth=${adjusted.warmthLevel}, empathy=${adjusted.empathyLevel}, firmness=${adjusted.firmnessLevel}`
    );

    return adjusted;
  }

  /**
   * Get State
   *
   * Returns current EQ runtime state.
   *
   * Useful for debugging, telemetry, and UI display.
   *
   * @returns Current runtime state
   */
  getState(): EQRuntimeState {
    return { ...this.state };
  }

  /**
   * Get Session Duration
   *
   * Returns elapsed time since session start in minutes.
   *
   * @returns Minutes elapsed
   */
  getSessionDuration(): number {
    const elapsed = Date.now() - this.state.sessionStartTime;
    return Math.floor(elapsed / 60000); // Convert ms to minutes
  }

  /**
   * Get Confidence Level
   *
   * Returns current confidence level category.
   *
   * @returns Confidence level
   */
  getConfidenceLevel(): "very-low" | "low" | "medium" | "high" | "very-high" {
    return classifyConfidenceLevel(this.state.confidenceSignal);
  }

  /**
   * Reset
   *
   * Resets runtime state to initial values.
   *
   * Use when starting a new conversation session.
   */
  reset(): void {
    this.state = {
      archetype: "unknown",
      stage: "opening",
      anxietyLevel: "medium",
      confidenceSignal: 0,
      lastDirectives: null,
      messageCountInStage: 0,
      totalMessages: 0,
      sessionStartTime: Date.now(),
      confidenceHistory: []
    };

    console.log("[EQRuntime] Reset to initial state");
  }

  /**
   * Update Anxiety Level (Private)
   *
   * Heuristic-based anxiety detection from message content.
   */
  private updateAnxietyLevel(msg: string): void {
    const m = msg.toLowerCase();

    // High anxiety signals
    if (
      m.includes("idk") ||
      m.includes("i don't know") ||
      m.includes("overwhelmed") ||
      m.includes("panic") ||
      m.includes("freaking out") ||
      m.includes("so stressed") ||
      m.includes("can't handle")
    ) {
      this.state.anxietyLevel = "high";
      console.log("[EQRuntime] Anxiety level: high");
      return;
    }

    // Low anxiety signals
    if (
      m.includes("easy") ||
      m.includes("done already") ||
      m.includes("no problem") ||
      m.includes("confident") ||
      m.includes("got this") ||
      m.includes("ready")
    ) {
      this.state.anxietyLevel = "low";
      console.log("[EQRuntime] Anxiety level: low");
      return;
    }

    // Default to medium if no clear signal
    if (this.state.anxietyLevel !== "medium") {
      this.state.anxietyLevel = "medium";
      console.log("[EQRuntime] Anxiety level: medium (default)");
    }
  }

  /**
   * Get Next Stage (Private)
   *
   * Returns the next stage after current stage, or null if at end.
   */
  private getNextStage(): SessionStage | null {
    const order: SessionStage[] = [
      "opening",
      "rapport-building",
      "diagnostic-probing",
      "analysis",
      "strategy-reveal",
      "motivation",
      "closing"
    ];

    const currentIndex = order.indexOf(this.state.stage);
    if (currentIndex === -1 || currentIndex === order.length - 1) {
      return null;
    }

    return order[currentIndex + 1];
  }
}

/**
 * Build Style Overlay
 *
 * Converts StyleDirectives into a prompt overlay for LLM injection.
 *
 * This text is injected into the LLM prompt to ensure the generated
 * response matches the computed emotional directives.
 *
 * @param style - Style directives from EQ curve
 * @returns Prompt overlay text
 */
export function buildStyleOverlay(style: StyleDirectives): string {
  return `
### STYLE OVERRIDE (GENERATED BY EQ CURVE ENGINE)
Warmth: ${style.warmthLevel}
Empathy: ${style.empathyLevel}
Cheer: ${style.cheerLevel}
Firmness: ${style.firmnessLevel}
Pace: ${style.paceLevel}
Intensity: ${style.intensityLevel}

Please adapt your tone dynamically to match these emotional settings precisely.
- Warmth ${style.warmthLevel}: ${getWarmthGuidance(style.warmthLevel)}
- Empathy ${style.empathyLevel}: ${getEmpathyGuidance(style.empathyLevel)}
- Firmness ${style.firmnessLevel}: ${getFirmnessGuidance(style.firmnessLevel)}
- Pace ${style.paceLevel}: ${getPaceGuidance(style.paceLevel)}
`;
}

function getWarmthGuidance(level: "low" | "medium" | "high"): string {
  if (level === "high") return "Be very warm, welcoming, and friendly";
  if (level === "medium") return "Be moderately warm and professional";
  return "Be neutral and task-focused";
}

function getEmpathyGuidance(level: "low" | "medium" | "high"): string {
  if (level === "high") return "Show deep understanding and validation of emotions";
  if (level === "medium") return "Acknowledge emotions when relevant";
  return "Focus on facts and actions, minimal emotional reflection";
}

function getFirmnessGuidance(level: "low" | "medium" | "high"): string {
  if (level === "high") return "Be direct, assertive, and reality-grounded";
  if (level === "medium") return "Balance directness with gentleness";
  return "Be soft, gentle, and tentative with feedback";
}

function getPaceGuidance(pace: "slow" | "normal" | "fast"): string {
  if (pace === "slow") return "Take your time, use shorter sentences, pause for reflection";
  if (pace === "normal") return "Use natural conversational pacing";
  return "Be concise and energetic, move quickly through points";
}
