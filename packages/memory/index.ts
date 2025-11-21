/**
 * packages/memory/index.ts
 *
 * Memory Layer - Central Exports
 *
 * Phase 1 memory modules for assessment agent.
 * Session-scoped, lightweight, purely functional.
 */

// M1 - EQ Memory
export { EQMemoryManager } from "./eqMemory";
export type {
  Archetype,
  ToneSignature,
  EQMemory,
} from "./eqMemory.types";

// M2 - Evidence Memory
export { EvidenceMemoryManager } from "./evidenceMemory";
export type {
  EvidenceSourceType,
  EvidenceReference,
  EvidenceMemoryEntry,
  EvidenceMemoryState,
} from "./evidenceMemory.types";

// M3 - Response Memory
export { ResponseMemoryManager } from "./responseMemory";
export type {
  AgentTurnMeta,
  ResponseMemoryState,
} from "./responseMemory.types";

// M4 - Student State Memory
export { StudentStateMemoryManager } from "./studentStateMemory";
export type {
  EmotionalTone,
  CognitiveLoad,
  MotivationLevel,
  ConfidenceLevel,
  ArchetypeState,
  StudentStateSnapshot,
  StudentStateMemoryState,
} from "./studentStateMemory.types";

// M5 - Working Memory
export { WorkingMemoryManager } from "./workingMemory";
export type {
  WorkingMemoryTurn,
  WorkingMemorySummary,
  WorkingMemoryState,
  ContextBundle,
} from "./workingMemory.types";
export type { Summarizer } from "./workingMemory";
