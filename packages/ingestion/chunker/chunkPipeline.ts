/**
 * Chunk Pipeline v1.0
 *
 * End-to-end orchestrator for chunking, embedding, and indexing.
 * Transforms cleaned ingestion outputs into queryable Pinecone vectors.
 */

import { semanticChunk } from "./semanticChunker";
import { classifyFallback, extractEQSignalsFallback } from "./chunkClassifier";
import { embedChunks, batchEmbedChunks } from "./chunkEmbedder";
import { indexChunks, batchIndexChunks } from "./chunkIndexer";
import { ChunkInput, IndexResult } from "./chunk.types";

/**
 * Run Chunk Pipeline
 *
 * Main entry point for the complete chunking pipeline.
 *
 * Pipeline stages:
 * 1. Semantic Chunking → Split text into coherent chunks
 * 2. Fallback Classification → Ensure all chunks have semantic types
 * 3. Embedding → Generate vector embeddings
 * 4. Indexing → Store in Pinecone
 *
 * @param input - Chunk input with cleaned text
 * @returns Index result with success stats
 */
export async function runChunkPipeline(
  input: ChunkInput
): Promise<IndexResult> {
  console.log("═".repeat(80));
  console.log("CHUNK PIPELINE");
  console.log("═".repeat(80));
  console.log("");
  console.log(`Coach ID:     ${input.coachId}`);
  console.log(`Source:       ${input.sourcePath}`);
  console.log(`Text Length:  ${input.cleanedText.length} characters`);
  console.log("");

  try {
    // Stage 1: Semantic Chunking
    console.log("Stage 1/4: Semantic Chunking");
    let chunks = await semanticChunk(input);
    console.log(`✓ Created ${chunks.length} chunks`);
    console.log("");

    if (chunks.length === 0) {
      console.log("⚠ No chunks created - text may be too short or empty");
      return {
        success: true,
        failed: 0,
        total: 0,
        indexedIds: []
      };
    }

    // Stage 2: Fallback Classification
    console.log("Stage 2/4: Fallback Classification");
    chunks = chunks.map(chunk => {
      // Ensure semantic type is set
      if (!chunk.semanticType || chunk.semanticType === "general") {
        chunk.semanticType = classifyFallback(chunk.text);
      }

      // Ensure EQ signals are set
      if (!chunk.eqSignals || chunk.eqSignals.length === 0) {
        chunk.eqSignals = extractEQSignalsFallback(chunk.text);
      }

      return chunk;
    });

    const semanticTypes = chunks.reduce((acc, c) => {
      acc[c.semanticType] = (acc[c.semanticType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log("✓ Semantic type distribution:");
    Object.entries(semanticTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    console.log("");

    // Stage 3: Embedding
    console.log("Stage 3/4: Generating Embeddings");

    const embeddedChunks =
      chunks.length > 100
        ? await batchEmbedChunks(chunks, 100)
        : await embedChunks(chunks);

    console.log(`✓ Generated ${embeddedChunks.length} embeddings`);
    console.log(
      `  Embedding dimensions: ${embeddedChunks[0]?.embedding.length || 0}`
    );
    console.log("");

    // Stage 4: Indexing
    console.log("Stage 4/4: Indexing to Pinecone");

    const indexResult =
      embeddedChunks.length > 100
        ? await batchIndexChunks(embeddedChunks, input.coachId, 100)
        : await indexChunks(embeddedChunks, input.coachId);

    console.log(`✓ Indexed ${indexResult.indexedIds.length} chunks`);

    if (indexResult.failed > 0) {
      console.log(`⚠ Failed to index ${indexResult.failed} chunks`);
    }

    console.log("");
    console.log("═".repeat(80));
    console.log("PIPELINE COMPLETE");
    console.log("═".repeat(80));
    console.log(`Total Chunks:   ${indexResult.total}`);
    console.log(`Indexed:        ${indexResult.indexedIds.length}`);
    console.log(`Failed:         ${indexResult.failed}`);
    console.log(
      `Success Rate:   ${Math.round((indexResult.indexedIds.length / indexResult.total) * 100)}%`
    );
    console.log("");

    return indexResult;
  } catch (error) {
    console.error("\n❌ Pipeline Error:", error);
    throw error;
  }
}

/**
 * Run Batch Chunk Pipeline
 *
 * Processes multiple files through the chunk pipeline.
 *
 * @param inputs - Array of chunk inputs
 * @returns Aggregated index results
 */
export async function runBatchChunkPipeline(
  inputs: ChunkInput[]
): Promise<IndexResult> {
  console.log(`\n🚀 Batch Chunk Pipeline: ${inputs.length} files\n`);

  const allIndexedIds: string[] = [];
  let totalFailed = 0;
  let totalChunks = 0;

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    console.log(
      `\n[${i + 1}/${inputs.length}] Processing: ${input.sourcePath}\n`
    );

    try {
      const result = await runChunkPipeline(input);
      allIndexedIds.push(...result.indexedIds);
      totalFailed += result.failed;
      totalChunks += result.total;
    } catch (error) {
      console.error(`❌ Failed to process ${input.sourcePath}:`, error);
      totalFailed++;
    }
  }

  console.log("\n" + "═".repeat(80));
  console.log("BATCH PIPELINE COMPLETE");
  console.log("═".repeat(80));
  console.log(`Files Processed: ${inputs.length}`);
  console.log(`Total Chunks:    ${totalChunks}`);
  console.log(`Indexed:         ${allIndexedIds.length}`);
  console.log(`Failed:          ${totalFailed}`);
  console.log("");

  return {
    success: totalFailed === 0,
    failed: totalFailed,
    total: totalChunks,
    indexedIds: allIndexedIds
  };
}
