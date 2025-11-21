/**
 * Memory Manager v4.0
 *
 * Unified interface combining Short-Term and Session Memory.
 *
 * Purpose:
 * - Single entry point for all memory operations
 * - Automatically updates both STM and SM
 * - Provides convenient access methods
 * - Simplifies agent integration
 *
 * Usage in Assessment Agent:
 * ```typescript
 * constructor(sessionId: string) {
 *   this.memory = new MemoryManager(sessionId);
 * }
 *
 * // Add user message
 * this.memory.addTurn("user", userMessage);
 *
 * // Add assistant response
 * this.memory.addTurn("assistant", response);
 *
 * // Record signals
 * this.memory.addEQSignal(eqMode);
 * this.memory.setArchetype(archetype);
 * this.memory.addIntent(intent);
 * this.memory.addChips(chips);
 *
 * // Mark progress
 * this.memory.markProgress("profileExtracted");
 *
 * // Get context for next response
 * const context = this.memory.getContext();
 * ```
 */

import { ShortTermMemory } from "./shortTermMemory";
import { SessionMemory } from "./sessionMemory";
import { MemoryTurn, MemoryContext, MemoryStats, AssessmentProgress } from "./memoryTypes";

/**
 * Memory Manager
 *
 * Combines STM + SM into a single interface for agents.
 */
export class MemoryManager {
  private sessionMemory: SessionMemory;
  private shortTerm: ShortTermMemory;

