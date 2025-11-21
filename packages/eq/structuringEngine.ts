/**
 * Conversational Structuring Engine v4.0
 *
 * Makes conversations feel intentional, guided, and expertly coached.
 *
 * This engine:
 * - Detects topic drift
 * - Inserts checkpoints ("let's pause and summarize")
 * - Performs micro-summaries
 * - Maintains a running agenda
 * - Detects completion of mini-sections
 * - Guides to the next structured step
 * - Adjusts for EQ + Momentum state
 *
 * Purpose: Transform the conversation from "AI improv" to structured
 * coaching session with clear progression and intentional flow.
 *
 * All deterministic. No LLM required.
 */

import { MomentumState } from "./momentumEngine";
import { EQRuntimeState } from "../agents/assessment-agent/src/eqRuntime";

/**
 * Structuring Directives
 *
 * Instructions for how to structure the next response.
 */
export interface StructuringDirectives {
  shouldSummarize: boolean; // Trigger micro-summary
  shouldCheckpoint: boolean; // Insert checkpoint ("let's pause")
  nextTopicHint?: string; // Suggested next topic
  driftDetected: boolean; // Student has drifted off-topic
  agendaProgress: number; // Progress through agenda (0-100)
  agendaStep: string; // Current step in agenda
  sectionComplete: boolean; // Current section appears complete
  needsRerail: boolean; // Needs to guide back to agenda
}

/**
 * Topic Keywords
 *
 * Keywords that indicate each topic area.
 */
const TOPIC_KEYWORDS = {
  intro: ["hi", "hello", "hey", "help", "start", "begin"],
  academics: [
    "gpa",
    "grades",
    "courses",
    "rigor",
    "ap",
    "ib",
    "math",
    "science",
    "sat",
    "act",
    "test scores",
    "transcript",
    "honors",
    "weighted"
  ],
  activities: [
    "club",
    "project",
    "volunteer",
    "leadership",
    "initiative",
    "startup",
    "extracurricular",
    "sport",
    "team",
    "organization",
    "president",
    "founder"
  ],
  narrative: [
    "story",
    "theme",
    "identity",
    "thread",
    "positioning",
    "passion",
    "interest",
    "why",
    "what drives",
    "care about"
  ],
  strategy: [
    "timeline",
    "summer",
    "strategy",
    "12-month",
    "plan",
    "next steps",
    "what should i do",
    "how do i",
    "recommendations"
  ],
  closing: ["thank", "thanks", "appreciate", "goodbye", "bye", "that's all", "got it"]
};

/**
 * Agenda Steps
 *
 * The structured flow of a coaching session.
 */
const AGENDA_STEPS = ["intro", "academics", "activities", "narrative", "strategy", "closing"];

/**
 * Structuring Engine
 *
 * Main class for managing conversation structure and flow.
 *
 * Usage:
 * ```typescript
 * const structuring = new StructuringEngine();
 *
 * // On each message:
 * const directives = structuring.evaluate(message, momentumState, eqState);
 *
 * // Use directives to shape response:
 * if (directives.shouldSummarize) {
 *   // Include summary in response
 * }
 * if (directives.driftDetected) {
 *   // Guide back to agenda
 * }
 * ```
 */
export class StructuringEngine {
  private agendaIndex: number = 0;
  private lastTopic: string | null = null;
  private driftCounter: number = 0;
  private messagesInCurrentStep: number = 0;
  private topicHistory: string[] = [];
  private sectionCompletionSignals: number = 0;

  constructor() {
    console.log("[StructuringEngine] Initialized at agenda step: intro");
  }

