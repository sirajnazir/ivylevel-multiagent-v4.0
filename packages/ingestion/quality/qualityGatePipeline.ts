import { QualityGateInput, QualityGateOutput, GateResult, QualityReport } from "./quality.types";
import { validateFormat } from "./formatValidator";
import { checkStructureLLM } from "./llmConsistencyCheck";
import { eqStyleMatchGate } from "./eqStyleGate";
import { semanticDensityGate } from "./semanticDensityGate";
import { cleanseChunk } from "./chunkCleanser";

/**
 * Quality Gate Pipeline v1.0
 *
 * Multi-step validation pipeline that ensures only high-quality,
 * Jenny-authentic content enters the RAG system.
 *
 * Pipeline stages:
 * 1. Format Validator → Check for corrupted extraction
 * 2. LLM Structural Consistency → Check for coherence
 * 3. EQ Style Match → Check if it sounds like Jenny
 * 4. Semantic Density → Check for actionable intel
 * 5. Chunk Cleanser → Normalize and clean
 *
 * Only if ALL gates pass → content goes to Pinecone.
 * Fail fast and loudly → prevents garbage propagation.
 */

/**
 * Run Quality Gate
 *
 * Main entry point for quality validation pipeline.
 */
export async function runQualityGate(
  input: QualityGateInput
): Promise<QualityGateOutput> {
  console.log("[QualityGate] Starting quality gate pipeline");
  console.log(`  - Source: ${input.sourcePath}`);
  console.log(`  - File type: ${input.metadata.fileType}`);
  console.log(`  - Text length: ${input.rawText.length}`);

  const startTime = Date.now();

  try {
    // Stage 1: Format Validation
    console.log("[QualityGate] Stage 1/4: Format validation");
    const formatResult = await validateFormat(input);

    // Stage 2: Structural Consistency
    console.log("[QualityGate] Stage 2/4: Structural consistency");
    const structureResult = await checkStructureLLM(input);

    // Stage 3: EQ Style Match
    console.log("[QualityGate] Stage 3/4: EQ style matching");
    const eqResult = await eqStyleMatchGate(input);

    // Stage 4: Semantic Density
    console.log("[QualityGate] Stage 4/4: Semantic density");
    const densityResult = await semanticDensityGate(input);

    // Aggregate results
    const allPassed =
      formatResult.passed &&
      structureResult.passed &&
      eqResult.passed &&
      densityResult.passed;

    const errors = [
      ...formatResult.errors,
      ...structureResult.errors,
      ...eqResult.errors,
      ...densityResult.errors
    ];

    const warnings = [
      ...formatResult.warnings,
      ...structureResult.warnings,
      ...eqResult.warnings,
      ...densityResult.warnings
    ];

    // Stage 5: Chunk Cleansing (only if passed)
    let cleanedText: string | undefined;
    if (allPassed) {
      console.log("[QualityGate] Stage 5/5: Chunk cleansing");
      cleanedText = cleanseChunk(input.rawText);
    }

    const duration = Date.now() - startTime;

    console.log("[QualityGate] Pipeline complete");
    console.log(`  - Passed: ${allPassed}`);
    console.log(`  - Duration: ${duration}ms`);
    console.log(`  - Errors: ${errors.length}`);
    console.log(`  - Warnings: ${warnings.length}`);

    if (!allPassed) {
      console.log("[QualityGate] FAILED - Blocking errors:");
      errors.forEach(error => console.log(`    - ${error}`));
    }

    return {
      passed: allPassed,
      cleanedText,
      errors,
      warnings,
      qualityScores: {
        format: formatResult.score,
        structure: structureResult.score,
        eqMatch: eqResult.score,
        density: densityResult.score
      },
      gateResults: {
        format: formatResult,
        structure: structureResult,
        eqMatch: eqResult,
        density: densityResult
      }
    };
  } catch (error) {
    console.error("[QualityGate] Pipeline error:", error);

    return {
      passed: false,
      errors: [`Pipeline error: ${error instanceof Error ? error.message : "Unknown error"}`],
      warnings: [],
      qualityScores: {
        format: 0,
        structure: 0,
        eqMatch: 0,
        density: 0
      }
    };
  }
}

