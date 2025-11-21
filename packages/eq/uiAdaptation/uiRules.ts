/**
 * uiRules.ts
 *
 * Component 4 - UI Adaptation Rules
 *
 * Rules that dictate how UI should behave per archetype.
 * These rules make the UI emotionally intelligent and responsive.
 */

import type { UIState, UIAdaptationContext, ArchetypeUIOverrides } from "./types";

/**
 * Archetype UI Map
 *
 * Maps each student archetype to specific UI adaptations.
 * This is what makes the UI feel "hand-crafted" for each student type.
 */
const ARCHETYPE_UI_MAP: Record<string, ArchetypeUIOverrides> = {
  OverwhelmedStarter: {
    colorTheme: "#5A76FF",
    microcopyTone: "calming",
    chipDensity: "low",
    showEvidence: false,
    pacing: "slow",
  },

  QuietHighPotential: {
    microcopyTone: "gentle",
    pacing: "slow",
    chipDensity: "low",
  },

  BurntOutAchiever: {
    microcopyTone: "reassuring",
    chipDensity: "low",
    pacing: "slow",
    showEvidence: false,
  },

  Explorer: {
    microcopyTone: "curious",
    chipDensity: "medium",
    showEvidence: true,
  },

  LateBloomer: {
    microcopyTone: "gentle",
    chipDensity: "medium",
    pacing: "slow",
  },

  Hacker: {
    microcopyTone: "direct",
    chipDensity: "high",
    pacing: "fast",
    showEvidence: true,
  },

  ReluctantDoer: {
    microcopyTone: "directive",
    chipDensity: "low",
    pacing: "normal",
  },

  HighFlyingGeneralist: {
    microcopyTone: "direct",
    chipDensity: "high",
    pacing: "fast",
    showEvidence: true,
  },

  HyperPerfectionist: {
    microcopyTone: "soft-direct",
    pacing: "slow",
    chipDensity: "low",
    showEvidence: false,
  },

  AnxiousPlanner: {
    microcopyTone: "reassuring",
    pacing: "slow",
    chipDensity: "low",
  },

  CreativeBuilder: {
    microcopyTone: "curious",
    chipDensity: "medium",
    showEvidence: true,
  },

  DistractedMultitasker: {
    microcopyTone: "directive",
    showEvidence: false,
    pacing: "fast",
    chipDensity: "low",
  },

  UnderconfidentStriver: {
    microcopyTone: "reassuring",
    chipDensity: "low",
    pacing: "slow",
  },

  IndependentThinker: {
    microcopyTone: "direct",
    chipDensity: "high",
    showEvidence: true,
  },

  StructuredExecutor: {
    microcopyTone: "directive",
    chipDensity: "high",
    pacing: "fast",
  },
};

/**
 * Get UI Rules
 *
 * Returns the complete UI state based on archetype and context.
 *
 * @param ctx - UI adaptation context
 * @returns Complete UI state
 */
export function getUIRules(ctx: UIAdaptationContext): UIState {
  // Base default state
  const base: UIState = {
    archetype: ctx.archetype,
    eqStyle: ctx.eqStyle,
    colorTheme: "#4A8CF7",
    microcopyTone: "neutral",
    chipDensity: "medium",
    showEvidence: true,
    showProgressStepper: true,
    pacing: "normal",
  };

  // Get archetype-specific overrides
  const overrides = ARCHETYPE_UI_MAP[ctx.archetype] || {};

  // Merge base with overrides
  return { ...base, ...overrides };
}

/**
 * Get Color Theme for Archetype
 *
 * Returns the primary color theme for a given archetype.
 *
 * @param archetype - Student archetype
 * @returns Hex color code
 */
export function getColorTheme(archetype: string): string {
  return ARCHETYPE_UI_MAP[archetype]?.colorTheme || "#4A8CF7";
}

/**
 * Get Microcopy Tone for Archetype
 *
 * Returns the microcopy tone for a given archetype.
 *
 * @param archetype - Student archetype
 * @returns Microcopy tone
 */
export function getMicrocopyTone(archetype: string): string {
  return ARCHETYPE_UI_MAP[archetype]?.microcopyTone || "neutral";
}

/**
 * Should Show Evidence
 *
 * Determines if evidence chips should be shown for this archetype.
 * Some archetypes (overwhelmed, anxious) benefit from less cognitive load.
 *
 * @param archetype - Student archetype
 * @returns True if evidence should be shown
 */
export function shouldShowEvidence(archetype: string): boolean {
  const override = ARCHETYPE_UI_MAP[archetype]?.showEvidence;
  return override !== undefined ? override : true;
}

/**
 * Get Chip Density
 *
 * Returns the chip density level for this archetype.
 *
 * @param archetype - Student archetype
 * @returns Chip density
 */
export function getChipDensity(archetype: string): "low" | "medium" | "high" {
  return ARCHETYPE_UI_MAP[archetype]?.chipDensity || "medium";
}

/**
 * Get Pacing
 *
 * Returns the UI pacing speed for this archetype.
 *
 * @param archetype - Student archetype
 * @returns Pacing speed
 */
export function getPacing(archetype: string): "slow" | "normal" | "fast" {
  return ARCHETYPE_UI_MAP[archetype]?.pacing || "normal";
}
