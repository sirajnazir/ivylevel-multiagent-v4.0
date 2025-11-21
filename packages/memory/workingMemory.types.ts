/**
 * workingMemory.types.ts
 *
 * M5 - Working Memory Types
 *
 * Type definitions for working memory (hot context window).
 * The RAM of the agent - fixed-size window with summarization.
 */

export interface WorkingMemoryTurn {
  turn: number;                          // 1,2,3... chat turn index
  userMessage: string;
  agentReply: string;
  timestamp: string;                     // ISO timestamp
}

export interface WorkingMemorySummary {
  startTurn: number;                     // First turn in summarized segment
  endTurn: number;                       // Last turn in summarized segment
  summary: string;                       // LLM-generated summary of the segment
  keyPoints: string[];                   // Key points extracted from segment
  timestamp: string;                     // ISO timestamp
}

export interface WorkingMemoryState {
  hotWindow: WorkingMemoryTurn[];        // Recent turns (default: last 16)
  summaries: WorkingMemorySummary[];     // Summaries of older segments
  windowSize: number;                    // Maximum turns in hot window (default: 16)
}

export interface ContextBundle {
  recentTurns: WorkingMemoryTurn[];      // Turns from hot window
  historySummaries: WorkingMemorySummary[]; // Summaries of earlier conversation
  totalTurns: number;                    // Total conversation length
}
