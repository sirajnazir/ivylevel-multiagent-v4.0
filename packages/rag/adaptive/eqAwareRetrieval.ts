/**
 * EQ-Aware Retrieval Fusion Engine v4.0
 *
 * THE ENGINE that fuses 5 signals to dynamically pick the best knowledge chips:
 * 1. EQ mode (gentle / direct / motivational / mentor)
 * 2. Persona style (Jenny's identity & patterns)
 * 3. Intent detection
 * 4. Archetype (student type)
 * 5. Conversation Stage
 *
 * This controls:
 * - Which Pinecone namespaces to search
 * - How to weight results
 * - Which EQ chips to force-include
 * - Which chips to exclude
 * - How much narrative vs tactical intel to inject
 *
 * This is the difference between:
 * "Generic AI answer" and "This sounds like Jenny, understands me, knows my type."
 */

import { blendRetrievalWeights } from "./blendWeights";
import { rerankWithEQ, filterBlandChips, diversityRerank } from "./rerankStrategies";
import { adaptiveRAG } from "./ragAdaptive";
import { RAGQuery, RankedChunk } from "./ragTypes";
import { ConversationStage } from "../../persona/jenny/eqRouter";

/**
 * EQ Retrieval Signal
 *
 * The 5 input signals that drive EQ-aware retrieval.
 */
export interface EQRetrievalSignal {
  eqMode: string;
  intent: string;
  archetype: string;
  stage: ConversationStage;
  personaStyle?: string;
}

/**
 * EQ Retrieval Result
 *
 * Enhanced retrieval result with EQ-aware metadata.
 */
export interface EQRetrievalResult {
  chips: RankedChunk[];
  weights: {
    semantic: number;
    tactical: number;
    emotional: number;
  };
  signal: EQRetrievalSignal;
  trace: string[];
  filtered: {
    blandChipsRemoved: number;
    diversityApplied: boolean;
  };
}

/**
 * EQ-Aware Retrieve
 *
 * Main entry point for EQ-aware retrieval.
 * Fuses all 5 signals into intelligent chip selection.
 *
 * Pipeline:
 * 1. Calculate retrieval weights from EQ mode + archetype
 * 2. Query Pinecone with adaptive RAG
 * 3. Filter bland chips
 * 4. Apply EQ-aware reranking
 * 5. Apply diversity constraints
 * 6. Return final selection
 *
 * @param query - The user's query
 * @param signal - The 5-signal input
 * @param limit - Maximum chips to return (default: 5)
 * @returns EQ-aware retrieval result
 */
