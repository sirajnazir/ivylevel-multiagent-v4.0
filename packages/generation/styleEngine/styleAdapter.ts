/**
 * Style Adapter v4.0
 *
 * Defines speaking tone + pacing rules from EQ Mode + Archetype.
 *
 * This is where we translate:
 * - EQ Mode (gentle/direct/motivational/mentor) → Tone directives
 * - Archetype (burnout/high_achiever/etc.) → Communication adjustments
 *
 * These directives get injected into the LLM prompt to control:
 * - Warmth level
 * - Directness
 * - Pacing
 * - Challenge intensity
 * - Reassurance frequency
 */

/**
 * Style Signal
 *
 * The output of the style adapter - a set of directives for the LLM.
 */
export interface StyleSignal {
  directives: string;
  metadata?: {
    eqMode: string;
    archetype: string;
    warmthLevel: number; // 0-1 scale
    directnessLevel: number; // 0-1 scale
    pacingSpeed: "slow" | "medium" | "fast";
  };
}

/**
 * Style Adapter
 *
 * Generates tone & pacing directives based on EQ mode and archetype.
 *
 * EQ Mode → Base Tone:
 * - gentle: High warmth, low challenge, slow pacing
 * - direct: Low warmth, high clarity, fast pacing
 * - motivational: High energy, forward momentum, medium pacing
 * - mentor: Balanced wisdom, calm authority, medium pacing
 *
 * Archetype → Adjustments:
 * - burnout: Reduce urgency, normalize setbacks, limit steps
 * - high_achiever: Increase rigor, competitive framing, stretch goals
 * - late_starter: Build confidence, break down complexity, celebrate progress
 * - quiet_builder: Respect introspection, deep frameworks, patient guidance
 * - explorer: Encourage curiosity, multiple paths, open-ended questions
 *
 * @param eqMode - The emotional intelligence mode
 * @param archetype - The student archetype
 * @returns Style signal with directives
 */
