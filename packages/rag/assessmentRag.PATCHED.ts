import type { RagQueryContext, RagResultChunk } from "./types";
import OpenAI from 'openai';
import { Pinecone } from '@pinecone-database/pinecone';

/**
 * Hybrid RAG retrieval for assessment agent.
 *
 * Responsibilities:
 * - Embed query text with OpenAI text-embedding-3-large
 * - Query Pinecone across 3 KB namespaces (924 + 40 + 9 chips)
 * - Rerank with Cohere (optional) or score-based sorting
 * - Return top N chunks with metadata
 *
 * PATCHED VERSION - Connects to actual Pinecone embeddings (973 vectors)
 */

const PINECONE_INDEX = process.env.PINECONE_INDEX_NAME ?? "jenny-v3-3072-093025";
const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? "";
const COHERE_API_KEY = process.env.COHERE_API_KEY ?? "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";

// Use ACTUAL namespaces from October 2025 embeddings
const KB_NAMESPACES = [
  'KBv6_2025-10-06_v1.0',           // 924 session KB chips
  'KBv6_iMessage_2025-10-07_v1.0',  // 40 iMessage tactics
  'KBv6_Assessment_2025-10-07_v1.0' // 9 assessment patterns
];

if (!PINECONE_API_KEY || !OPENAI_API_KEY) {
  console.warn("RAG: Missing Pinecone or OpenAI API key in environment");
}

// Initialize clients
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });

export interface RagOptions {
  topKInitial?: number;
  topKReranked?: number;
}

export async function retrieveAssessmentContext(
  query: string,
  ctx: RagQueryContext,
  options: RagOptions = {}
): Promise<RagResultChunk[]> {
  const topKInitial = options.topKInitial ?? 12;
  const topKReranked = options.topKReranked ?? 5;

  // 1) Embed query with OpenAI
  const embedding = await embedQuery(query);

  // 2) Query Pinecone across all 3 KB namespaces
  const pineconeResults = await queryPinecone(embedding, ctx, topKInitial);

  if (!pineconeResults.length) return [];

  // 3) Rerank with Cohere (if configured) or score-based sorting
  const reranked = await rerankWithCohere(query, pineconeResults, topKReranked);

  return reranked;
}

/**
 * Embed query text using OpenAI text-embedding-3-large
 * Returns 3072-dimensional vector
 */
async function embedQuery(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-large',
      input: query,
      dimensions: 3072
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('[RAG] OpenAI embedding error:', error);
    throw new Error(`Failed to embed query: ${(error as Error).message}`);
  }
}

/**
 * Query Pinecone across all 3 KB namespaces in parallel
 * Returns combined results with metadata
 */
async function queryPinecone(
  embedding: number[],
  ctx: RagQueryContext,
  topK: number
): Promise<RagResultChunk[]> {
  try {
    const index = pinecone.index(PINECONE_INDEX);

    // Query all 3 KB namespaces in parallel
    const results = await Promise.all(
      KB_NAMESPACES.map(ns =>
        index.namespace(ns).query({
          vector: embedding,
          topK: Math.ceil(topK / KB_NAMESPACES.length),
          includeMetadata: true,
          includeValues: false,
          filter: buildMetadataFilter(ctx)
        })
      )
    );

    // Flatten and convert to RagResultChunk format
    const chunks: RagResultChunk[] = results
      .flatMap(r => r.matches || [])
      .map(match => ({
        id: match.id,
        content: extractContent(match.metadata),
        score: match.score || 0,
        metadata: match.metadata as Record<string, any>,
        source: match.metadata?.filename as string || 'unknown'
      }))
      .filter(chunk => chunk.content.length > 0); // Filter out empty content

    return chunks;
  } catch (error) {
    console.error('[RAG] Pinecone query error:', error);
    throw new Error(`Failed to query Pinecone: ${(error as Error).message}`);
  }
}

/**
 * Build Pinecone metadata filter from RAG context
 * Filters by topic tags if provided
 */
function buildMetadataFilter(ctx: RagQueryContext): Record<string, any> | undefined {
  const filters: any = {};

  // Filter by topic tags if provided (e.g., 'assessment', 'crisis')
  if (ctx.topicTags && ctx.topicTags.length > 0) {
    // Match if any tag is in chip metadata
    // Note: Not all chips have 'tags' field, so this is best-effort filtering
    filters.situation_tag = { $in: ctx.topicTags };
  }

  // Return undefined if no filters (query all chips)
  return Object.keys(filters).length > 0 ? filters : undefined;
}

/**
 * Extract text content from chip metadata
 * Different chip types store content in different fields
 */
function extractContent(metadata: any): string {
  if (!metadata) return '';

  // KB chips store content in different fields depending on type
  if (metadata.content) return metadata.content as string;
  if (metadata.text) return metadata.text as string;
  if (metadata.context) return metadata.context as string;

  // Fallback: concatenate key fields to create searchable text
  const parts: string[] = [];

  if (metadata.type) parts.push(`Type: ${metadata.type}`);
  if (metadata.phase) parts.push(`Phase: ${metadata.phase}`);
  if (metadata.chip_family) parts.push(`Family: ${metadata.chip_family}`);

  // For chips without explicit content, at least return metadata description
  if (parts.length === 0 && metadata.filename) {
    parts.push(`Source: ${metadata.filename}`);
  }

  return parts.join(' | ');
}

/**
 * Rerank results using Cohere (if API key available)
 * Falls back to score-based sorting if Cohere unavailable
 */
async function rerankWithCohere(
  query: string,
  candidates: RagResultChunk[],
  topK: number
): Promise<RagResultChunk[]> {
  // If no Cohere key, just sort by score and take top K
  if (!COHERE_API_KEY) {
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  // Cohere reranking (optional enhancement)
  try {
    const CohereClient = require('cohere-ai').CohereClient;
    const cohere = new CohereClient({ token: COHERE_API_KEY });

    const response = await cohere.rerank({
      query,
      documents: candidates.map(c => c.content),
      topN: topK,
      model: 'rerank-english-v3.0'
    });

    // Map reranked results back to original chunks
    return response.results.map((result: any) => ({
      ...candidates[result.index],
      score: result.relevanceScore
    }));
  } catch (error) {
    console.warn('[RAG] Cohere reranking failed, falling back to score sort:', error);
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
