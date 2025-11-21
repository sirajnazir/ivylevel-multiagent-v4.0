import { AssessmentAgent } from '../src/AssessmentAgent';
import { AssessmentInput_v1 } from '../../../schema/assessmentInput_v1';
import { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';
import { OracleResults_v2 } from '../../../schema/oracleResults_v2';
import { NarrativeBlocks_v2, narrativeBlocksSchema_v2 } from '../../../schema/narrativeBlocks_v2';

/**
 * Integration tests for oracle execution and narrative generation
 * Tests the full pipeline: extractProfile -> runIntelligenceOracles -> generateNarrativeBlocks
 */

describe('AssessmentAgent - Oracle and Narrative Pipeline', () => {
  let mockInput: AssessmentInput_v1;
  let mockProfile: ExtractedProfile_v2;

  beforeEach(() => {
    // Mock input data
    mockInput = {
      studentId: 'test-student-123',
      transcriptText: 'Mock transcript',
      rawMessages: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello' },
      ],
      contextDocuments: [],
      existingStudentProfile: null,
    };

    // Mock extracted profile with full structure
    mockProfile = {
      academics: {
        gpa: { weighted: 4.5, unweighted: 3.9 },
        courseLoad: [
          { name: 'AP Calculus BC', rigorLevel: 'AP', subject: 'Mathematics', grade: 'A' },
          { name: 'AP Biology', rigorLevel: 'AP', subject: 'Science', grade: 'A-' },
          { name: 'AP Chemistry', rigorLevel: 'AP', subject: 'Science', grade: 'B+' },
        ],
        testScores: { sat: 1520, act: null, apScores: [{ subject: 'Calculus BC', score: 5 }] },
        academicInterests: ['STEM', 'Biology'],
        plannedCourses: ['AP Physics C', 'Multivariable Calculus'],
        rigorGaps: [],
      },
      activities: [
        {
          name: 'Science Research Intern',
          type: 'Research',
          role: 'Lead Researcher',
          hoursPerWeek: 10,
          yearsInvolved: 2,
          leadership: true,
          depthSignals: ['Published paper', 'Won regional competition'],
          outcomes: ['First-author publication in peer-reviewed journal'],
        },
        {
          name: 'Debate Team Captain',
          type: 'Club',
          role: 'Captain',
          hoursPerWeek: 8,
          yearsInvolved: 3,
          leadership: true,
          depthSignals: ['National circuit competitor'],
          outcomes: ['State championship finalist'],
        },
        {
          name: 'Volunteer Tutor',
          type: 'Volunteering',
          role: 'Tutor',
          hoursPerWeek: 4,
          yearsInvolved: 2,
          leadership: false,
          depthSignals: ['Regular commitment'],
          outcomes: ['Tutored 30+ students'],
        },
      ],
      awards: [
        { level: 'National', name: 'Intel ISEF Finalist', year: 11, description: 'Biomedical Engineering' },
        { level: 'State', name: 'State Science Fair 1st Place', year: 10, description: 'Biology' },
      ],
      personality: {
        coreValues: ['Curiosity', 'Compassion', 'Excellence'],
        identityThreads: ['Future physician-scientist', 'STEM advocate'],
        passions: ['Biomedical research', 'Science education'],
        communicationStyle: 'Articulate and thoughtful',
        emotionalIntelligence: 'High',
        growthMindset: 'Strong',
        resilience: 'High',
        creativity: 'High',
        leadership: 'Collaborative',
        empathy: 'Strong',
      },
      context: {
        familyInvolvement: 'Supportive',
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
        thematicHubs: ['STEM Research Excellence', 'Science Education Advocacy', 'Community Health Impact'],
        flagshipNarrative: 'A future physician-scientist leveraging biomedical research to democratize science education',
        admissionsPositioning: 'Deep STEM specialist with proven research credentials',
      },
    };
  });

  describe('runIntelligenceOracles()', () => {
    it('should run all three APS oracles sequentially', async () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      // Manually set extracted profile to bypass LLM call
      (agent as any).state.extractedProfile = mockProfile;

      const oracleResults = await agent.runIntelligenceOracles();

      // Validate structure
      expect(oracleResults).toHaveProperty('aptitude');
      expect(oracleResults).toHaveProperty('passion');
      expect(oracleResults).toHaveProperty('service');

      // Validate aptitude oracle
      expect(oracleResults.aptitude.score).toBeGreaterThanOrEqual(0);
      expect(oracleResults.aptitude.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(oracleResults.aptitude.evidence)).toBe(true);
      expect(typeof oracleResults.aptitude.rationale).toBe('string');

      // Validate passion oracle
      expect(oracleResults.passion.score).toBeGreaterThanOrEqual(0);
      expect(oracleResults.passion.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(oracleResults.passion.evidence)).toBe(true);

      // Validate service oracle
      expect(oracleResults.service.score).toBeGreaterThanOrEqual(0);
      expect(oracleResults.service.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(oracleResults.service.evidence)).toBe(true);
    });

    it('should calculate high aptitude score for strong academic profile', async () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();
      (agent as any).state.extractedProfile = mockProfile;

      const oracleResults = await agent.runIntelligenceOracles();

      // Profile has 3 AP courses, should score 70 + 3*5 = 85
      expect(oracleResults.aptitude.score).toBeGreaterThanOrEqual(80);
    });

    it('should calculate high passion score for leadership activities', async () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();
      (agent as any).state.extractedProfile = mockProfile;

      const oracleResults = await agent.runIntelligenceOracles();

      // Profile has 2 leadership activities (Science Research, Debate Captain)
      expect(oracleResults.passion.score).toBeGreaterThanOrEqual(80);
    });

    it('should calculate moderate service score for limited volunteering', async () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();
      (agent as any).state.extractedProfile = mockProfile;

      const oracleResults = await agent.runIntelligenceOracles();

      // Profile has 1 volunteering activity with 4 hours/week * 2 years = ~400 hours
      // Should score moderately (around 70-80)
      expect(oracleResults.service.score).toBeGreaterThanOrEqual(60);
      expect(oracleResults.service.score).toBeLessThanOrEqual(90);
    });

    it('should throw error if extractProfile() not called first', async () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      // Do NOT set extractedProfile

      await expect(agent.runIntelligenceOracles()).rejects.toThrow(
        'No extracted profile found. Must call extractProfile() first.'
      );
    });

    it('should save oracleResults to internal state', async () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();
      (agent as any).state.extractedProfile = mockProfile;

      await agent.runIntelligenceOracles();

      // Check internal state
      expect((agent as any).state.oracleResults).toBeDefined();
      expect((agent as any).state.step).toBe('oracles');
    });
  });

  describe('generateNarrativeBlocks()', () => {
    let mockOracleResults: OracleResults_v2;

    beforeEach(() => {
      mockOracleResults = {
        aptitude: {
          score: 85,
          evidence: ['3 AP courses identified'],
          rationale: 'Strong academic rigor',
        },
        passion: {
          score: 80,
          evidence: ['2 leadership activities'],
          rationale: 'Clear passion signals',
        },
        service: {
          score: 72,
          evidence: ['1 volunteering activity'],
          rationale: 'Moderate service commitment',
        },
        ivyScore: undefined,
        weakSpots: undefined,
      };
    });

    it('should generate narrative blocks with valid structure', () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, mockOracleResults);

      // Validate with Zod schema
      const validationResult = narrativeBlocksSchema_v2.safeParse(narrativeBlocks);
      expect(validationResult.success).toBe(true);

      // Validate structure
      expect(narrativeBlocks.thematicHubs).toHaveLength(3);
      expect(typeof narrativeBlocks.flagshipNarrative).toBe('string');
      expect(typeof narrativeBlocks.positioning).toBe('string');
      expect(typeof narrativeBlocks.identityThread).toBe('string');
      expect(Array.isArray(narrativeBlocks.risks)).toBe(true);
      expect(Array.isArray(narrativeBlocks.opportunities)).toBe(true);
    });

    it('should extract thematic hubs from narrativeScaffolding if available', () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, mockOracleResults);

      // Should use narrativeScaffolding.thematicHubs
      expect(narrativeBlocks.thematicHubs).toEqual([
        'STEM Research Excellence',
        'Science Education Advocacy',
        'Community Health Impact',
      ]);
    });

    it('should infer thematic hubs from activities if scaffolding has empty hubs', () => {
      const profileWithEmptyScaffolding = {
        ...mockProfile,
        narrativeScaffolding: {
          thematicHubs: ['', '', ''] as [string, string, string],
          flagshipNarrative: '',
          admissionsPositioning: '',
        },
      };
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      const narrativeBlocks = agent.generateNarrativeBlocks(profileWithEmptyScaffolding, mockOracleResults);

      // Should infer from top 3 activities
      expect(narrativeBlocks.thematicHubs).toEqual(['Research', 'Club', 'Volunteering']);
    });

    it('should generate "exceptional well-rounded leader" positioning for high scores', () => {
      const highScoreOracles: OracleResults_v2 = {
        aptitude: { score: 90, evidence: [], rationale: '' },
        passion: { score: 90, evidence: [], rationale: '' },
        service: { score: 90, evidence: [], rationale: '' },
      };

      const agent = new AssessmentAgent(mockInput);
      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, highScoreOracles);

      expect(narrativeBlocks.positioning).toContain('Exceptional well-rounded leader');
    });

    it('should generate "high-aptitude specialist" positioning for spiky aptitude profile', () => {
      const spikyAptitudeOracles: OracleResults_v2 = {
        aptitude: { score: 95, evidence: [], rationale: '' },
        passion: { score: 70, evidence: [], rationale: '' },
        service: { score: 65, evidence: [], rationale: '' },
      };

      const agent = new AssessmentAgent(mockInput);
      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, spikyAptitudeOracles);

      expect(narrativeBlocks.positioning).toContain('High-aptitude specialist');
    });

    it('should identify narrative risks for low oracle scores', () => {
      const lowScoreOracles: OracleResults_v2 = {
        aptitude: { score: 60, evidence: [], rationale: '' },
        passion: { score: 65, evidence: [], rationale: '' },
        service: { score: 50, evidence: [], rationale: '' },
      };

      const agent = new AssessmentAgent(mockInput);
      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, lowScoreOracles);

      expect(narrativeBlocks.risks.length).toBeGreaterThan(0);
      expect(narrativeBlocks.risks.some((r) => r.includes('rigor'))).toBe(true);
      expect(narrativeBlocks.risks.some((r) => r.includes('service'))).toBe(true);
    });

    it('should identify narrative opportunities for leadership activities', () => {
      const agent = new AssessmentAgent(mockInput);
      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, mockOracleResults);

      expect(narrativeBlocks.opportunities.length).toBeGreaterThan(0);
      expect(narrativeBlocks.opportunities.some((o) => o.includes('leadership'))).toBe(true);
    });

    it('should identify narrative opportunities for high creativity', () => {
      const agent = new AssessmentAgent(mockInput);
      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, mockOracleResults);

      // Profile has creativity: 'High'
      expect(narrativeBlocks.opportunities.some((o) => o.includes('creative'))).toBe(true);
    });

    it('should save narrativeBlocks to internal state', () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();

      agent.generateNarrativeBlocks(mockProfile, mockOracleResults);

      // Check internal state
      expect((agent as any).state.narrativeBlocks).toBeDefined();
      expect((agent as any).state.step).toBe('narrative');
    });
  });

  describe('Full Oracle + Narrative Pipeline Integration', () => {
    it('should execute full pipeline: oracles -> narrative blocks', async () => {
      const agent = new AssessmentAgent(mockInput);
      agent.initialize();
      (agent as any).state.extractedProfile = mockProfile;

      // Step 1: Run oracles
      const oracleResults = await agent.runIntelligenceOracles();
      expect(oracleResults).toBeDefined();

      // Step 2: Generate narrative blocks
      const narrativeBlocks = agent.generateNarrativeBlocks(mockProfile, oracleResults);
      expect(narrativeBlocks).toBeDefined();

      // Validate final state
      expect((agent as any).state.step).toBe('narrative');
      expect((agent as any).state.oracleResults).toEqual(oracleResults);
      expect((agent as any).state.narrativeBlocks).toEqual(narrativeBlocks);
    });

    it('should produce consistent results for same input', async () => {
      const agent1 = new AssessmentAgent(mockInput);
      agent1.initialize();
      (agent1 as any).state.extractedProfile = mockProfile;

      const agent2 = new AssessmentAgent(mockInput);
      agent2.initialize();
      (agent2 as any).state.extractedProfile = mockProfile;

      // Run pipeline twice
      const oracleResults1 = await agent1.runIntelligenceOracles();
      const narrativeBlocks1 = agent1.generateNarrativeBlocks(mockProfile, oracleResults1);

      const oracleResults2 = await agent2.runIntelligenceOracles();
      const narrativeBlocks2 = agent2.generateNarrativeBlocks(mockProfile, oracleResults2);

      // Results should be identical (deterministic)
      expect(oracleResults1).toEqual(oracleResults2);
      expect(narrativeBlocks1).toEqual(narrativeBlocks2);
    });
  });
});
