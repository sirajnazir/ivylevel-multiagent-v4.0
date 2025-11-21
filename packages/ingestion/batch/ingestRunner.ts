/**
 * Ingestion Runner v1.0
 *
 * Main orchestrator for batch ingestion pipeline.
 * Coordinates file scanning, LLM processing, quality gating, and reporting.
 */

import pLimit from "p-limit";
import { scanFiles, getFileStats } from "./fileScanner";
import { processFile } from "./llmProcessor";
import { startBatchUI, printSummaryBanner } from "./batchUI";
import { writeReport, writeTextReport } from "./batchReporter";
import { IngestionConfig, BatchResult } from "./batch.types";

/**
 * Run Ingestion
 *
 * Main entry point for batch ingestion pipeline.
 *
 * Pipeline stages:
 * 1. Scan files in directory
 * 2. Initialize UI
 * 3. Process files concurrently (with limit)
 * 4. Aggregate results
 * 5. Generate reports
 * 6. Display summary
 *
 * @param config - Ingestion configuration
 * @returns Batch results
 */
export async function runIngestion(config: IngestionConfig): Promise<BatchResult> {
  console.log("═".repeat(80));
  console.log("BATCH INGESTION PIPELINE");
  console.log("═".repeat(80));
  console.log("");
  console.log(`Coach ID:         ${config.coachId}`);
  console.log(`Root Directory:   ${config.rootDir}`);
  console.log(`File Types:       ${config.fileTypes.join(", ")}`);
  console.log(`Concurrent Limit: ${config.concurrentLimit}`);
  console.log(`Max Retries:      ${config.maxRetries}`);
  console.log("");

  // Stage 1: Scan files
  const tasks = scanFiles(config.rootDir, config.fileTypes);

  if (tasks.length === 0) {
    console.log("⚠ No files found to process");
    return {
      timestamp: new Date().toISOString(),
      coachId: config.coachId,
      processed: 0,
      succeeded: 0,
      failed: 0,
      warnings: 0,
      results: []
    };
  }

  // Print file statistics
  const stats = getFileStats(tasks);
  console.log(`Total Files:      ${stats.totalFiles}`);
  console.log(`Total Size:       ${formatBytes(stats.totalSize)}`);
  console.log(`By Type:`);
  Object.entries(stats.byType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
  console.log("");

  // Stage 2: Initialize UI
  const ui = startBatchUI(tasks.length);

  // Stage 3: Process files with concurrency limit
  const limit = pLimit(config.concurrentLimit);

  const results: BatchResult = {
    timestamp: new Date().toISOString(),
    coachId: config.coachId,
    processed: 0,
    succeeded: 0,
    failed: 0,
    warnings: 0,
    results: []
  };

  const processPromises = tasks.map(task =>
    limit(async () => {
      try {
        // Process file through LLM + quality gates
        const result = await processFile(task, config.coachId);

        // Update aggregated results
        results.processed++;

        if (result.status === "success") {
          results.succeeded++;
          results.warnings += result.warnings?.length || 0;
          ui.update(`✓ ${task.path.split("/").pop()}`);
        } else if (result.status === "failed") {
          results.failed++;
          ui.update(`✗ ${task.path.split("/").pop()}`);
        }

        results.results.push(result);
      } catch (error) {
        // Handle unexpected errors
        console.error(`Error processing ${task.path}:`, error);

        results.processed++;
        results.failed++;

        results.results.push({
          file: task.path,
          status: "failed",
          errors: [
            `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`
          ]
        });

        ui.update(`✗ ${task.path.split("/").pop()}`);
      }
    })
  );

  // Wait for all processing to complete
  await Promise.all(processPromises);

  // Stage 4: Complete UI
  if (results.failed === 0) {
    ui.succeed(`All ${results.succeeded} files processed successfully!`);
  } else {
    ui.succeed(
      `Completed: ${results.succeeded} succeeded, ${results.failed} failed`
    );
  }

  // Stage 5: Print summary
  printSummaryBanner(results.succeeded, results.failed, results.warnings);

  // Stage 6: Generate reports
  console.log("📄 Generating reports...\n");

  const jsonReportPath = writeReport(config.coachId, results);
  const textReportPath = writeTextReport(config.coachId, results);

  console.log(`✓ JSON report: ${jsonReportPath}`);
  console.log(`✓ Text report: ${textReportPath}`);
  console.log("");

  return results;
}

/**
 * Format Bytes
 *
 * Formats bytes into human-readable string.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}
