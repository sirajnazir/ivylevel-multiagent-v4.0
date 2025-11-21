import type { RagQueryContext, RagResultChunk } from "./types";
import { Pinecone } from "@pinecone-database/pinecone";
import OpenAI from "openai";

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
const BASE_NAMESPACES = [
  'KBv6_2025-10-06_v1.0',           // 924 session KB chips
  'KBv6_iMessage_2025-10-07_v1.0',  // 40 iMessage tactics
  'KBv6_Assessment_2025-10-07_v1.0' // 9 assessment patterns
];

// Optional EQ namespace (Phase 1.5 - controlled feature flag)
const EQ_NAMESPACE = process.env.PINECONE_EQ_NAMESPACE;

// Lazy initialization to allow dotenv to load first
let openai: OpenAI | null = null;
let pinecone: Pinecone | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY not found in environment');
    }
    openai = new OpenAI({ apiKey: key });
  }
  return openai;
}

function getPinecone(): Pinecone {
  if (!pinecone) {
    const key = process.env.PINECONE_API_KEY;
    if (!key) {
      throw new Error('PINECONE_API_KEY not found in environment');
    }
    pinecone = new Pinecone({ apiKey: key });
  }
  return pinecone;
}

export interface RagOptions {
  topKInitial?: number;
  topKReranked?: number;
  includeEQ?: boolean; // Phase 1.5: Include EQ namespace in retrieval
}

/**
 * Get namespaces to query based on options
 *
 * Returns base namespaces (session KB, iMessage, assessment)
 * plus optional EQ namespace if configured and requested.
 *
 * @param includeEQ - Whether to include EQ namespace
 * @returns Array of namespace strings to query
 */
function getNamespaces(includeEQ: boolean): string[] {
  if (includeEQ && EQ_NAMESPACE) {
    return [...BASE_NAMESPACES, EQ_NAMESPACE];
  }
  return BASE_NAMESPACES;
}

export async function retrieveAssessmentContext(
  query: string,
  ctx: RagQueryContext,
  options: RagOptions = {}
): Promise<RagResultChunk[]> {
  const topKInitial = options.topKInitial ?? 12;
  const topKReranked = options.topKReranked ?? 5;

  // Determine if EQ namespace should be included
  // Include EQ if explicitly requested OR if topic tags include 'eq'
  const includeEQ =
    options.includeEQ === true ||
    (ctx.topicTags?.includes('eq') ?? false);

  // 1) Embed query with OpenAI
  const embedding = await embedQuery(query);

  // 2) Query Pinecone across all namespaces (base + optional EQ)
  const namespaces = getNamespaces(includeEQ);
  const pineconeResults = await queryPinecone(embedding, ctx, topKInitial, namespaces);

  if (!pineconeResults.length) return [];

  // 3) Rerank with Cohere (if configured) or score-based sorting
  const reranked = await rerankWithCohere(query, pineconeResults, topKReranked);

  return reranked;
}

async function embedQuery(query: string): Promise<number[]> {
  try {
    const client = getOpenAI();
    const response = await client.embeddings.create({
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

async function queryPinecone(
  embedding: number[],
  ctx: RagQueryContext,
  topK: number,
  namespaces: string[]
): Promise<RagResultChunk[]> {
  try {
    const client = getPinecone();
    const index = client.index(PINECONE_INDEX);

    // Query all specified namespaces in parallel
    const results = await Promise.all(
      namespaces.map(ns =>
        index.namespace(ns).query({
          vector: embedding,
          topK: Math.ceil(topK / namespaces.length),
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
        text: extractContent(match.metadata),
        score: match.score || 0,
        metadata: match.metadata as Record<string, any>,
        source: match.metadata?.filename as string || 'unknown',
        coach: 'jenny',
        student: ctx.studentId,
        week: parseWeek(match.metadata?.week)
      }))
      .filter(chunk => chunk.text.length > 0);

    return chunks;
  } catch (error) {
    console.error('[RAG] Pinecone query error:', error);
    throw new Error(`Failed to query Pinecone: ${(error as Error).message}`);
  }
}

function buildMetadataFilter(ctx: RagQueryContext): Record<string, any> | undefined {
  const filters: any = {};

  if (ctx.topicTags && ctx.topicTags.length > 0) {
    filters.situation_tag = { $in: ctx.topicTags };
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

function parseWeek(weekValue: any): number | undefined {
  if (typeof weekValue === 'number') return weekValue;
  if (typeof weekValue === 'string') {
    const match = weekValue.match(/\d+/);
    return match ? parseInt(match[0]) : undefined;
  }
  return undefined;
}

function extractContent(metadata: any): string {
  if (!metadata) return '';

  if (metadata.content) return metadata.content as string;
  if (metadata.text) return metadata.text as string;
  if (metadata.context) return metadata.context as string;

  const parts: string[] = [];
  if (metadata.type) parts.push(`Type: ${metadata.type}`);
  if (metadata.phase) parts.push(`Phase: ${metadata.phase}`);
  if (metadata.chip_family) parts.push(`Family: ${metadata.chip_family}`);

  if (parts.length === 0 && metadata.filename) {
    parts.push(`Source: ${metadata.filename}`);
  }

  return parts.join(' | ');
}

async function rerankWithCohere(
  query: string,
  candidates: RagResultChunk[],
  topK: number
): Promise<RagResultChunk[]> {
  if (!COHERE_API_KEY) {
    return candidates
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  try {
    const CohereClient = require('cohere-ai').CohereClient;
    const cohere = new CohereClient({ token: COHERE_API_KEY });

    const response = await cohere.rerank({
      query,
      documents: candidates.map(c => c.text),
      topN: topK,
      model: 'rerank-english-v3.0'
    });

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
