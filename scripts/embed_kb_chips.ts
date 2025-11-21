#!/usr/bin/env ts-node
/**
 * KB Chips Embedding Pipeline
 *
 * Embeds all KB intelligence chips and uploads to Pinecone
 * Supports: session chips, imsg chips, exec chips, assess/gameplan chips
 */

import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

// Configuration
const PINECONE_API_KEY = process.env.PINECONE_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const PINECONE_INDEX_NAME = 'jenny-v3-3072-093025';
const NAMESPACE = 'KB_v6_2025';
const EMBEDDING_MODEL = 'text-embedding-3-large';
const BATCH_SIZE = 100;

const KB_CHIPS_ROOT = path.join(
  process.cwd(),
  'data',
  'v4_organized',
  'coaches',
  'jenny',
  'curated',
  'kb_chips'
);

// Initialize clients
const pinecone = new Pinecone({ apiKey: PINECONE_API_KEY });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

interface KBChip {
  chip_id: string;
  chip_type: string;
  chip_family?: string;
  session_id?: string;
  week?: number;
  phase?: string;
  date?: string;
  context?: string;
  fact?: string;
  jenny_tactic?: string;
  outcome?: string;
  tags?: string[];
  text?: string;
  [key: string]: any;
}

/**
 * Embed text using OpenAI
 */
async function embedText(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Build embedding text from chip fields
 */
function buildEmbeddingText(chip: KBChip): string {
  const parts: string[] = [];

  if (chip.context) parts.push(chip.context);
  if (chip.fact) parts.push(chip.fact);
  if (chip.jenny_tactic) parts.push(chip.jenny_tactic);
  if (chip.outcome) parts.push(chip.outcome);
  if (chip.tags && chip.tags.length > 0) parts.push(chip.tags.join(' '));
  if (chip.text) parts.push(chip.text);

  return parts.join('\n');
}

/**
 * Process a single JSONL file
 */
async function processJsonlFile(filePath: string): Promise<number> {
  console.log(`  Processing: ${path.basename(filePath)}`);

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const vectors: any[] = [];
  let lineNum = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;

    try {
      const chip: KBChip = JSON.parse(line);
      const embeddingText = buildEmbeddingText(chip);

      if (!embeddingText) {
        console.warn(`    ⚠️  Skipping chip with no content at line ${lineNum}`);
        continue;
      }

      const vector = await embedText(embeddingText);

      // Generate deterministic ID
      const chipId = chip.chip_id || `${path.basename(filePath, '.jsonl')}_${lineNum}`;

      vectors.push({
        id: chipId,
        values: vector,
        metadata: {
          ...chip,
          embedding_text: embeddingText.substring(0, 500), // Store first 500 chars
          source_file: path.basename(filePath)
        }
      });

      lineNum++;

      // Upload in batches
      if (vectors.length >= BATCH_SIZE) {
        await uploadBatch(vectors);
        vectors.length = 0; // Clear array
      }

    } catch (error) {
      console.error(`    ❌ Error processing line ${lineNum}: ${error}`);
    }
  }

  // Upload remaining vectors
  if (vectors.length > 0) {
    await uploadBatch(vectors);
  }

  return lineNum;
}

/**
 * Process a single JSON file (not JSONL)
 */
async function processJsonFile(filePath: string): Promise<number> {
  console.log(`  Processing: ${path.basename(filePath)}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const chips: KBChip[] = JSON.parse(content);

  if (!Array.isArray(chips)) {
    console.warn(`    ⚠️  Skipping non-array JSON file`);
    return 0;
  }

  const vectors: any[] = [];

  for (let i = 0; i < chips.length; i++) {
    const chip = chips[i];
    const embeddingText = buildEmbeddingText(chip);

    if (!embeddingText) continue;

    const vector = await embedText(embeddingText);
    const chipId = chip.chip_id || `${path.basename(filePath, '.json')}_${i}`;

    vectors.push({
      id: chipId,
      values: vector,
      metadata: {
        ...chip,
        embedding_text: embeddingText.substring(0, 500),
        source_file: path.basename(filePath)
      }
    });

    if (vectors.length >= BATCH_SIZE) {
      await uploadBatch(vectors);
      vectors.length = 0;
    }
  }

  if (vectors.length > 0) {
    await uploadBatch(vectors);
  }

  return chips.length;
}

/**
 * Upload batch to Pinecone
 */
async function uploadBatch(vectors: any[]): Promise<void> {
  const index = pinecone.index(PINECONE_INDEX_NAME);
  await index.namespace(NAMESPACE).upsert(vectors);
  console.log(`    ✅ Uploaded ${vectors.length} vectors`);
}

/**
 * Process all files in a directory
 */
async function processDirectory(dirPath: string): Promise<number> {
  if (!fs.existsSync(dirPath)) {
    console.log(`  ⚠️  Directory not found: ${dirPath}`);
    return 0;
  }

  const files = fs.readdirSync(dirPath);
  let totalChips = 0;

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      totalChips += await processDirectory(filePath);
    } else if (file.endsWith('.jsonl')) {
      totalChips += await processJsonlFile(filePath);
    } else if (file.endsWith('.json')) {
      totalChips += await processJsonFile(filePath);
    }
  }

  return totalChips;
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 KB Chips Embedding Pipeline');
  console.log('=' .repeat(80));
  console.log(`Root: ${KB_CHIPS_ROOT}`);
  console.log(`Namespace: ${NAMESPACE}`);
  console.log(`Model: ${EMBEDDING_MODEL}`);
  console.log('=' .repeat(80));
  console.log('');

  const startTime = Date.now();

  const totalChips = await processDirectory(KB_CHIPS_ROOT);

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log('=' .repeat(80));
  console.log('✅ EMBEDDING COMPLETE');
  console.log('=' .repeat(80));
  console.log(`Total chips processed: ${totalChips}`);
  console.log(`Duration: ${duration}s`);
  console.log(`Namespace: ${NAMESPACE}`);
  console.log('');
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as embedKBChips };
