/**
 * util/driftLogger.ts
 *
 * Logging and tracking of persona drift events
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DriftEvent, DriftLevel } from '../types';

/**
 * Default drift log path
 */
const DEFAULT_LOG_PATH = path.join(
  process.cwd(),
  'data/personas/jenny/weights/drift_log.jsonl'
);

/**
 * Save drift event to log (JSONL format)
 */
export function saveDriftEvent(event: DriftEvent, logPath?: string): void {
  const filePath = logPath || DEFAULT_LOG_PATH;

  // Ensure directory exists
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Append as JSONL (one JSON object per line)
  fs.appendFileSync(filePath, JSON.stringify(event) + '\n', 'utf8');
}

/**
 * Load drift events from log
 */
export function loadDriftEvents(
  logPath?: string,
  limit?: number
): DriftEvent[] {
  const filePath = logPath || DEFAULT_LOG_PATH;

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trim().split('\n').filter(l => l.trim());

  const events = lines.map(line => JSON.parse(line) as DriftEvent);

  if (limit) {
    return events.slice(-limit);
  }

  return events;
}

/**
 * Get drift statistics
 */
export function getDriftStats(logPath?: string): {
  total_events: number;
  by_level: Record<DriftLevel, number>;
  corrections_applied: number;
  avg_similarity: number;
  recent_trend: 'improving' | 'stable' | 'degrading';
} {
  const events = loadDriftEvents(logPath);

  const byLevel: Record<DriftLevel, number> = {
    green: 0,
    yellow: 0,
    orange: 0,
    red: 0,
  };

  let correctionsApplied = 0;
  let totalSimilarity = 0;

  for (const event of events) {
    byLevel[event.drift_level]++;
    if (event.correction_applied) {
      correctionsApplied++;
    }
    totalSimilarity += event.similarity;
  }

  const avgSimilarity = events.length > 0 ? totalSimilarity / events.length : 0;

  // Analyze trend from last 50 vs previous 50
  const recent = events.slice(-50);
  const previous = events.slice(-100, -50);

  let recentTrend: 'improving' | 'stable' | 'degrading' = 'stable';

  if (recent.length >= 10 && previous.length >= 10) {
    const recentAvg = recent.reduce((s, e) => s + e.similarity, 0) / recent.length;
    const previousAvg = previous.reduce((s, e) => s + e.similarity, 0) / previous.length;

    if (recentAvg > previousAvg + 0.02) {
      recentTrend = 'improving';
    } else if (recentAvg < previousAvg - 0.02) {
      recentTrend = 'degrading';
    }
  }

  return {
    total_events: events.length,
    by_level: byLevel,
    corrections_applied: correctionsApplied,
    avg_similarity: avgSimilarity,
    recent_trend: recentTrend,
  };
}

/**
 * Clear drift log (use with caution)
 */
export function clearDriftLog(logPath?: string): void {
  const filePath = logPath || DEFAULT_LOG_PATH;

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Export drift log as JSON array
 */
export function exportDriftLog(
  outputPath: string,
  logPath?: string
): void {
  const events = loadDriftEvents(logPath);

  fs.writeFileSync(outputPath, JSON.stringify(events, null, 2), 'utf8');
}

/**
 * Get drift events for specific time range
 */
export function getDriftEventsByTimeRange(
  startTime: string,
  endTime: string,
  logPath?: string
): DriftEvent[] {
  const events = loadDriftEvents(logPath);

  return events.filter(event => {
    const eventTime = event.timestamp;
    return eventTime >= startTime && eventTime <= endTime;
  });
}

/**
 * Get worst drift events
 */
export function getWorstDriftEvents(
  limit: number = 10,
  logPath?: string
): DriftEvent[] {
  const events = loadDriftEvents(logPath);

  return events
    .sort((a, b) => a.similarity - b.similarity) // Lowest similarity first
    .slice(0, limit);
}
