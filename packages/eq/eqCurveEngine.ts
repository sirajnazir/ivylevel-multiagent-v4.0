/**
 * EQ Curve Engine v4.0
 *
 * Dynamic emotional intelligence curve over session duration.
 *
 * Purpose: Jenny never speaks with the same energy for 60 minutes.
 * She curves through different emotional modes based on:
 * - Session stage (opening → probing → analysis → motivation → closing)
 * - Student archetype (anxious achiever vs overconfident vs low-confidence)
 * - Real-time anxiety levels
 * - Confidence signals
 * - Conversation momentum
 *
 * This is emotional jazz improvisation with guardrails.
 *
 * Instead of flat, pancake-flat EQ, you get:
 * Warm → Curious → Probing → Analytical → Strategic → Motivational → Grounding → Encouraging
 */

import { StyleDirectives } from "./styleMixer";
import { StudentArchetype } from "./archetypeModel";
import { SessionStage } from "./sessionStageModel";

/**
 * EQ Curve Parameters
 *
 * Input parameters for computing the dynamic EQ curve.
 */
export interface EQCurveParams {
  stage: SessionStage; // Where we are in the session
  archetype: StudentArchetype; // What type of student
  anxietyLevel: "low" | "medium" | "high"; // Current anxiety state
  confidenceSignals: number; // Student confidence (-10 to +10)
}

/**
 * Compute Dynamic EQ Curve
 *
 * Main function that adjusts base EQ directives based on session context.
 *
 * This creates the "emotional arc" of the conversation by modulating
 * warmth, empathy, firmness, cheer, pace, and intensity based on:
 * 1. Session stage progression
 * 2. Student archetype needs
 * 3. Real-time anxiety levels
 * 4. Confidence signals
 *
 * @param base - Base style directives (from mood vector)
 * @param params - Curve parameters (stage, archetype, anxiety, confidence)
 * @returns Adjusted style directives with curve applied
 */
export function computeDynamicEQCurve(
  base: StyleDirectives,
  params: EQCurveParams
): StyleDirectives {
  console.log(
    `[EQCurve] Computing curve for stage=${params.stage}, archetype=${params.archetype}, anxiety=${params.anxietyLevel}, confidence=${params.confidenceSignals}`
  );

  // Start with a copy of base directives
  let adjusted: StyleDirectives = { ...base };

  // Layer 1: Session stage modulation (PRIMARY - sets the emotional arc)
  // This is the dominant layer that establishes session flow
  adjusted = applyStageModulation(adjusted, params.stage);

  // Layer 2: Anxiety modulation (OVERRIDE - real-time emotional state)
  // High anxiety overrides everything for safety
  adjusted = applyAnxietyModulation(adjusted, params.anxietyLevel);

  // Layer 3: Archetype modulation (NUDGE - student-specific adjustments)
  // Only applies if not already covered by stage/anxiety
  adjusted = applyArchetypeNudge(adjusted, params.archetype);

  // Layer 4: Confidence signals adjustment (FINE-TUNE - based on signals)
  adjusted = applyConfidenceModulation(adjusted, params.confidenceSignals);

  // Layer 5: Safety clamping (ensure all values are valid)
  adjusted = clampAllLevels(adjusted);

  console.log(
    `[EQCurve] Adjusted: warmth=${adjusted.warmthLevel}, firmness=${adjusted.firmnessLevel}, empathy=${adjusted.empathyLevel}`
  );

  return adjusted;
}

/**
 * Apply Stage Modulation
 *
 * Modulates EQ based on session stage to create emotional arc.
 *
 * Stage Flow:
 * - opening: High warmth, high empathy, slow pace (build safety)
 * - rapport-building: High warmth, normal pace (establish trust)
 * - diagnostic-probing: Medium firmness, normal pace (ask hard questions)
 * - analysis: High firmness, fast pace, high intensity (sharp thinking)
 * - strategy-reveal: Medium warmth, high cheer (present insights optimistically)
 * - motivation: High warmth, high cheer, high empathy (rally energy)
 * - closing: High warmth, slow pace (send off strong)
 */
