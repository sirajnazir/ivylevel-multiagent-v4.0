/**
 * Adaptive Micro-Coaching Moves Engine v4.0
 *
 * The signature IVYLEVEL spark: micro-moves that feel human, intentional, and transformational.
 *
 * This engine decides, turn-by-turn, which micro coaching pattern to deploy:
 * 1. Affirmation / Praise - When student shows vulnerability, clarity, or progress
 * 2. Reframe / Clarify - When student shows confusion, overwhelm, negative framing
 * 3. Challenge / Push - When student is playing small, avoiding, or deflecting
 * 4. Motivational Micro-Ping - Small confidence sparks
 * 5. Accountability Nudge - Soft but firm commitment-seeking
 * 6. Anchor to Goal / Vision - Tie back to long-term objectives
 * 7. Pattern Recognition Mirror - Reflect patterns student may not see
 * 8. Stuck State Breaker Move - Pattern interrupt when student loops
 *
 * Purpose: Make the agent feel alive - warm when needed, challenging when appropriate,
 * motivational without being cringe, protective without being condescending,
 * and absolutely laser-focused on outcomes.
 *
 * All deterministic. No LLM required.
 */

import { MomentumState } from "./momentumEngine";
import { EQRuntimeState } from "../agents/assessment-agent/src/eqRuntime";

/**
 * Coaching Move Types
 *
 * Each move represents a distinct coaching intervention pattern.
 */
export type CoachingMove =
  | "affirm" // Affirmation / Praise
  | "reframe" // Reframe / Clarify
  | "challenge" // Challenge / Push
  | "motivate" // Motivational Micro-Ping
  | "accountability" // Accountability Nudge
  | "anchor" // Anchor to Goal / Vision
  | "mirror" // Pattern Recognition Mirror
  | "breaker" // Stuck State Breaker Move
  | "none"; // No special move needed

/**
 * Coaching Directive
 *
 * The output of the micro-coaching engine evaluation.
 */
export interface CoachingDirective {
  move: CoachingMove;
  rationale: string;
  intensity?: "light" | "medium" | "strong"; // How strongly to apply the move
  context?: string; // Additional context for the move
}

/**
 * Patterns that can be detected in student behavior
 */
export interface StudentPatterns {
  repetition?: boolean; // Student repeating same points
  looping?: boolean; // Student stuck in cognitive loop
  avoidance?: boolean; // Student avoiding commitment
  vulnerability?: boolean; // Student showing emotional honesty
  confusion?: boolean; // Student expressing confusion
  goalTalk?: boolean; // Student talking about future goals
}

/**
 * Vulnerability Patterns
 *
 * Phrases indicating emotional honesty or vulnerability.
 */
const VULNERABILITY_PATTERNS = [
  "i feel",
  "i'm worried",
  "i'm scared",
  "i'm anxious",
  "i'm nervous",
  "i'm not sure",
  "i don't know",
  "i'm afraid",
  "honestly",
  "to be honest",
  "truth is",
  "i'm struggling",
  "this is hard"
];

/**
 * Confusion Patterns
 *
 * Phrases indicating cognitive overload or ambiguity.
 */
const CONFUSION_PATTERNS = [
  "confused",
  "overwhelmed",
  "stuck",
  "lost",
  "don't understand",
  "not sure what",
  "how do i",
  "where do i start",
  "too much",
  "complicated"
];

/**
 * Avoidance Patterns
 *
 * Phrases indicating non-commitment or deflection.
 */
const AVOIDANCE_PATTERNS = [
  "maybe",
  "i'll try",
  "someday",
  "later",
  "eventually",
  "hopefully",
  "might",
  "probably",
  "if i can",
  "we'll see"
];

/**
 * Goal/Vision Patterns
 *
 * Phrases referencing future aspirations.
 */
const GOAL_PATTERNS = [
  "goal",
  "dream",
  "college",
  "university",
  "future",
  "vision",
  "want to",
  "hope to",
  "aspire",
  "ambition",
  "career",
  "major"
];

/**
 * Progress Patterns
 *
 * Phrases indicating achievement or forward movement.
 */
const PROGRESS_PATTERNS = [
  "i did",
  "i finished",
  "i completed",
  "i achieved",
  "i got",
  "i made",
  "i improved",
  "i worked on",
  "i figured out",
  "i understand now"
];

