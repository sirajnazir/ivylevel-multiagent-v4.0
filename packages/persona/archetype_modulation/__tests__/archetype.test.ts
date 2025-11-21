/**
 * __tests__/archetype.test.ts
 *
 * Tests for Component 43 - Persona-Archetype Adaptive Modulation Layer
 */

import { detectStudentArchetype, getArchetypeName } from '../detectArchetype';
import { buildModulationEnvelope, buildModulationPromptBlock, validateEnvelope } from '../buildEnvelope';
import { getModulationProfile, getArchetypeExamples } from '../modulationProfiles';
import type { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';
import { mockHighAchieverProfile, mockLostDreamerProfile, mockAnxiousOverthinkerProfile } from './fixtures';

describe('Component 43 - Archetype Detection', () => {
  describe('detectStudentArchetype', () => {
    it('should detect high-achieving robot archetype', () => {
      const result = detectStudentArchetype(mockHighAchieverProfile as ExtractedProfile_v2);

      expect(result.primary).toBe('high_achieving_robot');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.signals).toContain('High GPA + High rigor + Anxiety/burnout markers');
    });

    it('should detect lost dreamer archetype', () => {
      const result = detectStudentArchetype(mockLostDreamerProfile as ExtractedProfile_v2);

      expect(result.primary).toBe('lost_dreamer');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    it('should detect anxious overthinker archetype', () => {
      const result = detectStudentArchetype(mockAnxiousOverthinkerProfile as ExtractedProfile_v2);

      expect(result.primary).toBe('anxious_overthinker');
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.signals).toContain('High anxiety markers');
    });

    it('should include secondary archetype when applicable', () => {
      const result = detectStudentArchetype(mockHighAchieverProfile as ExtractedProfile_v2);

      // High achiever with overload patterns might have secondary
      if (result.secondary) {
        expect(['burnt_out_overloader', 'anxious_overthinker']).toContain(result.secondary);
      }
    });
  });

  describe('getArchetypeName', () => {
    it('should return human-readable names', () => {
      expect(getArchetypeName('high_achieving_robot')).toBe('The High-Achieving Robot');
      expect(getArchetypeName('lost_dreamer')).toBe('The Lost Dreamer');
      expect(getArchetypeName('anxious_overthinker')).toBe('The Highly Anxious Overthinker');
    });
  });
});

describe('Component 43 - Modulation Profiles', () => {
  describe('getModulationProfile', () => {
    it('should return profile for high-achieving robot', () => {
      const profile = getModulationProfile('high_achieving_robot');

      expect(profile.tone).toBe('calm_anchoring');
      expect(profile.structure).toBe('high');
      expect(profile.warmth).toBe('medium_high');
      expect(profile.pacing).toBe('slow');
      expect(profile.directives.reduce).toContain('pressure language');
      expect(profile.directives.increase).toContain('emotional grounding');
    });

    it('should return profile for chaotic creative', () => {
      const profile = getModulationProfile('chaotic_creative');

      expect(profile.tone).toBe('energizing_structured');
      expect(profile.directives.increase).toContain('containers and checkpoints');
      expect(profile.strategyLanguage).toContain('containers');
    });

    it('should have example phrases for all archetypes', () => {
      const archetypes: Array<keyof typeof import('../modulationProfiles').MODULATION_PROFILES> = [
        'high_achieving_robot',
        'lost_dreamer',
        'discouraged_underdog',
        'burnt_out_overloader',
        'detached_minimalist',
        'hyper_ambitious_spiky',
        'low_confidence_high_talent',
        'chaotic_creative',
        'anxious_overthinker'
      ];

      archetypes.forEach(archetype => {
        const profile = getModulationProfile(archetype);
        expect(profile.examplePhrases.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getArchetypeExamples', () => {
    it('should return signature phrases for archetype', () => {
      const examples = getArchetypeExamples('anxious_overthinker');

      expect(examples).toContain("Let's slow this down. You're spinning too many scenarios.");
      expect(examples.length).toBeGreaterThan(3);
    });
  });
});

describe('Component 43 - Modulation Envelope', () => {
  describe('buildModulationEnvelope', () => {
    it('should build envelope from profile', () => {
      const envelope = buildModulationEnvelope(mockHighAchieverProfile as ExtractedProfile_v2);

      expect(envelope.persona).toBe('jenny');
      expect(envelope.archetype).toBe('high_achieving_robot');
      expect(envelope.confidence).toBeGreaterThan(0.7);
      expect(envelope.toneProfile).toBeDefined();
      expect(envelope.constraints).toBeDefined();
      expect(envelope.metadata.detectionSignals).toBeDefined();
    });

    it('should set strict drift tolerance for anxious students', () => {
      const envelope = buildModulationEnvelope(mockAnxiousOverthinkerProfile as ExtractedProfile_v2);

      expect(envelope.constraints.driftTolerance).toBe('strict');
      expect(envelope.constraints.groundingRequired).toBe(true);
    });

    it('should set relaxed tolerance for creative students', () => {
      const envelope = buildModulationEnvelope(mockLostDreamerProfile as ExtractedProfile_v2);

      // Lost dreamers get relaxed tolerance
      if (envelope.archetype === 'lost_dreamer') {
        expect(envelope.constraints.driftTolerance).toBe('relaxed');
        expect(envelope.constraints.creativityLevel).toBe('high');
      }
    });

    it('should enforce stricter modulation when drift detected', () => {
      const driftResult = {
        drift_level: 'red',
        similarity: 0.3,
        requires_correction: true
      };

      const envelope = buildModulationEnvelope(mockLostDreamerProfile as ExtractedProfile_v2, driftResult);

      // Even relaxed archetypes get strict when drift is red
      expect(envelope.constraints.driftTolerance).toBe('strict');
      expect(envelope.constraints.creativityLevel).toBe('low');
      expect(envelope.constraints.groundingRequired).toBe(true);
    });
  });

  describe('buildModulationPromptBlock', () => {
    it('should generate well-formatted prompt block', () => {
      const envelope = buildModulationEnvelope(mockHighAchieverProfile as ExtractedProfile_v2);
      const promptBlock = buildModulationPromptBlock(envelope);

      expect(promptBlock).toContain('<<ARCHETYPE_MODULATION_PROFILE>>');
      expect(promptBlock).toContain('student_archetype: high_achieving_robot');
      expect(promptBlock).toContain('tone_style: calm_anchoring');
      expect(promptBlock).toContain('reduce_these:');
      expect(promptBlock).toContain('increase_these:');
      expect(promptBlock).toContain('emphasize_these:');
      expect(promptBlock).toContain('<<END_MODULATION_PROFILE>>');
    });
  });

  describe('validateEnvelope', () => {
    it('should validate correct envelope', () => {
      const envelope = buildModulationEnvelope(mockHighAchieverProfile as ExtractedProfile_v2);
      expect(validateEnvelope(envelope)).toBe(true);
    });

    it('should reject envelope with invalid confidence', () => {
      const envelope = buildModulationEnvelope(mockHighAchieverProfile as ExtractedProfile_v2);
      envelope.confidence = 1.5; // Invalid: > 1

      expect(validateEnvelope(envelope)).toBe(false);
    });
  });
});

describe('Component 43 - Integration Scenarios', () => {
  it('should provide different modulation for different archetypes', () => {
    const achieverEnvelope = buildModulationEnvelope(mockHighAchieverProfile as ExtractedProfile_v2);
    const dreamerEnvelope = buildModulationEnvelope(mockLostDreamerProfile as ExtractedProfile_v2);

    // Different archetypes
    expect(achieverEnvelope.archetype).not.toBe(dreamerEnvelope.archetype);

    // Different tone profiles
    expect(achieverEnvelope.toneProfile.tone).not.toBe(dreamerEnvelope.toneProfile.tone);

    // Different pacing
    expect(achieverEnvelope.toneProfile.pacing).not.toBe(dreamerEnvelope.toneProfile.pacing);
  });

  it('should provide archetype-specific example phrases', () => {
    const achieverEnvelope = buildModulationEnvelope(mockHighAchieverProfile as ExtractedProfile_v2);
    const dreamerEnvelope = buildModulationEnvelope(mockLostDreamerProfile as ExtractedProfile_v2);

    const achieverPhrases = achieverEnvelope.toneProfile.examplePhrases;
    const dreamerPhrases = dreamerEnvelope.toneProfile.examplePhrases;

    // High achiever gets "slow down" language
    expect(achieverPhrases.some(p => p.includes('slow'))).toBe(true);

    // Dreamer gets "exploration" language
    expect(dreamerPhrases.some(p => p.toLowerCase().includes('experiment') || p.toLowerCase().includes('try'))).toBe(true);
  });
});
