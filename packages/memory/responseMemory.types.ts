/**
 * responseMemory.types.ts
 *
 * M3 - Response Memory Types
 *
 * Type definitions for agent thought trail.
 * Tracks what the agent said, why it said it, and how it adapted.
 */

export interface AgentTurnMeta {
  turn: number;                          // 1,2,3... chat turn index
  intent: string;                        // "explore_academics" | "build_rapport" | etc.
  appliedFramework?: string;             // "CARE" | "SPARK" | "ANCHOR" | etc.
  eqAdjustment?: {
    toneDelta?: {
      warmth?: number;
      directness?: number;
      enthusiasm?: number;
      firmness?: number;
      empathy?: number;
      encouragement?: number;
    };
    rapportDelta?: number;
  };
  inferenceInputs?: {
    kbChipsUsed?: string[];              // IDs of KB chips used
    eqChipsUsed?: string[];              // IDs of EQ chips used
    intelChipsUsed?: string[];           // IDs of intelligence chips used
    ragPassagesUsed?: string[];          // IDs of RAG passages used
  };
  expectedStudentSignal?: string;        // What agent expects student to reveal
  timestamp: string;                     // ISO timestamp
}

export interface ResponseMemoryState {
  trail: AgentTurnMeta[];
}
