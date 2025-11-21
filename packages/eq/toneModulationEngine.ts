/**
 * Tone Modulation Layer v4.0
 *
 * "Micro-moves decide what, tone modulation decides how."
 *
 * This layer takes three inputs:
 * 1. Archetype Profile - Student type determines Jenny's stance
 * 2. EQ State - Dynamic emotional signals from last message
 * 3. Micro-Coaching Move - The coaching intervention being deployed
 *
 * And produces a Tone Directive with:
 * - warmth level
 * - directness
 * - assertiveness
 * - pacing
 * - specificity
 * - word choice profile
 * - signature Jenny markers
 *
 * Purpose: Force stylistic alignment so the agent sounds like Jenny,
 * adapts to student archetype, responds to moment-to-moment EQ signals,
 * and adjusts for the coaching move being deployed.
 *
 * All deterministic. No LLM required.
 */

import { CoachingMove } from "./microCoachingEngine";
import { EQRuntimeState } from "../agents/assessment-agent/src/eqRuntime";

/**
 * Student Archetype Types
 *
 * Each archetype requires a different coaching stance.
 */
export type ArchetypeType =
  | "HighAchiever"
  | "AnxiousPerfectionist"
  | "UnfocusedExplorer"
  | "ReluctantPragmatist"
  | "OverscheduledOverachiever"
  | "QuietDeepThinker"
  | "Unknown";

/**
 * Archetype Profile
 *
 * Minimal representation of student archetype for tone modulation.
 */
export interface ArchetypeProfile {
  type: ArchetypeType;
  confidence?: number; // 0-1
}

/**
 * EQ State for Tone Modulation
 *
 * Simplified EQ signals needed for tone adjustment.
 */
export interface EQStateForTone {
  valence: number; // -1 (negative) to +1 (positive)
  activation: "low" | "medium" | "high"; // Energy level
  cognitiveLoad: "low" | "medium" | "high"; // Mental overwhelm
  vulnerability: boolean; // Student showing emotional vulnerability
  safetySignals: boolean; // Student feels safe to share
}

/**
 * Tone Directive
 *
 * The output that guides LLM response styling.
 */
export interface ToneDirective {
  warmth: number; // 0-10 (0=cold, 10=very warm)
  directness: number; // 0-10 (0=indirect, 10=very direct)
  assertiveness: number; // 0-10 (0=passive, 10=very assertive)
  pacing: "slow" | "medium" | "fast";
  specificity: number; // 0-10 (0=vague, 10=very specific)
  styleMarkers: string[]; // Linguistic fingerprints
  rationale: string; // Explanation of tone choices
}

/**
 * Tone Modulation Engine
 *
 * Main class for computing tone directives based on archetype, EQ, and coaching move.
 *
 * Usage:
 * ```typescript
 * const toneEngine = new ToneModulationEngine();
 *
 * const directive = toneEngine.modulate(archetypeProfile, eqState, coachingMove);
 *
 * // Pass directive to LLM for stylistic alignment
 * ```
 */
export class ToneModulationEngine {
  constructor() {
    console.log("[ToneModulationEngine] Initialized");
  }

  /**
   * Modulate
   *
   * Computes tone directive based on three inputs:
   * 1. Student archetype (baseline tone)
   * 2. EQ state (emotional adjustments)
   * 3. Coaching move (move-specific adjustments)
   *
   * Process:
   * 1. Start with archetype baseline
   * 2. Adjust for EQ state (emotion, cognitive load, vulnerability)
   * 3. Adjust for coaching move (affirm, challenge, etc.)
   * 4. Normalize ranges and return
   *
   * @param archetype - Student archetype profile
   * @param eq - Current EQ state
   * @param move - Coaching move being deployed
   * @returns Tone directive
   */
  modulate(
    archetype: ArchetypeProfile,
    eq: EQStateForTone,
    move: CoachingMove
  ): ToneDirective {
    console.log(
      `[ToneModulationEngine] Modulating tone: archetype=${archetype.type}, move=${move}`
    );

    // Step 1: Archetype baseline
    const base = this.baseToneForArchetype(archetype);

    // Step 2: EQ adjustments
    const adjusted = this.adjustForEQ(base, eq);

    // Step 3: Move adjustments
    const final = this.adjustForMove(adjusted, move);

    console.log(
      `[ToneModulationEngine] Final tone: warmth=${final.warmth}, directness=${final.directness}, assertiveness=${final.assertiveness}, pacing=${final.pacing}`
    );

    return final;
  }

