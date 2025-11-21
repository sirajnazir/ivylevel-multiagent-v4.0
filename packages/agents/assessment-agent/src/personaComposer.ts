import { PersonaInstruction_v3, CoachPersona_v3 } from "../../../schema/coachPersona_v3";
import { EmotionalSignals } from "../../../schema/conversationMemory_v1";
import { ToneInstruction_v1 } from "../../../schema/toneInstruction_v1";
import { getJennyPersona } from "./jennyPersona";

/**
 * Persona Composer Engine
 *
 * Merges 4 layers to create runtime persona instruction:
 * Layer 1 = Jenny baseline (identity, voice, micro-traits)
 * Layer 2 = Emotional modulation (from conversation memory)
 * Layer 3 = Tone drift correction (from EQ feedback loop)
 * Layer 4 = Conversational phase context (future: early-assessment vs deep-diagnostic)
 *
 * This is the "computational model of Jenny's voice" that prevents
 * tone drift and maintains EQ continuity across long sessions.
 */

/**
 * Build Persona Instruction
 *
 * Composes a runtime persona instruction based on:
 * - Baseline persona (Jenny's identity and voice)
 * - Emotional signals (frustration, confidence, overwhelm, motivation, agency)
 * - Tone instructions (avoid patterns, mustInclude elements)
 *
 * Returns a PersonaInstruction_v3 that gets fed into the LLM each turn.
 */
export function buildPersonaInstruction(
  baseline: CoachPersona_v3,
  emotionalSignals: EmotionalSignals,
  toneInstruction: ToneInstruction_v1
): PersonaInstruction_v3 {
  console.log("[PersonaComposer] Building persona instruction");

  try {
    // Start with deep clone of baseline
    const persona: PersonaInstruction_v3 = structuredClone(baseline);

    // --- Layer 2: Emotional Signal Modulation ---

    // High frustration → increase warmth, slow pacing, validate-normalize-reframe
    if (emotionalSignals.frustration >= 3) {
      persona.tone.warmth = "very high";
      persona.tone.empathyType = "reflective";
      persona.microTraits.pacing = "slow-reassuring";
      persona.microTraits.reassurancePattern = "validate + normalize + reframe";
      console.log("[PersonaComposer] High frustration → reflective empathy mode");
    }

    // Low confidence → increase warmth, validating empathy, reinforce strengths
    if (emotionalSignals.confidence <= 2) {
      persona.tone.warmth = "high";
      persona.tone.empathyType = "validating";
      persona.tone.firmness = "gentle";
      persona.microTraits.motivationPattern = "celebrate micro-wins + reinforce strengths";
      console.log("[PersonaComposer] Low confidence → validation mode");
    }

    // High overwhelm → gentle firmness, slow pacing, short sentences
    if (emotionalSignals.overwhelm >= 3) {
      persona.tone.firmness = "gentle";
      persona.tone.energy = "calm";
      persona.microTraits.pacing = "slow-reassuring";
      persona.microTraits.sentenceStyle = "short calming sentences";
      persona.microTraits.reassurancePattern = "acknowledge + simplify + one next step";
      console.log("[PersonaComposer] High overwhelm → simplify mode");
    }

    // Low motivation → increase energy, momentum push, micro-wins
    if (emotionalSignals.motivation <= 2) {
      persona.tone.energy = "medium-high";
      persona.microTraits.motivationPattern = "micro-wins momentum push";
      persona.microTraits.reassurancePattern = "acknowledge + celebrate progress + next step";
      console.log("[PersonaComposer] Low motivation → momentum mode");
    }

    // Low agency → encourage ownership, invitational language
    if (emotionalSignals.agency <= 2) {
      persona.tone.firmness = "gentle-encouraging";
      persona.microTraits.motivationPattern = "encourage ownership + empower decision";
      console.log("[PersonaComposer] Low agency → empowerment mode");
    }

    // High confidence + high motivation → can be more challenging
    if (emotionalSignals.confidence >= 4 && emotionalSignals.motivation >= 4) {
      persona.tone.firmness = "direct-supportive";
      persona.tone.humor = "light teasing";
      persona.microTraits.motivationPattern = "challenge with encouragement";
      console.log("[PersonaComposer] High confidence + motivation → challenger mode");
    }

    // --- Layer 3: Tone Drift Correction Integration ---

    // Merge avoid patterns from tone instruction
    const mergedAvoid = [...new Set([...persona.boundaries.avoid, ...toneInstruction.avoid])];
    persona.boundaries.avoid = mergedAvoid;

    // Apply tone instruction adjustments
    if (toneInstruction.avoid.includes("robotic phrasing")) {
      persona.microTraits.sentenceStyle = "warm conversational";
      console.log("[PersonaComposer] Robotic drift detected → warm conversational");
    }

    if (toneInstruction.avoid.includes("lecturing")) {
      persona.tone.firmness = "gentle";
      persona.microTraits.sentenceStyle = "invitational questions";
      console.log("[PersonaComposer] Lecturing drift detected → invitational mode");
    }

    if (toneInstruction.avoid.includes("over-explaining")) {
      persona.microTraits.sentenceStyle = "short direct sentences";
      console.log("[PersonaComposer] Over-explaining drift detected → brevity mode");
    }

    // Apply warmth and empathy from tone instruction
    if (toneInstruction.warmth === "high") {
      persona.tone.warmth = "high";
    }

    if (toneInstruction.empathy === "reflective") {
      persona.tone.empathyType = "reflective";
    } else if (toneInstruction.empathy === "validating") {
      persona.tone.empathyType = "validating";
    }

    // Apply pacing from tone instruction
    if (toneInstruction.pacing === "slower") {
      persona.microTraits.pacing = "slow-reassuring";
    } else if (toneInstruction.pacing === "energetic") {
      persona.microTraits.pacing = "energetic";
    }

    // --- Layer 4: Conversational Phase Context (Future Enhancement) ---
    // For now, we use the baseline and emotional signals
    // Future: Add phase detection (rapport-building, diagnostic, strategy, etc.)

    console.log("[PersonaComposer] Persona instruction built");
    console.log(`  - Warmth: ${persona.tone.warmth}`);
    console.log(`  - Energy: ${persona.tone.energy}`);
    console.log(`  - Empathy: ${persona.tone.empathyType}`);
    console.log(`  - Firmness: ${persona.tone.firmness}`);
    console.log(`  - Pacing: ${persona.microTraits.pacing}`);

    return persona;
  } catch (error) {
    console.error("[PersonaComposer] Error building persona instruction:", error);
    console.warn("[PersonaComposer] Falling back to baseline persona");
    return baseline;
  }
}

