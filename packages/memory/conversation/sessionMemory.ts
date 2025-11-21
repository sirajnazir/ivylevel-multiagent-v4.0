/**
 * Session Memory v4.0
 *
 * Persistent memory for the entire assessment session.
 *
 * Purpose:
 * - Accumulates ALL conversational turns
 * - Tracks student signals (EQ, archetype, intents)
 * - Records knowledge chips used
 * - Maintains assessment progress state
 * - Provides full session context
 *
 * Lifetime:
 * - Created at session start
 * - Persists throughout entire assessment
 * - Can be serialized for storage/resume
 */

import { MemoryTurn, SessionMemoryState, AssessmentProgress, MemoryStats } from "./memoryTypes";

/**
 * Session Memory
 *
 * Persistent memory that tracks the full assessment session.
 */
export class SessionMemory {
  private state: SessionMemoryState;

  /**
   * Constructor
   *
   * @param sessionId - Unique session identifier
   */
  constructor(sessionId: string) {
    console.log(`[SessionMemory] Initializing session: ${sessionId}`);

    this.state = {
      sessionId,
      turns: [],
      eqSignals: [],
      archetype: null,
      intents: [],
      chipsUsed: [],
      assessmentProgress: {
        profileExtracted: false,
        oraclesDone: false,
        narrativeDone: false,
        strategyDone: false
      },
      metadata: {
        startTime: new Date().toISOString(),
        lastUpdateTime: new Date().toISOString(),
        turnCount: 0
      }
    };
  }

  /**
   * Add Turn
   *
   * Adds a conversational turn to the session history.
   * Never evicts - accumulates all turns.
   *
   * @param turn - The memory turn to add
   */
  addTurn(turn: MemoryTurn): void {
    console.log(`[SessionMemory] Adding ${turn.role} turn (total: ${this.state.turns.length + 1})`);

    this.state.turns.push(turn);
    this.state.metadata!.turnCount = this.state.turns.length;
    this.state.metadata!.lastUpdateTime = new Date().toISOString();
  }

  /**
   * Add EQ Signal
   *
   * Records an emotional intelligence signal detected during the session.
   *
   * @param signal - EQ mode or emotional state
   */
  addEQSignal(signal: string): void {
    console.log(`[SessionMemory] Recording EQ signal: ${signal}`);
    this.state.eqSignals.push(signal);
    this.state.metadata!.lastUpdateTime = new Date().toISOString();
  }

  /**
   * Set Archetype
   *
   * Sets the detected student archetype.
   * Updates replace previous archetype (archetype can evolve).
   *
   * @param type - Archetype type
   */
  setArchetype(type: string): void {
    console.log(`[SessionMemory] Setting archetype: ${type} (was: ${this.state.archetype || "none"})`);
    this.state.archetype = type;
    this.state.metadata!.lastUpdateTime = new Date().toISOString();
  }

  /**
   * Add Intent
   *
   * Records a detected user intent.
   *
   * @param intent - Intent type
   */
  addIntent(intent: string): void {
    console.log(`[SessionMemory] Recording intent: ${intent}`);
    this.state.intents.push(intent);
    this.state.metadata!.lastUpdateTime = new Date().toISOString();
  }

  /**
   * Add Chips
   *
   * Records knowledge chips used in generation.
   *
   * @param chips - Array of chip identifiers or content
   */
  addChips(chips: string[]): void {
    console.log(`[SessionMemory] Recording ${chips.length} chips used`);
    this.state.chipsUsed.push(...chips);
    this.state.metadata!.lastUpdateTime = new Date().toISOString();
  }

  /**
   * Update Progress
   *
   * Marks a specific assessment step as complete.
   *
   * @param step - Progress step key
   * @param value - Completion status
   */
  updateProgress(step: keyof AssessmentProgress, value: boolean): void {
    console.log(`[SessionMemory] Marking progress: ${step} = ${value}`);
    this.state.assessmentProgress[step] = value;
    this.state.metadata!.lastUpdateTime = new Date().toISOString();
  }

  /**
   * Get Full State
   *
   * Returns a deep copy of the entire session state.
   * Safe for serialization or external access.
   *
   * @returns Session memory state
   */
  getFullState(): SessionMemoryState {
    return JSON.parse(JSON.stringify(this.state));
  }

