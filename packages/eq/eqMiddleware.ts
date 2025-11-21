/**
 * eqMiddleware.ts
 *
 * Component 3 - EQ Response Modulator
 *
 * Final tone modifier for every agent reply.
 * This is the cybernetic feedback loop that adapts Jenny's responses
 * in real-time based on archetype, EQ style, and student signals.
 */

import type { EQState, EQModulationContext } from "./types";

/**
 * Apply EQ Middleware
 *
 * Modulates the agent's reply based on current EQ state.
 * This is called on every outgoing message.
 *
 * @param agentReply - Raw agent response
 * @param eq - Current EQ state
 * @param context - Optional context for more nuanced modulation
 * @returns Modulated response
 */
export function applyEQMiddleware(
  agentReply: string,
  eq: EQState,
  context?: EQModulationContext
): string {
  if (!eq.style) {
    // No EQ style set yet, return unchanged
    return agentReply;
  }

  let modified = agentReply;

  // Apply warmth adjustments
  modified = applyWarmth(modified, eq);

  // Apply directness adjustments
  modified = applyDirectness(modified, eq);

  // Apply structure adjustments
  modified = applyStructure(modified, eq);

  // Apply pacing adjustments
  modified = applyPacing(modified, eq);

  // Apply contextual adjustments (if context provided)
  if (context) {
    modified = applyContextualAdjustments(modified, eq, context);
  }

  return modified;
}

/**
 * Apply Warmth
 *
 * Adjusts warmth level of response.
 * High warmth = more supportive, validating language
 * Low warmth = more neutral, professional language
 */
