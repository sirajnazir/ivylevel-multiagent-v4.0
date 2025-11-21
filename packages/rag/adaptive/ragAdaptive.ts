/**
 * Adaptive RAG v4.0
 *
 * This is the main adaptive retrieval engine that transforms
 * "top 5 nearest neighbors" into "the 5 most contextually relevant,
 * EQ-appropriate, Jenny-authentic chips."
 *
 * Pipeline:
 * 1. Detect query intent
 * 2. Generate query embedding
 * 3. Query Pinecone for top 30 candidates
 * 4. Adaptively rank based on intent, EQ mode, coach fit
 * 5. Return top N with full trace
 */

import { Pinecone } from "@pinecone-database/pinecone";
import { detectIntent } from "./intentDetector";
import { rankChunk } from "./chunkRanker";
import { buildTrace } from "./chipTrace";
import { isEQCompatible } from "./eqWeighting";
import { isJennyAuthentic } from "./coachFitScorer";
import { RAGQuery, RankedChunk, ChipMetadata, PineconeMatch } from "./ragTypes";
import { embedText } from "../embed";

/**
 * Adaptive RAG
 *
 * Main entry point for adaptive retrieval.
 *
 * Steps:
 * 1. Detect semantic intent from query
 * 2. Generate embedding for semantic search
 * 3. Query Pinecone for top 30 candidates (broad net)
 * 4. Filter out incompatible EQ modes
 * 5. Filter out non-Jenny-authentic chips
 * 6. Adaptively rank based on intent + EQ + coach fit
 * 7. Return top N with full trace
 *
 * @param query - The RAG query with context
 * @returns Array of ranked chunks with scores and traces
 */
export async function adaptiveRAG(query: RAGQuery): Promise<RankedChunk[]> {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`[AdaptiveRAG] Starting adaptive retrieval`);
  console.log(`[AdaptiveRAG] Query: "${query.query}"`);
  console.log(`[AdaptiveRAG] Student Archetype: ${query.studentArchetype}`);
  console.log(`[AdaptiveRAG] Coach: ${query.coachId}`);
  console.log(`[AdaptiveRAG] EQ Mode: ${query.eqMode || "gentle (default)"}`);
  console.log(`[AdaptiveRAG] Limit: ${query.limit || 5}`);
  console.log("=".repeat(60));

  // Step 1: Detect Intent
  const intent = detectIntent(query.query);
  const eqMode = query.eqMode || "gentle";
  const limit = query.limit || 5;

  console.log(`\n[AdaptiveRAG] Intent detected: ${intent}`);

  // Step 2: Generate Embedding
  console.log(`[AdaptiveRAG] Generating query embedding...`);
  const embedding = await embedText(query.query);
  console.log(`[AdaptiveRAG] Embedding generated: ${embedding.length} dimensions`);

  // Step 3: Query Pinecone
  console.log(`[AdaptiveRAG] Querying Pinecone for top 30 candidates...`);

  const apiKey = process.env.PINECONE_API_KEY;
  if (!apiKey) {
    throw new Error("PINECONE_API_KEY environment variable not set");
  }

  const indexName = process.env.PINECONE_INDEX || "ivylevel-v4";
  const namespace = `coach-${query.coachId}-v4`;

  const pc = new Pinecone({ apiKey });
  const index = pc.index(indexName).namespace(namespace);

  const res = await index.query({
    topK: 30,
    vector: embedding,
    includeMetadata: true
  });

  console.log(`[AdaptiveRAG] Retrieved ${res.matches.length} candidates from Pinecone`);

  if (res.matches.length === 0) {
    console.log(`[AdaptiveRAG] No matches found in Pinecone`);
    return [];
  }

  // Step 4: Filter EQ Compatibility
  console.log(`\n[AdaptiveRAG] Filtering for EQ compatibility...`);

  const eqCompatible = res.matches.filter(match => {
    const metadata = match.metadata as unknown as ChipMetadata;
    return isEQCompatible(metadata, eqMode);
  });

  console.log(
    `[AdaptiveRAG] ${eqCompatible.length}/${res.matches.length} chips passed EQ filter`
  );

  // Step 5: Filter Jenny Authenticity
  console.log(`[AdaptiveRAG] Filtering for Jenny authenticity...`);

  const authentic = eqCompatible.filter(match => {
    const metadata = match.metadata as unknown as ChipMetadata;
    return isJennyAuthentic(metadata);
  });

  console.log(
    `[AdaptiveRAG] ${authentic.length}/${eqCompatible.length} chips passed authenticity filter`
  );

  // Step 6: Adaptive Ranking
  console.log(`\n[AdaptiveRAG] Applying adaptive ranking...`);

  const ranked = authentic.map(match => {
    const metadata = match.metadata as unknown as ChipMetadata;
    const pineconeSimilarity = match.score || 0;

    const score = rankChunk(metadata, intent, eqMode, pineconeSimilarity);

    const trace = buildTrace(metadata, intent, eqMode, score, pineconeSimilarity);

    return {
      id: match.id,
      text: metadata.text,
      semanticType: metadata.semanticType,
      eqSignals: metadata.eqSignals,
      score,
      trace
    } as RankedChunk;
  });

  // Step 7: Sort and Limit
  ranked.sort((a, b) => b.score - a.score);
  const topResults = ranked.slice(0, limit);

  console.log(`\n[AdaptiveRAG] Ranking complete:`);
  console.log(`  Total candidates: ${res.matches.length}`);
  console.log(`  After EQ filter: ${eqCompatible.length}`);
  console.log(`  After authenticity filter: ${authentic.length}`);
  console.log(`  Top ${limit} results returned`);

  if (topResults.length > 0) {
    console.log(`\n[AdaptiveRAG] Top result:`);
    console.log(`  Score: ${topResults[0].score.toFixed(2)}`);
    console.log(`  Semantic Type: ${topResults[0].semanticType}`);
    console.log(`  EQ Signals: ${topResults[0].eqSignals.join(", ")}`);
    console.log(`  Text: "${topResults[0].text.substring(0, 100)}..."`);
  }

  console.log("=".repeat(60) + "\n");

  return topResults;
}

