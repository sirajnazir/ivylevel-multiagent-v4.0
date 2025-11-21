/**
 * Ingestion Quality Gate Types v1.0
 *
 * Defines types for the multi-step quality validation pipeline
 * that sits between ingestion output and RAG indexing.
 *
 * Purpose: Guarantee only high-quality, Jenny-authentic intel enters Pinecone.
 */

/**
 * Quality Gate Input
 *
 * Raw ingested content to be validated.
 */
export interface QualityGateInput {
  /** Raw extracted text */
  rawText: string;

  /** Source file path (for debugging/logging) */
  sourcePath: string;

  /** Metadata about the source */
  metadata: {
    /** File type determines validation strategy */
    fileType: "pdf" | "vtt" | "txt" | "docx";

    /** Coach ID (for EQ signature matching) */
    coachId: string;

    /** Optional session ID */
    sessionId?: string;

    /** Optional additional context */
    context?: string;
  };
}

/**
 * Quality Gate Output
 *
 * Result of quality validation pipeline.
 */
export interface QualityGateOutput {
  /** Overall pass/fail */
  passed: boolean;

  /** Cleaned text (only if passed) */
  cleanedText?: string;

  /** Blocking errors (causes failure) */
  errors: string[];

  /** Non-blocking warnings */
  warnings: string[];

  /** Quality scores for each gate (0-100) */
  qualityScores: {
    /** Format validation score */
    format: number;

    /** Structural consistency score */
    structure: number;

    /** EQ style match score */
    eqMatch: number;

    /** Semantic density score */
    density: number;
  };

  /** Detailed gate results (for debugging) */
  gateResults?: {
    format: GateResult;
    structure: GateResult;
    eqMatch: GateResult;
    density: GateResult;
  };
}

/**
 * Gate Result
 *
 * Result from a single quality gate.
 */
export interface GateResult {
  /** Did this gate pass? */
  passed: boolean;

  /** Errors from this gate */
  errors: string[];

  /** Warnings from this gate */
  warnings: string[];

  /** Score (0-100) */
  score: number;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Quality Report
 *
 * Comprehensive report for an ingestion run.
 */
export interface QualityReport {
  /** Timestamp */
  timestamp: string;

  /** Total files processed */
  totalFiles: number;

  /** Files passed */
  filesPassed: number;

  /** Files failed */
  filesFailed: number;

  /** Individual file results */
  results: Array<{
    sourcePath: string;
    passed: boolean;
    errors: string[];
    warnings: string[];
    scores: QualityGateOutput["qualityScores"];
  }>;

  /** Summary statistics */
  summary: {
    averageFormatScore: number;
    averageStructureScore: number;
    averageEqScore: number;
    averageDensityScore: number;
  };
}
