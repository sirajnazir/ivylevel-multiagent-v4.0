/**
 * eqMemory.types.ts
 *
 * M1 - EQ Memory Types
 *
 * Type definitions for emotional intelligence memory.
 * Tracks archetype, tone signature, rapport, and sentiment.
 */

export type Archetype =
  | "Achiever"
  | "Builder"
  | "Explorer"
  | "Striver"
  | "Underdog"
  | "LateBloomer"
  | "Visionary"
  | "StructuredThinker"
  | "AnxiousHighPotential"
  | "HighPerformerLowStructure";

export interface ToneSignature {
  warmth: number;        // 0–1
  directness: number;    // 0–1
  enthusiasm: number;    // 0–1
  firmness: number;      // 0–1
  empathy: number;       // 0–1
  encouragement: number; // 0–1
}

export interface EQMemory {
  archetype: Archetype | null;
  tone: ToneSignature;
  rapportLevel: number;      // 0–1
  lastSentiment?: string;    // "positive" | "neutral" | "negative"
  lastAffirmationUsed?: string;
}