function applyStageModulation(directives: StyleDirectives, stage: SessionStage): StyleDirectives {
  const adjusted = { ...directives };

  switch (stage) {
    case "opening":
      // Warm welcome, set safety
      adjusted.warmthLevel = "high";
      adjusted.empathyLevel = "high";
      adjusted.paceLevel = "slow";
      adjusted.firmnessLevel = "low";
      break;

    case "rapport-building":
      // Build trust, get comfortable
      adjusted.warmthLevel = "high";
      adjusted.empathyLevel = "high";
      adjusted.cheerLevel = "medium";
      adjusted.paceLevel = "normal";
      break;

    case "diagnostic-probing":
      // Ask probing questions
      adjusted.firmnessLevel = "medium";
      adjusted.empathyLevel = "medium";
      adjusted.paceLevel = "normal";
      adjusted.intensityLevel = "medium";
      break;

    case "analysis":
      // Sharp, critical thinking
      adjusted.firmnessLevel = "high";
      adjusted.warmthLevel = "medium";
      adjusted.intensityLevel = "high";
      adjusted.paceLevel = "fast";
      break;

    case "strategy-reveal":
      // Present insights optimistically
      adjusted.warmthLevel = "medium";
      adjusted.cheerLevel = "high";
      adjusted.empathyLevel = "medium";
      adjusted.firmnessLevel = "medium";
      break;

    case "motivation":
      // Rally energy, inspire
      adjusted.warmthLevel = "high";
      adjusted.cheerLevel = "high";
      adjusted.empathyLevel = "high";
      adjusted.firmnessLevel = "medium";
      break;

    case "closing":
      // Wrap up, send off strong
      adjusted.warmthLevel = "high";
      adjusted.cheerLevel = "medium";
      adjusted.paceLevel = "slow";
      adjusted.empathyLevel = "medium";
      break;
  }

  return adjusted;
}

/**
 * Apply Archetype Nudge
 *
 * Applies archetype-specific adjustments that don't override stage requirements.
 * This is a "nudge" not a full replacement - it elevates/reduces levels
 * based on archetype needs without destroying the stage-based emotional arc.
 *
 * Archetypes:
 * - low-confidence-builder: Boost empathy and cheer, reduce firmness
 * - high-achiever-anxious: Boost empathy, maintain balance
 * - overconfident-spiky: Boost firmness, reduce empathy
 * - late-starter: Boost warmth and cheer
 * - underdog-high-ceiling: Boost both warmth AND firmness (belief + push)
 */
function applyArchetypeNudge(
  directives: StyleDirectives,
  archetype: StudentArchetype
): StyleDirectives {
  const adjusted = { ...directives };

  switch (archetype) {
    case "low-confidence-builder":
      // Boost empathy and cheer, soften firmness
      if (adjusted.empathyLevel !== "high") {
        adjusted.empathyLevel = elevateLevel(adjusted.empathyLevel);
      }
      if (adjusted.cheerLevel !== "high") {
        adjusted.cheerLevel = elevateLevel(adjusted.cheerLevel);
      }
      if (adjusted.firmnessLevel !== "low") {
        adjusted.firmnessLevel = reduceLevel(adjusted.firmnessLevel);
      }
      break;

    case "high-achiever-anxious":
      // Boost empathy while maintaining other dimensions
      if (adjusted.empathyLevel !== "high") {
        adjusted.empathyLevel = elevateLevel(adjusted.empathyLevel);
      }
      break;

    case "overconfident-spiky":
      // Boost firmness, reduce empathy (unless already adjusted by stage)
      if (adjusted.firmnessLevel !== "high") {
        adjusted.firmnessLevel = elevateLevel(adjusted.firmnessLevel);
      }
      if (adjusted.empathyLevel === "high" || adjusted.empathyLevel === "medium") {
        adjusted.empathyLevel = reduceLevel(adjusted.empathyLevel);
      }
      break;

    case "late-starter":
      // Boost warmth and cheer for encouragement
      if (adjusted.warmthLevel !== "high") {
        adjusted.warmthLevel = elevateLevel(adjusted.warmthLevel);
      }
      if (adjusted.cheerLevel === "low") {
        adjusted.cheerLevel = "medium";
      }
      break;

    case "underdog-high-ceiling":
      // Boost both warmth AND firmness (belief + push)
      if (adjusted.warmthLevel !== "high") {
        adjusted.warmthLevel = elevateLevel(adjusted.warmthLevel);
      }
      if (adjusted.firmnessLevel !== "high") {
        adjusted.firmnessLevel = elevateLevel(adjusted.firmnessLevel);
      }
      break;
  }

  return adjusted;
}

/**
 * Apply Anxiety Modulation
 *
 * Adjusts EQ based on real-time anxiety levels.
 *
 * High anxiety: Max warmth, max empathy, low firmness, slow pace (soothing)
 * Medium anxiety: Balanced empathy
 * Low anxiety: Can push harder
 */
function applyAnxietyModulation(
  directives: StyleDirectives,
  anxietyLevel: "low" | "medium" | "high"
): StyleDirectives {
  const adjusted = { ...directives };

  if (anxietyLevel === "high") {
    // Student is highly anxious - soothe and slow down
    adjusted.warmthLevel = "high";
    adjusted.empathyLevel = "high";
    adjusted.firmnessLevel = "low";
    adjusted.paceLevel = "slow";
    adjusted.intensityLevel = "low";
  } else if (anxietyLevel === "medium") {
    // Moderate anxiety - balance
    adjusted.empathyLevel = elevateLevel(adjusted.empathyLevel);
  }
  // Low anxiety - no special modulation needed

  return adjusted;
}

