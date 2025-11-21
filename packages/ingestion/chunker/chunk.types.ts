/**
 * Chunk Types v1.0
 *
 * Type definitions for semantic chunking and RAG indexing pipeline.
 */

/**
 * Chunk Input
 *
 * Input for chunking pipeline.
 */
export interface ChunkInput {
  coachId: string;
  sourcePath: string;
  cleanedText: string;
}

/**
 * Chunk
 *
 * A semantically coherent piece of content ready for embedding.
 */
export interface Chunk {
  id: string;
  coachId: string;
  sourcePath: string;
  order: number;
  text: string;
  semanticType: string;
  eqSignals: string[];
  size: number;
}

/**
 * Embedded Chunk
 *
 * A chunk with its vector embedding.
 */
export interface EmbeddedChunk extends Chunk {
  embedding: number[];
}

/**
 * Index Result
 *
 * Result from Pinecone indexing operation.
 */
export interface IndexResult {
  success: boolean;
  failed: number;
  total: number;
  indexedIds: string[];
}

/**
 * LLM Chunk Response
 *
 * Response from LLM-based semantic chunking.
 */
export interface LLMChunkResponse {
  chunk: string;
  semantic_type: string;
  eq_signals: string[];
}
