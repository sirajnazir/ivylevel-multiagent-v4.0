/**
 * jennyPhraseBank.types.ts
 *
 * Types for the Jenny Voice & Phrasebank Generator system.
 * Defines the structure of Jenny's linguistic fingerprint and phrase categories.
 */

/**
 * A single voice atom - a reusable phrase pattern in Jenny's style
 */
export interface VoiceAtom {
  text: string;
  intensity?: "light" | "medium" | "strong";
  contexts?: string[]; // Optional context hints for when to use this phrase
}

/**
 * Jenny's phrasebank organized by coaching function
 */
export interface JennyPhraseBank {
  // Validations: warm, affirming, specific to context
  validations: VoiceAtom[];

  // Grounding: slow down, presence, clarity
  grounding: VoiceAtom[];

  // Perspective shift: reframe, zoom out, alternative view
  perspectiveShift: VoiceAtom[];

  // Micro-challenges: gentle push, accountability nudge
  microChallenges: VoiceAtom[];

  // Motivational bursts: energy, momentum, belief
  motivationalBursts: VoiceAtom[];

  // Clarity frames: concrete, specific, actionable
  clarityFrames: VoiceAtom[];

  // Tactical pivots: strategic redirect, next move
  tacticalPivots: VoiceAtom[];

  // Autonomy respect: student agency, choice, control
  autonomyRespect: VoiceAtom[];

  // Empathy infusions: emotional recognition, validation
  empathyInfusions: VoiceAtom[];

  // Reflective prompts: invite student thinking, metacognition
  reflectivePrompts: VoiceAtom[];

  // Pacing markers: transition phrases for different speeds
  pacingMarkers: {
    slow: VoiceAtom[];
    medium: VoiceAtom[];
    fast: VoiceAtom[];
  };
}

/**
 * Selected phrases for a specific turn, based on tone + coaching move
 */
export interface SelectedPhrases {
  opening?: string; // Optional opening phrase
  body: string[]; // 2-3 core phrases to weave into response
  closing?: string; // Optional closing phrase
  pacingMarker?: string; // Optional pacing transition
  styleMarkers: string[]; // Style hints for LLM (e.g., "warm-direct", "challenge-gentle")
}

/**
 * Jenny's linguistic fingerprint elements
 */
export interface LinguisticFingerprint {
  toneAnchors: string[]; // Characteristic tone elements
  signatureDevices: string[]; // Rhetorical patterns
  sentenceArchitecture: string[]; // Structural patterns
  avoidances: string[]; // What Jenny never says
}
