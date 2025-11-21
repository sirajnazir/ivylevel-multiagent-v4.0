import {
  conversationMemorySchema,
  type ConversationMemory_v1,
  type ConversationMessage
} from "../../../schema/conversationMemory_v1";
import { applySignalBounds } from "../../../schema/memorySignal_v1";
import { extractMemorySignals, extractMemorySignalsHeuristic } from "./memorySignalExtractor";
import { summarizeConversation, shouldRegenerateSummary } from "./memorySummarizer";

/**
 * Update Conversation Memory
 *
 * Main engine for updating conversation memory after each turn.
 * Combines message history, emotional signal tracking, pattern detection,
 * and rolling summaries into a cohesive memory state.
 *
 * This is the "glue" that makes the agent feel alive and personalized.
 */

/**
 * Update Conversation Memory
 *
 * Updates memory state with new student and assistant messages.
 * Extracts emotional signals, detects patterns, and regenerates summary if needed.
 */
export async function updateConversationMemory(
  memory: ConversationMemory_v1,
  newStudentMessage: string,
  newAssistantMessage: string,
  useHeuristics: boolean = false
): Promise<ConversationMemory_v1> {
  console.log('[ConversationMemory] Updating memory with new turn');

  try {
    // Track message count before update for summary regeneration logic
    const previousMessageCount = memory.history.length;

    // Add new messages to history
    const studentMsg: ConversationMessage = {
      role: "student",
      content: newStudentMessage,
      timestamp: new Date().toISOString()
    };

    const assistantMsg: ConversationMessage = {
      role: "assistant",
      content: newAssistantMessage,
      timestamp: new Date().toISOString()
    };

    const updatedHistory = [...memory.history, studentMsg, assistantMsg];

    // Extract emotional signals
    const signals = useHeuristics
      ? extractMemorySignalsHeuristic(newStudentMessage)
      : await extractMemorySignals(newStudentMessage);

    console.log('[ConversationMemory] Signals extracted');
    console.log(`  - Confidence delta: ${signals.confidenceDelta}`);
    console.log(`  - Agency delta: ${signals.agencyDelta}`);
    console.log(`  - Patterns: ${signals.patterns.join(", ") || "none"}`);

    // Update emotional signals with bounds checking
    const updatedSignals = {
      frustration: applySignalBounds(memory.emotionalSignals.frustration, signals.frustrationDelta),
      confidence: applySignalBounds(memory.emotionalSignals.confidence, signals.confidenceDelta),
      overwhelm: applySignalBounds(memory.emotionalSignals.overwhelm, signals.overwhelmDelta),
      motivation: applySignalBounds(memory.emotionalSignals.motivation, signals.motivationDelta),
      agency: applySignalBounds(memory.emotionalSignals.agency, signals.agencyDelta)
    };

    // Merge patterns (deduplicate)
    const updatedPatterns = [...new Set([...memory.detectedPatterns, ...signals.patterns])];

    // Regenerate summary if needed
    let updatedSummary = memory.rollingSummary;
    if (shouldRegenerateSummary(updatedHistory, previousMessageCount)) {
      console.log('[ConversationMemory] Regenerating rolling summary');
      updatedSummary = await summarizeConversation(updatedHistory);
    }

    // Build updated memory
    const updatedMemory: ConversationMemory_v1 = {
      history: updatedHistory,
      rollingSummary: updatedSummary,
      emotionalSignals: updatedSignals,
      detectedPatterns: updatedPatterns,
      lastUpdated: new Date().toISOString()
    };

    // Validate with schema
    const validated = conversationMemorySchema.parse(updatedMemory);

    console.log('[ConversationMemory] Memory updated successfully');
    console.log(`  - History length: ${validated.history.length}`);
    console.log(`  - Emotional signals: frustration=${validated.emotionalSignals.frustration}, confidence=${validated.emotionalSignals.confidence}, agency=${validated.emotionalSignals.agency}`);
    console.log(`  - Detected patterns: ${validated.detectedPatterns.length}`);

    // Log telemetry
    console.log('[Telemetry] memory_updated', {
      frustration: validated.emotionalSignals.frustration,
      confidence: validated.emotionalSignals.confidence,
      agency: validated.emotionalSignals.agency,
      patternCount: validated.detectedPatterns.length,
      historyLength: validated.history.length
    });

    return validated;
  } catch (error) {
    console.error('[ConversationMemory] Error updating memory:', error);
    throw new Error(`Failed to update conversation memory: ${(error as Error).message}`);
  }
}

/**
 * Update Conversation Memory Batch
 *
 * Updates memory with multiple turns at once.
 * Useful for backfilling or batch processing.
 */
export async function updateConversationMemoryBatch(
  memory: ConversationMemory_v1,
  turns: Array<{ studentMessage: string; assistantMessage: string }>
): Promise<ConversationMemory_v1> {
  let currentMemory = memory;

  for (const turn of turns) {
    currentMemory = await updateConversationMemory(
      currentMemory,
      turn.studentMessage,
      turn.assistantMessage
    );
  }

  return currentMemory;
}

/**
 * Get Memory Summary
 *
 * Returns a human-readable summary of current memory state.
 * Useful for debugging and analytics.
 */
export function getMemorySummary(memory: ConversationMemory_v1): string {
  const lines: string[] = [];

  lines.push(`=== Conversation Memory Summary ===`);
  lines.push(`Messages: ${memory.history.length}`);
  lines.push(`Patterns: ${memory.detectedPatterns.join(", ") || "none"}`);
  lines.push(`Emotional Signals:`);
  lines.push(`  - Frustration: ${memory.emotionalSignals.frustration}/5`);
  lines.push(`  - Confidence: ${memory.emotionalSignals.confidence}/5`);
  lines.push(`  - Overwhelm: ${memory.emotionalSignals.overwhelm}/5`);
  lines.push(`  - Motivation: ${memory.emotionalSignals.motivation}/5`);
  lines.push(`  - Agency: ${memory.emotionalSignals.agency}/5`);
  lines.push(`Last Updated: ${memory.lastUpdated || "never"}`);

  if (memory.rollingSummary) {
    lines.push(`\nRolling Summary:`);
    lines.push(memory.rollingSummary);
  }

  return lines.join("\n");
}
