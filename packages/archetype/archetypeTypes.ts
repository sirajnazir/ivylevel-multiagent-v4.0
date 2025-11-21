/**
 * Archetype Types v4.0
 *
 * Basic student archetype definitions for EQ routing.
 * These are simplified versions - full archetype system is Component 23+.
 */

export type ArchetypeType =
  | "high_achiever"
  | "burnout"
  | "late_starter"
  | "quiet_builder"
  | "explorer"
  | "uncertain";

export interface ArchetypeProfile {
  type: ArchetypeType;
  confidence?: number;
  motivation?: number;
  overwhelm?: number;
}