export function styleAdapter(eqMode: string, archetype: string): StyleSignal {
  console.log(`[StyleAdapter] Adapting style for EQ:${eqMode}, Archetype:${archetype}`);

  let directives = "";
  let warmthLevel = 0.5;
  let directnessLevel = 0.5;
  let pacingSpeed: "slow" | "medium" | "fast" = "medium";

  // EQ MODE DIRECTIVES
  if (eqMode === "gentle") {
    directives += `
## GENTLE MODE DIRECTIVES
- Start with emotional mirroring ("I get it", "I hear you", "That makes sense")
- Soften directness, avoid overwhelming detail
- Validate feelings before giving instruction
- Use reassuring language ("You're not behind", "This is completely normal")
- Pause for breath between points
- Keep step count low (2-3 max)
- Frame challenges as "we'll figure this out together"`;

    warmthLevel = 0.9;
    directnessLevel = 0.3;
    pacingSpeed = "slow";

    console.log(`[StyleAdapter] Gentle mode: warmth=0.9, directness=0.3, pacing=slow`);
  }

  if (eqMode === "direct") {
    directives += `
## DIRECT MODE DIRECTIVES
- Skip emotional padding, get straight to the point
- Use crisp, direct instructions ("Here's what you need to do")
- Keep sentences concise and forward-moving
- Prioritize clarity over comfort
- Use numbered steps for tactical breakdown
- Frame as "Here's the reality" not "I'm sorry but"
- Cut filler words and throat-clearing`;

    warmthLevel = 0.3;
    directnessLevel = 0.9;
    pacingSpeed = "fast";

    console.log(`[StyleAdapter] Direct mode: warmth=0.3, directness=0.9, pacing=fast`);
  }

  if (eqMode === "motivational") {
    directives += `
## MOTIVATIONAL MODE DIRECTIVES
- Use energizing language and upward framing ("You can absolutely do this")
- Highlight strengths before weaknesses
- Use short, dynamic phrases ("Let's make this happen", "You're ready")
- Build momentum with action-oriented language
- Frame setbacks as temporary and surmountable
- Use confident, forward-leaning tone
- Inject optimism without toxicity`;

    warmthLevel = 0.7;
    directnessLevel = 0.6;
    pacingSpeed = "medium";

    console.log(`[StyleAdapter] Motivational mode: warmth=0.7, directness=0.6, pacing=medium`);
  }

  if (eqMode === "mentor") {
    directives += `
## MENTOR MODE DIRECTIVES
- Speak with calm, seasoned authority ("Here's what I've seen work")
- Blend story-like reasoning with actionable insights
- Use reflective but confident tone
- Share frameworks and principles, not just tactics
- Ask thoughtful questions to surface insights
- Balance "I'll guide you" with "You'll figure this out"
- Use metaphors and analogies for deeper understanding`;

    warmthLevel = 0.6;
    directnessLevel = 0.5;
    pacingSpeed = "medium";

    console.log(`[StyleAdapter] Mentor mode: warmth=0.6, directness=0.5, pacing=medium`);
  }

  // ARCHETYPE ADJUSTMENTS
  if (archetype === "burnout") {
    directives += `

## BURNOUT ARCHETYPE ADJUSTMENTS
- Reduce urgency in language ("No rush", "Take your time")
- Normalize setbacks ("This is completely expected")
- Limit step count to avoid overload (2 steps max)
- Emphasize rest and recovery as strategic
- Remove competitive framing entirely
- Focus on sustainable momentum, not sprints
- Validate exhaustion without dwelling on it`;

    warmthLevel = Math.min(warmthLevel + 0.2, 1.0);
    directnessLevel = Math.max(directnessLevel - 0.2, 0.1);
    pacingSpeed = "slow";

    console.log(`[StyleAdapter] Burnout adjustments: +warmth, -directness, slow pacing`);
  }

  if (archetype === "high_achiever") {
    directives += `

## HIGH ACHIEVER ARCHETYPE ADJUSTMENTS
- Lean into rigor and precision
- Use competitive framing ("Top students do this")
- Provide stretch goals and challenge-level guidance
- Respect their drive, don't soften unnecessarily
- Use data and benchmarks ("Here's what a 4.0 GPA with 12 APs looks like")
- Frame as optimization, not fixing
- Acknowledge their capability upfront`;

    directnessLevel = Math.min(directnessLevel + 0.2, 1.0);
    pacingSpeed = "fast";

    console.log(`[StyleAdapter] High achiever adjustments: +directness, fast pacing`);
  }

  if (archetype === "late_starter") {
    directives += `

## LATE STARTER ARCHETYPE ADJUSTMENTS
- Build confidence before challenge
- Break down complexity into digestible pieces
- Celebrate progress explicitly ("You're further than you think")
- Remove shame around starting late
- Frame as "plenty of time" not "need to catch up"
- Use encouraging, patient tone
- Focus on next step, not full roadmap`;

    warmthLevel = Math.min(warmthLevel + 0.1, 1.0);
    pacingSpeed = "slow";

    console.log(`[StyleAdapter] Late starter adjustments: +warmth, slow pacing`);
  }

  if (archetype === "quiet_builder") {
    directives += `

## QUIET BUILDER ARCHETYPE ADJUSTMENTS
- Respect introspection and depth
- Focus on frameworks and principles over hype
- Use calm, thoughtful language
- Avoid performative enthusiasm
- Emphasize substance over flash
- Give space for reflection
- Trust their ability to process deeply`;

    warmthLevel = Math.max(warmthLevel - 0.1, 0.2);
    pacingSpeed = "medium";

    console.log(`[StyleAdapter] Quiet builder adjustments: -warmth (more authentic), medium pacing`);
  }

  if (archetype === "explorer") {
    directives += `

## EXPLORER ARCHETYPE ADJUSTMENTS
- Encourage curiosity and multiple paths
- Use open-ended questions ("What excites you about this?")
- Frame as discovery, not prescription
- Avoid rigid step-by-step unless requested
- Celebrate exploration and experimentation
- Balance openness with structure
- Help them see connections across domains`;

    warmthLevel = Math.min(warmthLevel + 0.1, 1.0);

    console.log(`[StyleAdapter] Explorer adjustments: +warmth, curiosity-driven`);
  }

  if (archetype === "uncertain") {
    directives += `

## UNCERTAIN ARCHETYPE ADJUSTMENTS
- Provide structure and clarity to reduce anxiety
- Use reassuring but actionable language
- Break decisions into smaller choices
- Normalize uncertainty ("Most students feel this way")
- Focus on next concrete step, not full path
- Balance empathy with gentle pushing forward`;

    warmthLevel = Math.min(warmthLevel + 0.15, 1.0);
    directnessLevel = Math.max(directnessLevel - 0.1, 0.2);

    console.log(`[StyleAdapter] Uncertain adjustments: +warmth, -directness`);
  }

  console.log(`[StyleAdapter] Final style: warmth=${warmthLevel.toFixed(2)}, directness=${directnessLevel.toFixed(2)}, pacing=${pacingSpeed}`);

  return {
    directives: directives.trim(),
    metadata: {
      eqMode,
      archetype,
      warmthLevel,
      directnessLevel,
      pacingSpeed
    }
  };
}

/**
 * Get Style Summary
 *
 * Returns human-readable summary of style directives.
 *
 * @param signal - Style signal
 * @returns Summary string
 */
export function getStyleSummary(signal: StyleSignal): string {
  if (!signal.metadata) {
    return "Style signal generated (no metadata)";
  }

  const { eqMode, archetype, warmthLevel, directnessLevel, pacingSpeed } = signal.metadata;

  return `Style Profile:
  EQ Mode: ${eqMode}
  Archetype: ${archetype}
  Warmth: ${(warmthLevel * 100).toFixed(0)}%
  Directness: ${(directnessLevel * 100).toFixed(0)}%
  Pacing: ${pacingSpeed}`;
}

/**
 * Validate Style Compatibility
 *
 * Checks if style settings might conflict or produce poor results.
 *
 * @param signal - Style signal
 * @returns Array of warnings
 */
export function validateStyleCompatibility(signal: StyleSignal): string[] {
  const warnings: string[] = [];

  if (!signal.metadata) {
    warnings.push("Style signal missing metadata");
    return warnings;
  }

  const { eqMode, archetype, warmthLevel, directnessLevel } = signal.metadata;

  // Burnout + high directness
  if (archetype === "burnout" && directnessLevel > 0.7) {
    warnings.push("High directness with burnout archetype may overwhelm student");
  }

  // Motivational + low warmth
  if (eqMode === "motivational" && warmthLevel < 0.4) {
    warnings.push("Motivational mode needs more warmth to avoid sounding performative");
  }

  // Gentle + high directness
  if (eqMode === "gentle" && directnessLevel > 0.6) {
    warnings.push("Gentle mode conflicts with high directness");
  }

  // Direct + very low directness (shouldn't happen)
  if (eqMode === "direct" && directnessLevel < 0.5) {
    warnings.push("Direct mode has unexpectedly low directness level");
  }

  return warnings;
}