function applyWarmth(text: string, eq: EQState): string {
  if (!eq.style) return text;

  const { warmth } = eq.style;

  // High warmth (>= 0.8)
  if (warmth >= 0.8) {
    // Add warm opening if not present
    const warmOpenings = [
      "I hear you.",
      "That makes sense.",
      "I'm glad you shared that.",
      "You're doing great.",
    ];

    const hasWarmOpening = warmOpenings.some((opening) =>
      text.toLowerCase().startsWith(opening.toLowerCase())
    );

    if (!hasWarmOpening && text.length > 50) {
      const randomOpening = warmOpenings[Math.floor(Math.random() * warmOpenings.length)];
      text = `${randomOpening} ${text}`;
    }

    // Add supportive connectors
    text = text.replace(/\. However,/g, ". That said,");
    text = text.replace(/\. But /g, ". And ");
  }

  // Low warmth (<= 0.6)
  if (warmth <= 0.6) {
    // Remove overly warm language
    text = text.replace(/I hear you\.\s*/gi, "");
    text = text.replace(/That makes sense\.\s*/gi, "");
    text = text.replace(/You're doing great\.\s*/gi, "");
  }

  return text;
}

/**
 * Apply Directness
 *
 * Adjusts directness level of response.
 * High directness = more concise, action-oriented
 * Low directness = more exploratory, conversational
 */
function applyDirectness(text: string, eq: EQState): string {
  if (!eq.style) return text;

  const { directness } = eq.style;

  // High directness (>= 0.8)
  if (directness >= 0.8) {
    // Remove filler words
    text = text.replace(/\s+basically\s+/gi, " ");
    text = text.replace(/\s+actually\s+/gi, " ");
    text = text.replace(/\s+kind of\s+/gi, " ");
    text = text.replace(/\s+sort of\s+/gi, " ");

    // Use more direct language
    text = text.replace(/I think that you could/gi, "You should");
    text = text.replace(/You might want to consider/gi, "Consider");
    text = text.replace(/It would be good to/gi, "");
  }

  // Low directness (<= 0.5)
  if (directness <= 0.5) {
    // Soften imperatives
    text = text.replace(/^Do\s+/gm, "Consider doing ");
    text = text.replace(/^Start\s+/gm, "You might start ");
    text = text.replace(/You should/gi, "You could");
  }

  return text;
}

/**
 * Apply Structure
 *
 * Adjusts structure level of response.
 * High structure = more lists, numbered steps, clear organization
 * Low structure = more flowing, narrative style
 */
function applyStructure(text: string, eq: EQState): string {
  if (!eq.style) return text;

  const { structureLevel } = eq.style;

  // High structure (>= 0.7)
  if (structureLevel >= 0.7) {
    // Add structural markers if long response
    if (text.length > 200) {
      // Add "Here's what to focus on:" prefix if giving advice
      if (/focus|should|could|consider/i.test(text) && !text.startsWith("Here")) {
        text = "Here's what to focus on:\n\n" + text;
      }
    }
  }

  // Low structure (<= 0.5)
  if (structureLevel <= 0.5) {
    // Remove structural markers
    text = text.replace(/^Here's what to focus on:\s*/gi, "");
    text = text.replace(/^Here are the steps:\s*/gi, "");
    text = text.replace(/^Next steps:\s*/gi, "");
  }

  return text;
}

/**
 * Apply Pacing
 *
 * Adjusts pacing of response.
 * Slow = shorter responses, more check-ins
 * Fast = longer responses, more information density
 */
function applyPacing(text: string, eq: EQState): string {
  if (!eq.style) return text;

  const { pacing } = eq.style;

  // Slow pacing
  if (pacing === "slow") {
    // Limit response length
    const maxLength = 400;
    if (text.length > maxLength) {
      // Find a good breaking point (end of sentence)
      const truncateAt = text.lastIndexOf(".", maxLength);
      if (truncateAt > 0) {
        text = text.substring(0, truncateAt + 1);
        text += "\n\nLet's pause here. How does this sound so far?";
      }
    }

    // Add check-ins
    if (text.length > 150 && !text.includes("?")) {
      text += "\n\nDoes this resonate?";
    }
  }

  // Fast pacing
  if (pacing === "fast") {
    // Remove check-ins
    text = text.replace(/\n\nDoes this (make sense|resonate|sound good)\?/gi, "");
    text = text.replace(/\n\nLet's pause here\..*/gi, "");
    text = text.replace(/\n\nHow does this sound so far\?/gi, "");
  }

  return text;
}

/**
 * Apply Contextual Adjustments
 *
 * Additional adjustments based on real-time context signals.
 */
function applyContextualAdjustments(
  text: string,
  eq: EQState,
  context: EQModulationContext
): string {
  // High overwhelm → simplify and slow down
  if (context.overwhelmLevel && context.overwhelmLevel > 0.7) {
    text = text.substring(0, 300); // Shorten dramatically
    text += "\n\nLet's take this one step at a time. What feels most important right now?";
  }

  // High hesitation → add validation
  if (context.hesitationLevel && context.hesitationLevel > 0.7) {
    text = "I can sense some uncertainty here, and that's completely normal. " + text;
  }

  // High verbosity → match energy
  if (context.verbosityLevel && context.verbosityLevel > 0.8) {
    // Student is verbose → be more conversational
    text = text.replace(/\n\n/g, " ");
  }

  // Low verbosity → be more concise
  if (context.verbosityLevel && context.verbosityLevel < 0.3) {
    // Student is terse → mirror that
    text = text.split("\n\n")[0]; // Take first paragraph only
  }

  return text;
}

/**
 * Get Style Guidance
 *
 * Returns human-readable guidance for a given EQ style.
 * Useful for debugging or showing to users.
 *
 * @param eq - EQ state
 * @returns Style guidance string
 */
export function getStyleGuidance(eq: EQState): string {
  if (!eq.style) {
    return "No EQ style active";
  }

  return `
Style: ${eq.style.name}
Pacing: ${eq.style.pacing}
Warmth: ${(eq.style.warmth * 100).toFixed(0)}%
Directness: ${(eq.style.directness * 100).toFixed(0)}%
Structure: ${(eq.style.structureLevel * 100).toFixed(0)}%

Tone Markers: ${eq.style.toneMarkers.join(", ")}

Style Rules:
${eq.style.styleRules.map((rule, i) => `${i + 1}. ${rule}`).join("\n")}
  `.trim();
}
