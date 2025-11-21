/**
 * __tests__/tuner.test.ts
 *
 * Tests for Component 42 - Persona Weight Tuner + Drift Correction
 */

import { runPersonaTuner, detectDrift, checkDriftOnly, getPersonaDriftStats } from '../run_tuner';

describe('Component 42 - Persona Weight Tuner', () => {
  describe('detectDrift', () => {
    it('should detect green drift for high similarity', () => {
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockCentroid = new Array(1536).fill(0.1);
      const thresholds = {
        green: 0.85,
        yellow: 0.65,
        orange: 0.45,
        red: 0.0,
      };

      const result = detectDrift(mockEmbedding, mockCentroid, thresholds);

      expect(result.drift_level).toBe('green');
      expect(result.requires_correction).toBe(false);
      expect(result.similarity).toBeGreaterThan(0.9);
    });

    it('should detect red drift for low similarity', () => {
      const mockEmbedding = new Array(1536).fill(0.1);
      const mockCentroid = new Array(1536).fill(-0.1);
      const thresholds = {
        green: 0.85,
        yellow: 0.65,
        orange: 0.45,
        red: 0.0,
      };

      const result = detectDrift(mockEmbedding, mockCentroid, thresholds);

      expect(result.drift_level).toBe('red');
      expect(result.requires_correction).toBe(true);
      expect(result.similarity).toBeLessThan(0.45);
    });
  });

  describe('runPersonaTuner', () => {
    it('should return corrected text for generic AI patterns', async () => {
      const genericText = "You should try harder and don't worry about it.";

      const result = await runPersonaTuner(genericText, undefined, {
        verbose: false,
        auto_correct_threshold: 'orange',
      });

      // Mock rewrite should apply substitutions
      expect(result).not.toBe(genericText);
      expect(result).toContain("what will help here is");
      expect(result).toContain("you're not behind");
    });

    it('should preserve on-brand text without changes', async () => {
      const onBrandText = "I'm noticing a pattern here. Your nervous system is doing its thing. Let's ground this with one clean move.";

      const result = await runPersonaTuner(onBrandText, undefined, {
        verbose: false,
        auto_correct_threshold: 'orange',
      });

      // Should be identical or very similar (green drift)
      expect(result.length).toBeGreaterThan(50);
    });

    it('should log drift events', async () => {
      const testText = "You must focus on your goals.";

      await runPersonaTuner(testText, undefined, {
        verbose: false,
        drift_log_path: './data/personas/jenny/weights/drift_log_test.jsonl',
      });

      const stats = getPersonaDriftStats('./data/personas/jenny/weights/drift_log_test.jsonl');

      expect(stats.total_events).toBeGreaterThan(0);
    });
  });

  describe('checkDriftOnly', () => {
    it('should check drift without applying correction', async () => {
      const testText = "You should try harder.";

      const result = await checkDriftOnly(testText);

      expect(result).toHaveProperty('similarity');
      expect(result).toHaveProperty('drift_level');
      expect(result).toHaveProperty('requires_correction');
      expect(['green', 'yellow', 'orange', 'red']).toContain(result.drift_level);
    });
  });

  describe('getPersonaDriftStats', () => {
    it('should return aggregated drift statistics', () => {
      const stats = getPersonaDriftStats();

      expect(stats).toHaveProperty('total_events');
      expect(stats).toHaveProperty('by_level');
      expect(stats).toHaveProperty('corrections_applied');
      expect(stats).toHaveProperty('avg_similarity');
      expect(stats).toHaveProperty('recent_trend');

      expect(stats.by_level).toHaveProperty('green');
      expect(stats.by_level).toHaveProperty('yellow');
      expect(stats.by_level).toHaveProperty('orange');
      expect(stats.by_level).toHaveProperty('red');

      expect(['improving', 'stable', 'degrading']).toContain(stats.recent_trend);
    });
  });
});