/**
 * Playing Small Patterns
 *
 * Phrases indicating self-limitation or low ambition.
 */
const PLAYING_SMALL_PATTERNS = [
  "just a",
  "only a",
  "not that good",
  "probably not",
  "i can't",
  "too hard",
  "impossible",
  "never",
  "no way",
  "settle for"
];

/**
 * Micro-Coaching Engine
 *
 * Main class for determining which coaching move to deploy.
 *
 * Usage:
 * ```typescript
 * const coach = new MicroCoachingEngine();
 *
 * // On each student message:
 * const directive = coach.evaluate(message, momentumState, eqState);
 *
 * // Use directive to guide LLM response:
 * if (directive.move === "affirm") {
 *   // Generate affirming response
 * }
 * ```
 */
export class MicroCoachingEngine {
  private messageHistory: string[] = [];
  private lastMove: CoachingMove = "none";
  private moveCounter: Map<CoachingMove, number> = new Map();

  constructor() {
    console.log("[MicroCoachingEngine] Initialized");
  }

  /**
   * Evaluate
   *
   * Analyzes current message and context to determine which coaching move to deploy.
   *
   * Priority order:
   * 1. Breaker - highest priority when student is looping
   * 2. Affirm - recognize vulnerability and progress
   * 3. Reframe - clarify confusion
   * 4. Challenge - push when playing small
   * 5. Motivate - boost energy when dipping
   * 6. Accountability - nudge on avoidance
   * 7. Anchor - connect to vision
   * 8. Mirror - reflect patterns
   *
   * @param message - Student message text
   * @param momentum - Current momentum state
   * @param eq - Current EQ runtime state
   * @returns Coaching directive
   */
  evaluate(
    message: string,
    momentum: MomentumState,
    eq: EQRuntimeState
  ): CoachingDirective {
    const msg = message.toLowerCase().trim();

    console.log(`[MicroCoachingEngine] Evaluating message (${message.length} chars)`);

    // Track message history for pattern detection
    this.messageHistory.push(msg);
    if (this.messageHistory.length > 10) {
      this.messageHistory.shift();
    }

    // Detect patterns
    const patterns = this.detectPatterns(msg);

    // Priority 1: Breaker - stuck state / cognitive loop
    if (this.isLooping() || patterns.looping) {
      return this.recordMove({
        move: "breaker",
        rationale: "Student in cognitive loop; trigger pattern interrupt",
        intensity: "strong",
        context: "Repetitive language or circular thinking detected"
      });
    }

    // Priority 2: Affirm - vulnerability or progress
    if (patterns.vulnerability) {
      return this.recordMove({
        move: "affirm",
        rationale: "Student shows emotional honesty or vulnerability",
        intensity: momentum.momentumScore < 40 ? "strong" : "medium",
        context: "Validate feeling while maintaining forward motion"
      });
    }

    const hasProgress = this.containsAny(msg, PROGRESS_PATTERNS);
    if (hasProgress) {
      return this.recordMove({
        move: "affirm",
        rationale: "Student sharing progress or achievement",
        intensity: "medium",
        context: "Recognize effort and build momentum"
      });
    }

    // Priority 3: Reframe - confusion or overwhelm
    if (patterns.confusion) {
      return this.recordMove({
        move: "reframe",
        rationale: "Student indicates cognitive overload or ambiguity",
        intensity: momentum.focusLost ? "strong" : "medium",
        context: "Simplify and provide structure"
      });
    }

    // Priority 4: Challenge - playing small or high momentum but superficial
    const playingSmall = this.containsAny(msg, PLAYING_SMALL_PATTERNS);
    if (playingSmall) {
      return this.recordMove({
        move: "challenge",
        rationale: "Student self-limiting or playing small",
        intensity: eq.anxietyLevel === "high" ? "light" : "medium",
        context: "Push boundaries without triggering anxiety"
      });
    }

    if (momentum.trend === "up" && msg.length < 60 && !momentum.disengaged) {
      return this.recordMove({
        move: "challenge",
        rationale: "Student engaged but superficial; push for depth",
        intensity: "light",
        context: "Ask probing question to deepen engagement"
      });
    }

    // Priority 5: Motivate - momentum dipping
    if (momentum.trend === "down" || momentum.momentumScore < 40) {
      return this.recordMove({
        move: "motivate",
        rationale: "Energy is dipping; give a momentum spark",
        intensity: momentum.momentumScore < 30 ? "strong" : "medium",
        context: "Inject enthusiasm and confidence boost"
      });
    }

    // Priority 6: Accountability - avoidance patterns
    if (patterns.avoidance) {
      return this.recordMove({
        move: "accountability",
        rationale: "Student is avoiding commitment; nudge lightly",
        intensity: eq.archetype === "low-confidence-builder" ? "light" : "medium",
        context: "Seek concrete commitment without pressure"
      });
    }

    // Priority 7: Anchor - goal talk
    if (patterns.goalTalk) {
      return this.recordMove({
        move: "anchor",
        rationale: "Student referencing their future; anchor to long-term vision",
        intensity: "medium",
        context: "Connect current actions to future aspirations"
      });
    }

    // Priority 8: Mirror - pattern recognition
    if (patterns.repetition && this.messageHistory.length >= 3) {
      return this.recordMove({
        move: "mirror",
        rationale: "Student repeating themselves; reflect pattern",
        intensity: "light",
        context: "Gently point out pattern without judgment"
      });
    }

    // Default: No special move
    console.log("[MicroCoachingEngine] No special coaching move needed");
    return this.recordMove({
      move: "none",
      rationale: "Conversation flowing naturally; no intervention needed"
    });
  }

