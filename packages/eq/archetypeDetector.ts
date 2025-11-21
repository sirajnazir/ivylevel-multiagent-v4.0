/**
 * archetypeDetector.ts
 *
 * Component 3 - Archetype Detector
 *
 * LLM-driven structured output to classify students into one of 15 archetypes.
 * This drives the EQ style selection and adaptive communication.
 */

import type { Archetype, ArchetypeDetectionResult } from "./types";

/**
 * Archetype Descriptions
 *
 * Detailed descriptions of each archetype for LLM classification.
 */
const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  OverwhelmedStarter: "Student is overwhelmed by the college process, unsure where to start, anxious about next steps",
  QuietHighPotential: "Student has strong potential but is quiet, reserved, or hesitant to self-advocate",
  BurntOutAchiever: "Student is high-achieving but exhausted, stressed, or experiencing burnout",
  Explorer: "Student is curious and exploratory, interested in multiple paths, not yet committed to one direction",
  LateBloomer: "Student is developing their interests and strengths later than peers, showing recent growth",
  Hacker: "Student is technical, analytical, prefers direct communication and logical problem-solving",
  ReluctantDoer: "Student knows what to do but struggles with motivation, follow-through, or procrastination",
  HighFlyingGeneralist: "Student excels across multiple areas, has many interests, high-achieving and versatile",
  HyperPerfectionist: "Student has very high standards, anxious about mistakes, tends toward perfectionism",
  AnxiousPlanner: "Student is detail-oriented and planning-focused but anxious about uncertainty",
  CreativeBuilder: "Student is creative, entrepreneurial, builds projects and initiatives",
  DistractedMultitasker: "Student juggles many commitments, sometimes scattered or overwhelmed by options",
  UnderconfidentStriver: "Student works hard but lacks confidence, doubts their abilities despite evidence of success",
  IndependentThinker: "Student values autonomy, prefers to think independently, may resist structure",
  StructuredExecutor: "Student thrives with clear structure, follows plans methodically, execution-focused",
};

/**
 * Detect Archetype
 *
 * Uses LLM structured output to classify student into an archetype.
 *
 * @param transcriptSlice - Recent conversation history
 * @returns Detected archetype with confidence
 */
export async function detectArchetype(
  transcriptSlice: string
): Promise<ArchetypeDetectionResult> {
  const prompt = `
You are an expert student psychology classifier for IvyLevel's assessment agent.

Your task: Classify the student into EXACTLY ONE archetype based on their messages.

## ARCHETYPE DEFINITIONS:

${Object.entries(ARCHETYPE_DESCRIPTIONS)
  .map(([archetype, description]) => `- ${archetype}: ${description}`)
  .join("\n")}

## STUDENT MESSAGES:

${transcriptSlice}

## INSTRUCTIONS:

1. Analyze the student's language, concerns, energy level, and communication style
2. Choose the SINGLE archetype that best fits
3. Provide a confidence score (0.0 - 1.0)
4. Provide brief reasoning

Return ONLY valid JSON in this exact format:
{
  "archetype": "ArchetypeName",
  "confidence": 0.85,
  "reasoning": "Brief explanation of why this archetype fits"
}
  `.trim();

  try {
    // In production, this would call OpenAI's structured output API
    // For now, we'll use a simple mock implementation
    const result = await runStructuredLLM(prompt, transcriptSlice);

    return {
      archetype: result.archetype as Archetype,
      confidence: result.confidence || 0.7,
      reasoning: result.reasoning,
    };
  } catch (error) {
    console.error("[archetypeDetector] Error detecting archetype:", error);

    // Fallback to Explorer as a neutral default
    return {
      archetype: "Explorer",
      confidence: 0.5,
      reasoning: "Fallback due to detection error",
    };
  }
}

/**
 * Run Structured LLM
 *
 * Wrapper for OpenAI structured output API.
 * In production, this would call the actual API.
 *
 * @param prompt - System prompt
 * @param input - User input
 * @returns Structured output
 */
async function runStructuredLLM(
  prompt: string,
  input: string
): Promise<{
  archetype: string;
  confidence: number;
  reasoning: string;
}> {
  // TODO: Replace with actual OpenAI API call
  // Example:
  // const response = await openai.chat.completions.create({
  //   model: "gpt-4o",
  //   messages: [
  //     { role: "system", content: prompt },
  //     { role: "user", content: input }
  //   ],
  //   response_format: {
  //     type: "json_schema",
  //     json_schema: {
  //       name: "archetype_detection",
  //       schema: {
  //         type: "object",
  //         properties: {
  //           archetype: { type: "string" },
  //           confidence: { type: "number" },
  //           reasoning: { type: "string" }
  //         },
  //         required: ["archetype", "confidence"]
  //       }
  //     }
  //   }
  // });
  //
  // return JSON.parse(response.choices[0].message.content);

  // Mock implementation for now
  return {
    archetype: "Explorer",
    confidence: 0.75,
    reasoning: "Mock implementation - replace with actual LLM call",
  };
}

/**
 * Detect Archetype from Multiple Messages
 *
 * Analyzes multiple student messages to detect archetype.
 * More robust than single-message detection.
 *
 * @param messages - Array of student messages
 * @returns Detected archetype
 */
export async function detectArchetypeFromMessages(
  messages: Array<{ role: string; content: string }>
): Promise<ArchetypeDetectionResult> {
  // Filter to student messages only
  const studentMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n\n");

  if (!studentMessages.trim()) {
    return {
      archetype: "Explorer",
      confidence: 0.5,
      reasoning: "No student messages available",
    };
  }

  return detectArchetype(studentMessages);
}

/**
 * Get Archetype Description
 *
 * Returns the description for a given archetype.
 *
 * @param archetype - The archetype
 * @returns Description
 */
export function getArchetypeDescription(archetype: Archetype): string {
  return ARCHETYPE_DESCRIPTIONS[archetype];
}

/**
 * Get All Archetypes
 *
 * Returns all available archetypes.
 *
 * @returns Array of archetypes
 */
export function getAllArchetypes(): Archetype[] {
  return Object.keys(ARCHETYPE_DESCRIPTIONS) as Archetype[];
}
