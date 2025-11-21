/**
 * Chip Trace v4.0
 *
 * Every retrieved chip logs WHY it was selected.
 * This is the debugging/transparency layer that explains ranking decisions.
 *
 * Students never see this; developers always do.
 * Critical for understanding and improving retrieval quality.
 */

import { ChipMetadata, IntentType, EQMode } from "./ragTypes";
import { getScoreBreakdown } from "./chunkRanker";
import { getEQSignalMatchCount } from "./eqWeighting";
import { getJennyStyleMatchCount, getCoachPersonaAlignment } from "./coachFitScorer";

/**
 * Build Trace
 *
 * Creates a detailed trace array explaining why a chip was retrieved.
 *
 * Trace Format:
 * [
 *   "intent:academics",
 *   "semantic:academics",
 *   "eqSignals:passion,resilience",
 *   "score:1.42",
 *   "intentMatch:perfect",
 *   "eqMatches:2",
 *   "jennyStyleMarkers:4",
 *   "personaAlignment:0.75"
 * ]
 *
 * @param chip - The chip metadata
 * @param intent - The detected query intent
 * @param eqMode - The requested EQ mode
 * @param score - The final ranking score
 * @param pineconeSimilarity - Optional Pinecone similarity score
 * @returns Array of trace strings
 */
export function buildTrace(
  chip: ChipMetadata,
  intent: IntentType,
  eqMode: EQMode,
  score: number,
  pineconeSimilarity?: number
): string[] {
  console.log(`[ChipTrace] Building trace for chip: ${chip.text.substring(0, 40)}...`);

  const trace: string[] = [];

  // 1. Basic metadata
  trace.push(`intent:${intent}`);
  trace.push(`semantic:${chip.semanticType}`);
  trace.push(`eqSignals:${chip.eqSignals.join(",") || "none"}`);
  trace.push(`score:${score.toFixed(2)}`);

  // 2. Intent matching
  const intentMatch =
    chip.semanticType === intent ? "perfect" : "partial";
  trace.push(`intentMatch:${intentMatch}`);

  // 3. EQ signal matches
  const eqMatches = getEQSignalMatchCount(chip, eqMode);
  trace.push(`eqMatches:${eqMatches}`);

  // 4. Jenny style markers
  const jennyMarkers = getJennyStyleMatchCount(chip);
  trace.push(`jennyStyleMarkers:${jennyMarkers}`);

  // 5. Persona alignment
  const personaAlignment = getCoachPersonaAlignment(chip);
  trace.push(`personaAlignment:${personaAlignment.toFixed(2)}`);

  // 6. Score breakdown
  const breakdown = getScoreBreakdown(chip, intent, eqMode, pineconeSimilarity);
  trace.push(`intentScore:${breakdown.intentScore.toFixed(2)}`);
  trace.push(`eqWeight:${breakdown.eqWeight.toFixed(2)}`);
  trace.push(`coachWeight:${breakdown.coachWeight.toFixed(2)}`);

  if (pineconeSimilarity !== undefined) {
    trace.push(`pineconeScore:${pineconeSimilarity.toFixed(3)}`);
    trace.push(`similarityBoost:${breakdown.similarityBoost.toFixed(2)}`);
  }

  // 7. Source metadata
  trace.push(`source:${chip.sourcePath}`);
  trace.push(`order:${chip.order}`);

  console.log(`[ChipTrace] Trace built with ${trace.length} entries`);
  return trace;
}

/**
 * Format Trace for Display
 *
 * Converts trace array into human-readable string.
 * Used for logging and debugging.
 *
 * @param trace - Array of trace strings
 * @returns Formatted trace string
 */
export function formatTraceForDisplay(trace: string[]): string {
  const formatted = trace
    .map(entry => {
      const [key, value] = entry.split(":");
      return `  ${key.padEnd(20)}: ${value}`;
    })
    .join("\n");

  return `Chip Trace:\n${formatted}`;
}

/**
 * Build Batch Trace Summary
 *
 * Creates a summary of trace data across multiple chips.
 * Useful for understanding overall retrieval patterns.
 *
 * @param traces - Array of trace arrays
 * @returns Summary object with aggregate statistics
 */
