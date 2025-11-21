/**
 * Style Blender v4.0
 *
 * Blends EQ mode + Jenny persona into an output-ready tone guide.
 *
 * This is the fusion layer that combines:
 * - EQ mode (gentle/direct/motivational/mentor)
 * - Jenny's consistent identity traits
 * - Language patterns appropriate for the mode
 * - Signature coaching moves
 *
 * Output is a complete style guide for generating responses.
 */

import { EQ_MODES, getEQMode, EQModeDefinition } from "./eqModes";
import { JENNY_STYLE, JennyStyle } from "./personaStyles";

/**
 * Blended Style
 *
 * The output of style blending - a complete persona guide for response generation.
 */
export interface BlendedStyle {
  eqMode: string;
  tone: string;
  pacing: string;
  eqSignals: string[];
  languagePatterns: JennyStyle["languagePatterns"];
  signatureMoves: JennyStyle["signatureMoves"];
  identityTraits: string[];
  primaryPhrases: string[];
  avoidPhrases: string[];
  voiceGuidance: string;
}

/**
 * Blend Style
 *
 * Main entry point for style blending.
 * Combines EQ mode with Jenny's persona to create a unified style guide.
 *
 * @param eqMode - The EQ mode to use (gentle/direct/motivational/mentor)
 * @returns Complete blended style guide
 */
export function blendStyle(eqMode: string): BlendedStyle {
  console.log(`[StyleBlender] Blending style for EQ mode: ${eqMode}`);

  const mode = getEQMode(eqMode);

  // Select primary language patterns based on mode
  const primaryPhrases = selectPrimaryPhrases(mode);

  // Generate tone description with Jenny flavor
  const tone = `${mode.tone}, flavored with Jenny's immigrant-mentor credibility and tactical clarity`;

  // Generate voice guidance
  const voiceGuidance = generateVoiceGuidance(mode);

  console.log(`[StyleBlender] Tone: ${tone}`);
  console.log(`[StyleBlender] Pacing: ${mode.pacing}`);
  console.log(`[StyleBlender] Primary phrases: ${primaryPhrases.length} selected`);

  return {
    eqMode: mode.label,
    tone,
    pacing: mode.pacing,
    eqSignals: mode.signature,
    languagePatterns: JENNY_STYLE.languagePatterns,
    signatureMoves: JENNY_STYLE.signatureMoves,
    identityTraits: JENNY_STYLE.identityTraits,
    primaryPhrases,
    avoidPhrases: JENNY_STYLE.forbiddenPhrases,
    voiceGuidance
  };
}

/**
 * Select Primary Phrases
 *
 * Chooses the most relevant language patterns for the current EQ mode.
 *
 * @param mode - The EQ mode definition
 * @returns Array of primary phrases to emphasize
 */
function selectPrimaryPhrases(mode: EQModeDefinition): string[] {
  const patterns = JENNY_STYLE.languagePatterns;
  let primaryPhrases: string[] = [];

  switch (mode.label) {
    case "gentle":
      // Emphasize reassurance + some questioning
      primaryPhrases = [
        ...patterns.reassurance.slice(0, 3),
        ...patterns.questioningTechniques.slice(0, 2)
      ];
      break;

    case "direct":
      // Emphasize clarity markers + challenge lines
      primaryPhrases = [
        ...patterns.clarityMarkers.slice(0, 3),
        ...patterns.challengeLines.slice(0, 2)
      ];
      break;

    case "motivational":
      // Emphasize motivation boosters + some framework
      primaryPhrases = [
        ...patterns.motivationBoosters.slice(0, 3),
        ...patterns.frameworkLanguage.slice(0, 2)
      ];
      break;

    case "mentor":
      // Emphasize questioning + framework language
      primaryPhrases = [
        ...patterns.questioningTechniques.slice(0, 3),
        ...patterns.frameworkLanguage.slice(0, 2)
      ];
      break;

    default:
      // Fallback: mix of all
      primaryPhrases = [
        ...patterns.reassurance.slice(0, 1),
        ...patterns.clarityMarkers.slice(0, 1),
        ...patterns.motivationBoosters.slice(0, 1)
      ];
  }

  console.log(`[StyleBlender] Selected ${primaryPhrases.length} primary phrases for ${mode.label} mode`);
  return primaryPhrases;
}