  /**
   * Detect Patterns (Private)
   *
   * Analyzes message for behavioral patterns.
   *
   * @param msg - Lowercase message text
   * @returns Detected patterns
   */
  private detectPatterns(msg: string): StudentPatterns {
    return {
      vulnerability: this.containsAny(msg, VULNERABILITY_PATTERNS),
      confusion: this.containsAny(msg, CONFUSION_PATTERNS),
      avoidance: this.containsAny(msg, AVOIDANCE_PATTERNS),
      goalTalk: this.containsAny(msg, GOAL_PATTERNS),
      repetition: this.isRepetitive(),
      looping: this.isLooping()
    };
  }

  /**
   * Contains Any (Private)
   *
   * Checks if message contains any of the given patterns.
   *
   * @param msg - Lowercase message text
   * @param patterns - Array of pattern strings
   * @returns True if any pattern matches
   */
  private containsAny(msg: string, patterns: string[]): boolean {
    return patterns.some((p) => msg.includes(p));
  }

  /**
   * Is Repetitive (Private)
   *
   * Detects if student is repeating similar content.
   *
   * @returns True if repetition detected
   */
  private isRepetitive(): boolean {
    if (this.messageHistory.length < 3) return false;

    const recent = this.messageHistory.slice(-3);
    const last = recent[recent.length - 1];

    // Check if last message has significant overlap with previous 2
    let overlapCount = 0;
    for (let i = 0; i < recent.length - 1; i++) {
      const words = recent[i].split(" ");
      const matchingWords = words.filter((w) => w.length > 4 && last.includes(w));
      if (matchingWords.length >= 3) {
        overlapCount++;
      }
    }

    return overlapCount >= 1; // At least 1 overlapping message
  }

  /**
   * Is Looping (Private)
   *
   * Detects if student is stuck in cognitive loop.
   *
   * @returns True if looping detected
   */
  private isLooping(): boolean {
    if (this.messageHistory.length < 4) return false;

    const recent = this.messageHistory.slice(-4);

    // Check for circular patterns: same key phrases appearing 3+ times
    const keyPhrases: Map<string, number> = new Map();

    recent.forEach((msg) => {
      const words = msg.split(" ");
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        if (words[i].length > 3 && words[i + 1].length > 3) {
          keyPhrases.set(phrase, (keyPhrases.get(phrase) || 0) + 1);
        }
      }
    });

    // If any phrase appears 3+ times, it's a loop
    for (const count of keyPhrases.values()) {
      if (count >= 3) {
        console.log("[MicroCoachingEngine] Cognitive loop detected");
        return true;
      }
    }

