#!/usr/bin/env ts-node
/**
 * EQ Chips Embedding Script - Phase 1.5
 *
 * Embeds curated EQ chips from Jenny's coaching intelligence
 * into a dedicated Pinecone namespace.
 *
 * Usage:
 *   npx ts-node scripts/embed_eq_chips.ts
 *
 * Environment Variables:
 *   OPENAI_API_KEY - Required
 *   PINECONE_API_KEY - Required
 *   PINECONE_INDEX_NAME - Required
 *   PINECONE_EQ_NAMESPACE - Optional (default: EQ_v1_2025)
 */

import * as fs from 'fs';
import * as path from 'path';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const EQ_DIR = path.resolve(
  'data/v4_organized/coaches/jenny/curated/eq_chips'
);

const EQ_NAMESPACE = process.env.PINECONE_EQ_NAMESPACE || 'EQ_v1_2025';
const BATCH_SIZE = 50;

function loadEnvOrThrow(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v;
}

interface EQChipMetadata {
  doc_id: string;
  source?: any;
  conversation_summary?: any;
  speech_patterns?: any;
  coaching_intelligence?: any;
  scoring?: any;
  chip_family: string;
  coach: string;
  source_file: string;
  [key: string]: any;
}

function extractContentForEmbedding(chip: any): string {
  const parts: string[] = [];

  // Primary: conversation summary
  if (chip.conversation_summary?.one_liner) {
    parts.push(`Summary: ${chip.conversation_summary.one_liner}`);
  }

  // Topics and techniques
  if (chip.conversation_summary?.topics) {
    parts.push(`Topics: ${chip.conversation_summary.topics.join(', ')}`);
  }

  if (chip.conversation_summary?.techniques_used) {
    parts.push(`Techniques: ${chip.conversation_summary.techniques_used.join(', ')}`);
  }

  // Speech patterns
  if (chip.speech_patterns?.jenny_patterns) {
    parts.push(`Jenny Patterns: ${chip.speech_patterns.jenny_patterns.join(', ')}`);
  }

  if (chip.speech_patterns?.exemplars) {
    const quotes = chip.speech_patterns.exemplars
      .map((ex: any) => `${ex.cue}: "${ex.quote}"`)
      .join('; ');
    parts.push(`Examples: ${quotes}`);
  }

  // Coaching intelligence
  if (chip.coaching_intelligence) {
    const ci = chip.coaching_intelligence;

    if (ci.diagnostic?.baseline) {
      parts.push(`Baseline: ${JSON.stringify(ci.diagnostic.baseline)}`);
    }

    if (ci.strategic?.narrative) {
      parts.push(`Narrative: ${ci.strategic.narrative.join('; ')}`);
    }

    if (ci.tactical?.immediate_actions) {
      parts.push(`Actions: ${ci.tactical.immediate_actions.join('; ')}`);
    }

    if (ci.relationship?.trust_moves) {
      parts.push(`Trust: ${ci.relationship.trust_moves.join('; ')}`);
    }
  }

  // Chip suggestions
  if (chip.chip_suggestions) {
    const suggestions = chip.chip_suggestions
      .map((s: any) => `${s.chip_type}: ${s.title} - ${s.summary}`)
      .join('; ');
    parts.push(`Chips: ${suggestions}`);
  }

  // Fallback to raw JSON if nothing else
  if (parts.length === 0) {
    parts.push(JSON.stringify(chip).substring(0, 2000));
  }

  return parts.join('\n');
}

function buildMetadata(chip: any, fileName: string): EQChipMetadata {
  const metadata: EQChipMetadata = {
    doc_id: chip.doc_id || path.basename(fileName, '.json'),
    chip_family: 'eq',
    coach: 'jenny',
    source_file: fileName
  };

  // Include key fields from source
  if (chip.source) {
    metadata.source_type = chip.source.type;
    metadata.source_week = chip.source.week;
    metadata.source_phase = chip.source.phase;
    metadata.source_date = chip.source.date;
  }

  // Include speech pattern counts
  if (chip.speech_patterns?.counts) {
    Object.entries(chip.speech_patterns.counts).forEach(([key, value]) => {
      metadata[`sp_${key}`] = value;
    });
    metadata.sp_confidence = chip.speech_patterns.confidence;
  }

  // Include scoring
  if (chip.scoring) {
    metadata.score_empathy = chip.scoring.empathy;
    metadata.score_clarity = chip.scoring.clarity;
    metadata.score_actionability = chip.scoring.actionability;
    metadata.score_proofability = chip.scoring.proofability;
  }

  // Include coaching intelligence confidence
  if (chip.coaching_intelligence?.confidence) {
    metadata.ci_confidence = chip.coaching_intelligence.confidence;
  }

  // Include topics and techniques as arrays (Pinecone supports arrays)
  if (chip.conversation_summary?.topics) {
    metadata.topics = chip.conversation_summary.topics;
  }

  if (chip.conversation_summary?.techniques_used) {
    metadata.techniques = chip.conversation_summary.techniques_used;
  }

  if (chip.speech_patterns?.jenny_patterns) {
    metadata.jenny_patterns = chip.speech_patterns.jenny_patterns;
  }

  return metadata;
}

