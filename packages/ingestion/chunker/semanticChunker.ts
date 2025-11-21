/**
 * Semantic Chunker v1.0
 *
 * LLM-assisted semantic chunking for RAG indexing.
 * Splits cleaned text into coherent, semantically meaningful chunks.
 */

const { v4: uuidv4 } = require("uuid");
import { ChunkInput, Chunk, LLMChunkResponse } from "./chunk.types";
import { classifyFallback, extractEQSignalsFallback } from "./chunkClassifier";

/**
 * Semantic Chunk
 *
 * Main entry point for semantic chunking.
 *
 * FUTURE: Use LLM (Claude/GPT-5) for intelligent chunking:
 * - Prompt: "Split this into semantically coherent chunks..."
 * - Response: Array of {chunk, semantic_type, eq_signals}
 *
 * CURRENT: Uses simple sentence-based splitting with fallback classification
 *
 * @param input - Chunk input with cleaned text
 * @returns Array of semantically tagged chunks
 */
export async function semanticChunk(input: ChunkInput): Promise<Chunk[]> {
  console.log(`[SemanticChunker] Chunking text from: ${input.sourcePath}`);
  console.log(`[SemanticChunker] Text length: ${input.cleanedText.length}`);

  // FUTURE: Call LLM for intelligent chunking
  // const llmChunks = await callChunkLLM(input.cleanedText);

  // CURRENT: Use simple paragraph-based splitting
  const rawChunks = simpleChunkSplit(input.cleanedText);

  const chunks: Chunk[] = rawChunks.map((chunkText, idx) => {
    const semanticType = classifyFallback(chunkText);
    const eqSignals = extractEQSignalsFallback(chunkText);

    return {
      id: uuidv4(),
      coachId: input.coachId,
      sourcePath: input.sourcePath,
      order: idx,
      text: chunkText,
      semanticType,
      eqSignals,
      size: chunkText.length
    };
  });

  console.log(`[SemanticChunker] Created ${chunks.length} chunks`);
  console.log(`[SemanticChunker] Semantic types:`, [
    ...new Set(chunks.map(c => c.semanticType))
  ]);

  return chunks;
}

/**
 * Simple Chunk Split
 *
 * MVP chunking strategy using paragraphs and sentences.
 * Aims for ~500-1000 character chunks with semantic boundaries.
 *
 * Strategy:
 * 1. Split by double newlines (paragraphs)
 * 2. If paragraph too large, split by sentences
 * 3. Merge small chunks together
 *
 * @param text - Cleaned text to chunk
 * @returns Array of chunk texts
 */
function simpleChunkSplit(text: string): string[] {
  const chunks: string[] = [];

  // Split by paragraphs first
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  let currentChunk = "";

  for (const para of paragraphs) {
    // If paragraph is small enough, add to current chunk
    if (para.length < 800) {
      if (currentChunk.length + para.length < 1200) {
        currentChunk += (currentChunk ? "\n\n" : "") + para;
      } else {
        // Current chunk is full, save it and start new one
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }
        currentChunk = para;
      }
    } else {
      // Paragraph too large, need to split by sentences
      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      const sentences = para.split(/(?<=[.!?])\s+/);
      let sentenceChunk = "";

      for (const sentence of sentences) {
        if (sentenceChunk.length + sentence.length < 1000) {
          sentenceChunk += (sentenceChunk ? " " : "") + sentence;
        } else {
          if (sentenceChunk.length > 0) {
            chunks.push(sentenceChunk);
          }
          sentenceChunk = sentence;
        }
      }

      if (sentenceChunk.length > 0) {
        currentChunk = sentenceChunk;
      }
    }
  }

  // Don't forget the last chunk
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  // Filter out very small chunks (< 100 chars)
  const filteredChunks = chunks.filter(c => c.length >= 100);

  return filteredChunks;
}

/**
 * Call Chunk LLM (Stub)
 *
 * FUTURE: This will call Claude/GPT-5 for intelligent semantic chunking.
 *
 * Prompt:
 * ```
 * You are a semantic chunking AI for a college admissions coaching system.
 *
 * Split the following text into semantically coherent chunks.
 * Each chunk should:
 * - Be 300-1000 characters
 * - Represent a complete thought or topic
 * - Be useful for RAG retrieval
 *
 * For each chunk, provide:
 * - chunk: the text
 * - semantic_type: academics | activities | awards | eq | narrative | framework | general
 * - eq_signals: array of EQ keywords (e.g., ["passion", "resilience", "impact-driven"])
 *
 * Return JSON array.
 * ```
 */
async function callChunkLLM(text: string): Promise<LLMChunkResponse[]> {
  // Stub for future LLM implementation
  throw new Error("LLM chunking not yet implemented");
}