  /**
   * Evaluate
   *
   * Analyzes current message to determine structuring directives.
   *
   * Takes into account:
   * - Topic detection and drift
   * - Agenda progression
   * - Momentum state (for summaries)
   * - Message count in current step
   * - Completion signals
   *
   * @param message - Student message text
   * @param momentum - Current momentum state
   * @param eq - Current EQ runtime state
   * @returns Structuring directives
   */
  evaluate(
    message: string,
    momentum: MomentumState,
    eq: EQRuntimeState
  ): StructuringDirectives {
    const msg = message.toLowerCase();
    this.messagesInCurrentStep++;

    console.log(
      `[StructuringEngine] Evaluating message (step=${AGENDA_STEPS[this.agendaIndex]}, msg#=${this.messagesInCurrentStep})`
    );

    // 1. Detect current topic
    const currentTopic = this.detectTopic(msg);
    if (currentTopic) {
      this.topicHistory.push(currentTopic);
      // Keep only last 5 topics
      if (this.topicHistory.length > 5) {
        this.topicHistory.shift();
      }
    }

    // 2. Detect drift
    let driftDetected = false;
    if (currentTopic && this.lastTopic && currentTopic !== this.lastTopic) {
      // Check if returning to a topic from 2+ messages ago (getting back on track)
      // Don't count the last topic (that's the one we're changing from)
      const olderTopics = this.topicHistory.length >= 2 ? this.topicHistory.slice(0, -1) : [];
      const returningToOlderTopic = olderTopics.includes(currentTopic);

      if (returningToOlderTopic && this.driftCounter >= 2) {
        // Student getting back on track after drifting - reset drift
        this.driftCounter = 0;
        driftDetected = false;
        console.log(`[StructuringEngine] Student returning to earlier topic: ${currentTopic} (drift cleared)`);
      } else {
        this.driftCounter += 1;
        console.log(`[StructuringEngine] Topic shift: ${this.lastTopic} → ${currentTopic}`);

        // Drift = 2+ consecutive topic changes
        if (this.driftCounter >= 2) {
          driftDetected = true;
          console.log("[StructuringEngine] Drift detected!");
        }
      }
    } else if (currentTopic && currentTopic === this.lastTopic) {
      // Reset drift counter only when topic stays the same (student on-topic)
      this.driftCounter = 0;
    }
    // Don't reset if currentTopic is null - preserve drift counter

    // 3. Detect section completion signals
    const completionSignals = this.detectCompletionSignals(msg);
    if (completionSignals > 0) {
      this.sectionCompletionSignals += completionSignals;
    }

    const sectionComplete =
      this.sectionCompletionSignals >= 2 || this.messagesInCurrentStep >= 8;

    // 4. Advance agenda if appropriate
    const shouldAdvanceAgenda = this.shouldAdvanceAgenda(currentTopic, sectionComplete);
    if (shouldAdvanceAgenda && this.agendaIndex < AGENDA_STEPS.length - 1) {
      this.agendaIndex += 1;
      this.messagesInCurrentStep = 1; // Current message is first in new step
      this.sectionCompletionSignals = 0;
      // Don't reset drift counter - let it accumulate to detect rapid topic jumping
      console.log(`[StructuringEngine] Advanced to: ${AGENDA_STEPS[this.agendaIndex]}`);
    }

    this.lastTopic = currentTopic || this.lastTopic;

    // 5. Determine if summary needed
    const shouldSummarize =
      momentum.trend === "down" || // Momentum dropping
      driftDetected || // Drifted off topic
      (this.messagesInCurrentStep >= 6 && !sectionComplete) || // Long discussion without progress
      momentum.focusLost; // Student losing focus

    // 6. Determine if checkpoint needed
    const shouldCheckpoint =
      this.agendaIndex > 0 && // Not in intro
      (this.agendaIndex % 2 === 0 || // Every 2 steps
        sectionComplete); // Section just completed

    // 7. Determine next topic hint
    const nextTopicHint =
      this.agendaIndex < AGENDA_STEPS.length - 1
        ? AGENDA_STEPS[this.agendaIndex + 1]
        : undefined;

    // 8. Determine if needs re-rail
    const needsRerail = driftDetected || (this.driftCounter > 0 && momentum.disengaged);

    // 9. Calculate agenda progress
    const agendaProgress = Math.floor((this.agendaIndex / (AGENDA_STEPS.length - 1)) * 100);

    const directives: StructuringDirectives = {
      shouldSummarize,
      shouldCheckpoint,
      nextTopicHint,
      driftDetected,
      agendaProgress,
      agendaStep: AGENDA_STEPS[this.agendaIndex],
      sectionComplete,
      needsRerail
    };

    console.log(
      `[StructuringEngine] Directives: summarize=${shouldSummarize}, checkpoint=${shouldCheckpoint}, drift=${driftDetected}`
    );

    return directives;
  }

  /**
   * Detect Topic (Private)
   *
   * Determines which topic the message is about.
   * Prioritizes longer matches to avoid false positives (e.g., "helping" matching "help").
   *
   * @param msg - Lowercase message text
   * @returns Detected topic or null
   */
  private detectTopic(msg: string): string | null {
    let bestMatch: { topic: string; length: number } | null = null;

    for (const [topic, words] of Object.entries(TOPIC_KEYWORDS)) {
      for (const word of words) {
        if (msg.includes(word)) {
          // Prioritize longer matches
          if (!bestMatch || word.length > bestMatch.length) {
            bestMatch = { topic, length: word.length };
          }
        }
      }
    }

    return bestMatch ? bestMatch.topic : null;
  }

  /**
   * Detect Completion Signals (Private)
   *
   * Detects phrases that indicate a section is wrapping up.
   *
   * @param msg - Lowercase message text
   * @returns Number of completion signals detected
   */
  private detectCompletionSignals(msg: string): number {
    const completionPhrases = [
      "got it",
      "makes sense",
      "understand",
      "clear",
      "okay",
      "what's next",
      "next steps",
      "what should i do",
      "sounds good",
      "perfect"
    ];

    let count = 0;
    for (const phrase of completionPhrases) {
      if (msg.includes(phrase)) {
        count++;
      }
    }

    return count;
  }

