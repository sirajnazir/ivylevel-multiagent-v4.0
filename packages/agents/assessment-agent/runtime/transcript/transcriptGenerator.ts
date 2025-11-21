import { FlowState } from "../sessionFlow/flowState";
import { TranscriptFormatter } from "./transcriptFormatter";
import { SessionTranscript, SessionMetadata, Turn } from "./transcript.types";

/**
 * Session Transcript Generator v1.0
 *
 * The "Make any chaotic agent conversation look like a real Jenny coaching transcript" machine.
 *
 * Converts messy FlowState.history into clean, structured, index-friendly transcripts.
 *
 * Responsibilities:
 * - Convert FlowState history → structured Turn objects
 * - Clean LLM noise and formatting artifacts
 * - Generate session metadata and summary
 * - Preserve emotional signals and persona snapshots
 * - Produce KB-ready, RAG-indexable output
 *
 * This is the reference truth for:
 * - RAG indexing
 * - Extraction quality scoring
 * - EQ scoring
 * - Training data generation
 * - Parent reports
 * - Session replay
 */
export class SessionTranscriptGenerator {
  constructor(
    private formatter: TranscriptFormatter
  ) {}

  /**
   * Build Transcript
   *
   * Main entry point: converts FlowState → SessionTranscript.
   *
   * Steps:
   * 1. Map history messages → Turn objects
   * 2. Clean text with formatter
   * 3. Attach emotional signals and persona snapshots
   * 4. Compute session metadata
   * 5. Generate summary
   * 6. Return structured transcript
   */
  buildTranscript(
    state: FlowState,
    sessionMeta: SessionMetadata
  ): SessionTranscript {
    console.log("[TranscriptGenerator] Building transcript");
    console.log(`  - History length: ${state.history.length}`);
    console.log(`  - Session ID: ${sessionMeta.sessionId}`);

    // Build turns from history
    const turns: Turn[] = this.buildTurns(state);

    // Compute timestamps
    const startedAt = turns[0]?.timestamp ?? new Date().toISOString();
    const endedAt = turns[turns.length - 1]?.timestamp ?? startedAt;

    // Generate summary
    const summary = this.formatter.generateSummary(turns);

    console.log("[TranscriptGenerator] Transcript built");
    console.log(`  - Total turns: ${turns.length}`);
    console.log(`  - Duration: ${this.computeDuration(startedAt, endedAt)} minutes`);

    return {
      sessionId: sessionMeta.sessionId,
      coachId: sessionMeta.coachId,
      studentId: sessionMeta.studentId,
      metadata: {
        startedAt,
        endedAt,
        totalTurns: turns.length,
        totalDurationMinutes: this.computeDuration(startedAt, endedAt),
        summary
      },
      turns
    };
  }

  /**
   * Build Turns
   *
   * Converts FlowState.history messages → structured Turn objects.
   *
   * For each message:
   * - Map role (user → student, assistant → coach)
   * - Clean text (remove LLM noise)
   * - Attach phase, step, emotional signals, persona snapshot
   * - Normalize timestamp
   */
  private buildTurns(state: FlowState): Turn[] {
    return state.history.map((msg, idx) => {
      // Map role
      const role: "student" | "coach" = msg.role === "user" ? "student" : "coach";

      // Clean text
      const text = this.formatter.cleanText(msg.content);

      // Normalize timestamp
      const timestamp = msg.timestamp ?? new Date().toISOString();

      // Attach state context
      // Note: Using current state as snapshot (in real impl, we'd track per-turn state)
      const turn: Turn = {
        role,
        text,
        timestamp,
        phase: state.phase,
        step: state.step,
        emotionalSignals: { ...state.emotionalSignals },
        personaSnapshot: state.persona
      };

      return turn;
    });
  }

  /**
   * Compute Duration
   *
   * Calculates session duration in minutes from start/end timestamps.
   */
  private computeDuration(startISO: string, endISO: string): number {
    const startTime = new Date(startISO).getTime();
    const endTime = new Date(endISO).getTime();

    const durationMs = endTime - startTime;
    const durationMinutes = Math.round(durationMs / 60000);

    return Math.max(0, durationMinutes); // Ensure non-negative
  }

  /**
   * Export to JSON
   *
   * Serializes transcript to JSON string.
   * Useful for KB ingestion, storage, API responses.
   */
  exportToJSON(transcript: SessionTranscript): string {
    return JSON.stringify(transcript, null, 2);
  }

  /**
   * Export to Plain Text
   *
   * Converts transcript to human-readable plain text format.
   * Useful for parent reports, debugging, review.
   */
  exportToPlainText(transcript: SessionTranscript): string {
    const lines: string[] = [];

    lines.push("=".repeat(80));
    lines.push("COACHING SESSION TRANSCRIPT");
    lines.push("=".repeat(80));
    lines.push("");

    lines.push(`Session ID: ${transcript.sessionId}`);
    lines.push(`Coach: ${transcript.coachId}`);
    lines.push(`Student: ${transcript.studentId}`);
    lines.push(`Date: ${new Date(transcript.metadata.startedAt).toLocaleDateString()}`);
    lines.push(`Duration: ${transcript.metadata.totalDurationMinutes} minutes`);
    lines.push("");

    lines.push("SUMMARY");
    lines.push("-".repeat(80));
    lines.push(transcript.metadata.summary);
    lines.push("");

    lines.push("CONVERSATION");
    lines.push("-".repeat(80));
    lines.push("");

    transcript.turns.forEach((turn, idx) => {
      const speaker = turn.role === "coach" ? "Coach" : "Student";
      const time = new Date(turn.timestamp).toLocaleTimeString();

      lines.push(`[${idx + 1}] ${speaker} (${time})`);
      lines.push(turn.text);
      lines.push("");
    });

    lines.push("=".repeat(80));
    lines.push("END OF TRANSCRIPT");
    lines.push("=".repeat(80));

    return lines.join("\n");
  }

  /**
   * Export for Parent Report
   *
   * Generates parent-friendly version using formatter.
   */
  exportForParentReport(transcript: SessionTranscript): string {
    return this.formatter.formatForParentReport(transcript.turns);
  }
}

/**
 * Create Session Transcript Generator
 *
 * Factory function for creating generator instances.
 */
export function createSessionTranscriptGenerator(
  formatter: TranscriptFormatter
): SessionTranscriptGenerator {
  return new SessionTranscriptGenerator(formatter);
}