export function buildBatchTraceSummary(traces: string[][]): {
  totalChips: number;
  avgScore: number;
  intentDistribution: Record<string, number>;
  eqModeDistribution: Record<string, number>;
  avgJennyStyleMarkers: number;
  avgPersonaAlignment: number;
} {
  const totalChips = traces.length;

  // Extract scores
  const scores = traces
    .map(trace => {
      const scoreEntry = trace.find(e => e.startsWith("score:"));
      return scoreEntry ? parseFloat(scoreEntry.split(":")[1]) : 0;
    })
    .filter(s => s > 0);

  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;

  // Intent distribution
  const intentDistribution: Record<string, number> = {};
  traces.forEach(trace => {
    const semanticEntry = trace.find(e => e.startsWith("semantic:"));
    if (semanticEntry) {
      const semantic = semanticEntry.split(":")[1];
      intentDistribution[semantic] = (intentDistribution[semantic] || 0) + 1;
    }
  });

  // EQ mode distribution (based on EQ signals)
  const eqModeDistribution: Record<string, number> = {
    gentle: 0,
    direct: 0,
    motivational: 0
  };

  traces.forEach(trace => {
    const eqSignalsEntry = trace.find(e => e.startsWith("eqSignals:"));
    if (eqSignalsEntry) {
      const signals = eqSignalsEntry.split(":")[1].split(",");
      if (signals.some(s => ["supportive", "empathy", "validating"].includes(s))) {
        eqModeDistribution.gentle++;
      }
      if (signals.some(s => ["straight", "tactical", "challenger"].includes(s))) {
        eqModeDistribution.direct++;
      }
      if (signals.some(s => ["uplifting", "momentum", "passion"].includes(s))) {
        eqModeDistribution.motivational++;
      }
    }
  });

  // Average Jenny style markers
  const jennyMarkers = traces
    .map(trace => {
      const entry = trace.find(e => e.startsWith("jennyStyleMarkers:"));
      return entry ? parseInt(entry.split(":")[1]) : 0;
    })
    .filter(m => m > 0);

  const avgJennyStyleMarkers =
    jennyMarkers.reduce((sum, m) => sum + m, 0) / jennyMarkers.length;

  // Average persona alignment
  const personaAlignments = traces
    .map(trace => {
      const entry = trace.find(e => e.startsWith("personaAlignment:"));
      return entry ? parseFloat(entry.split(":")[1]) : 0;
    })
    .filter(a => a > 0);

  const avgPersonaAlignment =
    personaAlignments.reduce((sum, a) => sum + a, 0) / personaAlignments.length;

  console.log(`[ChipTrace] Batch summary generated for ${totalChips} chips`);
  console.log(`[ChipTrace] Average score: ${avgScore.toFixed(2)}`);
  console.log(`[ChipTrace] Average Jenny markers: ${avgJennyStyleMarkers.toFixed(1)}`);

  return {
    totalChips,
    avgScore,
    intentDistribution,
    eqModeDistribution,
    avgJennyStyleMarkers,
    avgPersonaAlignment
  };
}

/**
 * Log Trace
 *
 * Logs a chip trace to console in a readable format.
 * Used during development and debugging.
 *
 * @param trace - Array of trace strings
 * @param chipId - Optional chip ID for reference
 */
export function logTrace(trace: string[], chipId?: string): void {
  const header = chipId ? `Chip Trace [${chipId}]` : "Chip Trace";
  console.log(`\n${"=".repeat(60)}`);
  console.log(header);
  console.log("=".repeat(60));

  trace.forEach(entry => {
    const [key, value] = entry.split(":");
    console.log(`${key.padEnd(25)}: ${value}`);
  });

  console.log("=".repeat(60) + "\n");
}

/**
 * Compare Traces
 *
 * Compares two chip traces to understand ranking differences.
 * Useful for debugging why one chip ranked higher than another.
 *
 * @param trace1 - First chip trace
 * @param trace2 - Second chip trace
 * @returns Comparison object highlighting differences
 */
export function compareTraces(
  trace1: string[],
  trace2: string[]
): {
  scoreDiff: number;
  intentMatchDiff: string;
  eqMatchDiff: number;
  jennyMarkerDiff: number;
  personaAlignmentDiff: number;
} {
  const getTraceValue = (trace: string[], key: string): string => {
    const entry = trace.find(e => e.startsWith(key + ":"));
    return entry ? entry.split(":")[1] : "";
  };

  const score1 = parseFloat(getTraceValue(trace1, "score"));
  const score2 = parseFloat(getTraceValue(trace2, "score"));

  const eqMatches1 = parseInt(getTraceValue(trace1, "eqMatches"));
  const eqMatches2 = parseInt(getTraceValue(trace2, "eqMatches"));

  const jennyMarkers1 = parseInt(getTraceValue(trace1, "jennyStyleMarkers"));
  const jennyMarkers2 = parseInt(getTraceValue(trace2, "jennyStyleMarkers"));

  const persona1 = parseFloat(getTraceValue(trace1, "personaAlignment"));
  const persona2 = parseFloat(getTraceValue(trace2, "personaAlignment"));

  console.log(`[ChipTrace] Comparing traces:`);
  console.log(`  Score diff: ${(score1 - score2).toFixed(2)}`);
  console.log(`  EQ match diff: ${eqMatches1 - eqMatches2}`);
  console.log(`  Jenny marker diff: ${jennyMarkers1 - jennyMarkers2}`);

  return {
    scoreDiff: score1 - score2,
    intentMatchDiff: `${getTraceValue(trace1, "intentMatch")} vs ${getTraceValue(trace2, "intentMatch")}`,
    eqMatchDiff: eqMatches1 - eqMatches2,
    jennyMarkerDiff: jennyMarkers1 - jennyMarkers2,
    personaAlignmentDiff: persona1 - persona2
  };
}
