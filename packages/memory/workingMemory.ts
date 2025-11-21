/**
 * workingMemory.ts
 *
 * M5 - Working Memory Manager
 *
 * Hot context window manager with automatic summarization.
 * The RAM of the agent - keeps recent turns hot and summarizes older segments.
 */

import type {
  WorkingMemoryTurn,
  WorkingMemorySummary,
  WorkingMemoryState,
  ContextBundle,
} from "./workingMemory.types";

const DEFAULT_WINDOW_SIZE = 16;

const DEFAULT_STATE: WorkingMemoryState = {
  hotWindow: [],
  summaries: [],
  windowSize: DEFAULT_WINDOW_SIZE,
};

/**
 * Session Store Interface
 */
interface SessionStore {
  get(sessionId: string): any;
  update(sessionId: string, data: any): void;
}

/**
 * Summarizer Interface
 *
 * Optional interface for LLM-based summarization.
 * If not provided, working memory will use simple truncation.
 */
export interface Summarizer {
  summarize(turns: WorkingMemoryTurn[]): Promise<{
    summary: string;
    keyPoints: string[];
  }>;
}

export class WorkingMemoryManager {
  private summarizer?: Summarizer;

  constructor(
    private sessionStore: SessionStore,
    options?: {
      summarizer?: Summarizer;
      windowSize?: number;
    }
  ) {
    this.summarizer = options?.summarizer;
    if (options?.windowSize) {
      DEFAULT_STATE.windowSize = options.windowSize;
    }
  }

  /**
   * Get State
   *
   * Returns working memory state, initializing if needed.
   *
   * @param sessionId - Session identifier
   * @returns Working memory state
   */
  private getState(sessionId: string): WorkingMemoryState {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    if (!session.workingMemory) {
      session.workingMemory = JSON.parse(JSON.stringify(DEFAULT_STATE));
      this.sessionStore.update(sessionId, session);
    }

    return session.workingMemory;
  }

  /**
   * Add Turn
   *
   * Adds a new turn to working memory.
   * Triggers summarization if window exceeds size limit.
   *
   * @param sessionId - Session identifier
   * @param turn - Turn number
   * @param userMessage - User's message
   * @param agentReply - Agent's reply
   */
  async addTurn(
    sessionId: string,
    turn: number,
    userMessage: string,
    agentReply: string
  ): Promise<void> {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    const state = this.getState(sessionId);

    const entry: WorkingMemoryTurn = {
      turn,
      userMessage,
      agentReply,
      timestamp: new Date().toISOString(),
    };

    state.hotWindow.push(entry);

    // If window exceeds size, summarize oldest segment
    if (state.hotWindow.length > state.windowSize) {
      await this.summarizeOldest(sessionId, state);
    }

    this.sessionStore.update(sessionId, {
      ...session,
      workingMemory: state,
    });

    console.log(`[WorkingMemory] Added turn ${turn} (window: ${state.hotWindow.length}/${state.windowSize})`);
  }

  /**
   * Summarize Oldest
   *
   * Summarizes the oldest half of the hot window and moves it to summaries.
   *
   * @param sessionId - Session identifier
   * @param state - Working memory state
   */
  private async summarizeOldest(
    sessionId: string,
    state: WorkingMemoryState
  ): Promise<void> {
    const segmentSize = Math.floor(state.windowSize / 2);
    const toSummarize = state.hotWindow.slice(0, segmentSize);
    const remaining = state.hotWindow.slice(segmentSize);

    if (toSummarize.length === 0) return;

    let summary: string;
    let keyPoints: string[] = [];

    if (this.summarizer) {
      // Use LLM-based summarization
      const result = await this.summarizer.summarize(toSummarize);
      summary = result.summary;
      keyPoints = result.keyPoints;
    } else {
      // Fallback: Simple concatenation
      summary = `Turns ${toSummarize[0].turn}-${toSummarize[toSummarize.length - 1].turn}: `;
      summary += toSummarize
        .map((t) => `T${t.turn}: User asked about topic, agent responded.`)
        .join(" ");
      keyPoints = ["Summary generated without LLM summarizer"];
    }

    const summarizedSegment: WorkingMemorySummary = {
      startTurn: toSummarize[0].turn,
      endTurn: toSummarize[toSummarize.length - 1].turn,
      summary,
      keyPoints,
      timestamp: new Date().toISOString(),
    };

    state.summaries.push(summarizedSegment);
    state.hotWindow = remaining;

    console.log(
      `[WorkingMemory] Summarized turns ${summarizedSegment.startTurn}-${summarizedSegment.endTurn}`
    );
  }