    return false;
  }

  /**
   * Record Move (Private)
   *
   * Records the selected move and returns directive.
   *
   * @param directive - Coaching directive
   * @returns Same directive
   */
  private recordMove(directive: CoachingDirective): CoachingDirective {
    this.lastMove = directive.move;
    this.moveCounter.set(directive.move, (this.moveCounter.get(directive.move) || 0) + 1);

    console.log(
      `[MicroCoachingEngine] Move: ${directive.move} (${directive.intensity || "default"}) - ${directive.rationale}`
    );

    return directive;
  }

  /**
   * Get Move Frequency
   *
   * Returns how many times each move has been used.
   *
   * @returns Map of moves to counts
   */
  getMoveFrequency(): Map<CoachingMove, number> {
    return new Map(this.moveCounter);
  }

  /**
   * Get Last Move
   *
   * Returns the most recently selected move.
   *
   * @returns Last coaching move
   */
  getLastMove(): CoachingMove {
    return this.lastMove;
  }

  /**
   * Get State
   *
   * Returns current coaching engine state.
   *
   * @returns Engine state
   */
  getState() {
    return {
      lastMove: this.lastMove,
      moveFrequency: Object.fromEntries(this.moveCounter),
      messageHistoryLength: this.messageHistory.length
    };
  }

  /**
   * Reset
   *
   * Resets coaching engine to initial state.
   *
   * Use when starting a new conversation session.
   */
  reset(): void {
    this.messageHistory = [];
    this.lastMove = "none";
    this.moveCounter.clear();

    console.log("[MicroCoachingEngine] Reset to initial state");
  }
}

/**
 * Build Coaching Hints
 *
 * Converts coaching directive into LLM-friendly hints.
 *
 * These hints guide the LLM to apply the selected coaching move.
 *
 * @param directive - Coaching directive
 * @returns Hint text for LLM
 */
export function buildCoachingHints(directive: CoachingDirective): string {
  const hints: string[] = [];

  hints.push(`→ COACHING MOVE: ${directive.move.toUpperCase()}`);
  hints.push(`   Rationale: ${directive.rationale}`);

  if (directive.intensity) {
    hints.push(`   Intensity: ${directive.intensity}`);
  }

  if (directive.context) {
    hints.push(`   Context: ${directive.context}`);
  }

  // Add specific guidance for each move
  switch (directive.move) {
    case "affirm":
      hints.push("   → Validate their feeling or progress");
      hints.push("   → Be warm and genuine, not generic");
      hints.push("   → Connect affirmation to forward momentum");
      break;

    case "reframe":
      hints.push("   → Simplify the complexity");
      hints.push("   → Offer a clearer mental model");
      hints.push("   → Break overwhelm into manageable pieces");
      break;

    case "challenge":
      hints.push("   → Push them to think bigger");
      hints.push("   → Ask probing questions");
      hints.push("   → Challenge assumptions without attacking confidence");
      break;

    case "motivate":
      hints.push("   → Inject energy and enthusiasm");
      hints.push("   → Share a confidence spark");
      hints.push("   → Remind them of their strengths");
      break;

    case "accountability":
      hints.push("   → Seek concrete commitment");
      hints.push("   → Ask for specific next steps");
      hints.push("   → Be soft but firm - no pressure, just clarity");
      break;

    case "anchor":
      hints.push("   → Connect current moment to future vision");
      hints.push("   → Remind them why this matters");
      hints.push("   → Make the long-term goal feel real and achievable");
      break;

    case "mirror":
      hints.push("   → Reflect the pattern you're noticing");
      hints.push("   → Do it gently, without judgment");
      hints.push("   → Help them see what they might not see");
      break;

    case "breaker":
      hints.push("   → Break the pattern interrupt the loop");
      hints.push("   → Shift perspective dramatically");
      hints.push("   → Ask a totally different question");
      break;

    case "none":
      // No special guidance - natural flow
      break;
  }

  return hints.join("\n");
}

/**
 * Get Coaching Summary
 *
 * Returns human-readable summary of coaching state.
 *
 * @param directive - Coaching directive
 * @returns Summary string
 */
export function getCoachingSummary(directive: CoachingDirective): string {
  const parts: string[] = [];

  parts.push(`Move: ${directive.move}`);

  if (directive.intensity) {
    parts.push(`Intensity: ${directive.intensity}`);
  }

  parts.push(`Reason: ${directive.rationale}`);

  return parts.join(" | ");
}
