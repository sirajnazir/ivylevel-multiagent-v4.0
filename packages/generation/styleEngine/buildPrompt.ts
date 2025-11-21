/**
 * Build Prompt v4.0
 *
 * Constructs the final instruction for the LLM by combining:
 * - User message
 * - EQ mode (emotional state)
 * - Archetype (student type)
 * - Intent (coaching focus)
 * - Persona signature (Jenny's DNA)
 * - Style directives (tone & pacing rules)
 * - Knowledge chips (RAG context)
 *
 * This is the FINAL assembly point before LLM generation.
 * Everything upstream flows into this prompt structure.
 */

import { StyleSignal } from "./styleAdapter";
import { PersonaSignal } from "./personaAdapter";

/**
 * Prompt Input
 *
 * All signals needed to construct the generation prompt.
 */
export interface PromptInput {
  userMessage: string;
  chips: string[];
  eqMode: string;
  archetype: string;
  intent: string;
  persona: PersonaSignal;
  style: StyleSignal;
  conversationStage?: string;
}

/**
 * Build Prompt
 *
 * Constructs the final LLM instruction prompt with all signals integrated.
 *
 * Structure:
 * 1. Role definition (who Jenny is)
 * 2. EQ mode (emotional calibration)
 * 3. Archetype (student type adaptation)
 * 4. Coaching intent (focus area)
 * 5. Style rules (tone & pacing)
 * 6. Persona signature (Jenny's DNA)
 * 7. Knowledge chips (RAG context)
 * 8. User message (what to respond to)
 * 9. Output requirements (format & constraints)
 *
 * @param input - All signals for generation
 * @returns Formatted prompt string
 */
export function buildPrompt(input: PromptInput): string {
  console.log(`[BuildPrompt] Constructing prompt for EQ:${input.eqMode}, Archetype:${input.archetype}`);
  console.log(`[BuildPrompt] Intent:${input.intent}, Chips:${input.chips.length}`);

  const chipContext = input.chips.length > 0
    ? input.chips.map(c => `- ${c}`).join("\n")
    : "- [No specific knowledge chips retrieved for this query]";

  const stageGuidance = input.conversationStage
    ? `\n# CONVERSATION STAGE\nThis is the **${input.conversationStage}** phase of the conversation.\nAdjust depth and pacing accordingly.`
    : "";

  const prompt = `# ROLE
You are Jenny, an empathetic but high-performance college admissions mentor.
You combine warmth, precision, realism, and actionable rigor.
Your voice is human, conversational, emotionally attuned, and grounded in evidence.

# EQ MODE
User is currently in a *${input.eqMode}* emotional state.
Adjust warmth, pacing, and reassurance accordingly.

# ARCHETYPE
The student is a *${input.archetype}* type.
Adapt communication patterns and challenge levels accordingly.

# COACHING INTENT
Focus on: **${input.intent}**
${stageGuidance}

# STYLE RULES
${input.style.directives}

# PERSONA SIGNATURE (NON-NEGOTIABLE)
${input.persona.signature}

# HIGH-QUALITY CONTEXT
These are Jenny's own knowledge chips relevant to the moment:
${chipContext}

# USER MESSAGE
"${input.userMessage}"

# REQUIRED OUTPUT
Respond in **Jenny's authentic tone**, maintaining balance between empathy, clarity, and actionable next steps.
Use conversational, human phrasing. Avoid robotic transitions.
Give a short but emotionally calibrated response followed by 2-4 precise steps they should take next.

IMPORTANT:
- Do NOT use corporate language ("I'd be happy to", "Let me assist you", "Please note")
- Do NOT use overly formal transitions ("Furthermore", "Additionally", "In conclusion")
- Do NOT write long monologues or walls of text
- DO sound like a real human mentor in a 1:1 conversation
- DO use natural contractions and casual phrasing where appropriate
- DO maintain Jenny's signature blend of warmth + tactical clarity
`;

  console.log(`[BuildPrompt] Prompt constructed (${prompt.length} chars)`);

  return prompt;
}

/**
 * Build System Prompt
 *
 * Constructs the system-level instruction for the LLM.
 * This stays constant across all conversations.
 *
 * @returns System prompt string
 */
export function buildSystemPrompt(): string {
  return `You are Jenny, IvyLevel's lead mentor.

You are an empathetic, high-performance college admissions coach who combines:
- Deep emotional intelligence with tactical precision
- Immigrant hustle mentality with warm, human connection
- Evidence-based guidance with motivational support
- Direct clarity with emotional attunement

Your communication style:
- Natural, conversational, human (not corporate AI)
- Switches between gentle and firm based on student needs
- Uses relatable metaphors and real-world examples
- Validates feelings while pushing toward action
- Avoids platitudes, generic advice, and robotic language

Your goal: Help students gain clarity, build momentum, and achieve breakthrough results in college admissions.`;
}

/**
 * Validate Prompt Input
 *
 * Ensures all required fields are present and valid.
 *
 * @param input - Prompt input to validate
 * @returns Array of warnings (empty if valid)
 */
export function validatePromptInput(input: PromptInput): string[] {
  const warnings: string[] = [];

  if (!input.userMessage || input.userMessage.trim().length === 0) {
    warnings.push("User message is empty");
  }

  if (input.userMessage && input.userMessage.length > 1000) {
    warnings.push(`User message is very long (${input.userMessage.length} chars). Consider truncating.`);
  }

  if (!input.eqMode || !["gentle", "direct", "motivational", "mentor"].includes(input.eqMode)) {
    warnings.push(`Invalid EQ mode: ${input.eqMode}`);
  }

  if (!input.archetype) {
    warnings.push("Archetype is missing");
  }

  if (!input.intent) {
    warnings.push("Intent is missing");
  }

  if (!input.chips || input.chips.length === 0) {
    warnings.push("No knowledge chips provided. Response may lack specific guidance.");
  }

  if (input.chips && input.chips.length > 10) {
    warnings.push(`Many chips provided (${input.chips.length}). Consider limiting to top 5-7.`);
  }

  if (!input.style || !input.style.directives) {
    warnings.push("Style directives are missing");
  }

  if (!input.persona || !input.persona.signature) {
    warnings.push("Persona signature is missing");
  }

  return warnings;
}

/**
 * Get Prompt Stats
 *
 * Returns metadata about the constructed prompt.
 *
 * @param prompt - The prompt string
 * @returns Stats object
 */
export function getPromptStats(prompt: string): {
  totalChars: number;
  estimatedTokens: number;
  lines: number;
} {
  return {
    totalChars: prompt.length,
    estimatedTokens: Math.ceil(prompt.length / 4), // Rough estimate: 1 token ≈ 4 chars
    lines: prompt.split("\n").length
  };
}
