import { SessionTranscript } from "../../../../agents/assessment-agent/runtime/transcript/transcript.types";

/**
 * Multi-Format Transcript Export Types v1.0
 *
 * Defines interfaces for exporting transcripts to PDF, DOCX, Markdown, JSONL.
 * Used across the entire export layer.
 */

/**
 * Transcript Export Parameters
 *
 * Configuration for export operations.
 */
export interface TranscriptExportParams {
  /** The transcript to export */
  transcript: SessionTranscript;

  /** Optional output file path. If not provided, uses default naming. */
  outputPath?: string;

  /**
   * Inline mode: Return buffer instead of writing to file.
   * Useful for API responses, UI downloads, streaming.
   */
  inline?: boolean;
}

/**
 * Export Result
 *
 * Result of an export operation.
 */
export interface ExportResult {
  /** Whether export succeeded */
  success: boolean;

  /** File path (if written to disk) */
  path?: string;

  /** Buffer (if inline mode) */
  buffer?: Buffer;

  /** Export format used */
  format: "pdf" | "docx" | "md" | "jsonl";

  /** Error message (if failed) */
  error?: string;
}

/**
 * Export Format
 *
 * Supported export formats.
 */
export type ExportFormat = "pdf" | "docx" | "md" | "jsonl";

/**
 * Exporter Function
 *
 * Standard signature for all exporter functions.
 */
export type ExporterFunction = (params: TranscriptExportParams) => Promise<ExportResult>;
