/**
 * run_tuner.ts
 *
 * Main orchestrator for Component 42 - Persona Weight Tuner + Drift Correction
 * Monitors and corrects persona drift in real-time.
 */

import { loadCanonicalPersonaEmbedding, loadPersonaWeights } from './util/loadPersona';
import { computeCosineSimilarity } from './util/similarity';
import { rewriteToPersonaStyle } from './util/personaRewrite';
import { saveDriftEvent, getDriftStats } from './util/driftLogger';
import type {
  DriftLevel,
  DriftDetectionResult,
  DriftEvent,
  RewriteOptions,
  TunerConfig,
} from './types';

/**
 * Default tuner configuration
 */
const DEFAULT_CONFIG: TunerConfig = {
  weights_path: './data/personas/jenny/weights/persona_weights.json',
  canonical_embedding_path: './data/personas/jenny/embedding/persona_centroid.json',
  drift_log_path: './data/personas/jenny/weights/drift_log.jsonl',
  auto_correct_threshold: 'orange',
  verbose: false,
};

/**
 * Main persona tuner function
 *
 * @param outputText - LLM output text to check for drift
 * @param outputEmbedding - Optional pre-computed embedding of output
 * @param config - Tuner configuration
 * @returns Corrected text (or original if no correction needed)
 */
export async function runPersonaTuner(
  outputText: string,
  outputEmbedding?: number[],
  config: Partial<TunerConfig> = {}
): Promise<string> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    // Load persona centroid and weights
    const personaCentroid = await loadCanonicalPersonaEmbedding(cfg.canonical_embedding_path);
    const weights = loadPersonaWeights(cfg.weights_path);

    // Get or compute output embedding
    const outputEmb = outputEmbedding || await mockGetEmbedding(outputText);

    // Detect drift
    const driftResult = detectDrift(outputEmb, personaCentroid, weights.drift_thresholds);

    if (cfg.verbose) {
      console.log(`[PersonaTuner] Similarity: ${driftResult.similarity.toFixed(3)} | Level: ${driftResult.drift_level}`);
    }

    // Determine if correction is needed
    const needsCorrection = shouldApplyCorrection(
      driftResult.drift_level,
      cfg.auto_correct_threshold
    );

    let finalText = outputText;
    let correctionApplied = false;

    if (needsCorrection) {
      if (cfg.verbose) {
        console.log(`[PersonaTuner] Applying drift correction...`);
      }

      finalText = await rewriteToPersonaStyle(outputText, {
        target_similarity: weights.drift_thresholds.green,
      });

      correctionApplied = true;
    }

    // Log drift event
    const event: DriftEvent = {
      timestamp: new Date().toISOString(),
      original: outputText,
      rewritten: correctionApplied ? finalText : undefined,
      similarity: driftResult.similarity,
      drift_level: driftResult.drift_level,
      correction_applied: correctionApplied,
      metadata: {
        auto_correct_threshold: cfg.auto_correct_threshold,
      },
    };

    saveDriftEvent(event, cfg.drift_log_path);

    return finalText;
  } catch (error) {
    console.error('[PersonaTuner] Error:', error);
    // Return original text on error
    return outputText;
  }
}

/**
 * Detect drift level from similarity score
 */
export function detectDrift(
  outputEmbedding: number[],
  personaCentroid: number[],
  thresholds: any
): DriftDetectionResult {
  const similarity = computeCosineSimilarity(outputEmbedding, personaCentroid);

  let driftLevel: DriftLevel;
  let requiresCorrection: boolean;

  if (similarity >= thresholds.green) {
    driftLevel = 'green';
    requiresCorrection = false;
  } else if (similarity >= thresholds.yellow) {
    driftLevel = 'yellow';
    requiresCorrection = false;
  } else if (similarity >= thresholds.orange) {
    driftLevel = 'orange';
    requiresCorrection = true;
  } else {
    driftLevel = 'red';
    requiresCorrection = true;
  }

  return {
    similarity,
    drift_level: driftLevel,
    requires_correction: requiresCorrection,
    confidence: Math.abs(similarity),
  };
}

/**
 * Determine if correction should be applied
 */
function shouldApplyCorrection(
  driftLevel: DriftLevel,
  threshold: DriftLevel
): boolean {
  const severityOrder: DriftLevel[] = ['green', 'yellow', 'orange', 'red'];

  const driftIndex = severityOrder.indexOf(driftLevel);
  const thresholdIndex = severityOrder.indexOf(threshold);

  return driftIndex >= thresholdIndex;
}

/**
 * Mock embedding function (for testing without LLM API)
 */
async function mockGetEmbedding(text: string): Promise<number[]> {
  // In production:
  // const response = await openai.embeddings.create({
  //   model: 'text-embedding-3-large',
  //   input: text,
  // });
  // return response.data[0].embedding;

  // For testing: generate deterministic embedding from text hash
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash = hash & hash;
  }

  // Generate 1536-dimensional vector
  const embedding: number[] = [];
  let seed = Math.abs(hash);

  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i < 1536; i++) {
    embedding.push(random() * 2 - 1);
  }

  // Normalize
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  return embedding.map(v => v / norm);
}

/**
 * Batch process multiple outputs
 */
export async function batchProcessOutputs(
  outputs: string[],
  config: Partial<TunerConfig> = {}
): Promise<string[]> {
  const results: string[] = [];

  for (const output of outputs) {
    const corrected = await runPersonaTuner(output, undefined, config);
    results.push(corrected);
  }

  return results;
}

/**
 * Get current drift statistics
 */
export function getPersonaDriftStats(logPath?: string) {
  return getDriftStats(logPath);
}

/**
 * Check drift without applying correction
 */
export async function checkDriftOnly(
  outputText: string,
  outputEmbedding?: number[],
  config: Partial<TunerConfig> = {}
): Promise<DriftDetectionResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const personaCentroid = await loadCanonicalPersonaEmbedding(cfg.canonical_embedding_path);
  const weights = loadPersonaWeights(cfg.weights_path);
  const outputEmb = outputEmbedding || await mockGetEmbedding(outputText);

  return detectDrift(outputEmb, personaCentroid, weights.drift_thresholds);
}

/**
 * Main entry point for command-line usage
 */
if (require.main === module) {
  const testText = process.argv[2] || "You should try harder and don't worry about it.";

  runPersonaTuner(testText, undefined, { verbose: true })
    .then(result => {
      console.log('\n--- Original ---');
      console.log(testText);
      console.log('\n--- Corrected ---');
      console.log(result);
      console.log('\n--- Stats ---');
      console.log(getPersonaDriftStats());
    })
    .catch(console.error);
}

export { DEFAULT_CONFIG };
