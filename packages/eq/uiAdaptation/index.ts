/**
 * index.ts
 *
 * Component 4 - UI Adaptation Exports
 *
 * Main exports for the UI adaptation system.
 */

// Main adapter
export { UIAdapter } from "./uiAdapter";

// UI rules
export {
  getUIRules,
  getColorTheme,
  getMicrocopyTone,
  shouldShowEvidence,
  getChipDensity,
  getPacing,
} from "./uiRules";

// Components
export { ArchetypeBanner } from "./components/ArchetypeBanner";
export { Microcopy } from "./components/Microcopy";
export { Chips } from "./components/Chips";
export { Stepper } from "./components/Stepper";

// Types
export type {
  UIState,
  UIAdaptationContext,
  MicrocopyMap,
  ArchetypeUIOverrides,
} from "./types";