  /**
   * Get Context Bundle
   *
   * Returns a context bundle for LLM input.
   * Contains recent turns from hot window and summaries of earlier conversation.
   *
   * @param sessionId - Session identifier
   * @returns Context bundle
   */
  getContext(sessionId: string): ContextBundle {
    const state = this.getState(sessionId);

    const totalTurns =
      state.summaries.reduce((sum, s) => sum + (s.endTurn - s.startTurn + 1), 0) +
      state.hotWindow.length;

    return {
      recentTurns: [...state.hotWindow],
      historySummaries: [...state.summaries],
      totalTurns,
    };
  }

  /**
   * Get Hot Window
   *
   * Returns the current hot window of recent turns.
   *
   * @param sessionId - Session identifier
   * @returns Array of recent turns
   */
  getHotWindow(sessionId: string): WorkingMemoryTurn[] {
    const state = this.getState(sessionId);
    return [...state.hotWindow];
  }

  /**
   * Get All Summaries
   *
   * Returns all conversation summaries.
   *
   * @param sessionId - Session identifier
   * @returns Array of summaries
   */
  getAllSummaries(sessionId: string): WorkingMemorySummary[] {
    const state = this.getState(sessionId);
    return [...state.summaries];
  }

  /**
   * Get Turn Count
   *
   * Returns total number of turns in the conversation.
   *
   * @param sessionId - Session identifier
   * @returns Total turn count
   */
  getTurnCount(sessionId: string): number {
    const state = this.getState(sessionId);
    return (
      state.summaries.reduce((sum, s) => sum + (s.endTurn - s.startTurn + 1), 0) +
      state.hotWindow.length
    );
  }

  /**
   * Find Turn
   *
   * Searches for a specific turn in the hot window.
   * Returns undefined if turn is in summarized segments.
   *
   * @param sessionId - Session identifier
   * @param turn - Turn number
   * @returns Turn data or undefined
   */
  findTurn(sessionId: string, turn: number): WorkingMemoryTurn | undefined {
    const state = this.getState(sessionId);
    return state.hotWindow.find((t) => t.turn === turn);
  }

  /**
   * Get Recent N Turns
   *
   * Returns the last N turns from the hot window.
   *
   * @param sessionId - Session identifier
   * @param count - Number of turns to retrieve
   * @returns Array of recent turns
   */
  getRecentTurns(sessionId: string, count: number): WorkingMemoryTurn[] {
    const state = this.getState(sessionId);
    return state.hotWindow.slice(-count);
  }

  /**
   * Clear Working Memory
   *
   * Resets working memory to initial state.
   * Use with caution - this removes all conversation history.
   *
   * @param sessionId - Session identifier
   */
  clear(sessionId: string): void {
    const session = this.sessionStore.get(sessionId);
    if (!session) throw new Error("Session not found");

    session.workingMemory = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.sessionStore.update(sessionId, session);

    console.log(`[WorkingMemory] Cleared for ${sessionId}`);
  }

  /**
   * Get Memory Stats
   *
   * Returns statistics about working memory usage.
   *
   * @param sessionId - Session identifier
   * @returns Memory statistics
   */
  getMemoryStats(sessionId: string): {
    hotWindowSize: number;
    hotWindowCapacity: number;
    summaryCount: number;
    totalTurns: number;
    oldestSummarizedTurn: number | null;
    newestTurn: number | null;
  } {
    const state = this.getState(sessionId);

    const oldestSummarizedTurn =
      state.summaries.length > 0 ? state.summaries[0].startTurn : null;

    const newestTurn =
      state.hotWindow.length > 0
        ? state.hotWindow[state.hotWindow.length - 1].turn
        : null;

    return {
      hotWindowSize: state.hotWindow.length,
      hotWindowCapacity: state.windowSize,
      summaryCount: state.summaries.length,
      totalTurns: this.getTurnCount(sessionId),
      oldestSummarizedTurn,
      newestTurn,
    };
  }
}
