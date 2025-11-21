/**
 * run.ts
 *
 * Main orchestrator for Persona Canonicalization Pipeline (Component 41)
 * Transforms raw persona data through 4 stages:
 * A. Normalize → B. Extract → C. Canonicalize → D. Chunk
 */

import fs from 'fs';
import path from 'path';
import { normalizeRawText } from './stages/normalize';
import { extractPersonaConcepts } from './stages/extractConcepts';
import { canonicalizeConcepts, mergeDuplicateBlocks, sortBlocks, getBlockStats } from './stages/canonicalize';
import { chunkPersonaBlocks, getChunkStats } from './stages/chunk';
import { writeJSON, log } from './util';
import type { PipelineConfig } from './types';

/**
 * Default pipeline configuration
 */
const DEFAULT_CONFIG: PipelineConfig = {
  rawDir: path.join(process.cwd(), 'data/personas/jenny/raw'),
  canonicalDir: path.join(process.cwd(), 'data/personas/jenny/canonical'),
  chunkDir: path.join(process.cwd(), 'data/personas/jenny/chunks'),
  embedDir: path.join(process.cwd(), 'data/personas/jenny/embedding'),
  chunkSize: 200, // target tokens
  llmModel: 'gpt-4o-mini',
  verbose: true,
};

/**
 * Run complete canonicalization pipeline
 */
export async function runPipeline(config: Partial<PipelineConfig> = {}): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  log('🚀 Starting Persona Canonicalization Pipeline', 'info');
  log(`Raw directory: ${cfg.rawDir}`, 'info');

  // Ensure directories exist
  ensureDirectories(cfg);

  // Get list of raw files
  const rawFiles = fs.readdirSync(cfg.rawDir).filter(f => f.endsWith('.txt') || f.endsWith('.md'));

  if (rawFiles.length === 0) {
    log('No raw files found to process', 'warn');
    return;
  }

  log(`Found ${rawFiles.length} files to process`, 'info');

  // Process each file
  for (const file of rawFiles) {
    await processFile(file, cfg);
  }

  log('🎉 Persona Canonicalization Complete!', 'info');
}

/**
 * Process a single file through all stages
 */
async function processFile(filename: string, config: PipelineConfig): Promise<void> {
  log(`\n📄 Processing ${filename}`, 'info');

  try {
    // Read raw file
    const rawPath = path.join(config.rawDir, filename);
    const rawText = fs.readFileSync(rawPath, 'utf8');

    log(`  Read ${rawText.length} characters`, 'info');

    // Stage A: Normalize
    const normalizeResult = await normalizeRawText(rawText);
    if (!normalizeResult.success || !normalizeResult.data) {
      log(`  ❌ Stage A failed: ${normalizeResult.error}`, 'error');
      return;
    }

    log(`  ✓ Stage A: Normalized to ${normalizeResult.data.length} chars`, 'info');

    // Stage B: Extract concepts
    const extractResult = await extractPersonaConcepts(normalizeResult.data);
    if (!extractResult.success || !extractResult.data) {
      log(`  ❌ Stage B failed: ${extractResult.error}`, 'error');
      return;
    }

    const conceptCounts = Object.entries(extractResult.data)
      .map(([ch, concepts]) => `${ch}=${concepts.length}`)
      .join(', ');
    log(`  ✓ Stage B: Extracted concepts (${conceptCounts})`, 'info');

    // Stage C: Canonicalize
    const canonicalizeResult = await canonicalizeConcepts(extractResult.data);
    if (!canonicalizeResult.success || !canonicalizeResult.data) {
      log(`  ❌ Stage C failed: ${canonicalizeResult.error}`, 'error');
      return;
    }

    // Merge duplicates and sort
    let canonicalBlocks = mergeDuplicateBlocks(canonicalizeResult.data);
    canonicalBlocks = sortBlocks(canonicalBlocks);

    const blockStats = getBlockStats(canonicalBlocks);
    log(`  ✓ Stage C: Created ${blockStats.total} canonical blocks`, 'info');

    // Stage D: Chunk for embeddings
    const chunkResult = await chunkPersonaBlocks(canonicalBlocks, config.chunkSize);
    if (!chunkResult.success || !chunkResult.data) {
      log(`  ❌ Stage D failed: ${chunkResult.error}`, 'error');
      return;
    }

    const chunkStats = getChunkStats(chunkResult.data);
    log(`  ✓ Stage D: Created ${chunkStats.total} chunks (avg ${Math.round(chunkStats.avgTokens)} tokens)`, 'info');

    // Write outputs
    const baseName = filename.replace(/\.(txt|md)$/, '');

    writeJSON(config.canonicalDir, `${baseName}.canonical.json`, canonicalBlocks);
    log(`  💾 Saved canonical blocks`, 'info');

    writeJSON(config.chunkDir, `${baseName}.chunks.json`, chunkResult.data);
    log(`  💾 Saved chunks`, 'info');

    writeJSON(config.embedDir, `${baseName}.embedding.json`, chunkResult.data);
    log(`  💾 Saved embedding-ready data`, 'info');

    // Write stats
    const stats = {
      file: filename,
      processed_at: new Date().toISOString(),
      raw_chars: rawText.length,
      normalized_chars: normalizeResult.data.length,
      blocks: blockStats,
      chunks: chunkStats,
    };

    writeJSON(config.canonicalDir, `${baseName}.stats.json`, stats);
    log(`  ✅ Completed ${filename}`, 'info');

  } catch (error) {
    log(`  ❌ Failed to process ${filename}: ${error}`, 'error');
  }
}

/**
 * Ensure all output directories exist
 */
function ensureDirectories(config: PipelineConfig): void {
  for (const dir of [config.canonicalDir, config.chunkDir, config.embedDir]) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
}

/**
 * Main entry point
 */
if (require.main === module) {
  runPipeline().catch(error => {
    log(`Pipeline failed: ${error}`, 'error');
    process.exit(1);
  });
}

export { DEFAULT_CONFIG };
