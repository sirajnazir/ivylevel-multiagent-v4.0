/**
 * types.ts
 *
 * Type definitions for Component 47 - Assessment Session Tracker + Data Cleanliness Monitor
 */

/**
 * Telemetry Event
 *
 * Emitted every time the agent:
 * - Receives a student message
 * - Generates an assistant message
 * - Collects a slot
 * - Advances a stage
 * - Builds output
 */
export interface TelemetryEvent {
  /** Unique session identifier */
  sessionId: string;

  /** Event timestamp */
  timestamp: string;

  /** Current FSM stage */
  stage: string;

  /** Student's message (if applicable) */
  studentMessage?: string;

  /** Assistant's message (if applicable) */
  assistantMessage?: string;

  /** Slots extracted/collected in this turn */
  extractedSlots?: string[];

  /** Required slots for current stage */
  requiredSlots?: string[];

  /** RAG chunks retrieved (if applicable) */
  ragChunks?: Array<{
    id: string;
    score: number;
    content?: string;
  }>;

  /** EQ chips used (if applicable) */
  eqChips?: string[];

  /** Archetype classification (if applicable) */
  archetype?: string;

  /** Turn number in session */
  turnNumber?: number;

  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Telemetry Result
 *
 * Output from telemetry evaluation.
 * Contains 4 quality scores (0-100) and flags for issues.
 */
export interface TelemetryResult {
  /** Data cleanliness score (0-100) */
  cleanliness: number;

  /** EQ similarity score (0-100) - how much assistant sounds like Jenny */
  eqSimilarity: number;

  /** RAG relevance score (0-100) - quality of retrieved chunks */
  ragRelevance: number;

  /** Session progress score (0-100) - completeness toward next stage */
  progress: number;

  /** Quality issue flags */
  flags: TelemetryFlag[];

  /** Detailed breakdown of scores */
  details?: {
    cleanliness?: CleanlinessDetails;
    eqSimilarity?: EQSimilarityDetails;
    ragRelevance?: RAGRelevanceDetails;
    progress?: ProgressDetails;
  };

  /** Timestamp of evaluation */
  evaluatedAt: string;
}

/**
 * Telemetry Flag
 *
 * Indicates specific quality issues detected.
 */
export type TelemetryFlag =
  | 'low_cleanliness'           // Cleanliness < 70
  | 'low_eq_similarity'         // EQ similarity < 75
  | 'low_rag_relevance'         // RAG relevance < 60
  | 'slow_progress'             // Progress < 50
  | 'malformed_json'            // JSON parsing issues
  | 'markdown_fences'           // Stray markdown code fences
  | 'hallucination_markers'     // "As an AI..." phrases
  | 'unicode_issues'            // Weird unicode characters
  | 'empty_message'             // Empty or too-short message
  | 'overlong_message'          // Message > 3000 chars
  | 'slot_duplication'          // Same slot collected multiple times
  | 'voice_drift'               // Assistant voice drifting from Jenny
  | 'irrelevant_rag'            // RAG chunks not relevant
  | 'stalled_conversation';     // No progress in multiple turns

/**
 * Cleanliness Details
 *
 * Breakdown of data cleanliness checks.
 */
export interface CleanlinessDetails {
  hasMarkdownFences: boolean;
  hasHallucinationMarkers: boolean;
  hasUnicodeIssues: boolean;
  isEmpty: boolean;
  isOverlong: boolean;
  messageLength: number;
  penaltyReasons: string[];
}

/**
 * EQ Similarity Details
 *
 * Breakdown of EQ consistency checks.
 */
export interface EQSimilarityDetails {
  cosineSimilarity: number;
  vectorMagnitude: number;
  jennyVectorMagnitude: number;
  comparisonMethod: 'embedding' | 'heuristic' | 'mock';
}

/**
 * RAG Relevance Details
 *
 * Breakdown of RAG quality checks.
 */
export interface RAGRelevanceDetails {
  chunkCount: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  irrelevantChunks: number;
}

/**
 * Progress Details
 *
 * Breakdown of session progress checks.
 */
export interface ProgressDetails {
  collectedSlots: number;
  requiredSlots: number;
  percentComplete: number;
  missingSlots: string[];
}

/**
 * Telemetry History
 *
 * Aggregated telemetry data for a session.
 */
export interface TelemetryHistory {
  sessionId: string;
  events: TelemetryEvent[];
  results: TelemetryResult[];
  summary: TelemetrySummary;
}

/**
 * Telemetry Summary
 *
 * Aggregated statistics for a session.
 */
export interface TelemetrySummary {
  totalTurns: number;
  averageCleanliness: number;
  averageEQSimilarity: number;
  averageRAGRelevance: number;
  averageProgress: number;
  totalFlags: number;
  flagBreakdown: Record<TelemetryFlag, number>;
  overallQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Telemetry Thresholds
 *
 * Configurable quality thresholds.
 */
export interface TelemetryThresholds {
  cleanliness: number;        // Default: 70
  eqSimilarity: number;        // Default: 75
  ragRelevance: number;        // Default: 60
  progress: number;            // Default: 50
}

/**
 * Default Telemetry Thresholds
 */
export const DEFAULT_THRESHOLDS: TelemetryThresholds = {
  cleanliness: 70,
  eqSimilarity: 75,
  ragRelevance: 60,
  progress: 50
};
