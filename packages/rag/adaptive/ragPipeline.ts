/**
 * RAG Pipeline v4.0
 *
 * Main API entry point for the Adaptive RAG Retrieval Engine.
 * This is what the Assessment Agent calls.
 *
 * Provides a clean, simple interface that hides the complexity
 * of intent detection, EQ weighting, coach fit scoring, and adaptive ranking.
 */

import { adaptiveRAG, adaptiveRAGWithContext, adaptiveRAGMultiQuery } from "./ragAdaptive";
import { RAGQuery, RankedChunk } from "./ragTypes";
import { buildBatchTraceSummary, logTrace } from "./chipTrace";

/**
 * RAG Pipeline
 *
 * Main entry point for retrieval.
 * Use this for standard single-query retrieval.
 *
 * Example:
 * ```typescript
 * const results = await ragPipeline({
 *   query: "How important is my GPA?",
 *   studentArchetype: "high-performer",
 *   coachId: "jenny",
 *   eqMode: "direct",
 *   limit: 5
 * });
 * ```
 *
 * @param query - The RAG query
 * @returns Array of ranked chunks with scores and traces
 */
export async function ragPipeline(query: RAGQuery): Promise<RankedChunk[]> {
  console.log(`[RAGPipeline] Executing standard retrieval pipeline`);

  try {
    const results = await adaptiveRAG(query);

    console.log(`[RAGPipeline] Retrieved ${results.length} chunks`);

    return results;
  } catch (error) {
    console.error(`[RAGPipeline] Error during retrieval:`, error);
    throw new Error(`RAG pipeline failed: ${error}`);
  }
}

/**
 * RAG Pipeline with Context
 *
 * Context-aware retrieval that considers conversation history.
 * Use this when you have a multi-turn conversation.
 *
 * Example:
 * ```typescript
 * const results = await ragPipelineWithContext({
 *   query: "What about test scores?",
 *   studentArchetype: "mid-performer",
 *   coachId: "jenny",
 *   contextWindow: "Student: My GPA is 3.5...\nJenny: That's solid...",
 *   eqMode: "gentle",
 *   limit: 5
 * });
 * ```
 *
 * @param query - The RAG query with context window
 * @returns Array of ranked chunks
 */
export async function ragPipelineWithContext(query: RAGQuery): Promise<RankedChunk[]> {
  console.log(`[RAGPipeline] Executing context-aware retrieval pipeline`);

  try {
    const results = await adaptiveRAGWithContext(query);

    console.log(`[RAGPipeline] Retrieved ${results.length} chunks with context`);

    return results;
  } catch (error) {
    console.error(`[RAGPipeline] Error during context-aware retrieval:`, error);
    throw new Error(`RAG pipeline with context failed: ${error}`);
  }
}

/**
 * RAG Pipeline Multi-Query
 *
 * Retrieves and merges results from multiple related queries.
 * Use this for complex questions spanning multiple intents.
 *
 * Example:
 * ```typescript
 * const results = await ragPipelineMultiQuery([
 *   {
 *     query: "How do I build my spike?",
 *     studentArchetype: "explorer",
 *     coachId: "jenny",
 *     eqMode: "motivational"
 *   },
 *   {
 *     query: "What activities should I focus on?",
 *     studentArchetype: "explorer",
 *     coachId: "jenny",
 *     eqMode: "motivational"
 *   }
 * ]);
 * ```
 *
 * @param queries - Array of RAG queries
 * @returns Merged array of ranked chunks
 */
export async function ragPipelineMultiQuery(queries: RAGQuery[]): Promise<RankedChunk[]> {
  console.log(`[RAGPipeline] Executing multi-query retrieval pipeline`);

  try {
    const results = await adaptiveRAGMultiQuery(queries);

    console.log(`[RAGPipeline] Multi-query retrieved ${results.length} merged chunks`);

    return results;
  } catch (error) {
    console.error(`[RAGPipeline] Error during multi-query retrieval:`, error);
    throw new Error(`RAG multi-query pipeline failed: ${error}`);
  }
}

/**
 * RAG Pipeline with Logging
 *
 * Debug version that logs full traces for each retrieved chunk.
 * Use this during development to understand ranking decisions.
 *
 * @param query - The RAG query
 * @param verbose - Whether to log individual chunk traces
 * @returns Array of ranked chunks
 */
export async function ragPipelineDebug(
  query: RAGQuery,
  verbose: boolean = true
): Promise<RankedChunk[]> {
  console.log(`[RAGPipeline] Executing DEBUG retrieval pipeline`);

  const results = await adaptiveRAG(query);

  if (verbose && results.length > 0) {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`DEBUG: Retrieved Chunks Trace`);
    console.log("=".repeat(60));

    results.forEach((chunk, idx) => {
      console.log(`\nChunk ${idx + 1}/${results.length}:`);
      logTrace(chunk.trace, chunk.id);
    });

    // Print summary
    const summary = buildBatchTraceSummary(results.map(r => r.trace));
    console.log(`\n${"=".repeat(60)}`);
    console.log(`Summary Statistics`);
    console.log("=".repeat(60));
    console.log(`Total Chunks: ${summary.totalChips}`);
    console.log(`Average Score: ${summary.avgScore.toFixed(2)}`);
    console.log(`Average Jenny Markers: ${summary.avgJennyStyleMarkers.toFixed(1)}`);
    console.log(`Average Persona Alignment: ${summary.avgPersonaAlignment.toFixed(2)}`);
    console.log(`\nIntent Distribution:`);
    Object.entries(summary.intentDistribution).forEach(([intent, count]) => {
      console.log(`  ${intent}: ${count}`);
    });
    console.log("=".repeat(60) + "\n");
  }

  return results;
}

/**
 * Get Top Chip Text
 *
 * Convenience method to get just the text of retrieved chunks.
 * Useful when you only need the content, not the metadata.
 *
 * @param query - The RAG query
 * @returns Array of chunk texts
 */
export async function getTopChipText(query: RAGQuery): Promise<string[]> {
  const results = await ragPipeline(query);
  return results.map(chunk => chunk.text);
}

/**
 * Get Top Chip with Scores
 *
 * Returns chunks with just ID, text, and score.
 * Simplified output format for lightweight use cases.
 *
 * @param query - The RAG query
 * @returns Array of simplified chunks
 */
export async function getTopChipWithScores(
  query: RAGQuery
): Promise<Array<{ id: string; text: string; score: number }>> {
  const results = await ragPipeline(query);

  return results.map(chunk => ({
    id: chunk.id,
    text: chunk.text,
    score: chunk.score
  }));
}
