/**
 * jennyPhrasebankEngine.test.ts
 *
 * Test suite for the Jenny Phrasebank Engine.
 * Validates phrase selection, style markers, and integration with tone/coaching.
 */

import { JennyPhrasebankEngine, buildStyleHints, getFingerprint } from '../jennyPhrasebankEngine';
import { ToneDirective } from '../toneModulationEngine';
import { CoachingMove } from '../microCoachingEngine';
import { JENNY_PHRASEBANK, JENNY_FINGERPRINT } from '../jennyPhraseBank.data';

describe('JennyPhrasebankEngine', () => {
  let engine: JennyPhrasebankEngine;

  beforeEach(() => {
    engine = new JennyPhrasebankEngine();
  });

  describe('Phrase Selection by Coaching Move', () => {
    test('affirm move with high warmth selects validation + empathy', () => {
      const tone: ToneDirective = {
        warmth: 8,
        directness: 5,
        assertiveness: 5,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: ['warm-empathetic'],
        rationale: 'High warmth test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('affirming');
      expect(selected.styleMarkers).toContain('validating');
      expect(selected.styleMarkers).toContain('warm-empathetic');
    });

    test('affirm move with medium warmth selects validation + motivational', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 5,
        assertiveness: 5,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Medium warmth test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('affirming');
    });

    test('affirm move with low warmth selects concise validation', () => {
      const tone: ToneDirective = {
        warmth: 2,
        directness: 8,
        assertiveness: 7,
        pacing: 'fast',
        specificity: 9,
        styleMarkers: ['crisp-efficient'],
        rationale: 'Low warmth test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');

      expect(selected.body.length).toBeGreaterThanOrEqual(1);
      expect(selected.styleMarkers).toContain('affirming');
      expect(selected.styleMarkers).toContain('crisp-efficient');
    });

    test('reframe move always includes perspective shift', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 6,
        assertiveness: 5,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Reframe test',
      };

      const selected = engine.selectPhrases(tone, 'reframe');

      expect(selected.body.length).toBeGreaterThanOrEqual(1);
      expect(selected.styleMarkers).toContain('perspective-shifting');
      expect(selected.styleMarkers).toContain('reframing');
    });

    test('reframe move with high warmth includes grounding', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 5,
        assertiveness: 5,
        pacing: 'slow',
        specificity: 5,
        styleMarkers: [],
        rationale: 'Reframe with warmth',
      };

      const selected = engine.selectPhrases(tone, 'reframe');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('reframing');
    });

    test('reframe move with high directness includes clarity frame', () => {
      const tone: ToneDirective = {
        warmth: 4,
        directness: 8,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 8,
        styleMarkers: [],
        rationale: 'Reframe with directness',
      };

      const selected = engine.selectPhrases(tone, 'reframe');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('reframing');
    });

    test('challenge move always includes micro-challenge', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 6,
        assertiveness: 7,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Challenge test',
      };

      const selected = engine.selectPhrases(tone, 'challenge');

      expect(selected.body.length).toBeGreaterThanOrEqual(1);
      expect(selected.styleMarkers).toContain('challenging-gently');
      expect(selected.styleMarkers).toContain('accountability-oriented');
    });

    test('challenge move with high assertiveness uses strong intensity', () => {
      const tone: ToneDirective = {
        warmth: 4,
        directness: 7,
        assertiveness: 9,
        pacing: 'fast',
        specificity: 8,
        styleMarkers: ['confident-decisive'],
        rationale: 'Strong challenge',
      };

      const selected = engine.selectPhrases(tone, 'challenge');

      expect(selected.body.length).toBeGreaterThanOrEqual(1);
      expect(selected.styleMarkers).toContain('challenging-gently');
      expect(selected.styleMarkers).toContain('confident-decisive');
    });

    test('challenge move with high warmth adds validation cushion', () => {
      const tone: ToneDirective = {
        warmth: 8,
        directness: 5,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Challenge with warmth cushion',
      };

      const selected = engine.selectPhrases(tone, 'challenge');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('challenging-gently');
    });

    test('motivate move includes motivational burst', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 7,
        assertiveness: 7,
        pacing: 'fast',
        specificity: 7,
        styleMarkers: [],
        rationale: 'Motivate test',
      };

      const selected = engine.selectPhrases(tone, 'motivate');

      expect(selected.body.length).toBeGreaterThanOrEqual(1);
      expect(selected.styleMarkers).toContain('energizing');
      expect(selected.styleMarkers).toContain('momentum-building');
    });

    test('motivate move with high directness includes tactical pivot', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 9,
        assertiveness: 8,
        pacing: 'fast',
        specificity: 9,
        styleMarkers: ['direct-clear'],
        rationale: 'Motivate with tactical pivot',
      };

      const selected = engine.selectPhrases(tone, 'motivate');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('energizing');
      expect(selected.styleMarkers).toContain('direct-clear');
    });

    test('accountability move includes clarity frame + micro-challenge', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 7,
        assertiveness: 7,
        pacing: 'medium',
        specificity: 8,
        styleMarkers: [],
        rationale: 'Accountability test',
      };

      const selected = engine.selectPhrases(tone, 'accountability');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('clarity-focused');
      expect(selected.styleMarkers).toContain('action-oriented');
    });

    test('accountability move with high warmth adds grounding', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 6,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 7,
        styleMarkers: [],
        rationale: 'Accountability with grounding',
      };

      const selected = engine.selectPhrases(tone, 'accountability');

      expect(selected.body.length).toBeGreaterThanOrEqual(3);
      expect(selected.styleMarkers).toContain('action-oriented');
    });

    test('anchor move includes grounding + clarity frame', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 6,
        assertiveness: 6,
        pacing: 'slow',
        specificity: 7,
        styleMarkers: [],
        rationale: 'Anchor test',
      };

      const selected = engine.selectPhrases(tone, 'anchor');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('grounding');
      expect(selected.styleMarkers).toContain('concrete');
    });

    test('anchor move with high assertiveness uses strong grounding', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 7,
        assertiveness: 8,
        pacing: 'slow',
        specificity: 8,
        styleMarkers: [],
        rationale: 'Strong anchor',
      };

      const selected = engine.selectPhrases(tone, 'anchor');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('grounding');
    });

    test('mirror move includes reflective prompt', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 5,
        assertiveness: 4,
        pacing: 'slow',
        specificity: 5,
        styleMarkers: [],
        rationale: 'Mirror test',
      };

      const selected = engine.selectPhrases(tone, 'mirror');

      expect(selected.body.length).toBeGreaterThanOrEqual(1);
      expect(selected.styleMarkers).toContain('reflective');
      expect(selected.styleMarkers).toContain('metacognitive');
    });

    test('mirror move with high warmth includes empathy', () => {
      const tone: ToneDirective = {
        warmth: 8,
        directness: 4,
        assertiveness: 4,
        pacing: 'slow',
        specificity: 5,
        styleMarkers: [],
        rationale: 'Mirror with empathy',
      };

      const selected = engine.selectPhrases(tone, 'mirror');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('reflective');
    });

    test('breaker move includes strong grounding + tactical pivot', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 8,
        assertiveness: 8,
        pacing: 'fast',
        specificity: 8,
        styleMarkers: [],
        rationale: 'Breaker test',
      };

      const selected = engine.selectPhrases(tone, 'breaker');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('pattern-breaking');
      expect(selected.styleMarkers).toContain('strategic-redirect');
    });

    test('none move uses neutral fallback', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 5,
        assertiveness: 5,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Neutral test',
      };

      const selected = engine.selectPhrases(tone, 'none');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Pacing Marker Selection', () => {
    test('slow pacing selects slow pacing marker', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 5,
        assertiveness: 5,
        pacing: 'slow',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Slow pacing test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');

      expect(selected.pacingMarker).toBeDefined();
      // Verify it's one of the slow pacing markers
      const slowMarkers = JENNY_PHRASEBANK.pacingMarkers.slow.map(p => p.text);
      expect(slowMarkers).toContain(selected.pacingMarker);
    });

    test('medium pacing selects medium pacing marker', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 6,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Medium pacing test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');

      expect(selected.pacingMarker).toBeDefined();
      const mediumMarkers = JENNY_PHRASEBANK.pacingMarkers.medium.map(p => p.text);
      expect(mediumMarkers).toContain(selected.pacingMarker);
    });

    test('fast pacing selects fast pacing marker', () => {
      const tone: ToneDirective = {
        warmth: 4,
        directness: 8,
        assertiveness: 8,
        pacing: 'fast',
        specificity: 8,
        styleMarkers: [],
        rationale: 'Fast pacing test',
      };

      const selected = engine.selectPhrases(tone, 'motivate');

      expect(selected.pacingMarker).toBeDefined();
      const fastMarkers = JENNY_PHRASEBANK.pacingMarkers.fast.map(p => p.text);
      expect(fastMarkers).toContain(selected.pacingMarker);
    });
  });

  describe('Style Marker Generation', () => {
    test('high warmth adds warm-empathetic marker', () => {
      const tone: ToneDirective = {
        warmth: 9,
        directness: 5,
        assertiveness: 5,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'High warmth test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');

      expect(selected.styleMarkers).toContain('warm-empathetic');
    });

    test('low warmth adds crisp-efficient marker', () => {
      const tone: ToneDirective = {
        warmth: 2,
        directness: 8,
        assertiveness: 7,
        pacing: 'fast',
        specificity: 9,
        styleMarkers: [],
        rationale: 'Low warmth test',
      };

      const selected = engine.selectPhrases(tone, 'motivate');

      expect(selected.styleMarkers).toContain('crisp-efficient');
    });

    test('high directness adds direct-clear marker', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 9,
        assertiveness: 7,
        pacing: 'medium',
        specificity: 8,
        styleMarkers: [],
        rationale: 'High directness test',
      };

      const selected = engine.selectPhrases(tone, 'accountability');

      expect(selected.styleMarkers).toContain('direct-clear');
    });

    test('high assertiveness adds confident-decisive marker', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 7,
        assertiveness: 9,
        pacing: 'fast',
        specificity: 8,
        styleMarkers: [],
        rationale: 'High assertiveness test',
      };

      const selected = engine.selectPhrases(tone, 'challenge');

      expect(selected.styleMarkers).toContain('confident-decisive');
    });

    test('low assertiveness adds gentle-invitational marker', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 5,
        assertiveness: 2,
        pacing: 'slow',
        specificity: 5,
        styleMarkers: [],
        rationale: 'Low assertiveness test',
      };

      const selected = engine.selectPhrases(tone, 'mirror');

      expect(selected.styleMarkers).toContain('gentle-invitational');
    });

    test('high specificity adds concrete-actionable marker', () => {
      const tone: ToneDirective = {
        warmth: 5,
        directness: 7,
        assertiveness: 7,
        pacing: 'medium',
        specificity: 9,
        styleMarkers: [],
        rationale: 'High specificity test',
      };

      const selected = engine.selectPhrases(tone, 'accountability');

      expect(selected.styleMarkers).toContain('concrete-actionable');
    });
  });

  describe('Phrase Deduplication', () => {
    test('avoids repeating recently used phrases when possible', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 6,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Deduplication test',
      };

      // Select phrases multiple times
      const selections: string[] = [];
      for (let i = 0; i < 10; i++) {
        const selected = engine.selectPhrases(tone, 'affirm');
        selections.push(...selected.body);
      }

      // There should be variety in selections (not all identical)
      const uniquePhrases = new Set(selections);
      expect(uniquePhrases.size).toBeGreaterThan(1);
    });

    test('tracks recently used phrases up to maxRecentPhrases limit', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 6,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Tracking test',
      };

      // Select phrases many times to exceed limit
      for (let i = 0; i < 25; i++) {
        engine.selectPhrases(tone, 'affirm');
      }

      const state = engine.getState();
      // Should not exceed maxRecentPhrases (20)
      expect(state.recentlyUsedCount).toBeLessThanOrEqual(20);
    });
  });

  describe('Style Hints Generation', () => {
    test('buildStyleHints generates comprehensive style guide', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 7,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 7,
        styleMarkers: ['warm-empathetic', 'direct-clear'],
        rationale: 'Style hints test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');
      const hints = engine.buildStyleHints(selected);

      expect(hints).toContain('VOICE STYLE GUIDE');
      expect(hints).toContain('Jenny\'s coaching voice');
      expect(hints).toContain('warm but direct');
      expect(hints).toContain('Style markers:');
      expect(hints).toContain('affirming');
      expect(hints).toContain('validating');
      expect(hints).toContain('warm-empathetic');
      expect(hints).toContain('direct-clear');
    });

    test('buildStyleHints includes pacing marker when present', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 6,
        assertiveness: 6,
        pacing: 'slow',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Pacing marker test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');
      const hints = engine.buildStyleHints(selected);

      expect(hints).toContain('Pacing:');
      expect(selected.pacingMarker).toBeDefined();
    });

    test('buildStyleHints includes phrase atoms', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 7,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 7,
        styleMarkers: [],
        rationale: 'Phrase atoms test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');
      const hints = engine.buildStyleHints(selected);

      expect(hints).toContain('PHRASE ATOMS TO WEAVE IN');
      expect(hints).toContain('"');
      expect(hints).toContain('Use these phrases naturally');
    });

    test('helper function buildStyleHints works independently', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 6,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: ['test-marker'],
        rationale: 'Helper function test',
      };

      const selected = engine.selectPhrases(tone, 'affirm');
      const hints = buildStyleHints(selected);

      expect(hints).toContain('VOICE STYLE GUIDE');
      expect(hints).toContain('test-marker');
    });
  });

  describe('Linguistic Fingerprint', () => {
    test('getFingerprint returns Jenny fingerprint', () => {
      const fingerprint = engine.getFingerprint();

      expect(fingerprint.toneAnchors).toBeDefined();
      expect(fingerprint.signatureDevices).toBeDefined();
      expect(fingerprint.sentenceArchitecture).toBeDefined();
      expect(fingerprint.avoidances).toBeDefined();

      expect(fingerprint.toneAnchors.length).toBeGreaterThan(0);
      expect(fingerprint.signatureDevices.length).toBeGreaterThan(0);
    });

    test('helper function getFingerprint works independently', () => {
      const fingerprint = getFingerprint();

      expect(fingerprint).toEqual(JENNY_FINGERPRINT);
    });

    test('fingerprint includes expected tone anchors', () => {
      const fingerprint = engine.getFingerprint();

      expect(fingerprint.toneAnchors).toContain('warm but direct');
      expect(fingerprint.toneAnchors).toContain('curious without interrogation');
    });

    test('fingerprint includes expected avoidances', () => {
      const fingerprint = engine.getFingerprint();

      expect(fingerprint.avoidances).toContain('Corporate jargon');
      expect(fingerprint.avoidances).toContain('Platitudes and clichés');
    });
  });

  describe('State Management', () => {
    test('getState returns engine state', () => {
      const state = engine.getState();

      expect(state).toHaveProperty('recentlyUsedCount');
      expect(state).toHaveProperty('fingerprint');
      expect(state.recentlyUsedCount).toBe(0);
    });

    test('reset clears recently used phrases', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 6,
        assertiveness: 6,
        pacing: 'medium',
        specificity: 6,
        styleMarkers: [],
        rationale: 'Reset test',
      };

      // Select some phrases
      engine.selectPhrases(tone, 'affirm');
      engine.selectPhrases(tone, 'affirm');
      engine.selectPhrases(tone, 'affirm');

      let state = engine.getState();
      expect(state.recentlyUsedCount).toBeGreaterThan(0);

      // Reset
      engine.reset();

      state = engine.getState();
      expect(state.recentlyUsedCount).toBe(0);
    });
  });

  describe('Integration Scenarios', () => {
    test('high achiever + breaker move generates crisp pattern-breaking phrases', () => {
      const tone: ToneDirective = {
        warmth: 4,
        directness: 9,
        assertiveness: 8,
        pacing: 'fast',
        specificity: 9,
        styleMarkers: ['crisp', 'solution-forward'],
        rationale: 'High achiever breaker',
      };

      const selected = engine.selectPhrases(tone, 'breaker');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('pattern-breaking');
      expect(selected.styleMarkers).toContain('strategic-redirect');
      // Input style markers should be preserved
      expect(selected.styleMarkers).toContain('crisp');
      expect(selected.styleMarkers).toContain('solution-forward');
      expect(selected.styleMarkers).toContain('direct-clear');
      expect(selected.styleMarkers).toContain('confident-decisive');
      expect(selected.styleMarkers).toContain('concrete-actionable');
    });

    test('anxious perfectionist + affirm move generates warm empathetic phrases', () => {
      const tone: ToneDirective = {
        warmth: 9,
        directness: 5,
        assertiveness: 4,
        pacing: 'slow',
        specificity: 6,
        styleMarkers: ['warm-grounding', 'validating'],
        rationale: 'Anxious perfectionist affirm',
      };

      const selected = engine.selectPhrases(tone, 'affirm');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('affirming');
      expect(selected.styleMarkers).toContain('validating');
      expect(selected.styleMarkers).toContain('warm-empathetic');
    });

    test('quiet deep thinker + mirror move generates reflective gentle phrases', () => {
      const tone: ToneDirective = {
        warmth: 7,
        directness: 5,
        assertiveness: 3,
        pacing: 'slow',
        specificity: 5,
        styleMarkers: ['thoughtful', 'spacious'],
        rationale: 'Quiet deep thinker mirror',
      };

      const selected = engine.selectPhrases(tone, 'mirror');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('reflective');
      expect(selected.styleMarkers).toContain('metacognitive');
      expect(selected.styleMarkers).toContain('gentle-invitational');
    });

    test('unfocused explorer + anchor move generates grounding concrete phrases', () => {
      const tone: ToneDirective = {
        warmth: 6,
        directness: 7,
        assertiveness: 7,
        pacing: 'medium',
        specificity: 9,
        styleMarkers: ['grounding', 'specific'],
        rationale: 'Unfocused explorer anchor',
      };

      const selected = engine.selectPhrases(tone, 'anchor');

      expect(selected.body.length).toBeGreaterThanOrEqual(2);
      expect(selected.styleMarkers).toContain('grounding');
      expect(selected.styleMarkers).toContain('concrete');
      expect(selected.styleMarkers).toContain('concrete-actionable');
    });
  });
});
