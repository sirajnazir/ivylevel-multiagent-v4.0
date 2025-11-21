import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { safeJsonParse } from "../../../llm/safeJsonParse";
import {
  chatTurnResponseSchema,
  chatTurnInputSchema,
  type ChatTurnResponse,
  type ChatTurnInput
} from "../../../schema/chatTurnResponse_v1";
import { AssessmentInternalState_v1 } from "../../../schema/assessmentInternalState_v1";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * EQ-Integrated Response Generator
 *
 * Transforms EQ tone plans and student context into actual coaching language.
 * This is the moment where assessment intelligence becomes real conversation
 * that students want to engage with.
 *
 * Key responsibilities:
 * - Apply EQ tone plan (warmth, directive, language patterns)
 * - Adapt to student's emotional signals in real-time
 * - Integrate narrative themes and identity context
 * - Use micro-wins strategy where appropriate
 * - Sound like a real coach, not a chatbot
 * - Generate responses students want to reply to at midnight
 */

/**
 * Generate EQ-Integrated Response
 *
 * Main entry point for response generation.
 * Takes student message + full context → returns coaching response.
 */
export async function generateEQIntegratedResponse(
  state: AssessmentInternalState_v1,
  lastStudentMessage: string,
  sessionHistorySummary?: string
): Promise<ChatTurnResponse> {
  console.log('[ResponseGenerator] Generating EQ-integrated response');

  try {
    // Validate required state
    if (!state.eqTonePlan) {
      throw new Error('EQ Tone Plan missing. Must run applyEQModulation() first.');
    }

    // Build input payload
    const input: ChatTurnInput = {
      studentType: state.studentType,
      eqTonePlan: state.eqTonePlan,
      extractedProfile: state.extractedProfile,
      narrativeBlocks: state.narrativeBlocks,
      oracleResults: state.oracleResults,
      lastStudentMessage,
      sessionHistorySummary: sessionHistorySummary || undefined
    };

    // Validate input
    const validatedInput = chatTurnInputSchema.parse(input);

    // Load system prompt
    const promptPath = path.join(__dirname, "../../../prompts/responseGenerator.prompt.md");
    const systemPrompt = fs.readFileSync(promptPath, "utf8");

    // Call LLM
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(validatedInput, null, 2) }
      ],
      temperature: 0.7 // Higher for more natural, conversational responses
    });

    const cleaned = response.choices[0].message.content || JSON.stringify({
      assistantMessage: "I'm here to help. What's on your mind?",
      reasoningNotes: [
        "Fallback response due to LLM failure",
        "Using neutral warmth and directive levels",
        "Prompting student to share more context"
      ]
    });

    // Parse and validate response
    const parseResult = safeJsonParse(cleaned, chatTurnResponseSchema, { logErrors: true });

    if (!parseResult.success) {
      console.warn(`[ResponseGenerator] LLM parse failed, using fallback: ${parseResult.error}`);
      return buildFallbackResponse(state, lastStudentMessage);
    }

    const chatResponse = parseResult.data!;

    // Log telemetry (simple console log for now)
    console.log('[Telemetry] eq_response_generated', {
      studentType: state.studentType?.primaryType || "unknown",
      warmth: state.eqTonePlan.warmthLevel,
      directive: state.eqTonePlan.directiveLevel,
      messageLength: chatResponse.assistantMessage.length,
      reasoningNotesCount: chatResponse.reasoningNotes.length
    });

    console.log('[ResponseGenerator] Response generated successfully');
    console.log(`  - Message length: ${chatResponse.assistantMessage.length} chars`);
    console.log(`  - Reasoning notes: ${chatResponse.reasoningNotes.length}`);

    return chatResponse;
  } catch (error) {
    console.error('[ResponseGenerator] Error generating response:', error);
    console.warn('[ResponseGenerator] Falling back to safe response');
    return buildFallbackResponse(state, lastStudentMessage);
  }
}

/**
 * Fallback Response Builder
 *
 * Generates a safe, context-aware response when LLM fails.
 * Uses student type and EQ plan to create appropriate fallback.
 */