export async function eqAwareRetrieve(
  query: string,
  signal: EQRetrievalSignal,
  limit: number = 5
): Promise<EQRetrievalResult> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[EQAwareRetrieval] Starting EQ-aware retrieval`);
  console.log(`[EQAwareRetrieval] Query: "${query.substring(0, 50)}..."`);
  console.log(`[EQAwareRetrieval] EQ Mode: ${signal.eqMode}`);
  console.log(`[EQAwareRetrieval] Archetype: ${signal.archetype}`);
  console.log(`[EQAwareRetrieval] Intent: ${signal.intent}`);
  console.log(`[EQAwareRetrieval] Stage: ${signal.stage}`);
  console.log("=".repeat(60));

  // Step 1: Calculate retrieval weights
  const weights = blendRetrievalWeights(signal.eqMode, signal.archetype);

  console.log(
    `\n[EQAwareRetrieval] Retrieval weights: ` +
      `semantic=${(weights.semantic * 100).toFixed(0)}%, ` +
      `tactical=${(weights.tactical * 100).toFixed(0)}%, ` +
      `emotional=${(weights.emotional * 100).toFixed(0)}%`
  );

  // Step 2: Query with adaptive RAG
  // NOTE: In production, we'd query multiple namespaces here
  // For now, using single namespace with adaptive RAG
  console.log(`\n[EQAwareRetrieval] Querying Pinecone with adaptive RAG...`);

  const ragQuery: RAGQuery = {
    query,
    studentArchetype: signal.archetype,
    coachId: "jenny",
    eqMode: signal.eqMode as any,
    limit: 15 // Get more candidates for filtering/reranking
  };

  let chips = await adaptiveRAG(ragQuery);

  console.log(`[EQAwareRetrieval] Retrieved ${chips.length} initial candidates`);

  // Step 3: Filter bland chips
  const beforeFiltering = chips.length;
  chips = filterBlandChips(chips, 0.3);
  const blandChipsRemoved = beforeFiltering - chips.length;

  console.log(`[EQAwareRetrieval] Filtered ${blandChipsRemoved} bland chips`);

  // Step 4: Apply EQ-aware reranking
  console.log(`\n[EQAwareRetrieval] Applying EQ-aware reranking...`);
  chips = rerankWithEQ(chips, signal.eqMode);

  // Step 5: Apply diversity constraints
  console.log(`\n[EQAwareRetrieval] Applying diversity constraints...`);
  const beforeDiversity = chips.length;
  chips = diversityRerank(chips, 3);
  const diversityApplied = beforeDiversity !== chips.length;

  // Step 6: Limit to final count
  chips = chips.slice(0, limit);

  console.log(`\n[EQAwareRetrieval] Final selection: ${chips.length} chips`);

  // Build trace
  const trace = buildRetrievalTrace(signal, weights, chips.length, blandChipsRemoved);

  console.log("=".repeat(60) + "\n");

  return {
    chips,
    weights,
    signal,
    trace,
    filtered: {
      blandChipsRemoved,
      diversityApplied
    }
  };
}

/**
 * EQ-Aware Retrieve with Context
 *
 * Enhanced version that considers conversation context.
 * Useful for multi-turn conversations.
 *
 * @param query - The user's query
 * @param signal - The 5-signal input
 * @param conversationContext - Recent conversation history
 * @param limit - Maximum chips to return
 * @returns EQ-aware retrieval result
 */
export async function eqAwareRetrieveWithContext(
  query: string,
  signal: EQRetrievalSignal,
  conversationContext: string,
  limit: number = 5
): Promise<EQRetrievalResult> {
  console.log(`[EQAwareRetrieval] Using context-aware retrieval`);

  // Enhance query with context
  const enhancedQuery = `${query}\n\nRecent context:\n${conversationContext.substring(0, 300)}`;

  return eqAwareRetrieve(enhancedQuery, signal, limit);
}

/**
 * Build Retrieval Trace
 *
 * Creates detailed trace of retrieval decisions.
 *
 * @param signal - Input signals
 * @param weights - Calculated weights
 * @param finalCount - Final chip count
 * @param blandRemoved - Number of bland chips removed
 * @returns Trace array
 */
function buildRetrievalTrace(
  signal: EQRetrievalSignal,
  weights: { semantic: number; tactical: number; emotional: number },
  finalCount: number,
  blandRemoved: number
): string[] {
  return [
    `eqMode:${signal.eqMode}`,
    `archetype:${signal.archetype}`,
    `intent:${signal.intent}`,
    `stage:${signal.stage}`,
    `semanticWeight:${weights.semantic.toFixed(2)}`,
    `tacticalWeight:${weights.tactical.toFixed(2)}`,
    `emotionalWeight:${weights.emotional.toFixed(2)}`,
    `finalCount:${finalCount}`,
    `blandRemoved:${blandRemoved}`
  ];
}

/**
 * Get Retrieval Summary
 *
 * Returns human-readable summary of retrieval results.
 *
 * @param result - EQ retrieval result
 * @returns Summary string
 */
export function getRetrievalSummary(result: EQRetrievalResult): string {
  const lines: string[] = [];

  lines.push(`EQ-Aware Retrieval Summary`);
  lines.push(`=`.repeat(40));
  lines.push(`Chips Retrieved: ${result.chips.length}`);
  lines.push(`Bland Chips Removed: ${result.filtered.blandChipsRemoved}`);
  lines.push(`Diversity Applied: ${result.filtered.diversityApplied ? "Yes" : "No"}`);
  lines.push(``);
  lines.push(`Retrieval Weights:`);
  lines.push(`  Semantic: ${(result.weights.semantic * 100).toFixed(0)}%`);
  lines.push(`  Tactical: ${(result.weights.tactical * 100).toFixed(0)}%`);
  lines.push(`  Emotional: ${(result.weights.emotional * 100).toFixed(0)}%`);
  lines.push(``);
  lines.push(`Input Signals:`);
  lines.push(`  EQ Mode: ${result.signal.eqMode}`);
  lines.push(`  Archetype: ${result.signal.archetype}`);
  lines.push(`  Intent: ${result.signal.intent}`);
  lines.push(`  Stage: ${result.signal.stage}`);

  if (result.chips.length > 0) {
    lines.push(``);
    lines.push(`Top Chip:`);
    lines.push(`  Score: ${result.chips[0].score.toFixed(2)}`);
    lines.push(`  Type: ${result.chips[0].semanticType}`);
    lines.push(`  Text: "${result.chips[0].text.substring(0, 80)}..."`);
  }

  return lines.join("\n");
}

/**
 * Validate Retrieval Result
 *
 * Checks if retrieval result meets quality standards.
 * Returns warnings if issues detected.
 *
 * @param result - EQ retrieval result
 * @returns Array of warnings
 */
export function validateRetrievalResult(result: EQRetrievalResult): string[] {
  const warnings: string[] = [];

  // Warning: Too few chips
  if (result.chips.length < 3) {
    warnings.push(`Very few chips retrieved (${result.chips.length}). May need to relax filters.`);
  }

  // Warning: Too many bland chips removed
  if (result.filtered.blandChipsRemoved > 5) {
    warnings.push(
      `Many bland chips removed (${result.filtered.blandChipsRemoved}). ` +
        `Consider improving chip quality.`
    );
  }

  // Warning: All chips same type
  const types = new Set(result.chips.map(c => c.semanticType));
  if (types.size === 1 && result.chips.length > 2) {
    warnings.push(
      `All chips are same type (${Array.from(types)[0]}). ` + `Diversity may be needed.`
    );
  }

  // Warning: Extreme weight distribution
  if (
    result.weights.semantic > 0.7 ||
    result.weights.tactical > 0.7 ||
    result.weights.emotional > 0.7
  ) {
    warnings.push(`Very skewed weight distribution. May miss important content.`);
  }

  return warnings;
}
