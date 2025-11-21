import { OpenAI } from "openai";
import { ConversationMessage } from "../../../schema/conversationMemory_v1";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Memory Summarizer
 *
 * Generates rolling summaries of conversation history to avoid token bloat.
 * Summarizes key themes, progress, and open loops in 3-4 bullet points.
 *
 * This allows the agent to maintain context without sending 80k tokens
 * of "lol yeah school is hard" to the LLM every turn.
 */

/**
 * Summarize Conversation
 *
 * Creates a concise summary of the conversation history.
 * Returns 3-4 bullet points capturing key themes and progress.
 */
export async function summarizeConversation(
  history: ConversationMessage[]
): Promise<string> {
  console.log(`[MemorySummarizer] Summarizing ${history.length} messages`);

  // Don't summarize if conversation is too short
  if (history.length < 4) {
    return "Conversation just started.";
  }

  try {
    // Format history for LLM
    const text = history
      .map((m) => `${m.role === "student" ? "Student" : "Coach"}: ${m.content}`)
      .join("\n\n");

    const systemPrompt = `You are summarizing an assessment coaching conversation.

Your task is to create a concise summary in 3-4 bullet points.

Focus on:
- Key themes discussed (rigor, activities, narrative, etc.)
- Student's emotional state and concerns
- Progress or decisions made
- Open loops or pending commitments

Format as bullet points with no fluff.

Example:
- Student exploring AP Calc BC but expressing anxiety about workload
- Discussed balancing rigor with current GPA (3.9)
- Agreed to add one challenging course, not everything at once
- Student committed to making decision by end of week

Keep it factual and concise.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.3,
      max_tokens: 300 // Keep summaries short
    });

    const summary = response.choices[0].message.content?.trim() || "Conversation summary unavailable.";

    console.log('[MemorySummarizer] Summary generated successfully');

    return summary;
  } catch (error) {
    console.error('[MemorySummarizer] Error generating summary:', error);
    console.warn('[MemorySummarizer] Falling back to heuristic summary');
    return summarizeConversationHeuristic(history);
  }
}

/**
 * Summarize Conversation (Heuristic)
 *
 * Fast, deterministic summary generation without LLM.
 * Used as fallback when LLM is unavailable.
 */
function summarizeConversationHeuristic(history: ConversationMessage[]): string {
  const studentMessages = history.filter((m) => m.role === "student");
  const assistantMessages = history.filter((m) => m.role === "assistant");

  const summary: string[] = [];

  // Count
  summary.push(`- ${history.length} messages exchanged (${studentMessages.length} from student)`);

  // Recent topics (keyword extraction)
  const recentText = history.slice(-4).map(m => m.content.toLowerCase()).join(" ");
  const topics: string[] = [];

  if (/rigor|ap|ib|honors|calc|course/.test(recentText)) {
    topics.push("academic rigor");
  }
  if (/ec|extracurricular|activity|club/.test(recentText)) {
    topics.push("extracurriculars");
  }
  if (/essay|narrative|story|identity/.test(recentText)) {
    topics.push("narrative development");
  }
  if (/parent|mom|dad|family/.test(recentText)) {
    topics.push("family dynamics");
  }

  if (topics.length > 0) {
    summary.push(`- Topics: ${topics.join(", ")}`);
  }

  // Emotional tone
  if (/worried|anxious|scared|nervous/.test(recentText)) {
    summary.push("- Student expressing anxiety/concern");
  } else if (/excited|pumped|can't wait/.test(recentText)) {
    summary.push("- Student showing enthusiasm");
  }

  // Progress markers
  if (/i will|i'm going to|i signed up|i did/.test(recentText)) {
    summary.push("- Student taking ownership and action");
  }

  return summary.join("\n");
}

/**
 * Get Summary Length
 *
 * Returns character count of summary for monitoring.
 */
export function getSummaryLength(summary: string): number {
  return summary.length;
}

/**
 * Should Regenerate Summary
 *
 * Determines if summary needs regeneration based on:
 * - Number of new messages since last summary
 * - Summary age
 * - Significant topic shifts
 */
export function shouldRegenerateSummary(
  history: ConversationMessage[],
  lastSummaryMessageCount: number
): boolean {
  const currentMessageCount = history.length;
  const newMessages = currentMessageCount - lastSummaryMessageCount;

  // Regenerate every 6 messages
  return newMessages >= 6;
}
