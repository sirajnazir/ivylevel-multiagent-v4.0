import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Anthropic Claude LLM Client
 * Centralized wrapper for all Claude API calls
 * Model: claude-3-5-sonnet-20241022
 */

export interface LLMMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LLMExtractionOptions {
  rawMessages: LLMMessage[];
  transcriptText: string;
  maxRetries?: number;
  temperature?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * Load system prompt from file
 */
function loadSystemPrompt(promptPath: string): string {
  try {
    const fullPath = join(process.cwd(), promptPath);
    return readFileSync(fullPath, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to load prompt from ${promptPath}: ${error}`);
  }
}

/**
 * Build extraction prompt context
 */
function buildExtractionContext(
  transcriptText: string,
  rawMessages: LLMMessage[]
): string {
  const conversationHistory = rawMessages
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  return `
## CONVERSATION TRANSCRIPT

${transcriptText}

## STRUCTURED MESSAGE HISTORY

${conversationHistory}

## YOUR TASK

Extract the student profile as valid JSON following the OUTPUT CONTRACT exactly.
`.trim();
}

/**
 * Call Claude API (stubbed for now - will implement real API call)
 */
async function callClaudeAPI(
  systemPrompt: string,
  userPrompt: string,
  temperature: number = 0.3
): Promise<LLMResponse> {
  // TODO: Implement real Anthropic API call in production
  // For now, return mock response for testing

  console.log('[LLM] Calling Claude API (stubbed)');
  console.log('[LLM] System prompt length:', systemPrompt.length);
  console.log('[LLM] User prompt length:', userPrompt.length);
  console.log('[LLM] Temperature:', temperature);

  // Stub response - will be replaced with actual API call
  const mockResponse: LLMResponse = {
    content: JSON.stringify({
      academics: {
        gpa: { weighted: null, unweighted: null },
        courseLoad: [],
        testScores: { sat: null, act: null, apScores: [] },
        academicInterests: [],
        plannedCourses: [],
        rigorGaps: [],
      },
      activities: [],
      awards: [],
      personality: {
        coreValues: [],
        identityThreads: [],
        passions: [],
        communicationStyle: '',
        emotionalIntelligence: '',
      },
      context: {
        familyInvolvement: '',
        resourceConstraints: [],
        lifeCircumstances: [],
      },
      diagnostics: {
        rigorGaps: [],
        ecDepthGaps: [],
        narrativeIssues: [],
        strategicRisks: [],
      },
      narrativeScaffolding: {
        thematicHubs: ['', '', ''],
        flagshipNarrative: '',
        admissionsPositioning: '',
      },
    }),
    usage: {
      inputTokens: 0,
      outputTokens: 0,
    },
  };

  return mockResponse;
}

/**
 * Run LLM extraction with retry logic
 */
export async function runLLMExtraction(
  options: LLMExtractionOptions
): Promise<string> {
  const {
    rawMessages,
    transcriptText,
    maxRetries = 1,
    temperature = 0.3,
  } = options;

  // Validate inputs
  if (!transcriptText || transcriptText.trim().length === 0) {
    throw new Error('Transcript text is required for extraction');
  }

  if (!rawMessages || rawMessages.length === 0) {
    throw new Error('Raw messages are required for extraction');
  }

  // Load system prompt
  const systemPrompt = loadSystemPrompt(
    'packages/agents/assessment-agent/prompts/assessment.prompt.md'
  );

  // Build user context
  const userPrompt = buildExtractionContext(transcriptText, rawMessages);

  let lastError: Error | null = null;
  let attempts = 0;

  // Retry loop
  while (attempts <= maxRetries) {
    try {
      console.log(`[LLM] Extraction attempt ${attempts + 1}/${maxRetries + 1}`);

      // Call Claude API
      const response = await callClaudeAPI(systemPrompt, userPrompt, temperature);

      // Log token usage
      if (response.usage) {
        console.log('[LLM] Token usage:', response.usage);
      }

      // Return raw content (parsing happens in next layer)
      return response.content;
    } catch (error) {
      lastError = error as Error;
      attempts++;

      if (attempts <= maxRetries) {
        console.warn(`[LLM] Attempt ${attempts} failed, retrying...`, error);
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `LLM extraction failed after ${attempts} attempts: ${lastError?.message}`
  );
}

/**
 * Health check for LLM client
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // TODO: Implement real health check (ping Claude API)
    console.log('[LLM] Health check: OK (stubbed)');
    return true;
  } catch (error) {
    console.error('[LLM] Health check failed:', error);
    return false;
  }
}
