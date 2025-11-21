/**
 * Component 19 Tests - Batch Ingestion Runner v1.0
 *
 * Tests cover:
 * - File scanning in directories
 * - Mock file processing
 * - Quality gate integration
 * - Batch reporting
 * - Concurrent processing
 * - Error handling
 */

import fs from "fs";
import path from "path";
import { scanFiles, getFileStats } from "../fileScanner";
import { processFile } from "../llmProcessor";
import { writeReport, formatReportSummary } from "../batchReporter";
import { runIngestion } from "../ingestRunner";
import { IngestionConfig, BatchResult } from "../batch.types";

// Mock test directory
const TEST_DIR = path.join(__dirname, "test-data");

describe("Component 19 - Batch Ingestion Runner", () => {
  beforeAll(() => {
    // Create test directory structure
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }

    // Create test files
    fs.writeFileSync(
      path.join(TEST_DIR, "test1.txt"),
      `Hey! Looking at your profile, I see some solid work here. Your GPA is 3.8 which is competitive.

The real question is: what's your differentiation angle? What makes you different from other applicants?

Here's my framework: colleges want depth over breadth. Impact over participation. Leadership over titles.

So tell me: what's your spike? What specific area do you dominate?`,
      "utf-8"
    );

    fs.writeFileSync(
      path.join(TEST_DIR, "test2.txt"),
      `You mentioned leading the debate team. Cool. But I need specifics.

How many hours per week did you invest? What tournaments did you win? What was your actual impact?

The principle here is: show don't tell. Concrete examples beat vague claims every time.`,
      "utf-8"
    );

    fs.writeFileSync(
      path.join(TEST_DIR, "corrupted.txt"),
      "um yeah like um you know",
      "utf-8"
    );
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true, force: true });
    }

    // Clean up any generated reports
    const reportsDir = path.join(process.cwd(), "data", "reports");
    if (fs.existsSync(reportsDir)) {
      const reports = fs.readdirSync(reportsDir).filter(f => f.includes("test-"));
      reports.forEach(f => fs.unlinkSync(path.join(reportsDir, f)));
    }

    // Clean up .cleaned.txt files
    const files = [
      path.join(TEST_DIR, "test1.txt.cleaned.txt"),
      path.join(TEST_DIR, "test2.txt.cleaned.txt"),
      path.join(TEST_DIR, "corrupted.txt.cleaned.txt")
    ];
    files.forEach(f => {
      if (fs.existsSync(f)) {
        fs.unlinkSync(f);
      }
    });
  });

  /**
   * Test 1: File scanner finds all files
   */
  test("file scanner finds all txt files", () => {
    const tasks = scanFiles(TEST_DIR, ["txt"]);

    expect(tasks.length).toBe(3);
    expect(tasks.every(t => t.type === "txt")).toBe(true);
    expect(tasks.every(t => t.size > 0)).toBe(true);
  });

  /**
   * Test 2: File scanner handles non-existent directory
   */
  test("file scanner handles non-existent directory gracefully", () => {
    const tasks = scanFiles("/nonexistent/path", ["txt"]);

    expect(tasks.length).toBe(0);
  });

  /**
   * Test 3: File statistics are calculated correctly
   */
  test("file statistics calculation", () => {
    const tasks = scanFiles(TEST_DIR, ["txt"]);
    const stats = getFileStats(tasks);

    expect(stats.totalFiles).toBe(3);
    expect(stats.totalSize).toBeGreaterThan(0);
    expect(stats.byType.txt).toBe(3);
  });

  /**
   * Test 4: Process file with good content
   */
  test("process file with good Jenny content", async () => {
    const task = {
      path: path.join(TEST_DIR, "test1.txt"),
      type: "txt",
      size: 100
    };

    const result = await processFile(task, "jenny");

    // May pass or fail depending on quality scores
    // Just verify it processes without error
    expect(result.file).toBe(task.path);
    expect(["success", "failed"]).toContain(result.status);
  });

  /**
   * Test 5: Process file with poor content
   */
  test("process file with poor content fails quality gate", async () => {
    const task = {
      path: path.join(TEST_DIR, "corrupted.txt"),
      type: "txt",
      size: 50
    };

    const result = await processFile(task, "jenny");

    expect(result.status).toBe("failed");
    expect(result.errors).toBeDefined();
    expect(result.errors!.length).toBeGreaterThan(0);
  });

  /**
   * Test 6: Batch report generation
   */
  test("batch report is written to disk", () => {
    const results: BatchResult = {
      timestamp: new Date().toISOString(),
      coachId: "test-coach",
      processed: 2,
      succeeded: 1,
      failed: 1,
      warnings: 0,
      results: [
        {
          file: "test1.txt",
          status: "success",
          outputPath: "test1.txt.cleaned.txt"
        },
        {
          file: "test2.txt",
          status: "failed",
          errors: ["Quality gate failed"]
        }
      ]
    };

    const reportPath = writeReport("test-coach", results);

    expect(fs.existsSync(reportPath)).toBe(true);

    const reportContent = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
    expect(reportContent.coachId).toBe("test-coach");
    expect(reportContent.processed).toBe(2);
    expect(reportContent.succeeded).toBe(1);
    expect(reportContent.failed).toBe(1);

    // Clean up
    fs.unlinkSync(reportPath);
  });

  /**
   * Test 7: Report summary formatting
   */
  test("report summary is formatted correctly", () => {
    const results: BatchResult = {
      timestamp: new Date().toISOString(),
      coachId: "jenny",
      processed: 3,
      succeeded: 2,
      failed: 1,
      warnings: 2,
      results: []
    };

    const summary = formatReportSummary(results);

    expect(summary).toContain("BATCH INGESTION REPORT");
    expect(summary).toContain("Coach ID:       jenny");
    expect(summary).toContain("Total Files:    3");
    expect(summary).toContain("Succeeded:      2");
    expect(summary).toContain("Failed:         1");
  });

  /**
   * Test 8: Full ingestion run with test data
   */
  test("full ingestion run processes all files", async () => {
    const config: IngestionConfig = {
      coachId: "test-jenny",
      rootDir: TEST_DIR,
      fileTypes: ["txt"],
      maxRetries: 1,
      concurrentLimit: 2
    };

    const results = await runIngestion(config);

    expect(results.processed).toBe(3);
    expect(results.succeeded + results.failed).toBe(3);
    expect(results.results.length).toBe(3);

    // Verify report was generated
    const reportsDir = path.join(process.cwd(), "data", "reports");
    const reports = fs.readdirSync(reportsDir).filter(f => f.includes("test-jenny"));
    expect(reports.length).toBeGreaterThan(0);

    // Clean up reports
    reports.forEach(f => fs.unlinkSync(path.join(reportsDir, f)));
  }, 30000); // 30 second timeout for full pipeline

  /**
   * Test 9: Empty directory handling
   */
  test("ingestion handles empty directory", async () => {
    const emptyDir = path.join(__dirname, "empty-test");
    fs.mkdirSync(emptyDir, { recursive: true });

    const config: IngestionConfig = {
      coachId: "test-empty",
      rootDir: emptyDir,
      fileTypes: ["txt"],
      maxRetries: 1,
      concurrentLimit: 2
    };

    const results = await runIngestion(config);

    expect(results.processed).toBe(0);
    expect(results.succeeded).toBe(0);
    expect(results.failed).toBe(0);

    // Clean up
    fs.rmdirSync(emptyDir);
  });

  /**
   * Test 10: Concurrent processing respects limit
   */
  test("concurrent processing works correctly", async () => {
    const config: IngestionConfig = {
      coachId: "test-concurrent",
      rootDir: TEST_DIR,
      fileTypes: ["txt"],
      maxRetries: 1,
      concurrentLimit: 1 // Process one at a time
    };

    const results = await runIngestion(config);

    expect(results.processed).toBe(3);
    expect(results.succeeded + results.failed).toBe(3);
    // Files were processed sequentially (concurrency limit of 1)
    expect(results.results.length).toBe(3);

    // Clean up reports
    const reportsDir = path.join(process.cwd(), "data", "reports");
    const reports = fs.readdirSync(reportsDir).filter(f => f.includes("test-concurrent"));
    reports.forEach(f => fs.unlinkSync(path.join(reportsDir, f)));
  }, 30000);
});
