/**
 * Telemetry Module
 *
 * Simple event logging for tracking system behavior and performance.
 * Logs are used to understand:
 * - Which tone patterns correlate with engagement
 * - Session completion rates
 * - Follow-through on commitments
 * - Response quality metrics
 *
 * Future: Can be extended to send to analytics services
 * (Segment, Mixpanel, custom data warehouse, etc.)
 */

export interface TelemetryEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

/**
 * In-memory event store (for development)
 * In production, replace with actual analytics service
 */
const events: TelemetryEvent[] = [];

/**
 * Log Event
 *
 * Records an event with properties for analytics.
 *
 * Common events:
 * - eq_response_generated
 * - student_type_classified
 * - eq_modulation_applied
 * - assessment_completed
 * - session_started
 * - message_sent
 */
export function logEvent(event: string, properties?: Record<string, any>): void {
  const props = properties || {};
  const telemetryEvent: TelemetryEvent = {
    event,
    properties: props,
    timestamp: new Date().toISOString()
  };

  events.push(telemetryEvent);

  // Console log in development
  if (process.env.NODE_ENV !== "production") {
    console.log(`[Telemetry] ${event}`, properties);
  }

  // In production, send to analytics service
  // Example:
  // analytics.track(event, properties);
}

/**
 * Get Events
 *
 * Retrieve logged events (for testing/debugging).
 */
export function getEvents(): TelemetryEvent[] {
  return [...events];
}

/**
 * Get Events by Type
 *
 * Filter events by event name.
 */
export function getEventsByType(eventType: string): TelemetryEvent[] {
  return events.filter((e) => e.event === eventType);
}

/**
 * Clear Events
 *
 * Reset event store (for testing).
 */
export function clearEvents(): void {
  events.length = 0;
}

/**
 * Get Event Count
 *
 * Count total events logged.
 */
export function getEventCount(): number {
  return events.length;
}

/**
 * Export Events
 *
 * Export all events as JSON (for analysis).
 */
export function exportEvents(): string {
  return JSON.stringify(events, null, 2);
}
