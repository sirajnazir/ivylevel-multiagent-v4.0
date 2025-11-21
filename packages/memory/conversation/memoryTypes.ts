/**
 * Memory Types v4.0
 *
 * Type definitions for the Conversation Memory Engine.
 *
 * This defines the data structures for:
 * - Short-term memory (sliding window of recent turns)
 * - Session memory (full session state)
 * - Memory turns (individual conversation exchanges)
 * - Assessment progress tracking
 */

/**
 * Memory Turn
 *
 * A single conversational exchange.
 * Represents either a user message or assistant response.
 */
export interface MemoryTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    eqMode?: string;
    intent?: string;
    archetype?: string;
    chipsUsed?: number;
  };
}

/**
 * Short-Term Memory State
 *
 * Volatile memory that maintains a sliding window of recent turns.
 * Used for immediate conversational context.
 */
export interface ShortTermMemoryState {
  window: MemoryTurn[];
  maxWindow: number; // Default: 12-20 turns
}

/**
 * Assessment Progress
 *
 * Tracks which stages of the assessment have been completed.
 * Used to guide conversation flow and prevent redundant steps.
 */
export interface AssessmentProgress {
  profileExtracted: boolean;
  oraclesDone: boolean;
  narrativeDone: boolean;
  strategyDone: boolean;
}

/**
 * Session Memory State
 *
 * Persistent memory for the entire assessment session.
 * Accumulates all turns and tracks session-wide signals.
 */
export interface SessionMemoryState {
  sessionId: string;
  turns: MemoryTurn[];
  eqSignals: string[];
  archetype: string | null;
  intents: string[];
  chipsUsed: string[];
  assessmentProgress: AssessmentProgress;
  metadata?: {
    startTime: string;
    lastUpdateTime: string;
    turnCount: number;
  };
}

/**
 * Memory Context
 *
 * Combined context returned to agents.
 * Includes both short-term window and full session state.
 */
export interface MemoryContext {
  shortContext: MemoryTurn[];
  fullSession: SessionMemoryState;
}

/**
 * Memory Statistics
 *
 * Useful metadata about memory state.
 */
export interface MemoryStats {
  totalTurns: number;
  userTurns: number;
  assistantTurns: number;
  eqSignalsRecorded: number;
  uniqueIntents: number;
  chipsUsedCount: number;
  sessionDuration?: number; // milliseconds
}

/**
 * Reference Memory Entry
 *
 * Optional: Pre-loaded context from previous sessions or intake.
 * Not implemented in v1 but scaffolded for future.
 */
export interface ReferenceMemoryEntry {
  type: "previous_session" | "intake_survey" | "parent_note" | "profile_data";
  content: string;
  timestamp: string;
  relevance?: number; // 0-1 score for retrieval
}
