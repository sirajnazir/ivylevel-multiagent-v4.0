/**
 * RAG Types v4.0
 *
 * Type definitions for the Adaptive RAG Retrieval Engine.
 * These types power the intelligence layer between the Assessment Agent
 * and the Pinecone knowledge moat.
 */

/**
 * RAG Query
 *
 * Input for the adaptive retrieval system.
 * Contains student context, EQ mode, and query intent.
 */
export interface RAGQuery {
  query: string;
  studentArchetype: string;
  coachId: string;
  contextWindow?: string;
  eqMode?: "gentle" | "direct" | "motivational";
  limit?: number;
}

/**
 * Ranked Chunk
 *
 * Output from the adaptive retrieval system.
 * Contains the chunk data plus adaptive scoring and trace metadata.
 */
export interface RankedChunk {
  id: string;
  text: string;
  semanticType: string;
  eqSignals: string[];
  score: number;
  trace: string[];
}

/**
 * Intent Type
 *
 * The semantic category of the query.
 * Used to match against chunk semantic types.
 */
export type IntentType =
  | "academics"
  | "activities"
  | "awards"
  | "eq"
  | "narrative"
  | "framework"
  | "general";

/**
 * EQ Mode
 *
 * The emotional intelligence approach for retrieval.
 * Maps to different EQ signals and weighting strategies.
 */
export type EQMode = "gentle" | "direct" | "motivational";

/**
 * Chip Metadata
 *
 * Metadata stored in Pinecone for each chunk.
 * Used for adaptive ranking and filtering.
 */
export interface ChipMetadata {
  text: string;
  coachId: string;
  sourcePath: string;
  semanticType: string;
  eqSignals: string[];
  order: number;
  size: number;
}

/**
 * Pinecone Match
 *
 * Raw match result from Pinecone query.
 */
export interface PineconeMatch {
  id: string;
  score: number;
  metadata: ChipMetadata;
}
