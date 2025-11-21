/**
 * index.ts
 *
 * Component 3 - EQ & Archetype Engine Exports
 *
 * Main exports for the EQ adaptation system.
 */

// Main engine
export { EQEngine } from "./eqEngine";

// Archetype detection
export {
  detectArchetype,
  detectArchetypeFromMessages,
  getArchetypeDescription,
  getAllArchetypes,
} from "./archetypeDetector";

// EQ middleware
export { applyEQMiddleware, getStyleGuidance } from "./eqMiddleware";

// EQ profiles
export { EQ_STYLES } from "./eqProfiles";

// Types
export type {
  Archetype,
  EQStyle,
  EQState,
  ArchetypeDetectionResult,
  EQModulationContext,
} from "./types";