  /**
   * Get Session ID
   *
   * @returns Session identifier
   */
  getSessionId(): string {
    return this.state.sessionId;
  }

  /**
   * Get All Turns
   *
   * Returns all conversational turns.
   *
   * @returns Array of memory turns
   */
  getAllTurns(): MemoryTurn[] {
    return [...this.state.turns];
  }

  /**
   * Get Recent Turns
   *
   * Returns the N most recent turns.
   *
   * @param count - Number of turns to retrieve
   * @returns Array of memory turns
   */
  getRecentTurns(count: number): MemoryTurn[] {
    return this.state.turns.slice(-count);
  }

  /**
   * Get EQ Signal History
   *
   * Returns all recorded EQ signals.
   *
   * @returns Array of EQ signals
   */
  getEQSignals(): string[] {
    return [...this.state.eqSignals];
  }

  /**
   * Get Current Archetype
   *
   * @returns Current archetype or null
   */
  getArchetype(): string | null {
    return this.state.archetype;
  }

  /**
   * Get Intent History
   *
   * Returns all detected intents.
   *
   * @returns Array of intents
   */
  getIntents(): string[] {
    return [...this.state.intents];
  }

  /**
   * Get Unique Intents
   *
   * Returns deduplicated list of intents.
   *
   * @returns Array of unique intents
   */
  getUniqueIntents(): string[] {
    return Array.from(new Set(this.state.intents));
  }

  /**
   * Get Assessment Progress
   *
   * Returns current assessment progress state.
   *
   * @returns Assessment progress object
   */
  getProgress(): AssessmentProgress {
    return { ...this.state.assessmentProgress };
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
    return this.state.assessmentProgress[step];
  }

  /**
   * Get Session Stats
   *
   * Returns statistics about the session.
   *
   * @returns Memory statistics
   */
  getStats(): MemoryStats {
    const userTurns = this.state.turns.filter(t => t.role === "user").length;
    const assistantTurns = this.state.turns.filter(t => t.role === "assistant").length;

    const sessionDuration = this.state.metadata
      ? new Date().getTime() - new Date(this.state.metadata.startTime).getTime()
      : undefined;

    return {
      totalTurns: this.state.turns.length,
      userTurns,
      assistantTurns,
      eqSignalsRecorded: this.state.eqSignals.length,
      uniqueIntents: this.getUniqueIntents().length,
      chipsUsedCount: this.state.chipsUsed.length,
      sessionDuration
    };
  }

  /**
   * Get Session Summary
   *
   * Returns human-readable summary of the session.
   *
   * @returns Summary string
   */
  getSummary(): string {
    const stats = this.getStats();
    const progress = this.getProgress();

    const lines: string[] = [];
    lines.push(`Session: ${this.state.sessionId}`);
    lines.push(`Total Turns: ${stats.totalTurns} (${stats.userTurns} user, ${stats.assistantTurns} assistant)`);
    lines.push(`Archetype: ${this.state.archetype || "Not yet detected"}`);
    lines.push(`Unique Intents: ${stats.uniqueIntents}`);
    lines.push(`EQ Signals: ${stats.eqSignalsRecorded}`);
    lines.push(`Chips Used: ${stats.chipsUsedCount}`);
    lines.push(``);
    lines.push(`Assessment Progress:`);
    lines.push(`  Profile Extracted: ${progress.profileExtracted ? "✓" : "○"}`);
    lines.push(`  Oracles Done: ${progress.oraclesDone ? "✓" : "○"}`);
    lines.push(`  Narrative Done: ${progress.narrativeDone ? "✓" : "○"}`);
    lines.push(`  Strategy Done: ${progress.strategyDone ? "✓" : "○"}`);

    return lines.join("\n");
  }

  /**
   * Serialize
   *
   * Converts session memory to JSON string for storage.
   *
   * @returns JSON string
   */
  serialize(): string {
    return JSON.stringify(this.state);
  }

  /**
   * Restore from Serialized
   *
   * Static method to restore session memory from JSON string.
   *
   * @param serialized - JSON string
   * @returns Restored SessionMemory instance
   */
  static restore(serialized: string): SessionMemory {
    const state: SessionMemoryState = JSON.parse(serialized);
    const memory = new SessionMemory(state.sessionId);
    memory.state = state;
    console.log(`[SessionMemory] Restored session ${state.sessionId} with ${state.turns.length} turns`);
    return memory;
  }
}
