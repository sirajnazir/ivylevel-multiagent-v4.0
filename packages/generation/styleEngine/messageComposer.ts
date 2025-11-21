/**
 * Message Composer v4.0
 *
 * The ORCHESTRATOR that combines all signals into one coherent generation call.
 *
 * This is the high-level API that the Assessment Agent will use.
 * It takes all upstream signals and produces a final, style-aware response.
 *
 * Flow:
 * 1. Receive all input signals (user message, chips, EQ mode, archetype, intent)
 * 2. Adapt style based on EQ mode + archetype
 * 3. Inject Jenny's persona DNA
 * 4. Build final prompt
 * 5. Call LLM
 * 6. Validate output
 * 7. Return response with metadata
 */

import { buildPrompt, validatePromptInput, getPromptStats } from "./buildPrompt";
import { styleAdapter, validateStyleCompatibility } from "./styleAdapter";
import { personaAdapter, validateResponseAgainstPersona, JennyProfile } from "./personaAdapter";

/**
 * Compose Input
 *
 * All signals needed to compose a coaching response.
 */
export interface ComposeInput {
  userMessage: string;
  chips: string[];
  eqMode: string;
  archetype: string;
  intent: string;
  jennyProfile?: JennyProfile;
  conversationStage?: string;
  callLLM: (prompt: string, systemPrompt: string) => Promise<string>;
}

/**
 * Compose Result
 *
 * The generated response with metadata.
 */
export interface ComposeResult {
  response: string;
  metadata: {
    eqMode: string;
    archetype: string;
    intent: string;
    chipsUsed: number;
    promptLength: number;
    responseLength: number;
    validationWarnings: string[];
    styleMetadata?: any;
  };
  trace: string[];
}

/**
 * Compose Coach Response
 *
 * Main entry point for style-aware generation.
 * Combines all signals (EQ, Archetype, Persona, Chips, Intent) into one LLM call.
 *
 * Pipeline:
 * 1. Validate inputs
 * 2. Adapt style (tone + pacing)
 * 3. Inject persona (Jenny's DNA)
 * 4. Build prompt
 * 5. Call LLM
 * 6. Validate output
 * 7. Return result with trace
 *
 * @param input - All signals for composition
 * @returns Composed response with metadata
 */
export async function composeCoachResponse(input: ComposeInput): Promise<ComposeResult> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[MessageComposer] Starting style-aware generation`);
  console.log(`[MessageComposer] EQ:${input.eqMode}, Archetype:${input.archetype}, Intent:${input.intent}`);
  console.log(`[MessageComposer] Chips:${input.chips.length}, Stage:${input.conversationStage || "N/A"}`);
  console.log("=".repeat(60));

  const trace: string[] = [];
  const validationWarnings: string[] = [];

  // Step 1: Validate inputs
  console.log(`\n[MessageComposer] Validating inputs...`);
  const inputWarnings = validatePromptInput({
    userMessage: input.userMessage,
    chips: input.chips,
    eqMode: input.eqMode,
    archetype: input.archetype,
    intent: input.intent,
    persona: { signature: "" }, // Placeholder for validation
    style: { directives: "" }
  });

  if (inputWarnings.length > 0) {
    console.log(`[MessageComposer] Input warnings: ${inputWarnings.length}`);
    inputWarnings.forEach(w => console.log(`  - ${w}`));
    validationWarnings.push(...inputWarnings);
  }

  trace.push(`inputValidation:${inputWarnings.length}warnings`);

  // Step 2: Adapt style
  console.log(`\n[MessageComposer] Adapting style...`);
  const style = styleAdapter(input.eqMode, input.archetype);

  const styleWarnings = validateStyleCompatibility(style);
  if (styleWarnings.length > 0) {
    console.log(`[MessageComposer] Style warnings: ${styleWarnings.length}`);
    styleWarnings.forEach(w => console.log(`  - ${w}`));
    validationWarnings.push(...styleWarnings);
  }

  trace.push(
    `styleAdapted:eqMode=${input.eqMode},archetype=${input.archetype}`,
    `warmth=${style.metadata?.warmthLevel.toFixed(2)}`,
    `directness=${style.metadata?.directnessLevel.toFixed(2)}`,
    `pacing=${style.metadata?.pacingSpeed}`
  );

  // Step 3: Inject persona
  console.log(`\n[MessageComposer] Injecting Jenny's persona...`);
  const persona = personaAdapter(input.jennyProfile);

  trace.push(`personaInjected:jenny`);

  // Step 4: Build prompt
  console.log(`\n[MessageComposer] Building final prompt...`);
  const prompt = buildPrompt({
    userMessage: input.userMessage,
    chips: input.chips,
    eqMode: input.eqMode,
    archetype: input.archetype,
    intent: input.intent,
    persona,
    style,
    conversationStage: input.conversationStage
  });

  const promptStats = getPromptStats(prompt);
  console.log(`[MessageComposer] Prompt: ${promptStats.totalChars} chars, ~${promptStats.estimatedTokens} tokens`);

  trace.push(`promptBuilt:${promptStats.totalChars}chars,${promptStats.estimatedTokens}tokens`);

  // Step 5: Call LLM
  console.log(`\n[MessageComposer] Calling LLM...`);
  const systemPrompt = "You are Jenny, IvyLevel's lead mentor.";

  let response: string;
  try {
    response = await input.callLLM(prompt, systemPrompt);
    console.log(`[MessageComposer] LLM response received (${response.length} chars)`);
    trace.push(`llmCalled:success,${response.length}chars`);
  } catch (error) {
    console.error(`[MessageComposer] LLM call failed:`, error);
    trace.push(`llmCalled:failed`);
    throw new Error(`LLM generation failed: ${error}`);
  }

  // Step 6: Validate output
  console.log(`\n[MessageComposer] Validating output...`);
  const personaViolations = validateResponseAgainstPersona(response, persona);

  if (personaViolations.length > 0) {
    console.log(`[MessageComposer] Persona violations: ${personaViolations.length}`);
    personaViolations.forEach(v => console.log(`  - ${v}`));
    validationWarnings.push(...personaViolations);
  }

  trace.push(`outputValidated:${personaViolations.length}violations`);

  // Step 7: Build result
  console.log(`\n[MessageComposer] Composition complete`);
  console.log(`[MessageComposer] Total warnings: ${validationWarnings.length}`);
  console.log("=".repeat(60) + "\n");

  return {
    response: response.trim(),
    metadata: {
      eqMode: input.eqMode,
      archetype: input.archetype,
      intent: input.intent,
      chipsUsed: input.chips.length,
      promptLength: promptStats.totalChars,
      responseLength: response.length,
      validationWarnings,
      styleMetadata: style.metadata
    },
    trace
  };
}

