import { z } from "zod";
import { EmotionalSignals, emotionalSignalsSchema } from "../../../../schema/conversationMemory_v1";
import { PersonaInstruction_v3, coachPersonaSchema_v3 } from "../../../../schema/coachPersona_v3";

/**
 * Flow State Schema
 *
 * Tracks the current state of an assessment session.
 * This is the "working memory" of the Session Brain.
 */

/**
 * Flow Phase
 *
 * 5 macro phases of a Jenny assessment:
 * 1. warmup - Warm Rapport + Context Set
 * 2. diagnostic - Diagnostic Intake (Academics, ECs, Awards)
 * 3. deep_probe - Cognitive/Passion/Service Depth Probing
 * 4. narrative - Narrative Mapping + Positioning Signals
 * 5. wrap - Prep Targets + Wrap + Next Steps
 */
export type FlowPhase = "warmup" | "diagnostic" | "deep_probe" | "narrative" | "wrap";

/**
 * LLM Message
 */
export interface LLMMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

/**
 * Collected Data
 *
 * Structured information extracted during the session.
 */
export interface CollectedData {
  // Academic profile
  academics?: {
    gpa?: { weighted?: number; unweighted?: number };
    rigorLevel?: string;
    apCourses?: string[];
    favoriteSubjects?: string[];
    weakSubjects?: string[];
    academicChallenges?: string[];
  };

  // Extracurriculars
  ecs?: {
    activities?: Array<{
      name: string;
      role?: string;
      yearsInvolved?: number;
      hoursPerWeek?: number;
      impact?: string;
    }>;
    leadership?: string[];
    depth?: string; // "deep specialist" | "well-rounded" | "scattered"
  };

  // Awards and recognition
  awards?: {
    academic?: string[];
    ec?: string[];
    competitions?: string[];
  };

  // Personality and identity
  personality?: {
    background?: string[]; // immigrant, first-gen, etc.
    identity?: string[]; // LGBTQ+, ethnicity, etc.
    passion?: string; // What energizes them
    values?: string[];
    challenges?: string[];
    fears?: string[];
    excitements?: string[];
  };

  // Narrative signals
  narrative?: {
    thematicHubs?: string[];
    positioning?: string;
    archetypes?: string[];
    risks?: string[];
    opportunities?: string[];
  };

  // Red flags
  redFlags?: string[];

  // College preferences
  colleges?: {
    targets?: string[];
    interests?: string[];
    dealBreakers?: string[];
  };
}

/**
 * Flow State
 *
 * Complete state of an assessment session.
 */
export interface FlowState {
  /** Current macro phase */
  phase: FlowPhase;

  /** Current micro step ID */
  step: string;

  /** Turn count (for phase detection) */
  turnCount: number;

  /** Structured data collected during session */
  collected: CollectedData;

  /** Emotional signals (from conversation memory) */
  emotionalSignals: EmotionalSignals;

  /** Current persona instruction */
  persona: PersonaInstruction_v3;

  /** Conversation history */
  history: LLMMessage[];

  /** Session metadata */
  metadata: {
    sessionId?: string;
    startedAt: string;
    lastUpdatedAt: string;
  };
}

/**
 * Flow State Schema (Zod)
 */
export const flowStateSchema = z.object({
  phase: z.enum(["warmup", "diagnostic", "deep_probe", "narrative", "wrap"]),
  step: z.string(),
  turnCount: z.number(),
  collected: z.any(), // Complex nested structure, validate separately
  emotionalSignals: emotionalSignalsSchema,
  persona: coachPersonaSchema_v3,
  history: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    timestamp: z.string().optional()
  })),
  metadata: z.object({
    sessionId: z.string().optional(),
    startedAt: z.string(),
    lastUpdatedAt: z.string()
  })
});

/**
 * Initialize Flow State
 *
 * Creates a new flow state at the start of an assessment session.
 */
export function initializeFlowState(persona: PersonaInstruction_v3): FlowState {
  return {
    phase: "warmup",
    step: "warmup_intro",
    turnCount: 0,
    collected: {},
    emotionalSignals: {
      frustration: 0,
      confidence: 3,
      overwhelm: 0,
      motivation: 3,
      agency: 3
    },
    persona,
    history: [],
    metadata: {
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString()
    }
  };
}

/**
 * Flow State to String
 *
 * Human-readable format for debugging.
 */
export function flowStateToString(state: FlowState): string {
  const lines: string[] = [];

  lines.push("=== Flow State ===");
  lines.push(`Phase: ${state.phase}`);
  lines.push(`Step: ${state.step}`);
  lines.push(`Turn Count: ${state.turnCount}`);
  lines.push(`History Length: ${state.history.length}`);
  lines.push("");

  lines.push("Collected Data:");
  if (state.collected.academics) lines.push("  ✓ Academics");
  if (state.collected.ecs) lines.push("  ✓ ECs");
  if (state.collected.awards) lines.push("  ✓ Awards");
  if (state.collected.personality) lines.push("  ✓ Personality");
  if (state.collected.narrative) lines.push("  ✓ Narrative");

  lines.push("");
  lines.push(`Emotional State: frustration=${state.emotionalSignals.frustration}, confidence=${state.emotionalSignals.confidence}, overwhelm=${state.emotionalSignals.overwhelm}`);

  return lines.join("\n");
}
