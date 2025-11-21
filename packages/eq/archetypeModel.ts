/**
 * Student Archetype Model v4.0
 *
 * Defines the 5 core student archetypes that require different coaching approaches.
 *
 * These are NOT personality types - they're coaching intervention profiles
 * based on confidence, skill, and behavioral patterns.
 */

/**
 * Student Archetype
 *
 * The 5 core student profiles Jenny encounters.
 */
export type StudentArchetype =
  | "low-confidence-builder" // Low confidence, needs validation and scaffolding
  | "high-achiever-anxious" // High performing but paralyzed by perfectionism
  | "overconfident-spiky" // Overestimates ability, needs reality checks
  | "late-starter" // Behind but motivated, needs urgency + encouragement
  | "underdog-high-ceiling"; // Underestimated potential, needs belief + push

/**
 * Archetype Descriptions
 *
 * Clinical descriptions of each archetype.
 */
export const ARCHETYPE_DESCRIPTIONS: Record<StudentArchetype, string> = {
  "low-confidence-builder":
    "Student lacks confidence despite having real ability. Needs high warmth, high empathy, low firmness. Focus on small wins and scaffolded growth.",
  "high-achiever-anxious":
    "High performer paralyzed by perfectionism and anxiety. Needs empathy + grounding. Help them see 'good enough' vs 'perfect'.",
  "overconfident-spiky":
    "Overestimates abilities, resistant to feedback. Needs high firmness, low empathy initially. Reality checks with care.",
  "late-starter":
    "Behind peers but motivated to catch up. Needs urgency + encouragement. Balance honesty about gaps with belief in capacity.",
  "underdog-high-ceiling":
    "Underestimated potential (often FGLI, URM, non-traditional). Needs belief + push. Show them what's possible."
};

/**
 * Archetype EQ Needs
 *
 * Default EQ parameters for each archetype.
 */
export const ARCHETYPE_EQ_NEEDS: Record<
  StudentArchetype,
  {
    warmth: "low" | "medium" | "high";
    empathy: "low" | "medium" | "high";
    firmness: "low" | "medium" | "high";
    cheer: "low" | "medium" | "high";
  }
> = {
  "low-confidence-builder": {
    warmth: "high",
    empathy: "high",
    firmness: "low",
    cheer: "high"
  },
  "high-achiever-anxious": {
    warmth: "high",
    empathy: "high",
    firmness: "medium",
    cheer: "medium"
  },
  "overconfident-spiky": {
    warmth: "medium",
    empathy: "low",
    firmness: "high",
    cheer: "low"
  },
  "late-starter": {
    warmth: "high",
    empathy: "medium",
    firmness: "medium",
    cheer: "high"
  },
  "underdog-high-ceiling": {
    warmth: "high",
    empathy: "medium",
    firmness: "high",
    cheer: "high"
  }
};

/**
 * Get Archetype EQ Needs
 *
 * Returns the default EQ parameters for an archetype.
 *
 * @param archetype - Student archetype
 * @returns EQ needs object
 */
export function getArchetypeEQNeeds(archetype: StudentArchetype) {
  return ARCHETYPE_EQ_NEEDS[archetype];
}

/**
 * Detect Archetype From Signals
 *
 * Heuristic archetype detection from EQ signals and behavioral patterns.
 *
 * @param signals - Observed signals
 * @returns Most likely archetype
 */
export function detectArchetypeFromSignals(signals: {
  confidenceLevel: number; // -10 to +10
  anxietyLevel: "low" | "medium" | "high";
  resistanceSignals: number; // 0-10
  motivationLevel: "low" | "medium" | "high";
  performanceGap: "ahead" | "on-track" | "behind";
}): StudentArchetype {
  const { confidenceLevel, anxietyLevel, resistanceSignals, motivationLevel, performanceGap } =
    signals;

  // Overconfident + resistant = overconfident-spiky
  if (confidenceLevel > 5 && resistanceSignals > 5) {
    return "overconfident-spiky";
  }

  // High anxiety + high confidence = high-achiever-anxious
  if (anxietyLevel === "high" && confidenceLevel > 0) {
    return "high-achiever-anxious";
  }

  // Low confidence = low-confidence-builder
  if (confidenceLevel < -3) {
    return "low-confidence-builder";
  }

  // Behind + motivated = late-starter
  if (performanceGap === "behind" && motivationLevel === "high") {
    return "late-starter";
  }

  // Default: underdog-high-ceiling (most students)
  return "underdog-high-ceiling";
}

/**
 * Get Archetype Coaching Tips
 *
 * Returns coaching tips for working with each archetype.
 *
 * @param archetype - Student archetype
 * @returns Array of coaching tips
 */
export function getArchetypeCoachingTips(archetype: StudentArchetype): string[] {
  const tips: Record<StudentArchetype, string[]> = {
    "low-confidence-builder": [
      "Lead with validation before any feedback",
      "Point out micro-wins and small progress",
      "Use scaffolding: break tasks into tiny steps",
      "Avoid overwhelming with too many improvements",
      "Celebrate effort, not just outcomes"
    ],
    "high-achiever-anxious": [
      "Normalize imperfection and 'good enough'",
      "Reframe anxiety as sign of caring (not weakness)",
      "Give permission to deprioritize low-impact tasks",
      "Challenge catastrophic thinking gently",
      "Model self-compassion in your language"
    ],
    "overconfident-spiky": [
      "Start with respect for their confidence",
      "Present reality checks as data, not judgment",
      "Ask Socratic questions vs telling",
      "Let natural consequences do the teaching",
      "Don't over-validate; they don't need it"
    ],
    "late-starter": [
      "Be honest about gaps without shame",
      "Show belief in their capacity to catch up",
      "Create urgency without panic",
      "Focus on highest-leverage actions only",
      "Celebrate speed of progress, not just level"
    ],
    "underdog-high-ceiling": [
      "Paint vision of what's possible for them",
      "Call out underestimation patterns directly",
      "Push harder than they expect",
      "Celebrate identity ('you're the type who...')",
      "Don't over-explain; treat them as capable"
    ]
  };

  return tips[archetype];
}

/**
 * Compare Archetypes
 *
 * Returns how different two archetypes are (0-1, where 1 = totally different).
 *
 * @param a - First archetype
 * @param b - Second archetype
 * @returns Difference score (0-1)
 */
export function compareArchetypes(a: StudentArchetype, b: StudentArchetype): number {
  if (a === b) return 0;

  const needsA = ARCHETYPE_EQ_NEEDS[a];
  const needsB = ARCHETYPE_EQ_NEEDS[b];

  let differences = 0;
  const dims: Array<keyof typeof needsA> = ["warmth", "empathy", "firmness", "cheer"];

  for (const dim of dims) {
    if (needsA[dim] !== needsB[dim]) {
      differences++;
    }
  }

  return differences / dims.length;
}
