/**
 * EQ Router v4.0
 *
 * THE HEART OF THE PERSONA ENGINE.
 *
 * At runtime, for every message, this determines:
 * 1. Which EQ mode to use
 * 2. Which Jenny voice "variant" to channel
 * 3. Which RAG chips to emphasize
 * 4. How to phrase the output (tone + rhythm + emphasis)
 * 5. How to adapt if the student archetype shifts mid-session
 *
 * This fuses:
 * - Archetype Heuristics
 * - Intent Detection
 * - Adaptive RAG
 * - EQ Chips
 * - Jenny Persona Embedding
 * - Conversation State
 *
 * Outputs: EQ Mode + Persona Style Guide per turn.
 */

import { blendStyle, BlendedStyle } from "./styleBlender";
import { detectIntent } from "../../rag/adaptive/intentDetector";
import { IntentType } from "../../rag/adaptive/ragTypes";
import { ArchetypeProfile, ArchetypeType } from "../../archetype/archetypeTypes";

/**
 * Conversation Stage
 *
 * Where we are in the assessment conversation flow.
 * Each stage has default EQ mode preferences.
 */
export type ConversationStage = "warmup" | "diagnose" | "deep-dive" | "solution" | "wrap-up";

/**
 * EQ Routing Result
 *
 * The complete output of the EQ router.
 * This guides response generation.
 */
export interface EQRoutingResult {
  eqMode: string;
  persona: BlendedStyle;
  intent: IntentType;
  trace: string[];
  confidence: number;
  warnings: string[];
}

/**
 * Route EQ
 *
 * Main entry point for EQ routing.
 * Determines the optimal EQ mode and persona blend for this turn.
 *
 * Routing Logic Priority:
 * 1. Emotional keyword overrides (highest priority - safety first)
 * 2. Archetype + Intent combinations (student-specific)
 * 3. Conversation stage defaults (structural)
 *
 * @param userMessage - The student's message
 * @param archetype - The student's archetype profile
 * @param conversationStage - Current conversation stage
 * @returns Complete EQ routing result
 */
