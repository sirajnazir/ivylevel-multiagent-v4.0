/**
 * Telemetry and Event Logging Module
 *
 * Phase 1: Console-based logging for local development
 * Phase 2: Integration with external services (Kafka, OTel, etc.)
 *
 * IMPORTANT: Respects PII constraints - no student data in logs by default
 */

export type EventName =
  | "assessment.session_started"
  | "assessment.message_sent"
  | "assessment.completed"
  | "assessment.pipeline_error"
  | "assessment.rag_retrieval"
  | "assessment.oracle_execution"
  | "assessment.profile_extraction";

export interface BaseEvent {
  name: EventName;
  timestamp: string;
  sessionId?: string;
  studentId?: string; // Hashed or anonymized for production
  metadata?: Record<string, any>;
}

/**
 * Log an event to the telemetry system
 * Phase 1: Logs to console
 * Phase 2: Send to external event bus/telemetry service
 */
export function logEvent(event: BaseEvent): void {
  // Phase 1: Console log only
  // Respect PII constraints: studentId should be hashed in production
  const safeEvent = {
    ...event,
    timestamp: event.timestamp || new Date().toISOString(),
  };

  console.log("[telemetry]", JSON.stringify(safeEvent));

  // TODO Phase 2: Send to external service
  // - Kafka topic
  // - OpenTelemetry collector
  // - Custom analytics endpoint
}

/**
 * Helper to create session start event
 */
export function logSessionStart(sessionId: string, studentId: string): void {
  logEvent({
    name: "assessment.session_started",
    timestamp: new Date().toISOString(),
    sessionId,
    studentId,
  });
}

/**
 * Helper to create message sent event
 */
export function logMessageSent(sessionId: string, role: string): void {
  logEvent({
    name: "assessment.message_sent",
    timestamp: new Date().toISOString(),
    sessionId,
    metadata: { role },
  });
}

/**
 * Helper to create completion event
 */
export function logSessionComplete(sessionId: string, durationMs?: number): void {
  logEvent({
    name: "assessment.completed",
    timestamp: new Date().toISOString(),
    sessionId,
    metadata: { durationMs },
  });
}

/**
 * Helper to create pipeline error event
 */
export function logPipelineError(
  sessionId: string,
  stage: string,
  error: string
): void {
  logEvent({
    name: "assessment.pipeline_error",
    timestamp: new Date().toISOString(),
    sessionId,
    metadata: { stage, error },
  });
}

/**
 * Helper to create RAG retrieval event
 */
export function logRagRetrieval(
  sessionId: string,
  chunksRetrieved: number,
  queryTags?: string[]
): void {
  logEvent({
    name: "assessment.rag_retrieval",
    timestamp: new Date().toISOString(),
    sessionId,
    metadata: { chunksRetrieved, queryTags },
  });
}