function buildFallbackResponse(
  state: AssessmentInternalState_v1,
  lastStudentMessage: string
): ChatTurnResponse {
  const studentType = state.studentType?.primaryType || "unknown";
  const warmth = state.eqTonePlan?.warmthLevel || 3;
  const directive = state.eqTonePlan?.directiveLevel || 3;

  // Analyze student message for emotional signals
  const isQuestion = lastStudentMessage.includes("?");
  const isAnxious = /worried|anxious|scared|nervous|unsure/i.test(lastStudentMessage);
  const isExcited = /excited|can't wait|love|passionate/i.test(lastStudentMessage);

  let message = "";

  // Build response based on context
  if (isQuestion && isAnxious) {
    // Anxious question → reassuring + direct answer
    message = "I hear you. That's a really good question.\n\n";
    message += "Let me break this down in a way that'll make it clearer.\n\n";
    message += "What specifically are you most concerned about?";
  } else if (isQuestion) {
    // General question → direct answer
    message = "Good question. Let me address that directly.\n\n";
    message += "What I'm thinking is this: we should focus on what's most actionable right now.\n\n";
    message += "What would be most helpful for you to know first?";
  } else if (isExcited) {
    // Excited message → match energy + channel it
    message = "Love that energy!\n\n";
    message += "Now let's channel that into something concrete. Here's what I'm thinking for your next step.\n\n";
    message += "What feels like the best move to you?";
  } else if (isAnxious) {
    // Anxious message → normalize + ground
    message = "It's completely normal to feel that way. A lot of students do at this stage.\n\n";
    message += "Let's take this one step at a time.\n\n";
    message += "What's one thing we could tackle first that would help?";
  } else {
    // Default → acknowledge + move forward
    message = "I hear you.\n\n";
    message += "Here's what I'm thinking for next steps.\n\n";
    message += "What sounds right to you?";
  }

  return {
    assistantMessage: message,
    reasoningNotes: [
      `Fallback response for student type: ${studentType}`,
      `Using warmth level ${warmth}, directive level ${directive}`,
      `Detected ${isAnxious ? "anxious" : isExcited ? "excited" : "neutral"} tone`,
      `Response structure: ${isQuestion ? "direct answer" : "forward guidance"}`,
      "LLM unavailable, using deterministic fallback"
    ]
  };
}

/**
 * Batch Response Generation
 *
 * Generate responses for multiple student messages.
 * Useful for testing or bulk processing.
 */
export async function generateEQIntegratedResponseBatch(
  state: AssessmentInternalState_v1,
  messages: string[]
): Promise<ChatTurnResponse[]> {
  return Promise.all(
    messages.map((message) => generateEQIntegratedResponse(state, message))
  );
}

/**
 * Validate Response Quality
 *
 * Check if a generated response meets quality standards.
 * Used in testing and quality assurance.
 */
export function validateResponseQuality(
  response: ChatTurnResponse,
  eqTonePlan: any
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for forbidden patterns
  if (eqTonePlan.forbiddenPatterns) {
    eqTonePlan.forbiddenPatterns.forEach((pattern: string) => {
      if (response.assistantMessage.toLowerCase().includes(pattern.toLowerCase())) {
        issues.push(`Contains forbidden pattern: "${pattern}"`);
      }
    });
  }

  // Check for chatbot language
  const chatbotPhrases = [
    "as an ai",
    "i'm not capable",
    "i would be happy to assist",
    "please feel free to",
    "thank you for sharing"
  ];

  chatbotPhrases.forEach((phrase) => {
    if (response.assistantMessage.toLowerCase().includes(phrase)) {
      issues.push(`Contains chatbot phrase: "${phrase}"`);
    }
  });

  // Check for walls of text (paragraphs > 3 sentences)
  const paragraphs = response.assistantMessage.split("\n\n");
  paragraphs.forEach((para, idx) => {
    const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length > 3) {
      issues.push(`Paragraph ${idx + 1} has ${sentences.length} sentences (max 3)`);
    }
  });

  // Check minimum reasoning notes
  if (response.reasoningNotes.length < 3) {
    issues.push(`Only ${response.reasoningNotes.length} reasoning notes (min 3)`);
  }

  // Check message length (should be concise)
  if (response.assistantMessage.length > 500) {
    issues.push(`Message too long: ${response.assistantMessage.length} chars (recommend < 500)`);
  }

  return {
    valid: issues.length === 0,
    issues
  };
}
