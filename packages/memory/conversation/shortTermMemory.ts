/**
 * Short-Term Memory v4.0
 *
 * Maintains a sliding window of recent conversational turns.
 *
 * Purpose:
 * - Provides immediate context for next response
 * - Prevents loopiness (agent repeating itself)
 * - Maintains conversational flow
 * - Keeps context window manageable for LLM
 *
 * Window Size:
 * - Default: 14 turns (7 user, 7 assistant)
 * - Configurable: 10-20 turns recommended
 * - Auto-evicts oldest when full
 */

import { MemoryTurn, ShortTermMemoryState } from "./memoryTypes";

/**
 * Short-Term Memory
 *
 * Volatile, sliding-window memory for recent conversation context.
 */
export class ShortTermMemory {
  private state: ShortTermMemoryState;

  /**
   * Constructor
   *
   * @param maxWindow - Maximum number of turns to keep (default: 14)
   */
  constructor(maxWindow: number = 14) {
    console.log(`[ShortTermMemory] Initializing with maxWindow=${maxWindow}`);

    this.state = {
      window: [],
      maxWindow
    };
  }

  /**
   * Add Turn
   *
   * Adds a new conversational turn to the window.
   * Auto-evicts oldest turn if window is full.
   *
   * @param turn - The memory turn to add
   */
  addTurn(turn: MemoryTurn): void {
    console.log(`[ShortTermMemory] Adding ${turn.role} turn (window: ${this.state.window.length}/${this.state.maxWindow})`);

    this.state.window.push(turn);

    // Evict oldest if window exceeds max
    if (this.state.window.length > this.state.maxWindow) {
      const evicted = this.state.window.shift();
      console.log(`[ShortTermMemory] Evicted oldest turn (${evicted?.role})`);
    }
  }

  /**
   * Get Window
   *
   * Returns a deep copy of the current window.
   * Returns copy to prevent external mutation.
   *
   * @returns Array of memory turns
   */
  getWindow(): MemoryTurn[] {
    return JSON.parse(JSON.stringify(this.state.window));
  }

  /**
   * Get Window as Context String
   *
   * Returns the window formatted as a conversation string.
   * Useful for injecting into LLM prompts.
   *
   * @returns Formatted conversation string
   */
  getWindowAsContext(): string {
    if (this.state.window.length === 0) {
      return "[No recent conversation history]";
    }

    return this.state.window
      .map(turn => {
        const label = turn.role === "user" ? "Student" : "Jenny";
        return `${label}: ${turn.content}`;
      })
      .join("\n\n");
  }

  /**
   * Get Last N Turns
   *
   * Returns the most recent N turns from the window.
   *
   * @param n - Number of turns to retrieve
   * @returns Array of memory turns
   */
  getLastNTurns(n: number): MemoryTurn[] {
    return this.state.window.slice(-n);
  }

  /**
   * Get Last User Message
   *
   * Returns the most recent user message.
   * Useful for understanding current user intent.
   *
   * @returns Last user turn or undefined
   */
  getLastUserMessage(): MemoryTurn | undefined {
    for (let i = this.state.window.length - 1; i >= 0; i--) {
      if (this.state.window[i].role === "user") {
        return this.state.window[i];
      }
    }
    return undefined;
  }

  /**
   * Get Last Assistant Message
   *
   * Returns the most recent assistant message.
   * Useful for preventing repetition.
   *
   * @returns Last assistant turn or undefined
   */
  getLastAssistantMessage(): MemoryTurn | undefined {
    for (let i = this.state.window.length - 1; i >= 0; i--) {
      if (this.state.window[i].role === "assistant") {
        return this.state.window[i];
      }
    }
    return undefined;
  }

  /**
   * Clear
   *
   * Clears the entire window.
   * Useful for testing or session resets.
   */
  clear(): void {
    console.log(`[ShortTermMemory] Clearing window (had ${this.state.window.length} turns)`);
    this.state.window = [];
  }

  /**
   * Get Window Size
   *
   * Returns current number of turns in window.
   *
   * @returns Current window size
   */
  getWindowSize(): number {
    return this.state.window.length;
  }

  /**
   * Is Window Full
   *
   * Checks if window has reached max capacity.
   *
   * @returns True if full
   */
  isWindowFull(): boolean {
    return this.state.window.length >= this.state.maxWindow;
  }

  /**
   * Get Window Stats
   *
   * Returns statistics about the window.
   *
   * @returns Stats object
   */
  getWindowStats(): {
    size: number;
    maxSize: number;
    userTurns: number;
    assistantTurns: number;
    isFull: boolean;
  } {
    const userTurns = this.state.window.filter(t => t.role === "user").length;
    const assistantTurns = this.state.window.filter(t => t.role === "assistant").length;

    return {
      size: this.state.window.length,
      maxSize: this.state.maxWindow,
      userTurns,
      assistantTurns,
      isFull: this.isWindowFull()
    };
  }

  /**
   * Resize Window
   *
   * Changes the maximum window size.
   * If new size is smaller, evicts oldest turns.
   *
   * @param newMaxWindow - New maximum window size
   */
  resizeWindow(newMaxWindow: number): void {
    console.log(`[ShortTermMemory] Resizing window from ${this.state.maxWindow} to ${newMaxWindow}`);

    this.state.maxWindow = newMaxWindow;

    // Evict excess turns if new size is smaller
    while (this.state.window.length > newMaxWindow) {
      this.state.window.shift();
    }
  }
}