/**
 * Run Quality Gate Batch
 *
 * Process multiple files through quality gate.
 */
export async function runQualityGateBatch(
  inputs: QualityGateInput[]
): Promise<QualityReport> {
  console.log(`[QualityGate] Processing batch of ${inputs.length} files`);

  const results: QualityGateOutput[] = [];

  for (const input of inputs) {
    const result = await runQualityGate(input);
    results.push(result);
  }

  // Generate report
  const filesPassed = results.filter(r => r.passed).length;
  const filesFailed = results.filter(r => !r.passed).length;

  const avgFormat = results.reduce((sum, r) => sum + r.qualityScores.format, 0) / results.length;
  const avgStructure = results.reduce((sum, r) => sum + r.qualityScores.structure, 0) / results.length;
  const avgEq = results.reduce((sum, r) => sum + r.qualityScores.eqMatch, 0) / results.length;
  const avgDensity = results.reduce((sum, r) => sum + r.qualityScores.density, 0) / results.length;

  const report: QualityReport = {
    timestamp: new Date().toISOString(),
    totalFiles: inputs.length,
    filesPassed,
    filesFailed,
    results: inputs.map((input, idx) => ({
      sourcePath: input.sourcePath,
      passed: results[idx].passed,
      errors: results[idx].errors,
      warnings: results[idx].warnings,
      scores: results[idx].qualityScores
    })),
    summary: {
      averageFormatScore: Math.round(avgFormat),
      averageStructureScore: Math.round(avgStructure),
      averageEqScore: Math.round(avgEq),
      averageDensityScore: Math.round(avgDensity)
    }
  };

  console.log("[QualityGate] Batch complete");
  console.log(`  - Total files: ${inputs.length}`);
  console.log(`  - Passed: ${filesPassed}`);
  console.log(`  - Failed: ${filesFailed}`);
  console.log(`  - Pass rate: ${Math.round((filesPassed / inputs.length) * 100)}%`);

  return report;
}

/**
 * Export Quality Report
 *
 * Formats quality report for human consumption.
 */
export function exportQualityReport(report: QualityReport): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("INGESTION QUALITY REPORT");
  lines.push("=".repeat(80));
  lines.push("");

  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push(`Total Files: ${report.totalFiles}`);
  lines.push(`Passed: ${report.filesPassed} (${Math.round((report.filesPassed / report.totalFiles) * 100)}%)`);
  lines.push(`Failed: ${report.filesFailed} (${Math.round((report.filesFailed / report.totalFiles) * 100)}%)`);
  lines.push("");

  lines.push("Average Scores:");
  lines.push(`  Format:     ${report.summary.averageFormatScore}/100`);
  lines.push(`  Structure:  ${report.summary.averageStructureScore}/100`);
  lines.push(`  EQ Match:   ${report.summary.averageEqScore}/100`);
  lines.push(`  Density:    ${report.summary.averageDensityScore}/100`);
  lines.push("");

  lines.push("-".repeat(80));
  lines.push("Individual Files:");
  lines.push("-".repeat(80));

  report.results.forEach((result, idx) => {
    lines.push("");
    lines.push(`[${idx + 1}] ${result.sourcePath}`);
    lines.push(`    Status: ${result.passed ? "✓ PASSED" : "✗ FAILED"}`);
    lines.push(`    Scores: Format=${result.scores.format}, Structure=${result.scores.structure}, EQ=${result.scores.eqMatch}, Density=${result.scores.density}`);

    if (result.errors.length > 0) {
      lines.push(`    Errors:`);
      result.errors.forEach(error => lines.push(`      - ${error}`));
    }

    if (result.warnings.length > 0) {
      lines.push(`    Warnings:`);
      result.warnings.forEach(warning => lines.push(`      - ${warning}`));
    }
  });

  lines.push("");
  lines.push("=".repeat(80));

  return lines.join("\n");
}