/**
 * Build Persona Instruction with Jenny Baseline
 *
 * Convenience wrapper that uses Jenny's baseline persona.
 */
export function buildJennyPersonaInstruction(
  emotionalSignals: EmotionalSignals,
  toneInstruction: ToneInstruction_v1
): PersonaInstruction_v3 {
  const jennyBaseline = getJennyPersona();
  return buildPersonaInstruction(jennyBaseline, emotionalSignals, toneInstruction);
}

/**
 * Get Persona Phase Context
 *
 * Future enhancement: Detect conversational phase and adjust persona.
 * Phases:
 * - "rapport-building" - Early assessment, building trust
 * - "diagnostic" - Deep questioning, understanding full picture
 * - "strategic" - Planning, tactics, execution
 * - "accountability" - Follow-up, progress checks
 */
export function getPersonaPhaseContext(turnCount: number): string {
  // Simple heuristic for now
  if (turnCount <= 3) {
    return "rapport-building";
  } else if (turnCount <= 10) {
    return "diagnostic";
  } else {
    return "strategic";
  }
}

/**
 * Apply Phase-Specific Adjustments
 *
 * Future enhancement: Modify persona based on conversational phase.
 */
export function applyPhaseAdjustments(
  persona: PersonaInstruction_v3,
  phase: string
): PersonaInstruction_v3 {
  const adjusted = structuredClone(persona);

  switch (phase) {
    case "rapport-building":
      // More warmth, less challenging
      adjusted.tone.warmth = "high";
      adjusted.tone.firmness = "gentle";
      adjusted.tone.humor = "wholesome";
      break;

    case "diagnostic":
      // Cognitive empathy, reflective questions
      adjusted.tone.empathyType = "cognitive";
      adjusted.microTraits.sentenceStyle = "reflective questions";
      break;

    case "strategic":
      // More directive, clear next steps
      adjusted.tone.firmness = "gentle-firm";
      adjusted.microTraits.motivationPattern = "clear tactical steps";
      break;

    case "accountability":
      // Celebrate progress, encourage follow-through
      adjusted.tone.warmth = "high";
      adjusted.microTraits.motivationPattern = "celebrate progress + next commitment";
      break;
  }

  return adjusted;
}