async function main() {
  console.log('🎯 EQ Chips Embedding - Phase 1.5');
  console.log('='.repeat(80));
  console.log(`Source: ${EQ_DIR}`);
  console.log(`Target Namespace: ${EQ_NAMESPACE}`);
  console.log('='.repeat(80));
  console.log('');

  // Step 1: Validate environment
  console.log('📋 Step 1: Validating environment...');
  const openaiKey = loadEnvOrThrow('OPENAI_API_KEY');
  const pineconeKey = loadEnvOrThrow('PINECONE_API_KEY');
  const indexName = loadEnvOrThrow('PINECONE_INDEX_NAME');

  console.log(`✅ OpenAI API Key: ${openaiKey.substring(0, 20)}...`);
  console.log(`✅ Pinecone Index: ${indexName}`);
  console.log(`✅ EQ Namespace: ${EQ_NAMESPACE}`);
  console.log('');

  // Step 2: Initialize clients
  console.log('🔌 Step 2: Initializing API clients...');
  const openai = new OpenAI({ apiKey: openaiKey });
  const pc = new Pinecone({ apiKey: pineconeKey });
  const index = pc.index(indexName);
  console.log('✅ Clients initialized');
  console.log('');

  // Step 3: Load EQ chip files
  console.log('📂 Step 3: Loading EQ chip files...');
  if (!fs.existsSync(EQ_DIR)) {
    throw new Error(`EQ chips directory not found: ${EQ_DIR}`);
  }

  const files = fs.readdirSync(EQ_DIR)
    .filter(f => f.endsWith('.json'))
    .sort();

  console.log(`✅ Found ${files.length} EQ chip files`);
  console.log('');

  // Step 4: Process and embed chips
  console.log('⚙️  Step 4: Processing and embedding chips...');
  console.log('-'.repeat(80));

  const upserts: Array<{
    id: string;
    values: number[];
    metadata: Record<string, any>;
  }> = [];

  let processed = 0;
  let failed = 0;

  for (const fileName of files) {
    try {
      const fullPath = path.join(EQ_DIR, fileName);
      const raw = fs.readFileSync(fullPath, 'utf-8');
      const chip = JSON.parse(raw);

      // Extract content for embedding
      const content = extractContentForEmbedding(chip);

      // Generate embedding
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-large',
        input: content,
        dimensions: 3072
      });

      const vector = embeddingResponse.data[0].embedding;

      // Build metadata
      const metadata = buildMetadata(chip, fileName);

      // Generate unique ID
      const chipId = chip.doc_id || `eq_chip_${path.basename(fileName, '.json')}`;

      upserts.push({
        id: chipId,
        values: vector,
        metadata: metadata as Record<string, any>
      });

      processed++;

      // Progress indicator
      if (processed % 10 === 0) {
        console.log(`   Processed ${processed}/${files.length} chips...`);
      }

      // Batch upsert every N chips
      if (upserts.length >= BATCH_SIZE) {
        console.log(`   Upserting batch of ${upserts.length} to ${EQ_NAMESPACE}...`);
        await index.namespace(EQ_NAMESPACE).upsert(upserts);
        upserts.length = 0;
      }

    } catch (error) {
      failed++;
      console.error(`   ❌ Failed to process ${fileName}: ${(error as Error).message}`);
    }
  }

  // Final batch upsert
  if (upserts.length > 0) {
    console.log(`   Upserting final batch of ${upserts.length} to ${EQ_NAMESPACE}...`);
    await index.namespace(EQ_NAMESPACE).upsert(upserts);
  }

  console.log('-'.repeat(80));
  console.log('');

  // Step 5: Verify namespace stats
  console.log('📊 Step 5: Verifying namespace stats...');

  try {
    const stats = await index.describeIndexStats();
    const namespaceData = stats.namespaces?.[EQ_NAMESPACE];

    if (namespaceData) {
      const vectorCount = (namespaceData as any).recordCount || 0;
      console.log(`✅ Namespace ${EQ_NAMESPACE}: ${vectorCount} vectors`);
    } else {
      console.log(`⚠️  Namespace ${EQ_NAMESPACE} not yet visible (may take a moment)`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not verify stats: ${(error as Error).message}`);
  }

  console.log('');

  // Step 6: Summary
  console.log('='.repeat(80));
  console.log('✅ EQ CHIPS EMBEDDING COMPLETE');
  console.log('='.repeat(80));
  console.log(`   Total Files: ${files.length}`);
  console.log(`   Processed: ${processed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Success Rate: ${((processed / files.length) * 100).toFixed(1)}%`);
  console.log(`   Namespace: ${EQ_NAMESPACE}`);
  console.log('');

  if (failed > 0) {
    console.log('⚠️  Some files failed to process. Check logs above for details.');
    console.log('');
  }
}

main().catch(error => {
  console.error('');
  console.error('='.repeat(80));
  console.error('❌ EQ CHIPS EMBEDDING FAILED');
  console.error('='.repeat(80));
  console.error(`Error: ${error.message}`);
  if (error.stack) {
    console.error('');
    console.error('Stack trace:');
    console.error(error.stack);
  }
  console.error('');
  process.exit(1);
});