  /**
   * Base Tone For Archetype (Private)
   *
   * Determines baseline tone based on student archetype.
   *
   * Each archetype requires a different coaching stance:
   * - HighAchiever: Efficient, precise, challenge-forward
   * - AnxiousPerfectionist: Warm, steady, grounding
   * - UnfocusedExplorer: Playful structure + motivational nudges
   * - ReluctantPragmatist: Practical, low-fluff, respect autonomy
   * - OverscheduledOverachiever: Empathetic + boundaries + clarity
   * - QuietDeepThinker: Reflective, slower pacing, more mirroring
   *
   * @param arc - Archetype profile
   * @returns Base tone directive
   */
  private baseToneForArchetype(arc: ArchetypeProfile): ToneDirective {
    switch (arc.type) {
      case "HighAchiever":
        return {
          warmth: 4,
          directness: 9,
          assertiveness: 7,
          pacing: "fast",
          specificity: 9,
          styleMarkers: ["crisp", "solution-forward", "performance-oriented"],
          rationale: "High achiever baseline: efficient, precise"
        };

      case "AnxiousPerfectionist":
        return {
          warmth: 9,
          directness: 5,
          assertiveness: 4,
          pacing: "slow",
          specificity: 6,
          styleMarkers: ["soft edges", "grounding phrases", "validation-first"],
          rationale: "Anxious perfectionist: high warmth, low threat"
        };

      case "UnfocusedExplorer":
        return {
          warmth: 7,
          directness: 6,
          assertiveness: 5,
          pacing: "medium",
          specificity: 5,
          styleMarkers: ["curiosity-led", "gentle structure"],
          rationale: "Explorer: lighten the cognitive load"
        };

      case "ReluctantPragmatist":
        return {
          warmth: 5,
          directness: 8,
          assertiveness: 6,
          pacing: "medium",
          specificity: 8,
          styleMarkers: ["respect autonomy", "practicality"],
          rationale: "Pragmatist: respect boundaries, aim for utility"
        };

      case "OverscheduledOverachiever":
        return {
          warmth: 8,
          directness: 7,
          assertiveness: 4,
          pacing: "slow",
          specificity: 7,
          styleMarkers: ["acknowledge load", "relieve pressure"],
          rationale: "Overscheduled: reduce friction + stress"
        };

      case "QuietDeepThinker":
        return {
          warmth: 7,
          directness: 4,
          assertiveness: 3,
          pacing: "slow",
          specificity: 9,
          styleMarkers: ["reflective", "thought-partner"],
          rationale: "Deep thinker: slower pacing + conceptual space"
        };

      default:
        return {
          warmth: 6,
          directness: 6,
          assertiveness: 5,
          pacing: "medium",
          specificity: 6,
          styleMarkers: ["balanced"],
          rationale: "Default tone"
        };
    }
  }

  /**
   * Adjust For EQ (Private)
   *
   * Modulates tone based on emotional state signals.
   *
   * Adjustments:
   * - Negative valence → Increase warmth, decrease assertiveness, slow pacing
   * - High cognitive load → Increase specificity, decrease directness, slow pacing
   * - High activation → Increase pacing, increase directness
   * - Vulnerability → Increase warmth, decrease assertiveness, slow pacing
   *
   * @param base - Base tone directive
   * @param eq - EQ state
   * @returns Adjusted tone directive
   */
  private adjustForEQ(base: ToneDirective, eq: EQStateForTone): ToneDirective {
    const out = { ...base };

    // Emotional valence: -1 (negative) → +1 (positive)
    if (eq.valence < 0) {
      out.warmth += 2;
      out.assertiveness -= 1;
      out.pacing = "slow";
      out.styleMarkers = [...out.styleMarkers, "emotional-safety"];
      out.rationale += " | EQ-adjust: student distressed";
      console.log("[ToneModulationEngine] EQ adjust: negative valence detected");
    }

    // Cognitive Load High
    if (eq.cognitiveLoad === "high") {
      out.specificity = Math.min(10, out.specificity + 2);
      out.directness -= 1;
      out.pacing = "slow";
      out.styleMarkers = [...out.styleMarkers, "reduce-information-density"];
      out.rationale += " | EQ-adjust: cognitive load high";
      console.log("[ToneModulationEngine] EQ adjust: high cognitive load");
    }

    // High activation (excited, energized)
    if (eq.activation === "high") {
      out.pacing = "fast";
      out.directness += 1;
      out.styleMarkers = [...out.styleMarkers, "momentum-matching"];
      out.rationale += " | EQ-adjust: match student energy";
      console.log("[ToneModulationEngine] EQ adjust: high activation");
    }

    // Vulnerability detected
    if (eq.vulnerability) {
      out.warmth = Math.min(10, out.warmth + 3);
      out.assertiveness = Math.max(0, out.assertiveness - 2);
      out.pacing = "slow";
      out.styleMarkers = [...out.styleMarkers, "warm-grounding"];
      out.rationale += " | EQ-adjust: vulnerability detected";
      console.log("[ToneModulationEngine] EQ adjust: vulnerability detected");
    }

    return out;
  }

