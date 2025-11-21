import { ToneInstruction_v1 } from "../../../schema/toneInstruction_v1";
import { OpenAI } from "openai";
import { detectToneViolations } from "./eqFeedbackLoop";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Tone Drift Corrector
 *
 * Validates assistant messages against tone instructions and rewrites
 * if violations are detected.
 *
 * This is the "self-healing" component that catches tone drift and
 * auto-corrects it in 1-2 steps.
 *
 * Self-corrects:
 * - Harshness
 * - Over-explaining
 * - Robotic phrasing
 * - Neutral corporate tone
 * - Over-reassurance
 * - Lack of empathy
 */

/**
 * Correct Tone If Needed
 *
 * Validates an assistant message against tone instructions.
 * If violations are detected, rewrites the message.
 * If aligned, returns the original message unchanged.
 *
 * This is the "enforcement layer" that ensures EQ contract compliance.
 */
export async function correctToneIfNeeded(
  assistantMessage: string,
  instructions: ToneInstruction_v1
): Promise<string> {
  console.log("[ToneDriftCorrector] Checking message for tone alignment");

  try {
    // First, detect violations using deterministic rules
    const violations = detectToneViolations(assistantMessage, instructions);

    if (violations.length === 0) {
      console.log("[ToneDriftCorrector] No violations detected - message aligned");
      return assistantMessage;
    }

    console.log(`[ToneDriftCorrector] Violations detected: ${violations.join(", ")}`);
    console.log("[ToneDriftCorrector] Rewriting message to align with tone instructions");

    // Build system prompt for correction
    const systemPrompt = `You are a tone alignment enforcer for Jenny, an empathetic college coach.

Your task: If the assistant message violates the tone instruction, rewrite it.
If it's already aligned, return the original text unchanged.

TONE INSTRUCTION:
- Warmth: ${instructions.warmth}
- Empathy: ${instructions.empathy}
- Pacing: ${instructions.pacing}
- Coaching Style: ${instructions.coachingStyle}
${instructions.avoid.length > 0 ? `- AVOID: ${instructions.avoid.join(", ")}` : ""}
${instructions.mustInclude.length > 0 ? `- MUST INCLUDE: ${instructions.mustInclude.join(", ")}` : ""}

VIOLATIONS DETECTED:
${violations.map(v => `- ${v}`).join("\n")}

REWRITING RULES:
1. Keep the core message and intent
2. Maintain brevity (under 3 sentences if possible)
3. Fix only the tone violations
4. Sound like Jenny: warm, direct, empathetic, never robotic
5. Use conversational language: "totally", "yeah", "I hear you", "makes sense"
6. Avoid: "As an AI", corporate speak, academic tone, lecturing
7. Include empathy markers if required

Return ONLY the corrected message text. No explanations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: assistantMessage }
      ],
      temperature: 0.3, // Lower for consistent corrections
      max_tokens: 300
    });

    const corrected = response.choices[0].message.content?.trim() || assistantMessage;

    console.log("[ToneDriftCorrector] Message corrected successfully");

    return corrected;
  } catch (error) {
    console.error("[ToneDriftCorrector] Error correcting tone:", error);
    console.warn("[ToneDriftCorrector] Returning original message due to error");
    return assistantMessage;
  }
}

/**
 * Correct Tone (Heuristic Fallback)
 *
 * Fast, deterministic tone correction without LLM.
 * Used as fallback when LLM unavailable.
 */
export function correctToneHeuristic(
  assistantMessage: string,
  instructions: ToneInstruction_v1
): string {
  let corrected = assistantMessage;

  // Remove robotic phrases
  if (instructions.avoid.includes("robotic phrasing") || instructions.avoid.includes("AI self-reference")) {
    corrected = corrected.replace(/\b(as an ai|i'm an ai|as a language model|i am an ai|language model)\b/gi, "");
  }

  // Replace academic transitions with conversational ones
  if (instructions.avoid.includes("academic tone") || instructions.avoid.includes("formal transitions")) {
    corrected = corrected.replace(/\bhowever\b/gi, "but");
    corrected = corrected.replace(/\bmoreover\b/gi, "also");
    corrected = corrected.replace(/\btherefore\b/gi, "so");
    corrected = corrected.replace(/\bthus\b/gi, "so");
    corrected = corrected.replace(/\bconsequently\b/gi, "so");
    corrected = corrected.replace(/\bfurthermore\b/gi, "plus");
  }

  // Replace corporate speak
  if (instructions.avoid.includes("corporate speak")) {
    corrected = corrected.replace(/\bleverage\b/gi, "use");
    corrected = corrected.replace(/\butilize\b/gi, "use");
    corrected = corrected.replace(/\bfacilitate\b/gi, "help");
    corrected = corrected.replace(/\boptimize\b/gi, "improve");
  }

  // Replace lecturing tone
  if (instructions.avoid.includes("lecturing") || instructions.avoid.includes("directive language")) {
    corrected = corrected.replace(/\byou should\b/gi, "you could");
    corrected = corrected.replace(/\byou need to\b/gi, "you might want to");
    corrected = corrected.replace(/\byou must\b/gi, "you could");
    corrected = corrected.replace(/\bit's important that you\b/gi, "it might help to");
  }

  // Trim if over-explaining (keep first 3 sentences)
  if (instructions.avoid.includes("over-explaining")) {
    const sentences = corrected.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 3) {
      corrected = sentences.slice(0, 3).join(". ") + ".";
    }
  }

  // Add empathy marker if missing and required
  if (instructions.mustInclude.includes("acknowledge emotion") ||
      instructions.mustInclude.includes("include empathy marker")) {
    if (!/\b(feel|hear you|understand|makes sense|get it|i see)\b/i.test(corrected)) {
      corrected = "I hear you. " + corrected;
    }
  }

  // Clean up extra whitespace
  corrected = corrected.replace(/\s+/g, " ").trim();

  return corrected;
}

/**
 * Validate Tone Alignment
 *
 * Returns true if message aligns with tone instructions.
 * Used for quick validation without rewriting.
 */
export function validateToneAlignment(
  assistantMessage: string,
  instructions: ToneInstruction_v1
): boolean {
  const violations = detectToneViolations(assistantMessage, instructions);
  return violations.length === 0;
}