  /**
   * Should Advance Agenda (Private)
   *
   * Determines if it's time to move to the next agenda step.
   *
   * @param currentTopic - Current detected topic
   * @param sectionComplete - Whether current section is complete
   * @returns True if should advance
   */
  private shouldAdvanceAgenda(currentTopic: string | null, sectionComplete: boolean): boolean {
    // Don't advance from intro until we detect academics
    if (this.agendaIndex === 0 && currentTopic === "academics") {
      return true;
    }

    // Don't advance from academics until we detect activities
    if (this.agendaIndex === 1 && currentTopic === "activities") {
      return true;
    }

    // Don't advance from activities until we detect narrative
    if (this.agendaIndex === 2 && currentTopic === "narrative") {
      return true;
    }

    // Don't advance from narrative until we detect strategy
    if (this.agendaIndex === 3 && currentTopic === "strategy") {
      return true;
    }

    // Advance from strategy to closing if section complete
    if (this.agendaIndex === 4 && sectionComplete) {
      return true;
    }

    // Advance if current topic matches next step
    const nextStep = AGENDA_STEPS[this.agendaIndex + 1];
    if (currentTopic === nextStep) {
      return true;
    }

    return false;
  }

  /**
   * Get State
   *
   * Returns current structuring state.
   *
   * @returns Structuring state object
   */
  getState() {
    return {
      agendaIndex: this.agendaIndex,
      agendaStep: AGENDA_STEPS[this.agendaIndex],
      lastTopic: this.lastTopic,
      driftCounter: this.driftCounter,
      messagesInCurrentStep: this.messagesInCurrentStep,
      topicHistory: [...this.topicHistory],
      sectionCompletionSignals: this.sectionCompletionSignals
    };
  }

  /**
   * Get Agenda Summary
   *
   * Returns human-readable agenda progress summary.
   *
   * @returns Summary string
   */
  getAgendaSummary(): string {
    const current = AGENDA_STEPS[this.agendaIndex];
    const total = AGENDA_STEPS.length;
    const progress = Math.floor((this.agendaIndex / (total - 1)) * 100);

    return `Step ${this.agendaIndex + 1}/${total}: ${current} (${progress}% complete)`;
  }

  /**
   * Force Advance Agenda
   *
   * Manually advances to next agenda step.
   *
   * Useful for testing or explicit flow control.
   */
  forceAdvanceAgenda(): void {
    if (this.agendaIndex < AGENDA_STEPS.length - 1) {
      this.agendaIndex++;
      this.messagesInCurrentStep = 0;
      this.sectionCompletionSignals = 0;
      console.log(`[StructuringEngine] Force advanced to: ${AGENDA_STEPS[this.agendaIndex]}`);
    }
  }

  /**
   * Reset
   *
   * Resets structuring engine to initial state.
   *
   * Use when starting a new conversation session.
   */
  reset(): void {
    this.agendaIndex = 0;
    this.lastTopic = null;
    this.driftCounter = 0;
    this.messagesInCurrentStep = 0;
    this.topicHistory = [];
    this.sectionCompletionSignals = 0;

    console.log("[StructuringEngine] Reset to initial state");
  }
}

/**
 * Build Structuring Hints
 *
 * Converts structuring directives into LLM-friendly hints.
 *
 * These hints are injected into the prompt to guide response structure.
 *
 * @param directives - Structuring directives
 * @returns Hint text for LLM
 */
export function buildStructuringHints(directives: StructuringDirectives): string {
  const hints: string[] = [];

  if (directives.shouldSummarize) {
    hints.push(
      "→ SUMMARIZE: Include a brief recap of what we've covered so far before continuing."
    );
  }

  if (directives.shouldCheckpoint) {
    hints.push(
      "→ CHECKPOINT: Pause and check in with the student. Ask if they're following and ready to move forward."
    );
  }

  if (directives.driftDetected) {
    hints.push(
      "→ DRIFT DETECTED: Student has wandered off-topic. Gently guide back to the current focus area."
    );
  }

  if (directives.needsRerail) {
    hints.push(
      "→ RE-RAIL: Acknowledge their point, then redirect to the structured agenda."
    );
  }

  if (directives.sectionComplete) {
    hints.push(
      "→ SECTION COMPLETE: This section appears done. Transition to the next topic smoothly."
    );
  }

  if (directives.nextTopicHint) {
    hints.push(`→ NEXT TOPIC: Prepare to guide towards ${directives.nextTopicHint}`);
  }

  hints.push(`→ AGENDA: Currently in '${directives.agendaStep}' (${directives.agendaProgress}%)`);

  return hints.join("\n");
}

/**
 * Get Structuring Summary
 *
 * Returns human-readable summary of structuring state.
 *
 * @param directives - Structuring directives
 * @returns Summary string
 */
export function getStructuringSummary(directives: StructuringDirectives): string {
  const parts: string[] = [];

  parts.push(`Agenda: ${directives.agendaStep} (${directives.agendaProgress}%)`);

  if (directives.shouldSummarize) parts.push("Summary needed");
  if (directives.shouldCheckpoint) parts.push("Checkpoint ready");
  if (directives.driftDetected) parts.push("Drift detected");
  if (directives.sectionComplete) parts.push("Section complete");
  if (directives.nextTopicHint) parts.push(`Next: ${directives.nextTopicHint}`);

  return parts.join(" | ");
}