/**
 * Adaptive RAG with Context Window
 *
 * Enhanced version that considers conversation context
 * for more contextual retrieval.
 *
 * @param query - The RAG query with context window
 * @returns Array of ranked chunks
 */
export async function adaptiveRAGWithContext(query: RAGQuery): Promise<RankedChunk[]> {
  console.log(`[AdaptiveRAG] Using context-aware retrieval`);

  // If context window provided, combine with query for better embedding
  let searchText = query.query;

  if (query.contextWindow) {
    console.log(`[AdaptiveRAG] Context window provided (${query.contextWindow.length} chars)`);
    // Weight recent query more heavily than context
    searchText = `${query.query}\n\nRecent context:\n${query.contextWindow.substring(0, 500)}`;
  }

  // Create modified query with enhanced search text
  const enhancedQuery: RAGQuery = {
    ...query,
    query: searchText
  };

  return adaptiveRAG(enhancedQuery);
}

/**
 * Adaptive RAG Multi-Query
 *
 * Retrieves chips for multiple related queries and merges results.
 * Useful for complex questions that span multiple intents.
 *
 * @param queries - Array of RAG queries
 * @returns Merged and deduplicated array of ranked chunks
 */
export async function adaptiveRAGMultiQuery(queries: RAGQuery[]): Promise<RankedChunk[]> {
  console.log(`[AdaptiveRAG] Running multi-query retrieval for ${queries.length} queries`);

  const allResults = await Promise.all(queries.map(q => adaptiveRAG(q)));

  // Merge and deduplicate by chunk ID
  const merged = new Map<string, RankedChunk>();

  allResults.forEach(results => {
    results.forEach(chunk => {
      // If chunk already exists, keep the higher score
      const existing = merged.get(chunk.id);
      if (!existing || chunk.score > existing.score) {
        merged.set(chunk.id, chunk);
      }
    });
  });

  // Sort by score and return
  const deduplicated = Array.from(merged.values());
  deduplicated.sort((a, b) => b.score - a.score);

  console.log(`[AdaptiveRAG] Multi-query merged ${deduplicated.length} unique chunks`);

  return deduplicated;
}