  /**
   * Adjust For Move (Private)
   *
   * Modulates tone based on coaching move being deployed.
   *
   * Each move requires specific tone adjustments:
   * - Affirm: Increase warmth
   * - Reframe: Increase directness and specificity
   * - Challenge: Increase assertiveness and directness
   * - Motivate: Increase warmth and assertiveness
   * - Accountability: Increase directness and assertiveness
   * - Anchor: Increase specificity
   * - Mirror: Slow pacing
   * - Breaker: Fast pacing, increase directness
   *
   * @param base - Base tone directive
   * @param move - Coaching move
   * @returns Adjusted tone directive
   */
  private adjustForMove(base: ToneDirective, move: CoachingMove): ToneDirective {
    const out = { ...base };

    switch (move) {
      case "affirm":
        out.warmth += 2;
        out.styleMarkers = [...out.styleMarkers, "validation"];
        out.rationale += " | Move: affirm";
        break;

      case "reframe":
        out.directness += 2;
        out.specificity += 2;
        out.styleMarkers = [...out.styleMarkers, "clarity-blade"];
        out.rationale += " | Move: reframe";
        break;

      case "challenge":
        out.assertiveness += 3;
        out.directness += 1;
        out.styleMarkers = [...out.styleMarkers, "gentle-push"];
        out.rationale += " | Move: challenge";
        break;

      case "motivate":
        out.warmth += 1;
        out.assertiveness += 1;
        out.styleMarkers = [...out.styleMarkers, "spark"];
        out.rationale += " | Move: motivate";
        break;

      case "accountability":
        out.directness += 3;
        out.assertiveness += 2;
        out.styleMarkers = [...out.styleMarkers, "firm-kind"];
        out.rationale += " | Move: accountability";
        break;

      case "anchor":
        out.specificity += 3;
        out.styleMarkers = [...out.styleMarkers, "vision-link"];
        out.rationale += " | Move: anchor";
        break;

      case "mirror":
        out.pacing = "slow";
        out.styleMarkers = [...out.styleMarkers, "reflective-tone"];
        out.rationale += " | Move: mirror";
        break;

      case "breaker":
        out.pacing = "fast";
        out.directness += 2;
        out.styleMarkers = [...out.styleMarkers, "pattern-interrupt"];
        out.rationale += " | Move: breaker";
        break;

      case "none":
        // No adjustments for none
        break;
    }

    // Normalize ranges to 0-10
    out.warmth = Math.min(10, Math.max(0, out.warmth));
    out.directness = Math.min(10, Math.max(0, out.directness));
    out.assertiveness = Math.min(10, Math.max(0, out.assertiveness));
    out.specificity = Math.min(10, Math.max(0, out.specificity));

    return out;
  }

  /**
   * Get State
   *
   * Returns current engine state (currently stateless).
   *
   * @returns Engine state
   */
  getState() {
    return {
      initialized: true
    };
  }
}

/**
 * Convert EQRuntimeState To EQStateForTone
 *
 * Helper to convert full EQ runtime state to simplified tone state.
 *
 * @param eq - EQ runtime state
 * @returns EQ state for tone modulation
 */
export function convertEQStateForTone(eq: EQRuntimeState): EQStateForTone {
  // Convert anxiety level to valence
  let valence = 0;
  if (eq.anxietyLevel === "high") valence = -0.5;
  else if (eq.anxietyLevel === "medium") valence = 0;
  else valence = 0.3;

  // Convert confidence signal to activation
  let activation: "low" | "medium" | "high" = "medium";
  if (eq.confidenceSignal > 3) activation = "high";
  else if (eq.confidenceSignal < -3) activation = "low";

  // Infer cognitive load from stage and message count
  let cognitiveLoad: "low" | "medium" | "high" = "medium";
  if (eq.stage === "diagnostic-probing" || eq.stage === "analysis") {
    cognitiveLoad = "high";
  } else if (eq.stage === "opening" || eq.stage === "closing") {
    cognitiveLoad = "low";
  }

  // Vulnerability based on confidence and anxiety
  const vulnerability = eq.confidenceSignal < -5 || eq.anxietyLevel === "high";

  // Safety signals based on confidence
  const safetySignals = eq.confidenceSignal > 0;

  return {
    valence,
    activation,
    cognitiveLoad,
    vulnerability,
    safetySignals
  };
}

