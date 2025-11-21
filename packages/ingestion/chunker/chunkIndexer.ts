/**
 * Chunk Indexer v1.0
 *
 * Indexes embedded chunks into Pinecone for RAG retrieval.
 * Uses isolated namespaces per coach for data separation.
 */

import { Pinecone } from "@pinecone-database/pinecone";
import { EmbeddedChunk } from "./chunk.types";
import { IndexResult } from "./chunk.types";

/**
 * Index Chunks
 *
 * Indexes embedded chunks into Pinecone.
 *
 * Namespace strategy: coach-{coachId}-v4
 * - Example: coach-jenny-v4
 * - Allows clean separation between coaches
 * - Allows version upgrades without migration
 *
 * Metadata stored with each vector:
 * - coachId: Coach identifier
 * - sourcePath: Original file path
 * - text: Chunk text (for display in results)
 * - semanticType: Chunk category (academics, activities, etc.)
 * - eqSignals: EQ keywords
 * - order: Order within source file
 *
 * @param chunks - Array of embedded chunks
 * @param coachId - Coach ID for namespace
 * @returns Index result with success stats
 */
export async function indexChunks(
  chunks: EmbeddedChunk[],
  coachId: string = "jenny"
): Promise<IndexResult> {
  console.log(`[ChunkIndexer] Indexing ${chunks.length} chunks for coach: ${coachId}`);

  if (chunks.length === 0) {
    return {
      success: true,
      failed: 0,
      total: 0,
      indexedIds: []
    };
  }

  // Initialize Pinecone client
  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || "ivylevel-v4";

  if (!apiKey) {
    throw new Error("PINECONE_API_KEY environment variable is not set");
  }

  console.log(`[ChunkIndexer] Connecting to Pinecone index: ${indexName}`);

  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index(indexName);

  // Determine namespace
  const namespace = `coach-${coachId}-v4`;
  console.log(`[ChunkIndexer] Using namespace: ${namespace}`);

  // Convert chunks to Pinecone vectors
  const vectors = chunks.map(chunk => ({
    id: chunk.id,
    values: chunk.embedding,
    metadata: {
      coachId: chunk.coachId,
      sourcePath: chunk.sourcePath,
      text: chunk.text,
      semanticType: chunk.semanticType,
      eqSignals: chunk.eqSignals,
      order: chunk.order,
      size: chunk.size
    }
  }));

  console.log(`[ChunkIndexer] Prepared ${vectors.length} vectors for upsert`);

  try {
    // Upsert vectors to Pinecone
    await index.namespace(namespace).upsert(vectors);

    console.log(`[ChunkIndexer] Successfully indexed ${vectors.length} chunks`);

    return {
      success: true,
      failed: 0,
      total: chunks.length,
      indexedIds: chunks.map(c => c.id)
    };
  } catch (error) {
    console.error("[ChunkIndexer] Error indexing chunks:", error);

    return {
      success: false,
      failed: chunks.length,
      total: chunks.length,
      indexedIds: []
    };
  }
}

/**
 * Batch Index Chunks
 *
 * Indexes chunks in batches to avoid Pinecone limits.
 * Pinecone supports up to 100 vectors per upsert request.
 *
 * @param chunks - Array of embedded chunks
 * @param coachId - Coach ID
 * @param batchSize - Batch size (default: 100)
 * @returns Aggregated index result
 */
export async function batchIndexChunks(
  chunks: EmbeddedChunk[],
  coachId: string = "jenny",
  batchSize: number = 100
): Promise<IndexResult> {
  console.log(
    `[ChunkIndexer] Batch indexing ${chunks.length} chunks (batch size: ${batchSize})`
  );

  const indexedIds: string[] = [];
  let totalFailed = 0;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    console.log(
      `[ChunkIndexer] Indexing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`
    );

    const result = await indexChunks(batch, coachId);

    if (result.success) {
      indexedIds.push(...result.indexedIds);
    } else {
      totalFailed += result.failed;
    }

    // Small delay between batches
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return {
    success: totalFailed === 0,
    failed: totalFailed,
    total: chunks.length,
    indexedIds
  };
}

/**
 * Delete Chunks by Source
 *
 * Deletes all chunks from a specific source file.
 * Useful for re-indexing updated content.
 *
 * @param sourcePath - Source file path
 * @param coachId - Coach ID
 */
export async function deleteChunksBySource(
  sourcePath: string,
  coachId: string = "jenny"
): Promise<void> {
  console.log(`[ChunkIndexer] Deleting chunks from source: ${sourcePath}`);

  const apiKey = process.env.PINECONE_API_KEY;
  const indexName = process.env.PINECONE_INDEX || "ivylevel-v4";

  if (!apiKey) {
    throw new Error("PINECONE_API_KEY environment variable is not set");
  }

  const pinecone = new Pinecone({ apiKey });
  const index = pinecone.index(indexName);
  const namespace = `coach-${coachId}-v4`;

  try {
    // Delete by metadata filter
    await index.namespace(namespace).deleteMany({
      sourcePath: sourcePath
    });

    console.log(`[ChunkIndexer] Deleted chunks from: ${sourcePath}`);
  } catch (error) {
    console.error("[ChunkIndexer] Error deleting chunks:", error);
    throw error;
  }
}
