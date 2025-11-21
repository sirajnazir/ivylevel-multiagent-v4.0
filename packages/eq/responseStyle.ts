/**
 * Response Style v4.0
 *
 * Generates EQ-adaptive system prompt blocks for LLM responses.
 *
 * This is the MAGIC GLUE that makes Jenny's voice work.
 *
 * Purpose:
 * - Take style directives (from mood vector)
 * - Inject Jenny's tone rubrics
 * - Generate a system prompt block that TEACHES the LLM how to speak
 * - NOT what to say (content) - but HOW to say it (delivery)
 *
 * This block gets appended to the base system prompt before every LLM call.
 * Result: Every response adapts to student's emotional state while maintaining Jenny's voice.
 */

import { StyleDirectives } from "./styleMixer";
import { JENNY_TONE_RUBRIC, ToneRubric } from "./toneRubrics";

/**
 * Response Style Block
 *
 * Contains the full system prompt block for style adaptation.
 */
export interface ResponseStyleBlock {
  block: string; // The actual text to append to system prompt
  metadata: {
    directives: StyleDirectives;
    length: number;
    estimatedTokens: number;
  };
}

/**
 * Build Response Style Block
 *
 * Generates the complete EQ-adaptive style instruction block.
 *
 * This is what gets injected into every LLM call to control tone.
 *
 * @param style - Style directives from mood vector
 * @returns Complete style block with metadata
 */
export function buildResponseStyleBlock(style: StyleDirectives): ResponseStyleBlock {
  console.log(
    `[ResponseStyle] Building style block: warmth=${style.warmthLevel}, firmness=${style.firmnessLevel}, pace=${style.paceLevel}`
  );

  const block = `
### RESPONSE STYLE INSTRUCTIONS (EQ-ADAPTIVE)

Use Jenny's tone patterns. Adjust based on the STYLISTIC DIRECTIVES below.

#### STYLISTIC DIRECTIVES
- Warmth: ${style.warmthLevel}
- Firmness: ${style.firmnessLevel}
- Empathy: ${style.empathyLevel}
- Cheer/Energy: ${style.cheerLevel}
- Pace: ${style.paceLevel}
- Intensity: ${style.intensityLevel}

#### HOW TO ADAPT:
${generateAdaptationGuidance(style)}

#### TONE ELEMENTS TO USE:
Openings: ${JENNY_TONE_RUBRIC.openings.slice(0, 4).join(" | ")}
Validations: ${JENNY_TONE_RUBRIC.validations.slice(0, 3).join(" | ")}
Pacing cues: ${JENNY_TONE_RUBRIC.pacingCues.slice(0, 4).join(" | ")}
Micro-encouragements: ${JENNY_TONE_RUBRIC.microEncouragements.slice(0, 4).join(" | ")}
Firmness patterns: ${JENNY_TONE_RUBRIC.firmnessPatterns.slice(0, 3).join(" | ")}
Reframes: ${JENNY_TONE_RUBRIC.reframes.slice(0, 3).join(" | ")}
Closures: ${JENNY_TONE_RUBRIC.closures.slice(0, 3).join(" | ")}

#### CRITICAL REMINDERS:
- These are DELIVERY patterns, not content requirements
- You must still respond to the actual user question
- Adapt tone, not substance
- Stay grounded, tactical, and real
- No therapy-speak or empty affirmations
`.trim();

  const estimatedTokens = Math.ceil(block.length / 4);

  console.log(`[ResponseStyle] Generated block: ${block.length} chars, ~${estimatedTokens} tokens`);

  return {
    block,
    metadata: {
      directives: style,
      length: block.length,
      estimatedTokens
    }
  };
}

/**
 * Generate Adaptation Guidance
 *
 * Creates specific instructions based on style directives.
 * Tells the LLM exactly how to adapt for each dimension.
 *
 * @param style - Style directives
 * @returns Guidance text
 */
