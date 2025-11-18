import { AssessmentAgent } from '../src/AssessmentAgent';
import { AssessmentInput_v1 } from '../../../schema/assessmentInput_v1';
import { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';
import * as llm from '../../../llm';

// Mock the LLM module
jest.mock('../../../llm', () => ({
  runLLMExtraction: jest.fn(),
  safeJsonParse: jest.requireActual('../../../llm').safeJsonParse,
}));

describe('Extraction Pipeline', () => {
  let mockInput: AssessmentInput_v1;

  beforeEach(() => {
    mockInput = {
      studentId: 'test-student-456',
      transcriptText: 'Student: I take AP Calc BC and AP Physics. I started a robotics club.',
      rawMessages: [
        { role: 'user', content: 'Tell me about your courses' },
        { role: 'assistant', content: 'What classes are you taking?' },
        { role: 'user', content: 'AP Calc BC and AP Physics' },
      ],
      contextDocuments: [],
      existingStudentProfile: null,
    };

    jest.clearAllMocks();
  });

  describe('successful extraction', () => {
    it('should extract and validate complete profile', async () => {
      // Mock valid LLM response
      const mockProfile: ExtractedProfile_v2 = {
        academics: {
          gpa: { weighted: 4.5, unweighted: 3.9 },
          courseLoad: [
            { name: 'AP Calculus BC', rigorLevel: 'AP', subject: 'Math', grade: '11' },
            { name: 'AP Physics C', rigorLevel: 'AP', subject: 'Science', grade: '11' },
          ],
          testScores: { sat: 1520, act: null, apScores: [] },
          academicInterests: ['Mathematics', 'Physics'],
          plannedCourses: ['AP Computer Science', 'AP Statistics'],
          rigorGaps: [],
        },
        activities: [
          {
            name: 'Robotics Club',
            type: 'Club',
            role: 'Founder',
            hoursPerWeek: 10,
            yearsInvolved: 2,
            leadership: true,
            depthSignals: ['Founded club', 'Grew to 30 members'],
            outcomes: ['Won regional competition'],
          },
        ],
        awards: [
          {
            name: 'Math Olympiad Bronze',
            level: 'State',
            year: 2024,
            description: 'State-level math competition',
          },
        ],
        personality: {
          coreValues: ['Innovation', 'Problem-solving'],
          identityThreads: ['STEM builder', 'Team leader'],
          passions: ['Robotics', 'Mathematics'],
          communicationStyle: 'Direct and analytical',
          emotionalIntelligence: 'High self-awareness',
        },
        context: {
          familyInvolvement: 'Supportive but not overbearing',
          resourceConstraints: [],
          lifeCircumstances: [],
        },
        diagnostics: {
          rigorGaps: ['Missing AP English'],
          ecDepthGaps: [],
          narrativeIssues: [],
          strategicRisks: ['Need summer research experience'],
        },
        narrativeScaffolding: {
          thematicHubs: ['STEM Innovation', 'Leadership', 'Problem Solving'],
          flagshipNarrative: 'Builder who leads through technical innovation',
          admissionsPositioning: 'Engineering + Leadership hybrid',
        },
      };

      (llm.runLLMExtraction as jest.Mock).mockResolvedValue(JSON.stringify(mockProfile));

      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      const result = await agent.extractProfile();

      expect(result).toEqual(mockProfile);
      expect(llm.runLLMExtraction).toHaveBeenCalledTimes(1);
      expect(llm.runLLMExtraction).toHaveBeenCalledWith({
        rawMessages: mockInput.rawMessages,
        transcriptText: mockInput.transcriptText,
        maxRetries: 1,
        temperature: 0.3,
      });
    });

    it('should handle markdown-wrapped JSON response', async () => {
      const mockProfile: ExtractedProfile_v2 = {
        academics: {
          gpa: { weighted: null, unweighted: null },
          courseLoad: [],
          testScores: { sat: null, act: null, apScores: [] },
          academicInterests: [],
          plannedCourses: [],
          rigorGaps: [],
        },
        activities: [],
        awards: [],
        personality: {
          coreValues: [],
          identityThreads: [],
          passions: [],
          communicationStyle: '',
          emotionalIntelligence: '',
        },
        context: {
          familyInvolvement: '',
          resourceConstraints: [],
          lifeCircumstances: [],
        },
        diagnostics: {
          rigorGaps: [],
          ecDepthGaps: [],
          narrativeIssues: [],
          strategicRisks: [],
        },
        narrativeScaffolding: {
          thematicHubs: ['', '', ''],
          flagshipNarrative: '',
          admissionsPositioning: '',
        },
      };

      const wrappedResponse = '```json\n' + JSON.stringify(mockProfile) + '\n```';
      (llm.runLLMExtraction as jest.Mock).mockResolvedValue(wrappedResponse);

      const agent = new AssessmentAgent(mockInput);
      const result = await agent.extractProfile();

      expect(result).toEqual(mockProfile);
    });
  });

  describe('error handling', () => {
    it('should throw error on invalid JSON response', async () => {
      (llm.runLLMExtraction as jest.Mock).mockResolvedValue('invalid json {{{');

      const agent = new AssessmentAgent(mockInput);

      await expect(agent.extractProfile()).rejects.toThrow(
        'Failed to extract student profile'
      );
    });

    it('should throw error on schema validation failure', async () => {
      const invalidProfile = {
        academics: { gpa: 'not a valid structure' },
        // missing required fields
      };

      (llm.runLLMExtraction as jest.Mock).mockResolvedValue(JSON.stringify(invalidProfile));

      const agent = new AssessmentAgent(mockInput);

      await expect(agent.extractProfile()).rejects.toThrow(
        'Failed to extract student profile'
      );
    });

    it('should throw error when LLM extraction fails', async () => {
      (llm.runLLMExtraction as jest.Mock).mockRejectedValue(
        new Error('LLM API timeout')
      );

      const agent = new AssessmentAgent(mockInput);

      await expect(agent.extractProfile()).rejects.toThrow(
        'Failed to extract student profile'
      );
    });
  });

  describe('state management', () => {
    it('should update internal state after successful extraction', async () => {
      const mockProfile: ExtractedProfile_v2 = {
        academics: {
          gpa: { weighted: null, unweighted: null },
          courseLoad: [],
          testScores: { sat: null, act: null, apScores: [] },
          academicInterests: [],
          plannedCourses: [],
          rigorGaps: [],
        },
        activities: [],
        awards: [],
        personality: {
          coreValues: [],
          identityThreads: [],
          passions: [],
          communicationStyle: '',
          emotionalIntelligence: '',
        },
        context: {
          familyInvolvement: '',
          resourceConstraints: [],
          lifeCircumstances: [],
        },
        diagnostics: {
          rigorGaps: [],
          ecDepthGaps: [],
          narrativeIssues: [],
          strategicRisks: [],
        },
        narrativeScaffolding: {
          thematicHubs: ['', '', ''],
          flagshipNarrative: '',
          admissionsPositioning: '',
        },
      };

      (llm.runLLMExtraction as jest.Mock).mockResolvedValue(JSON.stringify(mockProfile));

      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      await agent.extractProfile();

      // Access internal state via any to test (in real code this would be tested differently)
      const state = (agent as any).state;
      expect(state.step).toBe('extract');
      expect(state.extractedProfile).toEqual(mockProfile);
    });
  });

  describe('integration flow', () => {
    it('should complete full extraction pipeline', async () => {
      const mockProfile: ExtractedProfile_v2 = {
        academics: {
          gpa: { weighted: 4.3, unweighted: 3.85 },
          courseLoad: [
            { name: 'AP Biology', rigorLevel: 'AP', subject: 'Science', grade: '10' },
          ],
          testScores: { sat: 1450, act: 33, apScores: [{ subject: 'Biology', score: 5 }] },
          academicInterests: ['Biology', 'Medicine'],
          plannedCourses: ['AP Chemistry'],
          rigorGaps: [],
        },
        activities: [
          {
            name: 'Hospital Volunteering',
            type: 'Volunteering',
            role: 'Volunteer',
            hoursPerWeek: 5,
            yearsInvolved: 1,
            leadership: false,
            depthSignals: ['100+ hours'],
            outcomes: [],
          },
        ],
        awards: [],
        personality: {
          coreValues: ['Service', 'Empathy'],
          identityThreads: ['Healthcare advocate'],
          passions: ['Medicine'],
          communicationStyle: 'Empathetic',
          emotionalIntelligence: 'High empathy and self-regulation',
        },
        context: {
          familyInvolvement: 'Parent is a doctor, supportive',
          resourceConstraints: [],
          lifeCircumstances: [],
        },
        diagnostics: {
          rigorGaps: [],
          ecDepthGaps: ['Need more leadership roles'],
          narrativeIssues: [],
          strategicRisks: [],
        },
        narrativeScaffolding: {
          thematicHubs: ['Healthcare', 'Service', 'Science'],
          flagshipNarrative: 'Future physician driven by service',
          admissionsPositioning: 'Pre-med with demonstrated compassion',
        },
      };

      (llm.runLLMExtraction as jest.Mock).mockResolvedValue(JSON.stringify(mockProfile));

      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      const profile = await agent.extractProfile();

      // Verify complete pipeline execution
      expect(profile).toBeDefined();
      expect(profile.academics.gpa.weighted).toBe(4.3);
      expect(profile.activities).toHaveLength(1);
      expect(profile.narrativeScaffolding.thematicHubs).toHaveLength(3);
      expect(llm.runLLMExtraction).toHaveBeenCalled();
    });
  });
});
