/**
 * Batch Reporter v1.0
 *
 * Generates and saves ingestion reports.
 */

import fs from "fs";
import path from "path";
import { BatchResult } from "./batch.types";

/**
 * Write Report
 *
 * Writes batch ingestion report to disk.
 *
 * Reports are saved to:
 * /data/reports/{coachId}-ingest-report-{timestamp}.json
 *
 * @param coachId - Coach ID
 * @param results - Batch results
 * @returns Path to saved report
 */
export function writeReport(coachId: string, results: BatchResult): string {
  console.log("[BatchReporter] Generating ingestion report");

  // Create reports directory if it doesn't exist
  const reportsDir = path.join(process.cwd(), "data", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    console.log(`[BatchReporter] Created reports directory: ${reportsDir}`);
  }

  // Generate report filename with timestamp
  const timestamp = Date.now();
  const filename = `${coachId}-ingest-report-${timestamp}.json`;
  const reportPath = path.join(reportsDir, filename);

  // Write report to disk
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), "utf-8");

  console.log(`[BatchReporter] Report saved: ${reportPath}`);

  return reportPath;
}

/**
 * Format Report Summary
 *
 * Creates a human-readable summary of the batch ingestion.
 *
 * @param results - Batch results
 * @returns Formatted summary string
 */
export function formatReportSummary(results: BatchResult): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push("BATCH INGESTION REPORT");
  lines.push("=".repeat(80));
  lines.push("");

  lines.push(`Coach ID:       ${results.coachId}`);
  lines.push(`Timestamp:      ${results.timestamp}`);
  lines.push(`Total Files:    ${results.processed}`);
  lines.push(`Succeeded:      ${results.succeeded} (${Math.round((results.succeeded / results.processed) * 100)}%)`);
  lines.push(`Failed:         ${results.failed} (${Math.round((results.failed / results.processed) * 100)}%)`);
  lines.push(`Total Warnings: ${results.warnings}`);
  lines.push("");

  lines.push("-".repeat(80));
  lines.push("FILE RESULTS:");
  lines.push("-".repeat(80));

  results.results.forEach((result, idx) => {
    lines.push("");
    lines.push(`[${idx + 1}] ${result.file}`);
    lines.push(`    Status: ${result.status === "success" ? "✓ SUCCESS" : "✗ FAILED"}`);

    if (result.outputPath) {
      lines.push(`    Output: ${result.outputPath}`);
    }

    if (result.quality) {
      lines.push(`    Quality Scores:`);
      lines.push(`      - Format:    ${result.quality.scores?.format || "N/A"}`);
      lines.push(`      - Structure: ${result.quality.scores?.structure || "N/A"}`);
      lines.push(`      - EQ Match:  ${result.quality.scores?.eqMatch || "N/A"}`);
      lines.push(`      - Density:   ${result.quality.scores?.density || "N/A"}`);
    }

    if (result.errors && result.errors.length > 0) {
      lines.push(`    Errors:`);
      result.errors.forEach(error => lines.push(`      - ${error}`));
    }

    if (result.warnings && result.warnings.length > 0) {
      lines.push(`    Warnings:`);
      result.warnings.forEach(warning => lines.push(`      - ${warning}`));
    }
  });

  lines.push("");
  lines.push("=".repeat(80));

  return lines.join("\n");
}

/**
 * Write Text Report
 *
 * Writes a human-readable text report alongside the JSON report.
 *
 * @param coachId - Coach ID
 * @param results - Batch results
 * @returns Path to saved text report
 */
export function writeTextReport(coachId: string, results: BatchResult): string {
  const reportsDir = path.join(process.cwd(), "data", "reports");
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const timestamp = Date.now();
  const filename = `${coachId}-ingest-report-${timestamp}.txt`;
  const reportPath = path.join(reportsDir, filename);

  const summary = formatReportSummary(results);
  fs.writeFileSync(reportPath, summary, "utf-8");

  console.log(`[BatchReporter] Text report saved: ${reportPath}`);

  return reportPath;
}
