/**
 * LLM Processor v1.0
 *
 * Processes files through LLM extraction and quality gates.
 */

import fs from "fs";
import { FileTask, PerFileResult } from "./batch.types";
import { QualityGateInput } from "../quality/quality.types";
import { runQualityGate } from "../quality/qualityGatePipeline";

/**
 * Process File
 *
 * Main entry point for processing a single file through the pipeline:
 * 1. Extract/read raw text (LLM extraction for complex formats, direct read for text)
 * 2. Run through quality gate pipeline
 * 3. Save cleaned output if passed
 * 4. Return result
 *
 * @param task - File task to process
 * @param coachId - Coach ID for EQ validation
 * @returns Processing result
 */
export async function processFile(
  task: FileTask,
  coachId: string
): Promise<PerFileResult> {
  console.log(`[LLMProcessor] Processing: ${task.path}`);

  try {
    // Step 1: Extract raw text
    // FUTURE: Use LLM extraction for PDF/VTT/DOCX
    // CURRENT: Direct file read for MVP
    const rawText = await extractRawText(task);

    // Step 2: Run quality gate
    const qualityInput: QualityGateInput = {
      rawText,
      sourcePath: task.path,
      metadata: {
        fileType: task.type as "pdf" | "vtt" | "txt" | "docx",
        coachId
      }
    };

    const quality = await runQualityGate(qualityInput);

    // Step 3: Handle quality gate failure
    if (!quality.passed) {
      console.log(`[LLMProcessor] Quality gate FAILED: ${task.path}`);
      return {
        status: "failed",
        file: task.path,
        errors: quality.errors,
        warnings: quality.warnings,
        quality: {
          scores: quality.qualityScores,
          passed: quality.passed
        }
      };
    }

    // Step 4: Save cleaned text
    const cleaned = quality.cleanedText!;
    const outPath = task.path + ".cleaned.txt";
    fs.writeFileSync(outPath, cleaned, "utf-8");

    console.log(`[LLMProcessor] Quality gate PASSED: ${task.path}`);
    console.log(`[LLMProcessor] Cleaned output saved: ${outPath}`);

    return {
      status: "success",
      file: task.path,
      warnings: quality.warnings,
      quality: {
        scores: quality.qualityScores,
        passed: quality.passed
      },
      outputPath: outPath
    };
  } catch (error) {
    console.error(`[LLMProcessor] Error processing ${task.path}:`, error);

    return {
      status: "failed",
      file: task.path,
      errors: [
        `Processing error: ${error instanceof Error ? error.message : "Unknown error"}`
      ]
    };
  }
}

/**
 * Extract Raw Text
 *
 * Extracts raw text from file based on type.
 *
 * FUTURE: Use LLM-based extraction for complex formats:
 * - PDF → LLM extraction with structure preservation
 * - VTT → LLM extraction with noise removal
 * - DOCX → LLM extraction with formatting cleanup
 *
 * CURRENT: Direct file read for MVP (works for .txt files)
 */
async function extractRawText(task: FileTask): Promise<string> {
  // For MVP, just read the file directly
  // This works for .txt files; future enhancement will add LLM extraction
  const content = fs.readFileSync(task.path, "utf-8");

  console.log(`[LLMProcessor] Extracted ${content.length} characters from ${task.path}`);

  return content;
}

/**
 * Call Extraction LLM (Stub)
 *
 * FUTURE: This will call Claude/GPT to extract structured content from:
 * - Corrupted PDFs
 * - Noisy VTT transcripts
 * - Complex DOCX files
 *
 * Prompt will be:
 * ```
 * Extract clean coaching content from this file.
 * Preserve structure, remove noise, fix OCR errors.
 * Return only the coaching dialogue and frameworks.
 * ```
 */
async function callExtractionLLM(task: FileTask): Promise<string> {
  // Stub for future LLM-based extraction
  throw new Error("LLM extraction not yet implemented");
}
