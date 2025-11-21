import { z } from "zod";
import { EmotionalSignals, emotionalSignalsSchema } from "../../../../schema/conversationMemory_v1";
import { PersonaInstruction_v3, coachPersonaSchema_v3 } from "../../../../schema/coachPersona_v3";

/**
 * Session Transcript Types v1.0
 *
 * Clean, structured representation of a coaching session.
 * This is the "reference truth" for:
 * - RAG indexing
 * - Extraction quality scoring
 * - EQ scoring
 * - Training data generation
 * - Parent reports
 * - Session replay
 */

/**
 * Turn
 *
 * A single conversational exchange in the session.
 */
export interface Turn {
  /** Speaker role */
  role: "student" | "coach";

  /** Clean message text (no JSON blobs, no LLM noise) */
  text: string;

  /** ISO timestamp */
  timestamp: string;

  /** Macro phase at time of turn */
  phase: string;

  /** Micro step at time of turn */
  step: string;

  /** Emotional state at time of turn */
  emotionalSignals: EmotionalSignals;

  /** Persona snapshot at time of turn */
  personaSnapshot: PersonaInstruction_v3;
}

/**
 * Turn Schema (Zod)
 */
export const turnSchema = z.object({
  role: z.enum(["student", "coach"]),
  text: z.string().min(1),
  timestamp: z.string(),
  phase: z.string(),
  step: z.string(),
  emotionalSignals: emotionalSignalsSchema,
  personaSnapshot: coachPersonaSchema_v3
});

/**
 * Session Transcript
 *
 * Complete structured transcript of a coaching session.
 */
export interface SessionTranscript {
  /** Unique session identifier */
  sessionId: string;

  /** Coach identifier (e.g., "jenny") */
  coachId: string;

  /** Student identifier */
  studentId: string;

  /** Session metadata */
  metadata: {
    /** Session start time (ISO) */
    startedAt: string;

    /** Session end time (ISO) */
    endedAt: string;

    /** Total number of turns */
    totalTurns: number;

    /** Total duration in minutes */
    totalDurationMinutes: number;

    /** High-level session summary */
    summary: string;
  };

  /** Ordered list of turns */
  turns: Turn[];
}

/**
 * Session Transcript Schema (Zod)
 */
export const sessionTranscriptSchema = z.object({
  sessionId: z.string(),
  coachId: z.string(),
  studentId: z.string(),
  metadata: z.object({
    startedAt: z.string(),
    endedAt: z.string(),
    totalTurns: z.number(),
    totalDurationMinutes: z.number(),
    summary: z.string()
  }),
  turns: z.array(turnSchema)
});

/**
 * Session Metadata
 *
 * Minimal metadata passed to transcript generator.
 */
export interface SessionMetadata {
  sessionId: string;
  coachId: string;
  studentId: string;
}