export function routeEQ(
  userMessage: string,
  archetype: ArchetypeProfile,
  conversationStage: ConversationStage
): EQRoutingResult {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[EQRouter] Routing EQ mode for new turn`);
  console.log(`[EQRouter] Message: "${userMessage.substring(0, 50)}..."`);
  console.log(`[EQRouter] Archetype: ${archetype.type}`);
  console.log(`[EQRouter] Stage: ${conversationStage}`);
  console.log("=".repeat(60));

  // Step 1: Detect semantic intent
  const intent = detectIntent(userMessage);
  console.log(`[EQRouter] Intent detected: ${intent}`);

  // Step 2: Start with stage-based default
  let eqMode = getStageDefaultMode(conversationStage);
  let confidence = 0.5; // Base confidence
  const warnings: string[] = [];

  console.log(`[EQRouter] Stage default mode: ${eqMode}`);

  // Step 3: Apply archetype + intent overrides
  const archetypeOverride = getArchetypeOverride(archetype, intent);
  if (archetypeOverride) {
    eqMode = archetypeOverride.mode;
    confidence = archetypeOverride.confidence;
    console.log(`[EQRouter] Archetype override: ${eqMode} (confidence: ${confidence})`);
  }

  // Step 4: Apply emotional keyword overrides (HIGHEST PRIORITY)
  const emotionalOverride = getEmotionalKeywordOverride(userMessage);
  if (emotionalOverride) {
    eqMode = emotionalOverride.mode;
    confidence = emotionalOverride.confidence;
    console.log(`[EQRouter] Emotional override: ${eqMode} (confidence: ${confidence})`);
  }

  // Step 5: Validate mode is appropriate
  const validationWarnings = validateModeChoice(eqMode, archetype, userMessage);
  warnings.push(...validationWarnings);

  // Step 6: Blend persona style
  console.log(`[EQRouter] Blending style for mode: ${eqMode}`);
  const persona = blendStyle(eqMode);

  // Step 7: Build trace
  const trace = buildRoutingTrace(
    conversationStage,
    archetype,
    intent,
    eqMode,
    emotionalOverride !== null,
    archetypeOverride !== null
  );

  console.log(`[EQRouter] Final EQ mode: ${eqMode}`);
  console.log(`[EQRouter] Confidence: ${confidence}`);
  console.log(`[EQRouter] Warnings: ${warnings.length}`);
  console.log("=".repeat(60) + "\n");

  return {
    eqMode,
    persona,
    intent,
    trace,
    confidence,
    warnings
  };
}

/**
 * Get Stage Default Mode
 *
 * Returns the default EQ mode for a conversation stage.
 *
 * Stage → Mode Mapping:
 * - warmup: gentle (building trust)
 * - diagnose: mentor (gathering information)
 * - deep-dive: direct (tactical work)
 * - solution: motivational (building momentum)
 * - wrap-up: mentor (strategic summary)
 *
 * @param stage - Conversation stage
 * @returns Default EQ mode
 */
function getStageDefaultMode(stage: ConversationStage): string {
  const stageDefaults: Record<ConversationStage, string> = {
    warmup: "gentle",
    diagnose: "mentor",
    "deep-dive": "direct",
    solution: "motivational",
    "wrap-up": "mentor"
  };

  return stageDefaults[stage] || "gentle";
}

/**
 * Get Archetype Override
 *
 * Returns EQ mode override based on archetype + intent combination.
 * Returns null if no override needed.
 *
 * @param archetype - Student archetype
 * @param intent - Message intent
 * @returns Override mode and confidence, or null
 */
function getArchetypeOverride(
  archetype: ArchetypeProfile,
  intent: IntentType
): { mode: string; confidence: number } | null {
  const { type } = archetype;

  // High achiever patterns
  if (type === "high_achiever") {
    if (intent === "academics" || intent === "activities") {
      return { mode: "direct", confidence: 0.8 };
    }
    if (intent === "eq") {
      return { mode: "mentor", confidence: 0.7 };
    }
  }

  // Burnout patterns
  if (type === "burnout") {
    // Always gentle for burnout students, regardless of intent
    return { mode: "gentle", confidence: 0.9 };
  }

  // Late starter patterns
  if (type === "late_starter") {
    if (intent === "framework" || intent === "general") {
      return { mode: "motivational", confidence: 0.75 };
    }
    return { mode: "mentor", confidence: 0.7 };
  }

  // Quiet builder patterns
  if (type === "quiet_builder") {
    if (intent === "eq" || intent === "narrative") {
      return { mode: "mentor", confidence: 0.8 };
    }
    return { mode: "gentle", confidence: 0.65 };
  }

  // Explorer patterns
  if (type === "explorer") {
    if (intent === "activities" || intent === "framework") {
      return { mode: "motivational", confidence: 0.75 };
    }
    return { mode: "mentor", confidence: 0.7 };
  }

  // No override needed
  return null;
}

/**
 * Get Emotional Keyword Override
 *
 * Detects emotional keywords and returns override mode.
 * This has HIGHEST PRIORITY - safety first.
 *
 * @param message - User message
 * @returns Override mode and confidence, or null
 */
function getEmotionalKeywordOverride(
  message: string
): { mode: string; confidence: number } | null {
  const lowerMessage = message.toLowerCase();

  // Distress keywords → gentle mode
  if (
    lowerMessage.match(
      /\b(overwhelmed|stressed|tired|burnt|burnout|exhausted|anxious|panic|depressed)\b/i
    )
  ) {
    console.log(`[EQRouter] Distress keywords detected → gentle mode`);
    return { mode: "gentle", confidence: 0.95 };
  }

  // Confusion keywords → mentor mode
  if (lowerMessage.match(/\b(stuck|don't know|lost|confused|unclear|unsure)\b/i)) {
    console.log(`[EQRouter] Confusion keywords detected → mentor mode`);
    return { mode: "mentor", confidence: 0.85 };
  }

  // Energy keywords → motivational mode
  if (lowerMessage.match(/\b(excited|ready|let's go|motivated|pumped|determined)\b/i)) {
    console.log(`[EQRouter] Energy keywords detected → motivational mode`);
    return { mode: "motivational", confidence: 0.85 };
  }

  // Tactical keywords → direct mode
  if (
    lowerMessage.match(
      /\b(exactly|specifically|how many|what should|give me|tell me exactly)\b/i
    )
  ) {
    console.log(`[EQRouter] Tactical keywords detected → direct mode`);
    return { mode: "direct", confidence: 0.75 };
  }

  // No emotional override needed
  return null;
}

/**
 * Validate Mode Choice
 *
 * Checks if the selected mode is appropriate for the context.
 * Returns warnings if potential issues detected.
 *
 * @param mode - Selected EQ mode
 * @param archetype - Student archetype
 * @param message - User message
 * @returns Array of warnings
 */
function validateModeChoice(
  mode: string,
  archetype: ArchetypeProfile,
  message: string
): string[] {
  const warnings: string[] = [];
  const lowerMessage = message.toLowerCase();

  // Warning: Direct mode with burnout student
  if (mode === "direct" && archetype.type === "burnout") {
    warnings.push("Direct mode selected for burnout student - may increase stress");
  }

  // Warning: Motivational mode when student expresses overwhelm
  if (mode === "motivational" && lowerMessage.match(/overwhelmed|stressed|tired|burnt/i)) {
    warnings.push("Motivational mode may feel performative when student is struggling");
  }

  // Warning: Gentle mode with high achiever asking tactical question
  if (
    mode === "gentle" &&
    archetype.type === "high_achiever" &&
    lowerMessage.match(/how many|exactly|specifically/i)
  ) {
    warnings.push("Gentle mode may feel condescending to high achiever seeking tactics");
  }

  return warnings;
}

/**
 * Build Routing Trace
 *
 * Creates a detailed trace of the routing decision.
 * Used for debugging and logging.
 *
 * @param stage - Conversation stage
 * @param archetype - Student archetype
 * @param intent - Message intent
 * @param finalMode - Final selected mode
 * @param hadEmotionalOverride - Whether emotional override was applied
 * @param hadArchetypeOverride - Whether archetype override was applied
 * @returns Trace array
 */
function buildRoutingTrace(
  stage: ConversationStage,
  archetype: ArchetypeProfile,
  intent: IntentType,
  finalMode: string,
  hadEmotionalOverride: boolean,
  hadArchetypeOverride: boolean
): string[] {
  const trace = [
    `stage:${stage}`,
    `archetype:${archetype.type}`,
    `intent:${intent}`,
    `mode:${finalMode}`
  ];

  if (hadEmotionalOverride) {
    trace.push("source:emotional_keywords");
  } else if (hadArchetypeOverride) {
    trace.push("source:archetype_override");
  } else {
    trace.push("source:stage_default");
  }

  if (archetype.confidence) {
    trace.push(`archetype_confidence:${archetype.confidence.toFixed(2)}`);
  }

  return trace;
}

/**
 * Route EQ Simple
 *
 * Simplified version that doesn't require full archetype profile.
 * Useful for quick routing when archetype is unknown.
 *
 * @param userMessage - The student's message
 * @param conversationStage - Current conversation stage
 * @returns EQ routing result with default archetype
 */
export function routeEQSimple(
  userMessage: string,
  conversationStage: ConversationStage = "diagnose"
): EQRoutingResult {
  const defaultArchetype: ArchetypeProfile = {
    type: "uncertain"
  };

  return routeEQ(userMessage, defaultArchetype, conversationStage);
}
