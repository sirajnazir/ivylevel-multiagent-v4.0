/**
 * __tests__/dialogueEngine.test.ts
 *
 * Tests for Component 45 - Assessment Session Dialogue Engine
 */

import {
  generateAssessmentTurn,
  getPhaseObjectives,
  createInitialDataStatus
} from '../assessmentDialogueEngine.llm';
import type {
  DialogueEngineInput,
  DialogueEngineOutput,
  MessageTurn
} from '../types';
import type { ArchetypeClassification } from '../../../../persona/archetype_classifier';
import type { ModulationEnvelope } from '../../../../persona/archetype_modulation';

// Mock fixtures
import {
  mockHighAchieverProfile,
  mockAnxiousOverthinkerProfile,
  mockLostDreamerProfile
} from '../../../../persona/archetype_modulation/__tests__/fixtures';

describe('Component 45 - Assessment Session Dialogue Engine', () => {
  describe('generateAssessmentTurn', () => {
    it('should generate opening rapport message for anxious overthinker', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'student',
          content: "Hi, I'm nervous about college."
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'anxious_overthinker',
        secondaryArchetype: null,
        confidence: 0.85,
        evidence: ['Anxiety markers in opening statement'],
        toneOverrides: {
          tone: 'soothing_reassuring',
          pacing: 'gentle',
          structure: 'medium',
          warmth: 'high'
        },
        styleConstraints: {
          avoidPhrases: ['you should', 'just decide'],
          increasePhrases: ["let's slow this down", 'one step at a time']
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'anxious_overthinker',
        secondary: null,
        confidence: 0.85,
        toneProfile: {
          archetype: 'anxious_overthinker',
          tone: 'soothing_reassuring',
          structure: 'medium',
          warmth: 'high',
          pacing: 'gentle',
          directives: {
            reduce: ['pressure language'],
            increase: ['reassurance'],
            emphasize: ['one step at a time']
          },
          strategyLanguage: 'manageable steps',
          examplePhrases: ["let's slow this down"]
        },
        constraints: {
          driftTolerance: 'strict',
          creativityLevel: 'low',
          groundingRequired: true
        },
        metadata: {
          detectionSignals: ['anxiety'],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'rapport_and_safety',
        messageHistory,
        profile: mockAnxiousOverthinkerProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: createInitialDataStatus()
      };

      const result = await generateAssessmentTurn(input);

      expect(result.message).toBeDefined();
      expect(result.message.length).toBeGreaterThan(50);
      expect(result.message.toLowerCase()).toContain('jenny');
      expect(result.nextPhase).toBe('rapport_and_safety');
      expect(result.updatedDataStatus.confidence).toBe('low');
      expect(result.diagnosticNotes.length).toBeGreaterThan(0);
      expect(result.phaseCompletionConfidence).toBeGreaterThan(0);
    });

    it('should generate academic mapping question for high achiever', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'student',
          content: "Hi, I'm stressed about my college list."
        },
        {
          role: 'coach',
          content: "Hey! I'm Jenny. Let's figure this out together."
        },
        {
          role: 'student',
          content: "I'm pretty stressed. Maybe 8/10."
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'high_achieving_robot',
        secondaryArchetype: null,
        confidence: 0.82,
        evidence: ['Stress about college performance'],
        toneOverrides: {
          tone: 'calm_anchoring',
          pacing: 'slow',
          structure: 'high',
          warmth: 'medium_high'
        },
        styleConstraints: {
          avoidPhrases: ['work harder', 'push yourself'],
          increasePhrases: ["let's slow this down", 'you are not your GPA']
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'high_achieving_robot',
        secondary: null,
        confidence: 0.82,
        toneProfile: {
          archetype: 'high_achieving_robot',
          tone: 'calm_anchoring',
          structure: 'high',
          warmth: 'medium_high',
          pacing: 'slow',
          directives: {
            reduce: ['pressure language'],
            increase: ['emotional grounding'],
            emphasize: ['you are not your GPA']
          },
          strategyLanguage: 'paced steps',
          examplePhrases: ["let's slow this down"]
        },
        constraints: {
          driftTolerance: 'strict',
          creativityLevel: 'medium',
          groundingRequired: true
        },
        metadata: {
          detectionSignals: ['perfectionism'],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'current_state_mapping',
        messageHistory,
        profile: mockHighAchieverProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: createInitialDataStatus()
      };

      const result = await generateAssessmentTurn(input);

      expect(result.message).toBeDefined();
      expect(result.message.toLowerCase()).toMatch(/gpa|academic|courseload|taking/);
      expect(result.nextPhase).toBe('current_state_mapping');
      expect(result.diagnosticNotes).toContain('Gathering academic data');
      expect(result.phaseCompletionConfidence).toBeGreaterThan(0);
    });

    it('should probe motivation in diagnostic phase', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'student',
          content: "I'm taking 5 APs and have a 4.2 GPA."
        },
        {
          role: 'coach',
          content: "What activities are you doing?"
        },
        {
          role: 'student',
          content: "Debate, mock trial, and student government."
        },
        {
          role: 'coach',
          content: "Which ones do you care about?"
        },
        {
          role: 'student',
          content: "I guess debate is mostly for college apps."
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'high_achieving_robot',
        secondaryArchetype: null,
        confidence: 0.82,
        evidence: ['Extrinsic motivation detected'],
        toneOverrides: {
          tone: 'calm_anchoring',
          pacing: 'slow',
          structure: 'high',
          warmth: 'medium_high'
        },
        styleConstraints: {
          avoidPhrases: ['work harder'],
          increasePhrases: ['permission to rest']
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'high_achieving_robot',
        secondary: null,
        confidence: 0.82,
        toneProfile: {
          archetype: 'high_achieving_robot',
          tone: 'calm_anchoring',
          structure: 'high',
          warmth: 'medium_high',
          pacing: 'slow',
          directives: {
            reduce: ['pressure'],
            increase: ['grounding'],
            emphasize: ['authenticity']
          },
          strategyLanguage: 'strategic',
          examplePhrases: ['permission to drop things']
        },
        constraints: {
          driftTolerance: 'strict',
          creativityLevel: 'medium',
          groundingRequired: true
        },
        metadata: {
          detectionSignals: ['perfectionism'],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'diagnostic_insights',
        messageHistory,
        profile: mockHighAchieverProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: {
          academicsComplete: true,
          extracurricularsComplete: true,
          stressLevelMapped: true,
          motivationProbed: false,
          identityThreadsExplored: false,
          gapsIdentified: false,
          commitmentLevel: 'medium',
          confidence: 'medium'
        }
      };

      const result = await generateAssessmentTurn(input);

      expect(result.message).toBeDefined();
      expect(result.message.toLowerCase()).toMatch(/why|care|internal|external/);
      expect(result.nextPhase).toBe('diagnostic_insights');
      expect(result.diagnosticNotes).toContain('Probing motivation');
      expect(result.updatedDataStatus.motivationProbed).toBe(true);
    });

    it('should generate strategic preview for lost dreamer', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'student',
          content: "I don't really know what I want to study."
        },
        {
          role: 'coach',
          content: "That's okay. What are you curious about?"
        },
        {
          role: 'student',
          content: "I like a lot of things but can't decide."
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'lost_dreamer',
        secondaryArchetype: null,
        confidence: 0.72,
        evidence: ['Uncertainty about direction'],
        toneOverrides: {
          tone: 'compassionate_exploratory',
          pacing: 'gentle',
          structure: 'medium',
          warmth: 'high'
        },
        styleConstraints: {
          avoidPhrases: ['decide now', 'pick one'],
          increasePhrases: ["let's try something small", "you don't need to know"]
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'lost_dreamer',
        secondary: null,
        confidence: 0.72,
        toneProfile: {
          archetype: 'lost_dreamer',
          tone: 'compassionate_exploratory',
          structure: 'medium',
          warmth: 'high',
          pacing: 'gentle',
          directives: {
            reduce: ['decision pressure'],
            increase: ['exploration language'],
            emphasize: ['lightweight experiments']
          },
          strategyLanguage: 'exploratory',
          examplePhrases: ["you don't need to see the whole path"]
        },
        constraints: {
          driftTolerance: 'relaxed',
          creativityLevel: 'high',
          groundingRequired: false
        },
        metadata: {
          detectionSignals: ['uncertainty'],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'strategic_preview',
        messageHistory,
        profile: mockLostDreamerProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: {
          academicsComplete: true,
          extracurricularsComplete: true,
          stressLevelMapped: true,
          motivationProbed: true,
          identityThreadsExplored: true,
          gapsIdentified: true,
          commitmentLevel: 'medium',
          confidence: 'low'
        }
      };

      const result = await generateAssessmentTurn(input);

      expect(result.message).toBeDefined();
      expect(result.message.toLowerCase()).toMatch(/explore|experiment|try|curious/);
      expect(result.nextPhase).toBe('strategic_preview');
      expect(result.diagnosticNotes).toContain('Strategic preview delivered');
      expect(result.phaseCompletionConfidence).toBeGreaterThan(0.9);
    });

    it('should advance phase when completion criteria met', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'student',
          content: "I'm doing okay, maybe 5/10 stress."
        },
        {
          role: 'coach',
          content: "Got it. Let's talk about your academics."
        },
        {
          role: 'student',
          content: "Sure, what do you want to know?"
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'high_achieving_robot',
        secondaryArchetype: null,
        confidence: 0.82,
        evidence: [],
        toneOverrides: {
          tone: 'calm_anchoring',
          pacing: 'slow',
          structure: 'high',
          warmth: 'medium_high'
        },
        styleConstraints: {
          avoidPhrases: [],
          increasePhrases: []
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'high_achieving_robot',
        secondary: null,
        confidence: 0.82,
        toneProfile: {
          archetype: 'high_achieving_robot',
          tone: 'calm_anchoring',
          structure: 'high',
          warmth: 'medium_high',
          pacing: 'slow',
          directives: {
            reduce: [],
            increase: [],
            emphasize: []
          },
          strategyLanguage: 'strategic',
          examplePhrases: []
        },
        constraints: {
          driftTolerance: 'moderate',
          creativityLevel: 'medium',
          groundingRequired: true
        },
        metadata: {
          detectionSignals: [],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'rapport_and_safety',
        messageHistory,
        profile: mockHighAchieverProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: createInitialDataStatus()
      };

      const result = await generateAssessmentTurn(input);

      // Should advance to current_state_mapping after 2+ rapport turns
      expect(result.nextPhase).toBe('current_state_mapping');
      expect(result.phaseCompletionConfidence).toBeGreaterThan(0.7);
    });

    it('should track data collection status updates', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'coach',
          content: "What's your GPA?"
        },
        {
          role: 'student',
          content: "I have a 4.2 weighted GPA and I'm taking 4 APs this year."
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'high_achieving_robot',
        secondaryArchetype: null,
        confidence: 0.82,
        evidence: [],
        toneOverrides: {
          tone: 'calm_anchoring',
          pacing: 'slow',
          structure: 'high',
          warmth: 'medium_high'
        },
        styleConstraints: {
          avoidPhrases: [],
          increasePhrases: []
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'high_achieving_robot',
        secondary: null,
        confidence: 0.82,
        toneProfile: {
          archetype: 'high_achieving_robot',
          tone: 'calm_anchoring',
          structure: 'high',
          warmth: 'medium_high',
          pacing: 'slow',
          directives: {
            reduce: [],
            increase: [],
            emphasize: []
          },
          strategyLanguage: 'strategic',
          examplePhrases: []
        },
        constraints: {
          driftTolerance: 'moderate',
          creativityLevel: 'medium',
          groundingRequired: true
        },
        metadata: {
          detectionSignals: [],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'current_state_mapping',
        messageHistory,
        profile: mockHighAchieverProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: createInitialDataStatus()
      };

      const result = await generateAssessmentTurn(input);

      expect(result.updatedDataStatus.academicsComplete).toBe(true);
      expect(result.updatedDataStatus.extracurricularsComplete).toBe(false);
    });

    it('should include diagnostic notes for internal tracking', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'student',
          content: "I'm really anxious about everything."
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'anxious_overthinker',
        secondaryArchetype: null,
        confidence: 0.85,
        evidence: ['Strong anxiety markers'],
        toneOverrides: {
          tone: 'soothing_reassuring',
          pacing: 'gentle',
          structure: 'medium',
          warmth: 'high'
        },
        styleConstraints: {
          avoidPhrases: [],
          increasePhrases: []
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'anxious_overthinker',
        secondary: null,
        confidence: 0.85,
        toneProfile: {
          archetype: 'anxious_overthinker',
          tone: 'soothing_reassuring',
          structure: 'medium',
          warmth: 'high',
          pacing: 'gentle',
          directives: {
            reduce: [],
            increase: [],
            emphasize: []
          },
          strategyLanguage: 'manageable',
          examplePhrases: []
        },
        constraints: {
          driftTolerance: 'strict',
          creativityLevel: 'low',
          groundingRequired: true
        },
        metadata: {
          detectionSignals: [],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'rapport_and_safety',
        messageHistory,
        profile: mockAnxiousOverthinkerProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: createInitialDataStatus()
      };

      const result = await generateAssessmentTurn(input);

      expect(result.diagnosticNotes).toBeDefined();
      expect(Array.isArray(result.diagnosticNotes)).toBe(true);
      expect(result.diagnosticNotes.length).toBeGreaterThan(0);
      expect(result.diagnosticNotes.some(note => note.includes('anxious_overthinker'))).toBe(true);
    });

    it('should include follow-up questions for agent planning', async () => {
      const messageHistory: MessageTurn[] = [
        {
          role: 'student',
          content: "I'm not sure what I want to major in."
        }
      ];

      const mockArchetype: ArchetypeClassification = {
        primaryArchetype: 'lost_dreamer',
        secondaryArchetype: null,
        confidence: 0.72,
        evidence: [],
        toneOverrides: {
          tone: 'compassionate_exploratory',
          pacing: 'gentle',
          structure: 'medium',
          warmth: 'high'
        },
        styleConstraints: {
          avoidPhrases: [],
          increasePhrases: []
        }
      };

      const mockModulation: ModulationEnvelope = {
        persona: 'jenny',
        archetype: 'lost_dreamer',
        secondary: null,
        confidence: 0.72,
        toneProfile: {
          archetype: 'lost_dreamer',
          tone: 'compassionate_exploratory',
          structure: 'medium',
          warmth: 'high',
          pacing: 'gentle',
          directives: {
            reduce: [],
            increase: [],
            emphasize: []
          },
          strategyLanguage: 'exploratory',
          examplePhrases: []
        },
        constraints: {
          driftTolerance: 'relaxed',
          creativityLevel: 'high',
          groundingRequired: false
        },
        metadata: {
          detectionSignals: [],
          timestamp: new Date().toISOString()
        }
      };

      const input: DialogueEngineInput = {
        phase: 'rapport_and_safety',
        messageHistory,
        profile: mockLostDreamerProfile,
        archetype: mockArchetype,
        modulation: mockModulation,
        dataStatus: createInitialDataStatus()
      };

      const result = await generateAssessmentTurn(input);

      expect(result.followUpQuestions).toBeDefined();
      expect(Array.isArray(result.followUpQuestions)).toBe(true);
    });
  });

  describe('getPhaseObjectives', () => {
    it('should return objectives for rapport phase', () => {
      const objectives = getPhaseObjectives('rapport_and_safety');

      expect(Array.isArray(objectives)).toBe(true);
      expect(objectives.length).toBeGreaterThan(0);
      expect(objectives.some(obj => obj.toLowerCase().includes('trust'))).toBe(true);
    });

    it('should return objectives for current state mapping', () => {
      const objectives = getPhaseObjectives('current_state_mapping');

      expect(Array.isArray(objectives)).toBe(true);
      expect(objectives.some(obj => obj.toLowerCase().includes('academic'))).toBe(true);
    });

    it('should return objectives for diagnostic insights', () => {
      const objectives = getPhaseObjectives('diagnostic_insights');

      expect(Array.isArray(objectives)).toBe(true);
      expect(objectives.some(obj => obj.toLowerCase().includes('motivation'))).toBe(true);
    });

    it('should return objectives for strategic preview', () => {
      const objectives = getPhaseObjectives('strategic_preview');

      expect(Array.isArray(objectives)).toBe(true);
      expect(objectives.some(obj => obj.toLowerCase().includes('next step'))).toBe(true);
    });
  });

  describe('createInitialDataStatus', () => {
    it('should create data status with all fields false/unknown', () => {
      const status = createInitialDataStatus();

      expect(status.academicsComplete).toBe(false);
      expect(status.extracurricularsComplete).toBe(false);
      expect(status.stressLevelMapped).toBe(false);
      expect(status.motivationProbed).toBe(false);
      expect(status.identityThreadsExplored).toBe(false);
      expect(status.gapsIdentified).toBe(false);
      expect(status.commitmentLevel).toBe('unknown');
      expect(status.confidence).toBe('unknown');
    });
  });
});
