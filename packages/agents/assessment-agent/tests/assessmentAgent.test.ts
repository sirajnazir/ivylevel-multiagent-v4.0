import { AssessmentAgent } from '../src/AssessmentAgent';
import { AssessmentInput_v1 } from '../../../schema/assessmentInput_v1';

describe('AssessmentAgent', () => {
  let mockInput: AssessmentInput_v1;

  beforeEach(() => {
    mockInput = {
      studentId: 'test-student-123',
      transcriptText: 'Mock transcript text',
      rawMessages: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi there!' },
      ],
      contextDocuments: ['doc1.pdf', 'doc2.pdf'],
      existingStudentProfile: null,
    };
  });

  it('should initialize AssessmentAgent', () => {
    const agent = new AssessmentAgent(mockInput);
    expect(agent).toBeDefined();
  });

  describe('extractProfile', () => {
    it('should return typed profile object', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();

      expect(profile).toBeDefined();
      expect(profile).toHaveProperty('academics');
      expect(profile).toHaveProperty('activities');
      expect(profile).toHaveProperty('awards');
      expect(profile).toHaveProperty('personality');
    });

    it('should return empty objects for stub implementation', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();

      expect(profile.academics).toEqual({});
      expect(profile.activities).toEqual({});
      expect(profile.awards).toEqual({});
      expect(profile.personality).toEqual({});
    });
  });

  describe('runIntelligenceOracles', () => {
    it('should return typed oracle results object', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();
      const oracleResults = agent.runIntelligenceOracles(profile);

      expect(oracleResults).toBeDefined();
      expect(typeof oracleResults).toBe('object');
    });

    it('should return empty object for stub implementation', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();
      const oracleResults = agent.runIntelligenceOracles(profile);

      expect(oracleResults).toEqual({});
    });
  });

  describe('generateNarrativeBlocks', () => {
    it('should return typed narrative object', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();
      const oracleResults = agent.runIntelligenceOracles(profile);
      const narrative = agent.generateNarrativeBlocks(profile, oracleResults);

      expect(narrative).toBeDefined();
      expect(narrative).toHaveProperty('themes');
      expect(narrative).toHaveProperty('identityThread');
      expect(narrative).toHaveProperty('positioning');
    });

    it('should return correct types for stub implementation', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();
      const oracleResults = agent.runIntelligenceOracles(profile);
      const narrative = agent.generateNarrativeBlocks(profile, oracleResults);

      expect(Array.isArray(narrative.themes)).toBe(true);
      expect(typeof narrative.identityThread).toBe('string');
      expect(typeof narrative.positioning).toBe('string');
      expect(narrative.themes).toEqual([]);
      expect(narrative.identityThread).toBe('');
      expect(narrative.positioning).toBe('');
    });
  });

  describe('generateStrategyBlocks', () => {
    it('should return typed strategy object', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();
      const oracleResults = agent.runIntelligenceOracles(profile);
      const narrative = agent.generateNarrativeBlocks(profile, oracleResults);
      const strategy = agent.generateStrategyBlocks(profile, oracleResults, narrative);

      expect(strategy).toBeDefined();
      expect(strategy).toHaveProperty('12MonthPlan');
      expect(strategy).toHaveProperty('summerPlanning');
      expect(strategy).toHaveProperty('awardsTargets');
    });

    it('should return correct types for stub implementation', () => {
      const agent = new AssessmentAgent(mockInput);
      const profile = agent.extractProfile();
      const oracleResults = agent.runIntelligenceOracles(profile);
      const narrative = agent.generateNarrativeBlocks(profile, oracleResults);
      const strategy = agent.generateStrategyBlocks(profile, oracleResults, narrative);

      expect(Array.isArray(strategy['12MonthPlan'])).toBe(true);
      expect(Array.isArray(strategy.summerPlanning)).toBe(true);
      expect(Array.isArray(strategy.awardsTargets)).toBe(true);
      expect(strategy['12MonthPlan']).toEqual([]);
      expect(strategy.summerPlanning).toEqual([]);
      expect(strategy.awardsTargets).toEqual([]);
    });
  });

  describe('full transformation chain', () => {
    it('should execute all steps sequentially without errors', () => {
      const agent = new AssessmentAgent(mockInput);

      expect(() => {
        agent.initialize();
        const profile = agent.extractProfile();
        const oracleResults = agent.runIntelligenceOracles(profile);
        const narrative = agent.generateNarrativeBlocks(profile, oracleResults);
        const strategy = agent.generateStrategyBlocks(profile, oracleResults, narrative);
      }).not.toThrow();
    });
  });
});
