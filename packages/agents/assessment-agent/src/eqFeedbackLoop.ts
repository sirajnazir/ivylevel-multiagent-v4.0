import { ToneInstruction_v1, createNeutralToneInstruction } from "../../../schema/toneInstruction_v1";
import { ConversationMemory_v1 } from "../../../schema/conversationMemory_v1";

/**
 * EQ Feedback Loop Engine
 *
 * Generates explicit tone instructions for the next assistant message
 * based on emotional signals, tone drift detection, and Jenny's EQ style.
 *
 * This is the "EQ autopilot" that prevents tone drift and maintains
 * stable emotional resonance across long sessions.
 *
 * Think of it like Grammarly for "sounding like Jenny."
 */

/**
 * Generate Tone Instruction
 *
 * Analyzes conversation memory and last assistant message to generate
 * explicit tone guidance for the next turn.
 *
 * Checks for:
 * - Emotional signals from student (frustration, confidence, overwhelm, etc.)
 * - Tone drift in recent assistant messages (robotic, academic, corporate)
 * - Behavioral patterns requiring specific coaching approaches
 *
 * Returns a Tone Instruction Object (TIO) that becomes the "whispered guidance"
 * fed into the LLM before each message.
 */
export function generateToneInstruction(
  memory: ConversationMemory_v1,
  lastAssistantMessage: string = ""
): ToneInstruction_v1 {
  console.log("[EQFeedbackLoop] Generating tone instruction");

  try {
    const { frustration, confidence, overwhelm, motivation, agency } = memory.emotionalSignals;

    // Start with neutral baseline
    let warmth = "medium";
    let empathy = "standard";
    let pacing = "steady";
    let coachingStyle = "balanced";
    const avoid: string[] = [];
    const mustInclude: string[] = [];

    // --- Emotional Signal Modulation ---

    // High frustration → de-escalate with high warmth
    if (frustration >= 3) {
      warmth = "high";
      empathy = "reflective";
      pacing = "slower";
      coachingStyle = "de-escalate";
      mustInclude.push("acknowledge emotion");
      avoid.push("minimizing their concern");
      console.log("[EQFeedbackLoop] High frustration detected → de-escalate mode");
    }

    // Low confidence → validate and reinforce
    if (confidence <= 2) {
      warmth = "high";
      empathy = "validating";
      coachingStyle = "reinforce strengths";
      mustInclude.push("validate their concern");
      avoid.push("dismissive language");
      console.log("[EQFeedbackLoop] Low confidence detected → validation mode");
    }

    // Low motivation → spark momentum
    if (motivation <= 2) {
      coachingStyle = "spark momentum";
      mustInclude.push("suggest small actionable next step");
      avoid.push("overwhelming them with options");
      console.log("[EQFeedbackLoop] Low motivation detected → momentum mode");
    }

    // High overwhelm → simplify and slow down
    if (overwhelm >= 3) {
      avoid.push("giving long lists");
      avoid.push("introducing too many options");
      pacing = "slower";
      mustInclude.push("simplify the next step");
      console.log("[EQFeedbackLoop] High overwhelm detected → simplify mode");
    }

    // Low agency → encourage ownership
    if (agency <= 2) {
      coachingStyle = "encourage ownership";
      mustInclude.push("use empowerment language");
      avoid.push("telling them what to do");
      console.log("[EQFeedbackLoop] Low agency detected → empowerment mode");
    }

    // --- Tone Drift Detection ---

    // Detect robotic/AI language leakage
    if (/\b(as an ai|i'm an ai|robot|synthetic|language model)\b/i.test(lastAssistantMessage)) {
      avoid.push("robotic phrasing");
      avoid.push("AI self-reference");
      mustInclude.push("use conversational warmth");
      console.log("[EQFeedbackLoop] Robotic tone detected → correction needed");
    }

    // Detect academic/formal tone
    if (/\b(however|moreover|therefore|thus|consequently|furthermore)\b/i.test(lastAssistantMessage)) {
      avoid.push("academic tone");
      avoid.push("formal transitions");
      mustInclude.push("use casual connectors");
      console.log("[EQFeedbackLoop] Academic tone detected → correction needed");
    }

    // Detect corporate speak
    if (/\b(leverage|synergy|optimize|utilize|facilitate|stakeholder)\b/i.test(lastAssistantMessage)) {
      avoid.push("corporate speak");
      mustInclude.push("use everyday language");
      console.log("[EQFeedbackLoop] Corporate speak detected → correction needed");
    }

    // Detect over-explaining (walls of text)
    if (lastAssistantMessage.length > 500) {
      avoid.push("over-explaining");
      avoid.push("long paragraphs");
      mustInclude.push("keep response under 3 sentences");
      console.log("[EQFeedbackLoop] Over-explaining detected → brevity needed");
    }

    // Detect lecturing tone
    if (/\b(you should|you need to|you must|it's important that you)\b/i.test(lastAssistantMessage)) {
      avoid.push("lecturing");
      avoid.push("directive language");
      mustInclude.push("use invitational language");
      console.log("[EQFeedbackLoop] Lecturing tone detected → correction needed");
    }

    // Detect neutral/emotionless tone (no empathy markers)
    if (lastAssistantMessage.length > 100 && !/\b(feel|hear|understand|makes sense|get it|totally)\b/i.test(lastAssistantMessage)) {
      empathy = "validating";
      mustInclude.push("include empathy marker");
      console.log("[EQFeedbackLoop] Emotionless tone detected → add empathy");
    }

    // --- Pattern-Based Modulation ---

    // Check detected patterns for additional guidance
    if (memory.detectedPatterns.includes("parental_pressure_expressed")) {
      mustInclude.push("validate student's own voice");
      avoid.push("reinforcing parent expectations");
    }

    if (memory.detectedPatterns.includes("micro_win_celebration")) {
      mustInclude.push("celebrate the progress");
      warmth = "high";
    }

    if (memory.detectedPatterns.includes("avoidance_of_difficult_topics")) {
      empathy = "gentle";
      pacing = "slower";
      mustInclude.push("create safe space for exploration");
    }

    if (memory.detectedPatterns.includes("analysis_paralysis")) {
      coachingStyle = "simplify decision";
      mustInclude.push("narrow down to 2 options max");
    }

    // Build final instruction
    const instruction: ToneInstruction_v1 = {
      warmth,
      empathy,
      pacing,
      coachingStyle,
      avoid,
      mustInclude
    };

    console.log("[EQFeedbackLoop] Tone instruction generated");
    console.log(`  - Warmth: ${warmth}`);
    console.log(`  - Empathy: ${empathy}`);
    console.log(`  - Coaching style: ${coachingStyle}`);
    console.log(`  - Avoid: ${avoid.join(", ") || "none"}`);
    console.log(`  - Must include: ${mustInclude.join(", ") || "none"}`);

    return instruction;
  } catch (error) {
    console.error("[EQFeedbackLoop] Error generating tone instruction:", error);
    console.warn("[EQFeedbackLoop] Falling back to neutral tone instruction");
    return createNeutralToneInstruction();
  }
}

/**
 * Detect Tone Violations
 *
 * Checks if an assistant message violates the tone instruction.
 * Returns array of violations found.
 */
export function detectToneViolations(
  assistantMessage: string,
  instruction: ToneInstruction_v1
): string[] {
  const violations: string[] = [];

  // Check "avoid" patterns
  for (const pattern of instruction.avoid) {
    switch (pattern) {
      case "robotic phrasing":
      case "AI self-reference":
        if (/\b(as an ai|i'm an ai|robot|synthetic|language model)\b/i.test(assistantMessage)) {
          violations.push(`Contains ${pattern}`);
        }
        break;

      case "academic tone":
      case "formal transitions":
        if (/\b(however|moreover|therefore|thus|consequently|furthermore)\b/i.test(assistantMessage)) {
          violations.push(`Contains ${pattern}`);
        }
        break;

      case "corporate speak":
        if (/\b(leverage|synergy|optimize|utilize|facilitate|stakeholder)\b/i.test(assistantMessage)) {
          violations.push(`Contains ${pattern}`);
        }
        break;

      case "lecturing":
      case "directive language":
        if (/\b(you should|you need to|you must|it's important that you)\b/i.test(assistantMessage)) {
          violations.push(`Contains ${pattern}`);
        }
        break;

      case "over-explaining":
      case "long paragraphs":
        if (assistantMessage.length > 500) {
          violations.push(`Message too long (${assistantMessage.length} chars)`);
        }
        break;

      case "giving long lists":
        const listMatches = assistantMessage.match(/[-•]\s+/g);
        if (listMatches && listMatches.length > 5) {
          violations.push(`List too long (${listMatches.length} items)`);
        }
        break;
    }
  }

  // Check "mustInclude" patterns
  for (const pattern of instruction.mustInclude) {
    let found = false;

    switch (pattern) {
      case "acknowledge emotion":
        found = /\b(feel|hear you|understand|makes sense|get it|i see)\b/i.test(assistantMessage);
        if (!found) violations.push(`Missing: ${pattern}`);
        break;

      case "validate their concern":
        found = /\b(valid|makes sense|understand|get it|that's real)\b/i.test(assistantMessage);
        if (!found) violations.push(`Missing: ${pattern}`);
        break;

      case "use conversational warmth":
      case "include empathy marker":
        found = /\b(feel|totally|yeah|i hear you|makes sense|get it)\b/i.test(assistantMessage);
        if (!found) violations.push(`Missing: ${pattern}`);
        break;

      case "suggest small actionable next step":
        found = /\b(next step|try|could you|how about|what if you)\b/i.test(assistantMessage);
        if (!found) violations.push(`Missing: ${pattern}`);
        break;

      case "celebrate the progress":
        found = /\b(awesome|great|nice|love|proud|progress|win)\b/i.test(assistantMessage);
        if (!found) violations.push(`Missing: ${pattern}`);
        break;
    }
  }

  return violations;
}
