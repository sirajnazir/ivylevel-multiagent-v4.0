import { z } from "zod";

/**
 * Conversation Memory Schema v1
 *
 * Tracks emotional signals, patterns, and conversational context
 * across multiple turns. This is the "memory" that makes the agent
 * feel alive and personalized, not just "replying politely."
 *
 * Key capabilities:
 * - Tracks emotional signals (frustration, confidence, overwhelm, motivation, agency)
 * - Detects behavioral patterns (avoidance, empowerment, progress, etc.)
 * - Maintains rolling summary to avoid token bloat
 * - Updates dynamically with each conversation turn
 * - Feeds EQ response generator for adaptive tone
 */

/**
 * Conversation Message
 *
 * A single turn in the conversation.
 */
export const conversationMessageSchema = z.object({
  role: z.enum(["student", "assistant"]),
  content: z.string(),
  timestamp: z.string().optional()
});

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;

/**
 * Emotional Signals
 *
 * Tracks 5 key emotional dimensions on a 0-5 scale.
 * These signals inform EQ modulation and response generation.
 *
 * Scale interpretation:
 * 0 = None/absent
 * 1 = Minimal
 * 2 = Low
 * 3 = Moderate
 * 4 = High
 * 5 = Very high/intense
 */
export const emotionalSignalsSchema = z.object({
  /** Frustration level with process, requirements, or outcomes */
  frustration: z.number().min(0).max(5),

  /** Confidence in abilities and decisions */
  confidence: z.number().min(0).max(5),

  /** Overwhelm from workload, choices, or complexity */
  overwhelm: z.number().min(0).max(5),

  /** Motivation to take action and engage */
  motivation: z.number().min(0).max(5),

  /** Agency (self-direction, ownership of decisions) */
  agency: z.number().min(0).max(5)
});

export type EmotionalSignals = z.infer<typeof emotionalSignalsSchema>;

/**
 * Conversation Memory
 *
 * Complete memory state for an assessment session.
 * Combines conversation history with emotional tracking and pattern detection.
 */
export const conversationMemorySchema = z.object({
  /**
   * Full conversation history
   * Includes all student and assistant messages
   */
  history: z.array(conversationMessageSchema),

  /**
   * Rolling summary of conversation
   * 3-4 bullet points capturing key themes and progress
   * Updated after each turn to avoid token bloat
   */
  rollingSummary: z.string().optional(),

  /**
   * Emotional signal tracking
   * Dynamic 0-5 scores updated with each message
   */
  emotionalSignals: emotionalSignalsSchema,

  /**
   * Detected patterns
   * Behavioral patterns observed over the conversation
   * Examples:
   * - "avoidance_of_rigor_discussion"
   * - "empowerment_language_emerging"
   * - "micro_win_celebration_effective"
   * - "parental_pressure_recurring_theme"
   * - "confidence_building_in_progress"
   */
  detectedPatterns: z.array(z.string()),

  /**
   * Last updated timestamp
   * ISO 8601 format
   */
  lastUpdated: z.string().optional()
});

export type ConversationMemory_v1 = z.infer<typeof conversationMemorySchema>;

/**
 * Initialize Conversation Memory
 *
 * Creates a new memory instance with neutral emotional signals.
 */
export function initializeConversationMemory(): ConversationMemory_v1 {
  return {
    history: [],
    rollingSummary: undefined,
    emotionalSignals: {
      frustration: 0,
      confidence: 3, // Start with moderate baseline
      overwhelm: 0,
      motivation: 3, // Start with moderate baseline
      agency: 3 // Start with moderate baseline
    },
    detectedPatterns: [],
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Get Recent Messages
 *
 * Returns the most recent N messages from history.
 * Useful for context windows and summaries.
 */
export function getRecentMessages(
  memory: ConversationMemory_v1,
  count: number
): ConversationMessage[] {
  return memory.history.slice(-count);
}

/**
 * Get Emotional Signal Summary
 *
 * Returns a human-readable summary of current emotional state.
 */
export function getEmotionalSignalSummary(signals: EmotionalSignals): string {
  const parts: string[] = [];

  if (signals.frustration >= 4) {
    parts.push("high frustration");
  } else if (signals.frustration >= 2) {
    parts.push("moderate frustration");
  }

  if (signals.confidence <= 2) {
    parts.push("low confidence");
  } else if (signals.confidence >= 4) {
    parts.push("high confidence");
  }

  if (signals.overwhelm >= 4) {
    parts.push("feeling overwhelmed");
  }

  if (signals.motivation <= 2) {
    parts.push("low motivation");
  } else if (signals.motivation >= 4) {
    parts.push("high motivation");
  }

  if (signals.agency <= 2) {
    parts.push("low agency");
  } else if (signals.agency >= 4) {
    parts.push("strong agency");
  }

  return parts.length > 0 ? parts.join(", ") : "balanced emotional state";
}
