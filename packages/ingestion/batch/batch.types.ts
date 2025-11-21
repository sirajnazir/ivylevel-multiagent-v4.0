/**
 * Batch Ingestion Types v1.0
 *
 * Type definitions for the batch ingestion pipeline.
 */

/**
 * Ingestion Configuration
 *
 * Defines how ingestion should run for a specific coach.
 */
export interface IngestionConfig {
  coachId: string;
  rootDir: string;
  fileTypes: ("pdf" | "vtt" | "txt" | "docx")[];
  maxRetries: number;
  concurrentLimit: number;
}

/**
 * File Task
 *
 * Represents a single file to be processed.
 */
export interface FileTask {
  path: string;
  type: string;
  size: number;
}

/**
 * Batch Result
 *
 * Aggregated results from batch ingestion run.
 */
export interface BatchResult {
  timestamp: string;
  coachId: string;
  processed: number;
  succeeded: number;
  failed: number;
  warnings: number;
  results: PerFileResult[];
}

/**
 * Per-File Result
 *
 * Result for a single file processed through the pipeline.
 */
export interface PerFileResult {
  file: string;
  status: "success" | "failed" | "skipped";
  errors?: string[];
  warnings?: string[];
  quality?: any;
  outputPath?: string;
}
