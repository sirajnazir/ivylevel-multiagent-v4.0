/**
 * LLM Caller v4.0
 *
 * Thin wrapper for Claude API calls.
 * Handles authentication, rate limiting, error handling, and response formatting.
 *
 * This is the bridge between our style-aware prompt construction
 * and the actual LLM generation.
 */

import Anthropic from "@anthropic-ai/sdk";

/**
 * LLM Config
 *
 * Configuration for LLM calls.
 */
export interface LLMConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  apiKey?: string;
}

/**
 * Default LLM Config
 *
 * Production-ready defaults for Jenny's generation.
 */
const DEFAULT_CONFIG: Required<LLMConfig> = {
  model: "claude-3-5-sonnet-20241022",
  maxTokens: 512,
  temperature: 0.8,
  topP: 0.9,
  apiKey: process.env.ANTHROPIC_API_KEY || ""
};

/**
 * Call Jenny LLM
 *
 * Main entry point for LLM generation.
 * Uses Claude 3.5 Sonnet with optimized settings for coaching conversations.
 *
 * Model Choice:
 * - claude-3-5-sonnet: Best balance of quality, speed, cost
 * - Temperature 0.8: Creative but controlled (not too wild)
 * - Max tokens 512: Forces concise responses (Jenny doesn't monologue)
 * - Top-p 0.9: Diverse vocabulary without chaos
 *
 * @param prompt - The full prompt (from buildPrompt)
 * @param systemPrompt - System-level instruction
 * @param config - Optional config overrides
 * @returns Generated text
 */
export async function callJennyLLM(
  prompt: string,
  systemPrompt: string = "You are Jenny, IvyLevel's lead mentor.",
  config: LLMConfig = {}
): Promise<string> {
  console.log(`[LLMCaller] Preparing to call Claude API`);
  console.log(`[LLMCaller] Prompt: ${prompt.length} chars`);
  console.log(`[LLMCaller] Model: ${config.model || DEFAULT_CONFIG.model}`);

  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  if (!finalConfig.apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set. Cannot call LLM.");
  }

  // Initialize Anthropic client
  const client = new Anthropic({
    apiKey: finalConfig.apiKey
  });

  try {
    console.log(`[LLMCaller] Calling Claude API...`);

    const response = await client.messages.create({
      model: finalConfig.model,
      max_tokens: finalConfig.maxTokens,
      temperature: finalConfig.temperature,
      top_p: finalConfig.topP,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    console.log(`[LLMCaller] Response received`);
    console.log(`[LLMCaller] Stop reason: ${response.stop_reason}`);
    console.log(`[LLMCaller] Input tokens: ${response.usage.input_tokens}`);
    console.log(`[LLMCaller] Output tokens: ${response.usage.output_tokens}`);

    // Extract text from response
    const textContent = response.content.find(block => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      throw new Error("No text content in response");
    }

    const generatedText = textContent.text;
    console.log(`[LLMCaller] Generated: ${generatedText.length} chars`);

    return generatedText;
  } catch (error) {
    console.error(`[LLMCaller] Error calling Claude API:`, error);
    throw new Error(`LLM call failed: ${error}`);
  }
}

/**
 * Call Jenny LLM with Retry
 *
 * Wrapper that retries failed LLM calls.
 * Useful for handling transient API errors.
 *
 * @param prompt - The prompt
 * @param systemPrompt - System prompt
 * @param config - Config
 * @param maxRetries - Max retry attempts (default: 2)
 * @returns Generated text
 */
export async function callJennyLLMWithRetry(
  prompt: string,
  systemPrompt: string = "You are Jenny, IvyLevel's lead mentor.",
  config: LLMConfig = {},
  maxRetries: number = 2
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[LLMCaller] Retry attempt ${attempt}/${maxRetries}`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }

      return await callJennyLLM(prompt, systemPrompt, config);
    } catch (error) {
      lastError = error as Error;
      console.error(`[LLMCaller] Attempt ${attempt + 1} failed:`, error);
    }
  }

  throw new Error(`LLM call failed after ${maxRetries + 1} attempts: ${lastError?.message}`);
}

/**
 * Mock LLM Caller
 *
 * For testing purposes - returns deterministic responses without API calls.
 * Useful for unit tests and development.
 *
 * @param prompt - The prompt (analyzed for test responses)
 * @param systemPrompt - System prompt (ignored in mock)
 * @returns Mock response
 */
export async function mockLLMCaller(prompt: string, systemPrompt: string): Promise<string> {
  console.log(`[MockLLMCaller] Generating mock response`);

  const lowerPrompt = prompt.toLowerCase();

  // Check EQ mode specifically in the header (more accurate)
  if (lowerPrompt.includes("user is currently in a *gentle*")) {
    return "I get it. This is overwhelming. Let's take it one step at a time. Here's what I want you to focus on first...";
  }

  // Direct mode detection
  if (lowerPrompt.includes("user is currently in a *direct*")) {
    return "Here's what you need to do. Step 1: Focus on your spike. Step 2: Build depth, not breadth. Step 3: Execute.";
  }

  // Motivational mode detection
  if (lowerPrompt.includes("user is currently in a *motivational*")) {
    return "You absolutely can do this. I've seen students with less accomplish more. Let's build momentum together.";
  }

  // Mentor mode detection
  if (lowerPrompt.includes("user is currently in a *mentor*")) {
    return "Here's what I've seen work. The principle is depth over breadth. Let me break down the framework for you.";
  }

  // Burnout detection
  if (lowerPrompt.includes("burnout")) {
    return "Take a breath. This is completely normal. Let's focus on just one small step today.";
  }

  // High achiever detection
  if (lowerPrompt.includes("high_achiever") || lowerPrompt.includes("high achiever")) {
    return "You're ready for rigor. Here's the optimization framework top students use.";
  }

  // Default response
  return "I hear you. Let's figure this out together. Here's what I'm thinking we should focus on next.";
}

/**
 * Estimate Token Count
 *
 * Rough estimation of token count for prompt planning.
 * Anthropic's formula: ~1 token per 4 characters for English text.
 *
 * @param text - Text to estimate
 * @returns Estimated token count
 */
export function estimateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Validate API Key
 *
 * Checks if Anthropic API key is properly configured.
 *
 * @returns True if valid, false otherwise
 */
export function validateAPIKey(): boolean {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error(`[LLMCaller] ANTHROPIC_API_KEY not found in environment`);
    return false;
  }

  if (!apiKey.startsWith("sk-ant-")) {
    console.error(`[LLMCaller] ANTHROPIC_API_KEY format invalid`);
    return false;
  }

  console.log(`[LLMCaller] API key validated`);
  return true;
}

/**
 * Get Model Info
 *
 * Returns information about the model being used.
 *
 * @param config - LLM config
 * @returns Model info string
 */
export function getModelInfo(config: LLMConfig = {}): string {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return `Model: ${finalConfig.model}
Max Tokens: ${finalConfig.maxTokens}
Temperature: ${finalConfig.temperature}
Top-P: ${finalConfig.topP}`;
}
