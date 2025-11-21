import { OpenAI } from "openai";
import { safeJsonParse } from "../../../llm/safeJsonParse";
import { memorySignalSchema, createNeutralSignal, type MemorySignal } from "../../../schema/memorySignal_v1";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Memory Signal Extractor
 *
 * Extracts emotional and behavioral signals from student messages.
 * Uses LLM to detect subtle changes in frustration, confidence,
 * overwhelm, motivation, and agency.
 *
 * Also detects behavioral patterns like avoidance, empowerment,
 * parental pressure, etc.
 */

/**
 * Extract Memory Signals
 *
 * Analyzes a student message and returns detected signal deltas.
 */
export async function extractMemorySignals(message: string): Promise<MemorySignal> {
  console.log('[MemorySignalExtractor] Analyzing message for emotional signals');

  try {
    const systemPrompt = `You are an emotional intelligence analyzer for a college coaching platform.

Your task is to analyze a student's message and detect emotional and behavioral signals.

Return a JSON object with:
- frustrationDelta: change in frustration level (-5 to +5)
- confidenceDelta: change in confidence level (-5 to +5)
- overwhelmDelta: change in overwhelm level (-5 to +5)
- motivationDelta: change in motivation level (-5 to +5)
- agencyDelta: change in agency/ownership level (-5 to +5)
- patterns: array of detected behavioral patterns

Patterns to detect:
- "avoidance_of_difficult_topics" - Student changes subject or deflects
- "empowerment_language_emerging" - Student uses "I will" or "I'm going to"
- "micro_win_celebration" - Student shares small progress
- "parental_pressure_expressed" - Mentions parent expectations
- "confidence_building" - Shows increased self-assurance
- "seeking_permission" - Asks "Is it okay if..." or "Should I..."
- "taking_ownership" - Decisiveness, commits to action
- "analysis_paralysis" - Overthinking, can't decide
- "excitement_about_possibilities" - Energetic, optimistic tone

Examples:

Message: "I'm worried about taking AP Calc BC. What if I can't handle it?"
Output:
{
  "frustrationDelta": 0,
  "confidenceDelta": -1,
  "overwhelmDelta": 1,
  "motivationDelta": 0,
  "agencyDelta": -1,
  "patterns": ["seeking_permission"]
}

Message: "I signed up for the environmental club meeting like you suggested."
Output:
{
  "frustrationDelta": 0,
  "confidenceDelta": 1,
  "overwhelmDelta": 0,
  "motivationDelta": 1,
  "agencyDelta": 2,
  "patterns": ["taking_ownership", "micro_win_celebration"]
}

Message: "My parents want me to apply to all Ivies but I don't know if that's realistic."
Output:
{
  "frustrationDelta": 1,
  "confidenceDelta": -1,
  "overwhelmDelta": 2,
  "motivationDelta": 0,
  "agencyDelta": -1,
  "patterns": ["parental_pressure_expressed", "seeking_permission"]
}

Analyze the student message and return signal deltas.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.3 // Lower for consistent signal detection
    });

    const cleaned = response.choices[0].message.content || JSON.stringify(createNeutralSignal());

    // Parse and validate
    const parseResult = safeJsonParse(cleaned, memorySignalSchema, { logErrors: true });

    if (!parseResult.success) {
      console.warn(`[MemorySignalExtractor] LLM parse failed, using neutral signal: ${parseResult.error}`);
      return createNeutralSignal();
    }

    console.log('[MemorySignalExtractor] Signals extracted successfully');
    console.log(`  - Confidence delta: ${parseResult.data!.confidenceDelta}`);
    console.log(`  - Agency delta: ${parseResult.data!.agencyDelta}`);
    console.log(`  - Patterns: ${parseResult.data!.patterns.join(", ") || "none"}`);

    return parseResult.data!;
  } catch (error) {
    console.error('[MemorySignalExtractor] Error extracting signals:', error);
    console.warn('[MemorySignalExtractor] Falling back to neutral signal');
    return createNeutralSignal();
  }
}

/**
 * Extract Memory Signals with Heuristics
 *
 * Faster heuristic-based signal extraction for common cases.
 * Falls back to LLM for nuanced analysis.
 */
export function extractMemorySignalsHeuristic(message: string): MemorySignal {
  const lower = message.toLowerCase();
  const signal: MemorySignal = createNeutralSignal();

  // Frustration markers
  if (/frustrated|annoyed|irritated|confused/.test(lower)) {
    signal.frustrationDelta = 1;
  }

  // Confidence markers
  if (/i can|i will|i'm going to|i got this/.test(lower)) {
    signal.confidenceDelta = 1;
    signal.patterns.push("empowerment_language_emerging");
  }
  if (/i can't|i don't think i can|what if i fail/.test(lower)) {
    signal.confidenceDelta = -1;
  }

  // Overwhelm markers
  if (/overwhelmed|too much|can't keep up|drowning/.test(lower)) {
    signal.overwhelmDelta = 2;
  }

  // Motivation markers
  if (/excited|can't wait|looking forward|pumped/.test(lower)) {
    signal.motivationDelta = 1;
    signal.patterns.push("excitement_about_possibilities");
  }
  if (/don't care|whatever|not sure why/.test(lower)) {
    signal.motivationDelta = -1;
  }

  // Agency markers
  if (/i signed up|i did|i completed|i decided/.test(lower)) {
    signal.agencyDelta = 2;
    signal.patterns.push("taking_ownership", "micro_win_celebration");
  }
  if (/should i|is it okay|my parents want|they said/.test(lower)) {
    signal.agencyDelta = -1;
    signal.patterns.push("seeking_permission");
  }

  // Parental pressure
  if (/my parents|my mom|my dad|they want me to/.test(lower)) {
    signal.patterns.push("parental_pressure_expressed");
  }

  // Avoidance
  if (/let's talk about something else|anyway|maybe later/.test(lower)) {
    signal.patterns.push("avoidance_of_difficult_topics");
  }

  return signal;
}
