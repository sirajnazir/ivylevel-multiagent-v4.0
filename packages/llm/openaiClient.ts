/**
 * OpenAI Client v4.0
 *
 * Simple wrapper for OpenAI API calls.
 * Used specifically for EQ drift correction.
 *
 * Note: The main system uses Claude (Anthropic), but the drift
 * correction loop uses GPT-4.1 for faster iterations.
 */

/**
 * OpenAI Message
 *
 * Standard OpenAI message format.
 */
export interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * OpenAI Config
 *
 * Configuration for OpenAI API calls.
 */
export interface OpenAIConfig {
  model?: string;
  messages: OpenAIMessage[];
  maxTokens?: number;
  temperature?: number;
  apiKey?: string;
}

/**
 * Call OpenAI
 *
 * Makes an API call to OpenAI for drift correction.
 *
 * @param config - OpenAI configuration
 * @returns Generated text or null if failed
 */
export async function callOpenAI(config: OpenAIConfig): Promise<string | null> {
  const model = config.model || "gpt-4o";
  const maxTokens = config.maxTokens || 512;
  const temperature = config.temperature || 0.7;
  const apiKey = config.apiKey || process.env.OPENAI_API_KEY;

  console.log(
    `[OpenAI] Calling ${model} with ${config.messages.length} messages, temp=${temperature}`
  );

  if (!apiKey) {
    console.warn(`[OpenAI] No API key provided, using mock response`);
    return mockOpenAIResponse(config.messages);
  }

  try {
    // In production, this would make actual OpenAI API call
    // For now, we'll use a mock implementation
    const response = await mockOpenAIResponse(config.messages);

    console.log(`[OpenAI] Response generated: ${response?.length || 0} chars`);

    return response;
  } catch (error) {
    console.error(`[OpenAI] API call failed:`, error);
    return null;
  }
}

/**
 * Mock OpenAI Response
 *
 * Generates a mock response for testing without API calls.
 * Simulates drift correction by applying simple tone transformations.
 *
 * @param messages - Input messages
 * @returns Mock corrected response
 */
async function mockOpenAIResponse(messages: OpenAIMessage[]): Promise<string | null> {
  console.log(`[MockOpenAI] Generating mock response`);

  // Get the user message which contains the original text
  const userMessage = messages.find(m => m.role === "user");
  if (!userMessage) {
    return null;
  }

  // Extract the original text from the user message
  // Format: "Here is the original response that needs EQ correction:\n---\n{text}\n---\n..."
  const match = userMessage.content.match(/---\n([\s\S]*?)\n---/);
  const originalText = match ? match[1].trim() : userMessage.content;

  console.log(`[MockOpenAI] Original text: "${originalText.substring(0, 50)}..."`);

  // Apply simple tone corrections
  let corrected = originalText;

  // Fix 1: Replace formal language
  corrected = corrected
    .replace(/\byou must\b/gi, "you'll want to")
    .replace(/\byou need to\b/gi, "here's what I'd focus on")
    .replace(/\byou should\b/gi, "I'd recommend")
    .replace(/as per your request/gi, "Sure")
    .replace(/furthermore/gi, "also")
    .replace(/in conclusion/gi, "so");

  // Fix 2: Replace harsh language
  corrected = corrected
    .replace(/\byour grades are low\b/gi, "looks like grades need some work")
    .replace(/\bimprove\b/gi, "strengthen")
    .replace(/\bfailing\b/gi, "struggling a bit");

  // Fix 3: Add warmth if missing
  if (!/i totally hear you|i'm with you|makes sense/i.test(corrected)) {
    corrected = "I totally hear you. " + corrected;
  }

  // Fix 4: Add encouragement if missing
  if (!/you've got|this is fixable|we've got this/i.test(corrected)) {
    corrected += " You've got this.";
  }

  console.log(`[MockOpenAI] Corrected text: "${corrected.substring(0, 50)}..."`);

  return corrected;
}

/**
 * Batch Call OpenAI
 *
 * Makes multiple OpenAI calls in parallel.
 * Useful for generating multiple candidate responses.
 *
 * @param configs - Array of OpenAI configurations
 * @returns Array of generated texts
 */
export async function batchCallOpenAI(configs: OpenAIConfig[]): Promise<(string | null)[]> {
  console.log(`[OpenAI] Batch calling ${configs.length} requests`);

  const promises = configs.map(config => callOpenAI(config));
  const results = await Promise.all(promises);

  const successCount = results.filter(r => r !== null).length;
  console.log(`[OpenAI] Batch complete: ${successCount}/${configs.length} successful`);

  return results;
}