/**
 * Compose Simple Response
 *
 * Simplified version for quick generation without full signal pipeline.
 * Useful for testing or fallback scenarios.
 *
 * @param userMessage - The user's message
 * @param callLLM - LLM caller function
 * @param eqMode - Optional EQ mode (defaults to "mentor")
 * @returns Simple response
 */
export async function composeSimpleResponse(
  userMessage: string,
  callLLM: (prompt: string, systemPrompt: string) => Promise<string>,
  eqMode: string = "mentor"
): Promise<string> {
  console.log(`[MessageComposer] Composing simple response (EQ:${eqMode})`);

  const result = await composeCoachResponse({
    userMessage,
    chips: [],
    eqMode,
    archetype: "uncertain",
    intent: "general",
    callLLM
  });

  return result.response;
}

/**
 * Get Composition Summary
 *
 * Returns human-readable summary of composition process.
 *
 * @param result - Compose result
 * @returns Summary string
 */
export function getCompositionSummary(result: ComposeResult): string {
  const lines: string[] = [];

  lines.push(`Generation Summary`);
  lines.push(`=`.repeat(40));
  lines.push(`EQ Mode: ${result.metadata.eqMode}`);
  lines.push(`Archetype: ${result.metadata.archetype}`);
  lines.push(`Intent: ${result.metadata.intent}`);
  lines.push(`Chips Used: ${result.metadata.chipsUsed}`);
  lines.push(`Prompt Length: ${result.metadata.promptLength} chars`);
  lines.push(`Response Length: ${result.metadata.responseLength} chars`);
  lines.push(`Validation Warnings: ${result.metadata.validationWarnings.length}`);

  if (result.metadata.styleMetadata) {
    lines.push(``);
    lines.push(`Style Settings:`);
    lines.push(`  Warmth: ${(result.metadata.styleMetadata.warmthLevel * 100).toFixed(0)}%`);
    lines.push(`  Directness: ${(result.metadata.styleMetadata.directnessLevel * 100).toFixed(0)}%`);
    lines.push(`  Pacing: ${result.metadata.styleMetadata.pacingSpeed}`);
  }

  if (result.metadata.validationWarnings.length > 0) {
    lines.push(``);
    lines.push(`Warnings:`);
    result.metadata.validationWarnings.slice(0, 5).forEach(w => {
      lines.push(`  - ${w}`);
    });
  }

  return lines.join("\n");
}

/**
 * Batch Compose
 *
 * Generate multiple responses in parallel (useful for A/B testing).
 *
 * @param inputs - Array of compose inputs
 * @returns Array of results
 */
export async function batchCompose(inputs: ComposeInput[]): Promise<ComposeResult[]> {
  console.log(`[MessageComposer] Batch composing ${inputs.length} responses`);

  const results = await Promise.all(inputs.map(input => composeCoachResponse(input)));

  console.log(`[MessageComposer] Batch complete: ${results.length} responses generated`);

  return results;
}