  /**
   * Constructor
   *
   * @param sessionId - Unique session identifier
   * @param shortTermWindow - Max STM window size (default: 14)
   */
  constructor(sessionId: string, shortTermWindow: number = 14) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[MemoryManager] Initializing for session: ${sessionId}`);
    console.log(`[MemoryManager] Short-term window: ${shortTermWindow}`);
    console.log("=".repeat(60) + "\n");

    this.sessionMemory = new SessionMemory(sessionId);
    this.shortTerm = new ShortTermMemory(shortTermWindow);
  }

  /**
   * Add Turn
   *
   * Adds a conversational turn to both STM and SM.
   *
   * @param role - "user" or "assistant"
   * @param content - Message content
   * @param metadata - Optional metadata (EQ mode, intent, etc.)
   */
  addTurn(role: "user" | "assistant", content: string, metadata?: MemoryTurn["metadata"]): void {
    console.log(`[MemoryManager] Adding ${role} turn`);

    const turn: MemoryTurn = {
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    };

    // Add to both memories
    this.sessionMemory.addTurn(turn);
    this.shortTerm.addTurn(turn);
  }

  /**
   * Add EQ Signal
   *
   * Records an EQ mode or emotional state detected.
   *
   * @param signal - EQ signal
   */
  addEQSignal(signal: string): void {
    this.sessionMemory.addEQSignal(signal);
  }

  /**
   * Set Archetype
   *
   * Sets or updates the student archetype.
   *
   * @param type - Archetype type
   */
  setArchetype(type: string): void {
    this.sessionMemory.setArchetype(type);
  }

  /**
   * Add Intent
   *
   * Records a detected user intent.
   *
   * @param intent - Intent type
   */
  addIntent(intent: string): void {
    this.sessionMemory.addIntent(intent);
  }

  /**
   * Add Chips
   *
   * Records knowledge chips used in generation.
   *
   * @param chips - Array of chip identifiers
   */
  addChips(chips: string[]): void {
    this.sessionMemory.addChips(chips);
  }

  /**
   * Mark Progress
   *
   * Marks an assessment step as complete.
   *
   * @param step - Progress step key
   */
  markProgress(step: keyof AssessmentProgress): void {
    this.sessionMemory.updateProgress(step, true);
  }

  /**
   * Get Context
   *
   * Returns combined memory context for agents.
   * Includes both short-term window and full session state.
   *
   * @returns Memory context
   */
  getContext(): MemoryContext {
    return {
      shortContext: this.shortTerm.getWindow(),
      fullSession: this.sessionMemory.getFullState()
    };
  }

  /**
   * Get Short Context as String
   *
   * Returns recent conversation formatted as string.
   * Useful for injecting into LLM prompts.
   *
   * @returns Formatted conversation string
   */
  getShortContextString(): string {
    return this.shortTerm.getWindowAsContext();
  }

  /**
   * Get Last User Message
   *
   * Returns the most recent user message.
   *
   * @returns Last user turn or undefined
   */
  getLastUserMessage(): MemoryTurn | undefined {
    return this.shortTerm.getLastUserMessage();
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
    return this.shortTerm.getLastAssistantMessage();
  }

  /**
   * Get Current Archetype
   *
   * @returns Current archetype or null
   */
  getCurrentArchetype(): string | null {
    return this.sessionMemory.getArchetype();
  }

  /**
   * Get Assessment Progress
   *
   * @returns Assessment progress state
   */
  getProgress(): AssessmentProgress {
    return this.sessionMemory.getProgress();
  }

  /**
   * Is Step Complete
   *
   * Checks if a specific assessment step is done.
   *
   * @param step - Progress step key
   * @returns True if complete
   */
  isStepComplete(step: keyof AssessmentProgress): boolean {
    return this.sessionMemory.isStepComplete(step);
  }

  /**
   * Get Stats
   *
   * Returns memory statistics.
   *
   * @returns Memory stats
   */
  getStats(): MemoryStats {
    return this.sessionMemory.getStats();
  }

  /**
   * Get Summary
   *
   * Returns human-readable summary of the session.
   *
   * @returns Summary string
   */
  getSummary(): string {
    return this.sessionMemory.getSummary();
  }

  /**
   * Clear Short-Term Memory
   *
   * Clears the STM window (keeps session memory intact).
   * Useful for conversation resets without losing session history.
   */
  clearShortTerm(): void {
    console.log(`[MemoryManager] Clearing short-term memory`);
    this.shortTerm.clear();
  }

  /**
   * Serialize
   *
   * Serializes session memory to JSON string.
   * Useful for persistence or session resume.
   *
   * @returns JSON string
   */
  serialize(): string {
    return this.sessionMemory.serialize();
  }

  /**
   * Restore
   *
   * Static method to restore MemoryManager from serialized state.
   *
   * @param serialized - JSON string
   * @param shortTermWindow - STM window size (default: 14)
   * @returns Restored MemoryManager instance
   */
  static restore(serialized: string, shortTermWindow: number = 14): MemoryManager {
    const sessionMemory = SessionMemory.restore(serialized);
    const sessionId = sessionMemory.getSessionId();

    const manager = new MemoryManager(sessionId, shortTermWindow);
    manager.sessionMemory = sessionMemory;

    // Rebuild short-term window from recent turns
    const recentTurns = sessionMemory.getRecentTurns(shortTermWindow);
    recentTurns.forEach(turn => manager.shortTerm.addTurn(turn));

    console.log(`[MemoryManager] Restored session ${sessionId} with ${recentTurns.length} turns in STM`);

    return manager;
  }

  /**
   * Get Conversation History
   *
   * Returns formatted conversation history for display or logging.
   *
   * @param maxTurns - Maximum turns to include (default: all)
   * @returns Formatted history string
   */
  getConversationHistory(maxTurns?: number): string {
    const allTurns = this.sessionMemory.getAllTurns();
    const turns = maxTurns ? allTurns.slice(-maxTurns) : allTurns;

    if (turns.length === 0) {
      return "[No conversation history]";
    }

    return turns
      .map((turn, idx) => {
        const label = turn.role === "user" ? "Student" : "Jenny";
        const timestamp = new Date(turn.timestamp).toLocaleTimeString();
        return `[${idx + 1}] ${timestamp} - ${label}:\n${turn.content}`;
      })
      .join("\n\n");
  }

  /**
   * Get Session ID
   *
   * @returns Session identifier
   */
  getSessionId(): string {
    return this.sessionMemory.getSessionId();
  }

  /**
   * Get Window Stats
   *
   * Returns statistics about the short-term memory window.
   *
   * @returns Window stats
   */
  getWindowStats() {
    return this.shortTerm.getWindowStats();
  }

  /**
   * Log Memory State
   *
   * Logs current memory state to console.
   * Useful for debugging.
   */
  logMemoryState(): void {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`[MemoryManager] Memory State`);
    console.log("=".repeat(60));
    console.log(this.getSummary());
    console.log(``);
    console.log(`Short-Term Window:`);
    console.log(`  Size: ${this.shortTerm.getWindowSize()}/${this.shortTerm.getWindowStats().maxSize}`);
    console.log(`  User Turns: ${this.shortTerm.getWindowStats().userTurns}`);
    console.log(`  Assistant Turns: ${this.shortTerm.getWindowStats().assistantTurns}`);
    console.log("=".repeat(60) + "\n");
  }
}
