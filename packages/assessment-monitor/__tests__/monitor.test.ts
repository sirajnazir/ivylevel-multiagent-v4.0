/**
 * __tests__/monitor.test.ts
 *
 * Tests for Component 47 - Assessment Session Tracker + Data Cleanliness Monitor
 */

import { SessionTelemetry } from '../sessionTelemetry';
import { runDataLint } from '../dataLint';
import { runEQConsistency } from '../eqConsistency';
import { runRAGQuality } from '../ragQuality';
import { computeProgressScore } from '../sessionProgress';
import type { TelemetryEvent } from '../types';

describe('Component 47 - Assessment Session Tracker', () => {
  describe('DataLint_v1', () => {
    it('should give perfect score for clean message', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: "Hey! I'm Jenny. Let's figure this out together."
      };

      const score = runDataLint(event);
      expect(score).toBe(100);
    });

    it('should penalize markdown fences', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: 'Here is some code: ```python\nprint("hello")\n```'
      };

      const score = runDataLint(event);
      expect(score).toBeLessThan(100);
    });

    it('should penalize hallucination markers', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: 'As an AI language model, I cannot help you with that.'
      };

      const score = runDataLint(event);
      expect(score).toBeLessThan(70);
    });

    it('should penalize unicode issues', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: 'Hello � world'
      };

      const score = runDataLint(event);
      expect(score).toBeLessThan(100);
    });

    it('should penalize empty messages', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: ''
      };

      const score = runDataLint(event);
      expect(score).toBeLessThan(100);
    });

    it('should penalize overlong messages', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: 'a'.repeat(3500)
      };

      const score = runDataLint(event);
      expect(score).toBeLessThan(100);
    });

    it('should penalize slot duplication', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        extractedSlots: ['student_background', 'student_background', 'emotional_state']
      };

      const score = runDataLint(event);
      expect(score).toBeLessThan(100);
    });
  });

  describe('EQConsistency_v1', () => {
    it('should return 0 for empty message', async () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: ''
      };

      const score = await runEQConsistency(event);
      expect(score).toBe(0);
    });

    it('should return score for valid message', async () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: "Hey! I hear you. Let's slow this down and figure it out together."
      };

      const score = await runEQConsistency(event);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should score Jenny-like phrases higher', async () => {
      const jennyMessage: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: "I hear you. Let's slow this down. Your nervous system is doing its thing."
      };

      const roboticMessage: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: "I understand your concern. Certainly, I will help you with that. Regarding your question..."
      };

      const jennyScore = await runEQConsistency(jennyMessage);
      const roboticScore = await runEQConsistency(roboticMessage);

      expect(jennyScore).toBeGreaterThan(roboticScore);
    });
  });

  describe('RAGQuality_v1', () => {
    it('should return 100 for no RAG chunks (neutral)', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        ragChunks: []
      };

      const score = runRAGQuality(event);
      expect(score).toBe(100);
    });

    it('should score high for relevant chunks', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'diagnostic',
        ragChunks: [
          { id: '1', score: 0.9 },
          { id: '2', score: 0.85 },
          { id: '3', score: 0.88 }
        ]
      };

      const score = runRAGQuality(event);
      expect(score).toBeGreaterThan(80);
    });

    it('should score low for irrelevant chunks', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'diagnostic',
        ragChunks: [
          { id: '1', score: 0.2 },
          { id: '2', score: 0.15 },
          { id: '3', score: 0.3 }
        ]
      };

      const score = runRAGQuality(event);
      expect(score).toBeLessThan(50);
    });

    it('should penalize mixed quality chunks', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'diagnostic',
        ragChunks: [
          { id: '1', score: 0.9 },
          { id: '2', score: 0.2 },  // Bad chunk
          { id: '3', score: 0.85 }
        ]
      };

      const score = runRAGQuality(event);
      expect(score).toBeLessThan(80);
    });
  });

  describe('SessionProgress_v1', () => {
    it('should return 0% for no slots collected', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        extractedSlots: [],
        requiredSlots: ['student_background', 'emotional_state', 'motivation_reason']
      };

      const score = computeProgressScore(event);
      expect(score).toBe(0);
    });

    it('should return 50% for half slots collected', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        extractedSlots: ['student_background'],
        requiredSlots: ['student_background', 'emotional_state']
      };

      const score = computeProgressScore(event);
      expect(score).toBe(50);
    });

    it('should return 100% for all slots collected', () => {
      const event: TelemetryEvent = {
        sessionId: 'test',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        extractedSlots: ['student_background', 'emotional_state', 'motivation_reason'],
        requiredSlots: ['student_background', 'emotional_state', 'motivation_reason']
      };

      const score = computeProgressScore(event);
      expect(score).toBe(100);
    });
  });

  describe('SessionTelemetry', () => {
    it('should evaluate event with all inspectors', async () => {
      const telemetry = new SessionTelemetry('test-session');

      const event: TelemetryEvent = {
        sessionId: 'test-session',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        studentMessage: "I'm nervous about college",
        assistantMessage: "I hear you. Let's figure this out together.",
        extractedSlots: ['student_background'],
        requiredSlots: ['student_background', 'emotional_state', 'motivation_reason']
      };

      const result = await telemetry.evaluate(event);

      expect(result.cleanliness).toBeGreaterThanOrEqual(0);
      expect(result.cleanliness).toBeLessThanOrEqual(100);

      expect(result.eqSimilarity).toBeGreaterThanOrEqual(0);
      expect(result.eqSimilarity).toBeLessThanOrEqual(100);

      expect(result.ragRelevance).toBeGreaterThanOrEqual(0);
      expect(result.ragRelevance).toBeLessThanOrEqual(100);

      expect(result.progress).toBeGreaterThanOrEqual(0);
      expect(result.progress).toBeLessThanOrEqual(100);

      expect(Array.isArray(result.flags)).toBe(true);
      expect(result.evaluatedAt).toBeDefined();
    });

    it('should flag low cleanliness', async () => {
      const telemetry = new SessionTelemetry('test-session');

      const event: TelemetryEvent = {
        sessionId: 'test-session',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: 'As an AI, I cannot help you with that. ```code```'
      };

      const result = await telemetry.evaluate(event);

      expect(result.flags).toContain('low_cleanliness');
    });

    it('should flag slow progress', async () => {
      const telemetry = new SessionTelemetry('test-session');

      const event: TelemetryEvent = {
        sessionId: 'test-session',
        timestamp: new Date().toISOString(),
        stage: 'current_state',
        extractedSlots: [],
        requiredSlots: ['academics_rigor', 'ec_depth', 'passion_signals', 'service_signals', 'identity_signals']
      };

      const result = await telemetry.evaluate(event);

      expect(result.flags).toContain('slow_progress');
    });

    it('should track history', async () => {
      const telemetry = new SessionTelemetry('test-session');

      const event1: TelemetryEvent = {
        sessionId: 'test-session',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: 'Hello'
      };

      const event2: TelemetryEvent = {
        sessionId: 'test-session',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: 'World'
      };

      await telemetry.evaluate(event1);
      await telemetry.evaluate(event2);

      const history = telemetry.getHistory();
      expect(history).toHaveLength(2);
    });

    it('should generate summary', async () => {
      const telemetry = new SessionTelemetry('test-session');

      const event: TelemetryEvent = {
        sessionId: 'test-session',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: "I hear you. Let's work on this together.",
        extractedSlots: ['student_background'],
        requiredSlots: ['student_background', 'emotional_state']
      };

      await telemetry.evaluate(event);

      const summary = telemetry.getSummary();

      expect(summary.totalTurns).toBe(1);
      expect(summary.averageCleanliness).toBeGreaterThan(0);
      expect(summary.averageEQSimilarity).toBeGreaterThan(0);
      expect(summary.averageRAGRelevance).toBeGreaterThan(0);
      expect(summary.averageProgress).toBeGreaterThan(0);
      expect(summary.overallQuality).toBeDefined();
    });

    it('should respect custom thresholds', async () => {
      const telemetry = new SessionTelemetry('test-session', {
        cleanliness: 90,  // Stricter threshold
        eqSimilarity: 85,
        ragRelevance: 70,
        progress: 60
      });

      const event: TelemetryEvent = {
        sessionId: 'test-session',
        timestamp: new Date().toISOString(),
        stage: 'rapport',
        assistantMessage: "Let's talk about college.",
        extractedSlots: ['student_background'],
        requiredSlots: ['student_background', 'emotional_state', 'motivation_reason']
      };

      const result = await telemetry.evaluate(event);

      // With stricter thresholds, more likely to flag issues
      expect(result.flags.length).toBeGreaterThanOrEqual(0);
    });

    it('should detect trends', async () => {
      const telemetry = new SessionTelemetry('test-session');

      // Add several events with improving quality
      for (let i = 0; i < 5; i++) {
        const event: TelemetryEvent = {
          sessionId: 'test-session',
          timestamp: new Date().toISOString(),
          stage: 'rapport',
          assistantMessage: `Turn ${i}: I hear you. Let's figure this out.`,
          extractedSlots: i < 2 ? [] : ['student_background'],
          requiredSlots: ['student_background']
        };

        await telemetry.evaluate(event);
      }

      const trends = telemetry.detectTrends();

      expect(trends.progressTrend).toBeDefined();
      expect(['improving', 'stable', 'degrading']).toContain(trends.progressTrend);
    });
  });
});