/**
 * Generate Voice Guidance
 *
 * Creates specific guidance for how to write in this blended style.
 *
 * @param mode - The EQ mode definition
 * @returns Voice guidance string
 */
function generateVoiceGuidance(mode: EQModeDefinition): string {
  const baseGuidance = `Write as Jenny in ${mode.label} mode. ${mode.description}`;

  const styleNotes = [
    "Use contractions (I'm, you're, let's)",
    "Keep sentences under 25 words",
    "Mix short punchy sentences with longer explanatory ones",
    "Use conversational but precise vocabulary"
  ];

  // Mode-specific additions
  const modeSpecificGuidance: Record<string, string[]> = {
    gentle: [
      "Validate emotions before giving advice",
      "Use slower pacing - one idea per sentence",
      "Normalize struggles ('This is completely normal')",
      "Avoid pushing too hard or overwhelming"
    ],
    direct: [
      "Get straight to the point",
      "Use tactical language ('The key thing is', 'Here's what matters')",
      "Be crisp and efficient",
      "Avoid overexplaining or hedging"
    ],
    motivational: [
      "Lead with energy and possibility",
      "Use 'you can' language frequently",
      "Frame challenges as doable",
      "Avoid toxic positivity - stay realistic"
    ],
    mentor: [
      "Ask questions to surface insights",
      "Provide contextual wisdom",
      "Reference patterns from experience",
      "Avoid being preachy or condescending"
    ]
  };

  const modeNotes = modeSpecificGuidance[mode.label] || [];

  const fullGuidance = [
    baseGuidance,
    "",
    "Style requirements:",
    ...styleNotes.map(note => `- ${note}`),
    "",
    `${mode.label.charAt(0).toUpperCase() + mode.label.slice(1)} mode specifics:`,
    ...modeNotes.map(note => `- ${note}`)
  ].join("\n");

  return fullGuidance;
}

/**
 * Blend Style with Override
 *
 * Advanced version that allows overriding specific style elements.
 * Useful for edge cases or experimental modes.
 *
 * @param eqMode - Base EQ mode
 * @param overrides - Partial style overrides
 * @returns Blended style with overrides applied
 */
export function blendStyleWithOverride(
  eqMode: string,
  overrides: Partial<BlendedStyle>
): BlendedStyle {
  const baseStyle = blendStyle(eqMode);

  console.log(`[StyleBlender] Applying overrides to ${eqMode} mode`);

  return {
    ...baseStyle,
    ...overrides
  };
}

/**
 * Get Style Summary
 *
 * Returns a human-readable summary of the blended style.
 * Useful for debugging and logging.
 *
 * @param style - Blended style to summarize
 * @returns Summary string
 */
export function getStyleSummary(style: BlendedStyle): string {
  return [
    `EQ Mode: ${style.eqMode}`,
    `Tone: ${style.tone}`,
    `Pacing: ${style.pacing}`,
    `EQ Signals: ${style.eqSignals.join(", ")}`,
    `Primary Phrases: ${style.primaryPhrases.length} selected`,
    `Identity Traits: ${style.identityTraits.join(", ")}`
  ].join("\n");
}

/**
 * Validate Style Compatibility
 *
 * Checks if the blended style is compatible with given constraints.
 * Returns warnings if incompatibilities detected.
 *
 * @param style - Blended style
 * @param studentState - Student emotional state
 * @returns Array of warnings (empty if compatible)
 */
export function validateStyleCompatibility(
  style: BlendedStyle,
  studentState: { overwhelmed?: boolean; confident?: boolean; motivated?: boolean }
): string[] {
  const warnings: string[] = [];

  // Gentle mode warnings
  if (style.eqMode === "gentle" && studentState.confident) {
    warnings.push("Gentle mode may feel condescending to confident student");
  }

  // Direct mode warnings
  if (style.eqMode === "direct" && studentState.overwhelmed) {
    warnings.push("Direct mode may overwhelm already-stressed student");
  }

  // Motivational mode warnings
  if (style.eqMode === "motivational" && studentState.overwhelmed) {
    warnings.push("Motivational mode may feel performative when student is burnt out");
  }

  if (warnings.length > 0) {
    console.log(`[StyleBlender] Compatibility warnings: ${warnings.join("; ")}`);
  }

  return warnings;
}
