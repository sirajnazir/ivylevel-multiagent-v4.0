/**
 * evidenceMemory.types.ts
 *
 * M2 - Evidence Memory Types
 *
 * Type definitions for evidence tracking.
 * Stores references to evidence used in each reply for transparency.
 */

export type EvidenceSourceType =
  | "kb_chip"
  | "eq_chip"
  | "intel_chip"
  | "rag_passage"
  | "strategy_chip"
  | "student_history"
  | "session_context";

export interface EvidenceReference {
  id: string;                       // unique ID (hash, chip-id, etc.)
  sourceType: EvidenceSourceType;   // categorization
  filePath?: string;                // where it originally came from
  excerpt?: string;                 // trimmed excerpt for display
  confidence?: number;              // 0–1 (LLM can compute)
}

export interface EvidenceMemoryEntry {
  turn: number;                     // 1,2,3... chat turn index
  usedEvidence: EvidenceReference[];
}

export interface EvidenceMemoryState {
  trail: EvidenceMemoryEntry[];
}
