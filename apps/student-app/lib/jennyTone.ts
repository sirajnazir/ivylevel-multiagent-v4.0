/**
 * jennyTone.ts
 *
 * Component 1 Integration - Jenny Tone Utilities
 *
 * EQ microstyle injector and tone utilities for the frontend.
 * This provides client-side helpers for working with Jenny's EQ profiles.
 */

export interface JennyEQProfile {
  label: string;
  warmth: number;
  strictness: number;
  signaturePhrases: string[];
}

export const JennyEQProfiles: Record<string, JennyEQProfile> = {
  warm_supportive: {
    label: "warm_supportive",
    warmth: 0.9,
    strictness: 0.1,
    signaturePhrases: [
      "Let's take this step by step.",
      "I see where you're coming from.",
      "This is totally workable.",
      "You're not alone in feeling this way.",
      "Let's figure this out together.",
    ],
  },

  calm_firm: {
    label: "calm_firm",
    warmth: 0.7,
    strictness: 0.5,
    signaturePhrases: [
      "Let's focus on what matters most here.",
      "I'm with you, but we need clarity.",
      "Here's what's most important:",
      "Let's be strategic about this.",
    ],
  },

  encouraging: {
    label: "encouraging",
    warmth: 0.85,
    strictness: 0.3,
    signaturePhrases: [
      "You've got this.",
      "I can see your potential here.",
      "This is exactly the kind of growth that matters.",
      "You're making real progress.",
    ],
  },

  analytical: {
    label: "analytical",
    warmth: 0.6,
    strictness: 0.7,
    signaturePhrases: [
      "Let's break this down.",
      "Here's what the data shows:",
      "From a strategic standpoint:",
      "The pattern I'm seeing is:",
    ],
  },

  motivational: {
    label: "motivational",
    warmth: 0.8,
    strictness: 0.6,
    signaturePhrases: [
      "Now's the time to act on this.",
      "Let's turn this into momentum.",
      "This is your opportunity to:",
      "You're ready for this next step.",
    ],
  },
};

/**
 * Get EQ Profile
 *
 * Returns an EQ profile by label.
 *
 * @param label - Profile label
 * @returns EQ profile
 */
export function getEQProfile(label: string): JennyEQProfile {
  return JennyEQProfiles[label] || JennyEQProfiles.warm_supportive;
}

/**
 * Get Random Signature Phrase
 *
 * Returns a random signature phrase from a profile.
 *
 * @param profile - EQ profile
 * @returns Random phrase
 */
export function getRandomSignaturePhrase(profile: JennyEQProfile): string {
  const phrases = profile.signaturePhrases;
  return phrases[Math.floor(Math.random() * phrases.length)];
}

/**
 * Format EQ Tone for Display
 *
 * Formats EQ tone data for UI display.
 *
 * @param eqTone - EQ tone object
 * @returns Formatted string
 */
export function formatEQToneForDisplay(eqTone: {
  label: string;
  warmth: number;
  strictness: number;
}): string {
  return `${eqTone.label.replace("_", " ")} (${Math.round(eqTone.warmth * 100)}% warmth)`;
}

/**
 * Get Tone Badge Color
 *
 * Returns appropriate color for tone badge based on warmth level.
 *
 * @param warmth - Warmth level (0-1)
 * @returns Hex color code
 */
export function getToneBadgeColor(warmth: number): string {
  if (warmth >= 0.8) return "#f97316"; // Warm orange
  if (warmth >= 0.6) return "#3b82f6"; // Blue
  return "#6b7280"; // Gray
}
