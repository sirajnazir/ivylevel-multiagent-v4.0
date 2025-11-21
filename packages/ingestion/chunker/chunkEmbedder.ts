/**
 * Chunk Embedder v1.0
 *
 * Generates vector embeddings for chunks using OpenAI text-embedding-3-large.
 * These embeddings enable semantic search in Pinecone.
 */

import OpenAI from "openai";
import { Chunk, EmbeddedChunk } from "./chunk.types";

/**
 * Embed Chunks
 *
 * Generates embeddings for an array of chunks using OpenAI's embedding model.
 *
 * Model: text-embedding-3-large
 * - Dimensions: 3072
 * - Best for semantic search
 * - Higher quality than ada-002
 *
 * @param chunks - Array of chunks to embed
 * @returns Array of chunks with embeddings
 */
export async function embedChunks(chunks: Chunk[]): Promise<EmbeddedChunk[]> {
  console.log(`[ChunkEmbedder] Embedding ${chunks.length} chunks`);

  if (chunks.length === 0) {
    return [];
  }

  // Initialize OpenAI client
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }

  const openai = new OpenAI({ apiKey });

  // Extract text from chunks
  const texts = chunks.map(c => c.text);

  console.log(`[ChunkEmbedder] Calling OpenAI API...`);

  try {
    // Generate embeddings
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: texts,
      encoding_format: "float"
    });

    console.log(`[ChunkEmbedder] Received ${response.data.length} embeddings`);

    // Combine chunks with their embeddings
    const embeddedChunks: EmbeddedChunk[] = chunks.map((chunk, idx) => ({
      ...chunk,
      embedding: response.data[idx].embedding
    }));

    // Verify embedding dimensions
    const sampleDimension = embeddedChunks[0]?.embedding.length;
    console.log(
      `[ChunkEmbedder] Embedding dimensions: ${sampleDimension} (expected: 3072)`
    );

    return embeddedChunks;
  } catch (error) {
    console.error("[ChunkEmbedder] Error generating embeddings:", error);
    throw error;
  }
}

/**
 * Embed Single Chunk
 *
 * Convenience method for embedding a single chunk.
 *
 * @param chunk - Single chunk to embed
 * @returns Embedded chunk
 */
export async function embedSingleChunk(chunk: Chunk): Promise<EmbeddedChunk> {
  const [embedded] = await embedChunks([chunk]);
  return embedded;
}

/**
 * Batch Embed Chunks
 *
 * Embeds chunks in batches to avoid API rate limits.
 * OpenAI supports up to 2048 texts per request.
 *
 * @param chunks - Array of chunks
 * @param batchSize - Batch size (default: 100)
 * @returns Array of embedded chunks
 */
export async function batchEmbedChunks(
  chunks: Chunk[],
  batchSize: number = 100
): Promise<EmbeddedChunk[]> {
  console.log(
    `[ChunkEmbedder] Batch embedding ${chunks.length} chunks (batch size: ${batchSize})`
  );

  const embeddedChunks: EmbeddedChunk[] = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    console.log(
      `[ChunkEmbedder] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)}`
    );

    const embedded = await embedChunks(batch);
    embeddedChunks.push(...embedded);

    // Small delay to avoid rate limits
    if (i + batchSize < chunks.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return embeddedChunks;
}