function generateAdaptationGuidance(style: StyleDirectives): string {
  const guidance: string[] = [];

  // Warmth guidance
  if (style.warmthLevel === "high") {
    guidance.push("- Warmth=HIGH → Use soft openings and validations. Start with empathy.");
  } else if (style.warmthLevel === "low") {
    guidance.push("- Warmth=LOW → Be direct and factual. Skip emotional mirroring.");
  } else {
    guidance.push("- Warmth=MEDIUM → Balance warmth with practicality.");
  }

  // Firmness guidance
  if (style.firmnessLevel === "high") {
    guidance.push(
      "- Firmness=HIGH → Include gentle but clear reality checks. Push back when needed."
    );
  } else if (style.firmnessLevel === "low") {
    guidance.push("- Firmness=LOW → Stay supportive and gentle. Avoid challenging language.");
  } else {
    guidance.push("- Firmness=MEDIUM → Be clear but not confrontational.");
  }

  // Empathy guidance
  if (style.empathyLevel === "high") {
    guidance.push("- Empathy=HIGH → Reflect student feelings in 1 sentence before problem-solving.");
  } else if (style.empathyLevel === "low") {
    guidance.push("- Empathy=LOW → Focus on solutions, not feelings.");
  } else {
    guidance.push("- Empathy=MEDIUM → Acknowledge feelings briefly, then move to action.");
  }

  // Pace guidance
  if (style.paceLevel === "slow") {
    guidance.push("- Pace=SLOW → Break explanations into small steps. Use pacing cues.");
  } else if (style.paceLevel === "fast") {
    guidance.push("- Pace=FAST → Move quickly. Be concise and forward-momentum.");
  } else {
    guidance.push("- Pace=NORMAL → Standard pacing. Clear but not rushed.");
  }

  // Cheer guidance
  if (style.cheerLevel === "high") {
    guidance.push(
      "- Cheer=HIGH → Add subtle motivational micro-encouragements. Be energizing."
    );
  } else if (style.cheerLevel === "low") {
    guidance.push("- Cheer=LOW → Stay calm and measured. No hype.");
  } else {
    guidance.push("- Cheer=MEDIUM → Light optimism without overdoing it.");
  }

  // Intensity guidance
  if (style.intensityLevel === "high") {
    guidance.push("- Intensity=HIGH → Be more direct and forward-moving. Create urgency.");
  } else if (style.intensityLevel === "low") {
    guidance.push("- Intensity=LOW → Keep sentences short and grounded. No pressure.");
  } else {
    guidance.push("- Intensity=MEDIUM → Balanced energy level.");
  }

  return guidance.join("\n");
}

/**
 * Build Minimal Style Block
 *
 * Generates a compact version of the style block.
 * Useful when context window is limited.
 *
 * @param style - Style directives
 * @returns Minimal style block
 */
export function buildMinimalStyleBlock(style: StyleDirectives): string {
  return `
### STYLE (EQ-ADAPTIVE)
Warmth: ${style.warmthLevel} | Firmness: ${style.firmnessLevel} | Pace: ${style.paceLevel} | Empathy: ${style.empathyLevel} | Cheer: ${style.cheerLevel} | Intensity: ${style.intensityLevel}

Adapt tone to match these levels. Use Jenny's patterns: warm but tactical, empathetic but real.
`.trim();
}

/**
 * Inject Style Block Into System Prompt
 *
 * Appends the style block to a base system prompt.
 * Handles proper formatting and separation.
 *
 * @param basePrompt - Base system prompt
 * @param style - Style directives
 * @param minimal - Use minimal block (default: false)
 * @returns Complete system prompt with style block
 */
export function injectStyleBlockIntoSystemPrompt(
  basePrompt: string,
  style: StyleDirectives,
  minimal: boolean = false
): string {
  const styleBlock = minimal
    ? buildMinimalStyleBlock(style)
    : buildResponseStyleBlock(style).block;

  return `${basePrompt}

---

${styleBlock}

---

### END STYLE BLOCK
`;
}

/**
 * Extract Style Directives From Block
 *
 * Parses style directives from a style block (for testing/debugging).
 *
 * @param block - Style block text
 * @returns Parsed directives or null
 */
