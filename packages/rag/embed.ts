/**
 * Embedding Helper v4.0
 *
 * Utility for generating OpenAI embeddings for RAG queries.
 * Uses text-embedding-3-large (3072 dimensions) for consistency
 * with the chunking pipeline.
 */

import OpenAI from "openai";

/**
 * Embed Text
 *
 * Generates an embedding vector for a text query.
 * Uses OpenAI's text-embedding-3-large model.
 *
 * @param text - The text to embed
 * @returns Embedding vector (3072 dimensions)
 */
export async function embedText(text: string): Promise<number[]> {
  console.log(`[Embedder] Generating embedding for query: "${text.substring(0, 50)}..."`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
      encoding_format: "float"
    });

    const embedding = response.data[0].embedding;

    console.log(`[Embedder] Embedding generated: ${embedding.length} dimensions`);

    return embedding;
  } catch (error) {
    console.error(`[Embedder] Error generating embedding:`, error);
    throw new Error(`Failed to generate embedding: ${error}`);
  }
}

/**
 * Embed Texts Batch
 *
 * Generates embeddings for multiple texts in a single API call.
 * More efficient than individual calls for batch operations.
 *
 * @param texts - Array of texts to embed
 * @returns Array of embedding vectors
 */
export async function embedTextsBatch(texts: string[]): Promise<number[][]> {
  console.log(`[Embedder] Generating ${texts.length} embeddings in batch`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable not set");
  }

  const openai = new OpenAI({ apiKey });

  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: texts,
      encoding_format: "float"
    });

    const embeddings = response.data.map(item => item.embedding);

    console.log(`[Embedder] Generated ${embeddings.length} embeddings`);

    return embeddings;
  } catch (error) {
    console.error(`[Embedder] Error generating batch embeddings:`, error);
    throw new Error(`Failed to generate batch embeddings: ${error}`);
  }
}
