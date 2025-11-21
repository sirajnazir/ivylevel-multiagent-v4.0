/**
 * studentStateMemory.types.ts
 *
 * M4 - Student State Memory Types
 *
 * Type definitions for student state tracking.
 * Tracks what the student is becoming (evolving emotional/cognitive state).
 */

export type EmotionalTone =
  | "excited"
  | "anxious"
  | "confident"
  | "overwhelmed"
  | "curious"
  | "defensive"
  | "engaged"
  | "withdrawn"
  | "neutral";

export type CognitiveLoad = "low" | "medium" | "high" | "overloaded";

export type MotivationLevel = "low" | "medium" | "high";

export type ConfidenceLevel = "low" | "medium" | "high";

export interface ArchetypeState {
  current: string;                       // Current archetype classification
  confidence: number;                    // 0-1 confidence in classification
  drift?: {
    toward: string;                      // Archetype drifting toward
    strength: number;                    // 0-1 strength of drift
  };
}

export interface StudentStateSnapshot {
  turn: number;                          // 1,2,3... chat turn index
  emotionalTone: EmotionalTone;
  cognitiveLoad: CognitiveLoad;
  motivation: MotivationLevel;
  confidence: ConfidenceLevel;
  archetypeState?: ArchetypeState;
  signalsDetected?: string[];            // Key signals observed (e.g., "mentions_time_pressure", "asks_clarifying_questions")
  timestamp: string;                     // ISO timestamp
}

export interface StudentStateMemoryState {
  snapshots: StudentStateSnapshot[];
  latestSnapshot: StudentStateSnapshot | null;
}
