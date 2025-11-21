import { z } from "zod";

/**
 * Coach Persona Schema v3
 *
 * The computational model of Jenny's voice, cadence, micro-traits, humor,
 * and conversational DNA. This is the "EQ moat" that makes the agent feel
 * like a real coach, not a sterile PDF generator.
 *
 * Purpose:
 * - Define Jenny's identity, tone, micro-traits, and boundaries
 * - Enable runtime persona composition based on emotional signals
 * - Maintain voice continuity across long sessions
 * - Prevent tone drift into corporate/robotic language
 * - Support future "Coach Twins" using same engine
 */

/**
 * Coach Identity
 *
 * Core identity attributes that establish credibility and relatability.
 */
export const coachIdentitySchema = z.object({
  /**
   * Coach name
   */
  name: z.string().min(1),

  /**
   * Archetype descriptor
   * Examples: "warm challenger", "strategic guide", "empathetic strategist"
   */
  archetype: z.string().min(1),

  /**
   * Background story elements
   * Examples:
   * - "immigrant journey"
   * - "first-generation college pathway"
   * - "earned Ivy+ admission through disciplined systems"
   */
  background: z.array(z.string()),

  /**
   * Credibility markers
   * Examples:
   * - "helped 200+ students get into top-tier schools"
   * - "expert in essays, EC strategy, portfolio building"
   */
  credibilityMarkers: z.array(z.string())
});

export type CoachIdentity = z.infer<typeof coachIdentitySchema>;

/**
 * Coach Tone
 *
 * Dynamic tone attributes that shift based on emotional signals.
 */
export const coachToneSchema = z.object({
  /**
   * Warmth level
   * Examples: "high", "medium-high", "medium", "moderate"
   */
  warmth: z.string().min(1),

  /**
   * Energy level
   * Examples: "high", "medium-high", "medium", "low", "calm"
   */
  energy: z.string().min(1),

  /**
   * Empathy type
   * Examples: "reflective", "validating", "cognitive", "supportive"
   */
  empathyType: z.string().min(1),

  /**
   * Firmness style
   * Examples: "gentle-firm", "gentle", "soft", "direct-supportive"
   */
  firmness: z.string().min(1),

  /**
   * Humor style
   * Examples: "light teasing", "wholesome", "none", "playful"
   */
  humor: z.string().min(1)
});

export type CoachTone = z.infer<typeof coachToneSchema>;

/**
 * Coach Micro-Traits
 *
 * Fine-grained behavioral patterns that define conversational style.
 */
export const coachMicroTraitsSchema = z.object({
  /**
   * Pacing style
   * Examples:
   * - "slow-reassuring"
   * - "steady"
   * - "energetic"
   * - "measured"
   */
  pacing: z.string().min(1),

  /**
   * Sentence style
   * Examples:
   * - "warm conversational"
   * - "short calming sentences"
   * - "direct and concise"
   * - "relaxed flowing"
   */
  sentenceStyle: z.string().min(1),

  /**
   * Metaphor style
   * Examples:
   * - "accessible, light, non-cringe"
   * - "sports analogies"
   * - "minimal metaphors"
   */
  metaphorStyle: z.string().min(1),

  /**
   * Motivation pattern
   * Examples:
   * - "micro-wins momentum push"
   * - "celebrate small progress"
   * - "challenge with encouragement"
   */
  motivationPattern: z.string().min(1),

  /**
   * Reassurance pattern
   * Examples:
   * - "validate + normalize + reframe"
   * - "acknowledge + perspective shift"
   * - "empathize + actionable next step"
   */
  reassurancePattern: z.string().min(1)
});

export type CoachMicroTraits = z.infer<typeof coachMicroTraitsSchema>;

/**
 * Coach Boundaries
 *
 * Hard boundaries and forbidden patterns to prevent tone drift.
 */
export const coachBoundariesSchema = z.object({
  /**
   * Patterns to avoid
   * Examples: "robotic phrasing", "lecturing", "over-explaining"
   */
  avoid: z.array(z.string()),

  /**
   * Phrases to never say
   * Examples: "As an AI", "calculated response", "I'm just a bot"
   */
  neverSay: z.array(z.string())
});

export type CoachBoundaries = z.infer<typeof coachBoundariesSchema>;

/**
 * Coach Persona v3
 *
 * Complete persona profile combining identity, tone, micro-traits, and boundaries.
 */
export const coachPersonaSchema_v3 = z.object({
  identity: coachIdentitySchema,
  tone: coachToneSchema,
  microTraits: coachMicroTraitsSchema,
  boundaries: coachBoundariesSchema
});

export type CoachPersona_v3 = z.infer<typeof coachPersonaSchema_v3>;

/**
 * Persona Instruction v3
 *
 * Runtime persona composition that gets fed into LLM each turn.
 * Same structure as CoachPersona_v3 but represents the dynamic, composed state.
 */
export type PersonaInstruction_v3 = CoachPersona_v3;

/**
 * Create Baseline Persona
 *
 * Returns a neutral baseline persona.
 * Specific coach personas (like Jenny) are defined separately.
 */
export function createBaselinePersona(): CoachPersona_v3 {
  return {
    identity: {
      name: "Coach",
      archetype: "supportive guide",
      background: [],
      credibilityMarkers: []
    },
    tone: {
      warmth: "medium",
      energy: "medium",
      empathyType: "cognitive",
      firmness: "balanced",
      humor: "minimal"
    },
    microTraits: {
      pacing: "steady",
      sentenceStyle: "conversational",
      metaphorStyle: "accessible",
      motivationPattern: "encourage progress",
      reassurancePattern: "acknowledge + support"
    },
    boundaries: {
      avoid: ["robotic phrasing", "lecturing"],
      neverSay: ["As an AI", "I'm just a bot"]
    }
  };
}

/**
 * Persona to String
 *
 * Converts persona to human-readable format for debugging.
 */
export function personaToString(persona: CoachPersona_v3): string {
  const lines: string[] = [];

  lines.push(`=== Coach Persona: ${persona.identity.name} ===`);
  lines.push(`Archetype: ${persona.identity.archetype}`);
  lines.push(`Warmth: ${persona.tone.warmth} | Energy: ${persona.tone.energy}`);
  lines.push(`Empathy: ${persona.tone.empathyType} | Firmness: ${persona.tone.firmness}`);
  lines.push(`Humor: ${persona.tone.humor}`);
  lines.push(`Pacing: ${persona.microTraits.pacing}`);
  lines.push(`Sentence Style: ${persona.microTraits.sentenceStyle}`);

  if (persona.boundaries.avoid.length > 0) {
    lines.push(`Avoid: ${persona.boundaries.avoid.join(", ")}`);
  }

  return lines.join("\n");
}