export function extractStyleDirectivesFromBlock(block: string): StyleDirectives | null {
  try {
    const warmthMatch = block.match(/Warmth: (low|medium|high)/);
    const firmnessMatch = block.match(/Firmness: (low|medium|high)/);
    const empathyMatch = block.match(/Empathy: (low|medium|high)/);
    const cheerMatch = block.match(/Cheer\/Energy: (low|medium|high)/);
    const paceMatch = block.match(/Pace: (slow|normal|fast)/);
    const intensityMatch = block.match(/Intensity: (low|medium|high)/);

    if (!warmthMatch || !firmnessMatch || !empathyMatch || !cheerMatch || !paceMatch || !intensityMatch) {
      return null;
    }

    return {
      warmthLevel: warmthMatch[1] as "low" | "medium" | "high",
      firmnessLevel: firmnessMatch[1] as "low" | "medium" | "high",
      empathyLevel: empathyMatch[1] as "low" | "medium" | "high",
      cheerLevel: cheerMatch[1] as "low" | "medium" | "high",
      paceLevel: paceMatch[1] as "slow" | "normal" | "fast",
      intensityLevel: intensityMatch[1] as "low" | "medium" | "high"
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get Style Block Stats
 *
 * Returns statistics about the generated style block.
 *
 * @param styleBlock - Response style block
 * @returns Stats object
 */
export function getStyleBlockStats(styleBlock: ResponseStyleBlock): {
  length: number;
  tokens: number;
  lines: number;
  hasOpenings: boolean;
  hasValidations: boolean;
  hasPacingCues: boolean;
} {
  const lines = styleBlock.block.split("\n").length;

  return {
    length: styleBlock.metadata.length,
    tokens: styleBlock.metadata.estimatedTokens,
    lines,
    hasOpenings: styleBlock.block.includes("Openings:"),
    hasValidations: styleBlock.block.includes("Validations:"),
    hasPacingCues: styleBlock.block.includes("Pacing cues:")
  };
}

/**
 * Validate Style Block
 *
 * Checks that style block contains all required elements.
 *
 * @param block - Style block text
 * @returns Validation result
 */
export function validateStyleBlock(block: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for required sections
  if (!block.includes("RESPONSE STYLE INSTRUCTIONS")) {
    errors.push("Missing RESPONSE STYLE INSTRUCTIONS header");
  }

  if (!block.includes("STYLISTIC DIRECTIVES")) {
    errors.push("Missing STYLISTIC DIRECTIVES section");
  }

  if (!block.includes("HOW TO ADAPT")) {
    errors.push("Missing HOW TO ADAPT section");
  }

  if (!block.includes("TONE ELEMENTS TO USE")) {
    errors.push("Missing TONE ELEMENTS TO USE section");
  }

  // Check for required directives
  const requiredDirectives = [
    "Warmth:",
    "Firmness:",
    "Empathy:",
    "Cheer/Energy:",
    "Pace:",
    "Intensity:"
  ];

  for (const directive of requiredDirectives) {
    if (!block.includes(directive)) {
      errors.push(`Missing directive: ${directive}`);
    }
  }

  // Check for tone rubric categories
  const requiredRubrics = [
    "Openings:",
    "Validations:",
    "Pacing cues:",
    "Micro-encouragements:",
    "Firmness patterns:",
    "Reframes:",
    "Closures:"
  ];

  for (const rubric of requiredRubrics) {
    if (!block.includes(rubric)) {
      errors.push(`Missing rubric: ${rubric}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Compare Style Blocks
 *
 * Compares two style blocks and identifies differences.
 *
 * @param block1 - First style block
 * @param block2 - Second style block
 * @returns Comparison result
 */
export function compareStyleBlocks(
  block1: ResponseStyleBlock,
  block2: ResponseStyleBlock
): {
  directivesChanged: boolean;
  lengthDiff: number;
  changedDirectives: string[];
} {
  const dir1 = block1.metadata.directives;
  const dir2 = block2.metadata.directives;

  const changedDirectives: string[] = [];

  if (dir1.warmthLevel !== dir2.warmthLevel) changedDirectives.push("warmth");
  if (dir1.firmnessLevel !== dir2.firmnessLevel) changedDirectives.push("firmness");
  if (dir1.empathyLevel !== dir2.empathyLevel) changedDirectives.push("empathy");
  if (dir1.cheerLevel !== dir2.cheerLevel) changedDirectives.push("cheer");
  if (dir1.paceLevel !== dir2.paceLevel) changedDirectives.push("pace");
  if (dir1.intensityLevel !== dir2.intensityLevel) changedDirectives.push("intensity");

  return {
    directivesChanged: changedDirectives.length > 0,
    lengthDiff: block2.metadata.length - block1.metadata.length,
    changedDirectives
  };
}