/**
 * Convert Archetype String To Profile
 *
 * Helper to convert archetype string to profile.
 *
 * @param archetype - Archetype string from EQ runtime
 * @returns Archetype profile
 */
export function convertArchetypeToProfile(
  archetype: string
): ArchetypeProfile {
  // Map EQ runtime archetypes to tone modulation archetypes
  const mapping: Record<string, ArchetypeType> = {
    "high-achiever-anxious": "HighAchiever",
    "low-confidence-builder": "AnxiousPerfectionist",
    "overconfident-spiky": "ReluctantPragmatist",
    "late-starter": "UnfocusedExplorer",
    "underdog-high-ceiling": "QuietDeepThinker",
    "unknown": "Unknown"
  };

  return {
    type: mapping[archetype] || "Unknown",
    confidence: 0.5
  };
}

/**
 * Build Tone Hints
 *
 * Converts tone directive into LLM-friendly hints.
 *
 * These hints guide the LLM to apply the specified tone.
 *
 * @param directive - Tone directive
 * @returns Hint text for LLM
 */
export function buildToneHints(directive: ToneDirective): string {
  const hints: string[] = [];

  hints.push("→ TONE DIRECTIVE:");
  hints.push(`   Warmth: ${directive.warmth}/10 (${getWarmthLabel(directive.warmth)})`);
  hints.push(
    `   Directness: ${directive.directness}/10 (${getDirectnessLabel(directive.directness)})`
  );
  hints.push(
    `   Assertiveness: ${directive.assertiveness}/10 (${getAssertivenessLabel(directive.assertiveness)})`
  );
  hints.push(`   Pacing: ${directive.pacing}`);
  hints.push(`   Specificity: ${directive.specificity}/10 (${getSpecificityLabel(directive.specificity)})`);

  if (directive.styleMarkers.length > 0) {
    hints.push(`   Style Markers: ${directive.styleMarkers.join(", ")}`);
  }

  hints.push(`   Rationale: ${directive.rationale}`);

  return hints.join("\n");
}

/**
 * Get Warmth Label (Private Helper)
 */
function getWarmthLabel(warmth: number): string {
  if (warmth >= 8) return "very warm";
  if (warmth >= 6) return "warm";
  if (warmth >= 4) return "neutral";
  if (warmth >= 2) return "cool";
  return "cold";
}

/**
 * Get Directness Label (Private Helper)
 */
function getDirectnessLabel(directness: number): string {
  if (directness >= 8) return "very direct";
  if (directness >= 6) return "direct";
  if (directness >= 4) return "moderate";
  if (directness >= 2) return "indirect";
  return "very indirect";
}

/**
 * Get Assertiveness Label (Private Helper)
 */
function getAssertivenessLabel(assertiveness: number): string {
  if (assertiveness >= 8) return "very assertive";
  if (assertiveness >= 6) return "assertive";
  if (assertiveness >= 4) return "moderate";
  if (assertiveness >= 2) return "gentle";
  return "passive";
}

/**
 * Get Specificity Label (Private Helper)
 */
function getSpecificityLabel(specificity: number): string {
  if (specificity >= 8) return "very specific";
  if (specificity >= 6) return "specific";
  if (specificity >= 4) return "moderate";
  if (specificity >= 2) return "general";
  return "vague";
}

/**
 * Get Tone Summary
 *
 * Returns human-readable summary of tone directive.
 *
 * @param directive - Tone directive
 * @returns Summary string
 */
export function getToneSummary(directive: ToneDirective): string {
  const parts: string[] = [];

  parts.push(`Warmth: ${directive.warmth}`);
  parts.push(`Direct: ${directive.directness}`);
  parts.push(`Assert: ${directive.assertiveness}`);
  parts.push(`Pace: ${directive.pacing}`);
  parts.push(`Specific: ${directive.specificity}`);

  return parts.join(" | ");
}