/**
 * Apply Confidence Modulation
 *
 * Adjusts EQ based on confidence signals (-10 to +10).
 *
 * Low confidence (<-5): Max empathy, low firmness, high cheer
 * High confidence (>5): High firmness, high intensity, push harder
 * Balanced (-5 to 5): No special modulation
 */
function applyConfidenceModulation(
  directives: StyleDirectives,
  confidenceSignals: number
): StyleDirectives {
  const adjusted = { ...directives };

  if (confidenceSignals < -5) {
    // Very low confidence - boost and support
    adjusted.empathyLevel = "high";
    adjusted.firmnessLevel = "low";
    adjusted.cheerLevel = elevateLevel(adjusted.cheerLevel);
  } else if (confidenceSignals > 5) {
    // High confidence - can push harder
    adjusted.firmnessLevel = "high";
    adjusted.intensityLevel = "high";
  }
  // Balanced confidence - no special modulation

  return adjusted;
}

/**
 * Clamp All Levels
 *
 * Ensures all directive levels are valid.
 * Safety function to prevent invalid states.
 */
function clampAllLevels(directives: StyleDirectives): StyleDirectives {
  return {
    warmthLevel: clampLevel(directives.warmthLevel),
    empathyLevel: clampLevel(directives.empathyLevel),
    firmnessLevel: clampLevel(directives.firmnessLevel),
    cheerLevel: clampLevel(directives.cheerLevel),
    paceLevel: clampPace(directives.paceLevel),
    intensityLevel: clampLevel(directives.intensityLevel)
  };
}

/**
 * Clamp Level
 *
 * Ensures level is one of: low, medium, high.
 */
function clampLevel(level: any): "low" | "medium" | "high" {
  const allowed = ["low", "medium", "high"];
  return allowed.includes(level) ? level : "medium";
}

/**
 * Clamp Pace
 *
 * Ensures pace is one of: slow, normal, fast.
 */
function clampPace(pace: any): "slow" | "normal" | "fast" {
  const allowed = ["slow", "normal", "fast"];
  return allowed.includes(pace) ? pace : "normal";
}

/**
 * Elevate Level
 *
 * Increases a level by one step (low → medium → high).
 * Useful for applying boosts.
 */
function elevateLevel(level: "low" | "medium" | "high"): "low" | "medium" | "high" {
  if (level === "low") return "medium";
  if (level === "medium") return "high";
  return "high"; // Already at max
}

/**
 * Reduce Level
 *
 * Decreases a level by one step (high → medium → low).
 * Useful for applying reductions.
 */
function reduceLevel(level: "low" | "medium" | "high"): "low" | "medium" | "high" {
  if (level === "high") return "medium";
  if (level === "medium") return "low";
  return "low"; // Already at min
}

/**
 * Get Curve Summary
 *
 * Returns a human-readable summary of the curve adjustments.
 *
 * @param base - Base directives before curve
 * @param adjusted - Adjusted directives after curve
 * @param params - Curve parameters
 * @returns Summary string
 */
export function getCurveSummary(
  base: StyleDirectives,
  adjusted: StyleDirectives,
  params: EQCurveParams
): string {
  const changes: string[] = [];

  if (base.warmthLevel !== adjusted.warmthLevel) {
    changes.push(`warmth: ${base.warmthLevel} → ${adjusted.warmthLevel}`);
  }
  if (base.empathyLevel !== adjusted.empathyLevel) {
    changes.push(`empathy: ${base.empathyLevel} → ${adjusted.empathyLevel}`);
  }
  if (base.firmnessLevel !== adjusted.firmnessLevel) {
    changes.push(`firmness: ${base.firmnessLevel} → ${adjusted.firmnessLevel}`);
  }
  if (base.cheerLevel !== adjusted.cheerLevel) {
    changes.push(`cheer: ${base.cheerLevel} → ${adjusted.cheerLevel}`);
  }
  if (base.paceLevel !== adjusted.paceLevel) {
    changes.push(`pace: ${base.paceLevel} → ${adjusted.paceLevel}`);
  }
  if (base.intensityLevel !== adjusted.intensityLevel) {
    changes.push(`intensity: ${base.intensityLevel} → ${adjusted.intensityLevel}`);
  }

  if (changes.length === 0) {
    return "No curve adjustments applied (base directives unchanged)";
  }

  return `EQ Curve (stage=${params.stage}, archetype=${params.archetype}): ${changes.join(", ")}`;
}
