import { PersonaInstruction_v3 } from "../../../schema/coachPersona_v3";
import { JENNY_VOICE_PRINCIPLES, JENNY_DONTS } from "./jennyPersona";

/**
 * Persona-to-LLM Application Layer
 *
 * Converts PersonaInstruction_v3 into LLM system prompts.
 * This is where the computational persona model becomes actual voice.
 *
 * The system prompt includes:
 * - Identity and credibility markers
 * - Tone guidance (warmth, energy, empathy, firmness, humor)
 * - Micro-traits (pacing, sentence style, motivation patterns)
 * - Boundaries (avoid patterns, forbidden phrases)
 * - Voice principles (sentence starters, empathy patterns, etc.)
 */

/**
 * LLM Input
 *
 * Structure for LLM prompt composition.
 */
export interface LLMInput {
  systemPrompt: string;
  userMessage: string;
}

/**
 * Apply Persona to LLM
 *
 * Converts persona instruction into a system prompt for the LLM.
 * This prompt is prepended to every assistant turn.
 */
export function applyPersonaToLLM(
  persona: PersonaInstruction_v3,
  userMessage: string
): LLMInput {
  console.log("[PersonaToLLM] Applying persona to LLM input");

  const systemPrompt = buildPersonaSystemPrompt(persona);

  return {
    systemPrompt,
    userMessage
  };
}

/**
 * Build Persona System Prompt
 *
 * Constructs the complete system prompt from persona instruction.
 */
export function buildPersonaSystemPrompt(persona: PersonaInstruction_v3): string {
  const sections: string[] = [];

  // === IDENTITY ===
  sections.push(`You are ${persona.identity.name}, a ${persona.identity.archetype}.`);
  sections.push("");

  if (persona.identity.background.length > 0) {
    sections.push("YOUR BACKGROUND:");
    persona.identity.background.forEach(bg => {
      sections.push(`- ${bg}`);
    });
    sections.push("");
  }

  if (persona.identity.credibilityMarkers.length > 0) {
    sections.push("YOUR EXPERTISE:");
    persona.identity.credibilityMarkers.forEach(marker => {
      sections.push(`- ${marker}`);
    });
    sections.push("");
  }

  // === PURPOSE ===
  sections.push("YOUR PURPOSE:");
  sections.push("- Build rapport with students navigating college admissions");
  sections.push("- Provide strategic, tactical guidance on academics, ECs, narrative, and applications");
  sections.push("- Be warm but firm - supportive without babying");
  sections.push("- Guide with empathy and clarity");
  sections.push("- Help students build momentum through micro-wins");
  sections.push("");

  // === TONE GUIDANCE ===
  sections.push("YOUR TONE:");
  sections.push(`- Warmth: ${persona.tone.warmth}`);
  sections.push(`- Energy: ${persona.tone.energy}`);
  sections.push(`- Empathy Type: ${persona.tone.empathyType}`);
  sections.push(`- Firmness: ${persona.tone.firmness}`);
  sections.push(`- Humor: ${persona.tone.humor}`);
  sections.push("");

  // === MICRO-TRAITS ===
  sections.push("YOUR CONVERSATIONAL STYLE:");
  sections.push(`- Pacing: ${persona.microTraits.pacing}`);
  sections.push(`- Sentence Style: ${persona.microTraits.sentenceStyle}`);
  sections.push(`- Metaphor Style: ${persona.microTraits.metaphorStyle}`);
  sections.push(`- Motivation Pattern: ${persona.microTraits.motivationPattern}`);
  sections.push(`- Reassurance Pattern: ${persona.microTraits.reassurancePattern}`);
  sections.push("");

  // === VOICE PRINCIPLES ===
  sections.push("HOW TO SOUND LIKE YOU:");
  JENNY_VOICE_PRINCIPLES.core.forEach(principle => {
    sections.push(`- ${principle}`);
  });
  sections.push("");

  sections.push("SENTENCE STARTERS YOU USE:");
  sections.push(JENNY_VOICE_PRINCIPLES.starters.slice(0, 5).join(", "));
  sections.push("");

  sections.push("EMPATHY PATTERNS:");
  JENNY_VOICE_PRINCIPLES.empathy.forEach(pattern => {
    sections.push(`- ${pattern}`);
  });
  sections.push("");

  // === BOUNDARIES ===
  if (persona.boundaries.avoid.length > 0) {
    sections.push("PATTERNS TO AVOID:");
    persona.boundaries.avoid.forEach(pattern => {
      sections.push(`- ${pattern}`);
    });
    sections.push("");
  }

  if (persona.boundaries.neverSay.length > 0) {
    sections.push("NEVER SAY:");
    persona.boundaries.neverSay.forEach(phrase => {
      sections.push(`- "${phrase}"`);
    });
    sections.push("");
  }

  sections.push("CRITICAL DON'TS:");
  JENNY_DONTS.forEach(dont => {
    sections.push(`- ${dont}`);
  });
  sections.push("");

  // === RESPONSE FORMAT ===
  sections.push("WHEN RESPONDING:");
  sections.push("1. Keep it conversational and natural");
  sections.push("2. Use 2-3 sentences max per paragraph");
  sections.push("3. Ask reflective questions to engage the student");
  sections.push("4. Validate emotions before offering guidance");
  sections.push("5. End with an invitation or question (not 'Let me know if you have questions')");
  sections.push("6. Be specific and tactical, not generic");
  sections.push("7. Sound like a real human coach, not an AI assistant");
  sections.push("");

  return sections.join("\n");
}

/**
 * Build Compact Persona Prompt
 *
 * Shorter version for token-constrained contexts.
 */
export function buildCompactPersonaPrompt(persona: PersonaInstruction_v3): string {
  return `You are ${persona.identity.name}, a ${persona.identity.archetype}.

Tone: ${persona.tone.warmth} warmth, ${persona.tone.energy} energy, ${persona.tone.empathyType} empathy, ${persona.tone.firmness} firmness.

Style: ${persona.microTraits.sentenceStyle}. ${persona.microTraits.motivationPattern}.

Core principles:
- Use 'I' and 'we' (not 'you should')
- 2-3 sentences max per paragraph
- Validate before challenging
- Ask reflective questions
- Be warm, direct, human - never robotic

Avoid: ${persona.boundaries.avoid.slice(0, 5).join(", ")}

Never say: ${persona.boundaries.neverSay.slice(0, 3).join(", ")}`;
}

/**
 * Format Persona for JSON
 *
 * Returns persona as clean JSON for debugging or API transmission.
 */
export function formatPersonaAsJSON(persona: PersonaInstruction_v3): string {
  return JSON.stringify(persona, null, 2);
}
