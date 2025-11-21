import { AssessmentAgent } from '../src/AssessmentAgent';
import { AssessmentInput_v1 } from '../../../schema/assessmentInput_v1';
import { extractedProfileSchema_v2, ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';
import { oracleResultsSchema_v2 } from '../../../schema/oracleResults_v2';
import { narrativeBlocksSchema_v2 } from '../../../schema/narrativeBlocks_v2';
import { strategyBlocksSchema_v2 } from '../../../schema/strategyBlocks_v2';
import { assessmentOutputSchema_v2 } from '../../../schema/assessmentOutput_v2';

/**
 * Full Assessment Pipeline Integration Test
 * Tests the complete end-to-end flow: extractProfile -> oracles -> narrative -> strategy -> output
 */

describe('Full Assessment Pipeline', () => {
  let mockInput: AssessmentInput_v1;
  let mockProfile: ExtractedProfile_v2;

  beforeEach(() => {
    mockInput = {
      studentId: 'test-student-full-pipeline',
      transcriptText: 'Student loves biology and community service. Strong academic record with AP courses.',
      rawMessages: [
        { role: 'user', content: 'Tell me about your interests' },
        { role: 'assistant', content: 'I love biology and helping my community' },
      ],
      contextDocuments: [],
      existingStudentProfile: null,
    };

    // Full mock profile for testing
    mockProfile = {
      academics: {
        gpa: { weighted: 4.3, unweighted: 3.85 },
        courseLoad: [
          { name: 'AP Biology', rigorLevel: 'AP', subject: 'Science', grade: 'A' },
          { name: 'AP Calculus AB', rigorLevel: 'AP', subject: 'Mathematics', grade: 'A-' },
          { name: 'Honors English', rigorLevel: 'Honors', subject: 'English', grade: 'B+' },
        ],
        testScores: { sat: 1480, act: null, apScores: [{ subject: 'Biology', score: 5 }] },
        academicInterests: ['Biology', 'Environmental Science'],
        plannedCourses: ['AP Environmental Science', 'AP Statistics'],
        rigorGaps: [],
      },
      activities: [
        {
          name: 'Environmental Club President',
          type: 'Club',
          role: 'President',
          hoursPerWeek: 6,
          yearsInvolved: 3,
          leadership: true,
          depthSignals: ['Led 5 community cleanups', 'Recruited 30+ members'],
          outcomes: ['Raised $2000 for local conservation'],
        },
        {
          name: 'Community Tutor',
          type: 'Volunteering',
          role: 'Tutor',
          hoursPerWeek: 4,
          yearsInvolved: 2,
          leadership: false,
          depthSignals: ['Consistent weekly commitment'],
          outcomes: ['Tutored 20 students in biology'],
        },
      ],
      awards: [
        { level: 'State', name: 'State Science Fair 2nd Place', year: 11, description: 'Environmental research' },
      ],
      personality: {
        coreValues: ['Environmental stewardship', 'Community service', 'Academic excellence'],
        identityThreads: ['Environmental advocate', 'Science educator'],
        passions: ['Environmental conservation', 'Biology education'],
        communicationStyle: 'Enthusiastic and clear',
        emotionalIntelligence: 'High',
        growthMindset: 'Strong',
        resilience: 'High',
        creativity: 'Medium',
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
        thematicHubs: ['Environmental Science Leadership', 'Community Education', 'Biology Research'],
        flagshipNarrative: 'Environmental advocate leveraging science to educate and mobilize community',
        admissionsPositioning: 'Service-oriented STEM leader with environmental focus',
      },
    };
  });

  it('should run complete pipeline from profile to final output', async () => {
    const agent = new AssessmentAgent(mockInput);
    agent.initialize();

    // Manually set extracted profile to bypass LLM call
    (agent as any).state.extractedProfile = mockProfile;

    // Step 1: Run oracles
    const oracles = await agent.runIntelligenceOracles();
    expect(oracleResultsSchema_v2.safeParse(oracles).success).toBe(true);
    expect(oracles.aptitude).toBeDefined();
    expect(oracles.passion).toBeDefined();
    expect(oracles.service).toBeDefined();

    // Step 2: Generate narrative blocks
    const narrative = agent.generateNarrativeBlocks(mockProfile, oracles);
    expect(narrativeBlocksSchema_v2.safeParse(narrative).success).toBe(true);
    expect(narrative.thematicHubs).toHaveLength(3);
    expect(narrative.flagshipNarrative).toBeTruthy();
    expect(narrative.positioning).toBeTruthy();

    // Step 3: Generate strategy blocks
    const strategy = agent.generateStrategyBlocks(mockProfile, oracles, narrative);
    expect(strategyBlocksSchema_v2.safeParse(strategy).success).toBe(true);
    expect(strategy.twelveMonthPlan).toHaveLength(12);
    expect(strategy.summerPlanning).toHaveLength(3);
    expect(strategy.awardsTargets.length).toBeGreaterThan(0);

    // Step 4: Build output
    const output = agent.buildOutput();
    expect(assessmentOutputSchema_v2.safeParse(output).success).toBe(true);
    expect(output.profile).toEqual(mockProfile);
    expect(output.oracles).toEqual(oracles);
    expect(output.narrative).toEqual(narrative);
    expect(output.strategy).toEqual(strategy);
    expect(output.metadata.modelVersion).toBe('2.0.0');
    expect(output.metadata.agentVersion).toBe('3.0.0');
  });

  it('should validate all intermediate outputs with Zod schemas', async () => {
    const agent = new AssessmentAgent(mockInput);
    agent.initialize();
    (agent as any).state.extractedProfile = mockProfile;

    const oracles = await agent.runIntelligenceOracles();
    const oraclesValidation = oracleResultsSchema_v2.safeParse(oracles);
    expect(oraclesValidation.success).toBe(true);

    const narrative = agent.generateNarrativeBlocks(mockProfile, oracles);
    const narrativeValidation = narrativeBlocksSchema_v2.safeParse(narrative);
    expect(narrativeValidation.success).toBe(true);

    const strategy = agent.generateStrategyBlocks(mockProfile, oracles, narrative);
    const strategyValidation = strategyBlocksSchema_v2.safeParse(strategy);
    expect(strategyValidation.success).toBe(true);

    const output = agent.buildOutput();
    const outputValidation = assessmentOutputSchema_v2.safeParse(output);
    expect(outputValidation.success).toBe(true);
  });

  it('should maintain consistent state throughout pipeline', async () => {
    const agent = new AssessmentAgent(mockInput);
    agent.initialize();
    (agent as any).state.extractedProfile = mockProfile;

    // Check state after oracles
    await agent.runIntelligenceOracles();
    expect((agent as any).state.step).toBe('oracles');
    expect((agent as any).state.oracleResults).toBeDefined();

    // Check state after narrative
    agent.generateNarrativeBlocks(mockProfile, (agent as any).state.oracleResults);
    expect((agent as any).state.step).toBe('narrative');
    expect((agent as any).state.narrativeBlocks).toBeDefined();

    // Check state after strategy
    agent.generateStrategyBlocks(
      mockProfile,
      (agent as any).state.oracleResults,
      (agent as any).state.narrativeBlocks
    );
    expect((agent as any).state.step).toBe('strategy');
    expect((agent as any).state.strategyBlocks).toBeDefined();

    // Check state after output
    agent.buildOutput();
    expect((agent as any).state.step).toBe('output');
    expect((agent as any).state.output).toBeDefined();
  });

  it('should throw error if buildOutput called before completing pipeline', () => {
    const agent = new AssessmentAgent(mockInput);
    agent.initialize();

    // Try to build output without running pipeline
    expect(() => agent.buildOutput()).toThrow('Cannot build output: extractedProfile is missing');
  });

  it('should generate 12 monthly plans with valid structure', async () => {
    const agent = new AssessmentAgent(mockInput);
    agent.initialize();
    (agent as any).state.extractedProfile = mockProfile;

    const oracles = await agent.runIntelligenceOracles();
    const narrative = agent.generateNarrativeBlocks(mockProfile, oracles);
    const strategy = agent.generateStrategyBlocks(mockProfile, oracles, narrative);

    expect(strategy.twelveMonthPlan).toHaveLength(12);
    strategy.twelveMonthPlan.forEach((monthPlan, idx) => {
      expect(monthPlan.month).toBe(`Month ${idx + 1}`);
      expect(Array.isArray(monthPlan.priorities)).toBe(true);
      expect(Array.isArray(monthPlan.tasks)).toBe(true);
      expect(Array.isArray(monthPlan.risks)).toBe(true);
    });
  });

  it('should generate 3 summer scenarios (baseline, stretch, moonshot)', async () => {
    const agent = new AssessmentAgent(mockInput);
    agent.initialize();
    (agent as any).state.extractedProfile = mockProfile;

    const oracles = await agent.runIntelligenceOracles();
    const narrative = agent.generateNarrativeBlocks(mockProfile, oracles);
    const strategy = agent.generateStrategyBlocks(mockProfile, oracles, narrative);

    expect(strategy.summerPlanning).toHaveLength(3);
    expect(strategy.summerPlanning[0].scenario).toBe('baseline');
    expect(strategy.summerPlanning[1].scenario).toBe('stretch');
    expect(strategy.summerPlanning[2].scenario).toBe('moonshot');

    strategy.summerPlanning.forEach((scenario) => {
      expect(Array.isArray(scenario.focusAreas)).toBe(true);
      expect(Array.isArray(scenario.commitments)).toBe(true);
      expect(Array.isArray(scenario.risks)).toBe(true);
    });
  });

  it('should generate awards targets with tier and likelihood', async () => {
    const agent = new AssessmentAgent(mockInput);
    agent.initialize();
    (agent as any).state.extractedProfile = mockProfile;

    const oracles = await agent.runIntelligenceOracles();
    const narrative = agent.generateNarrativeBlocks(mockProfile, oracles);
    const strategy = agent.generateStrategyBlocks(mockProfile, oracles, narrative);

    expect(strategy.awardsTargets.length).toBeGreaterThan(0);
    strategy.awardsTargets.forEach((target) => {
      expect(target.name).toBeTruthy();
      expect(['school', 'local', 'state', 'national', 'international']).toContain(target.tier);
      expect(['low', 'medium', 'high']).toContain(target.likelihood);
      expect(target.rationale).toBeTruthy();
    });
  });

  it('should produce deterministic results for same input', async () => {
    const agent1 = new AssessmentAgent(mockInput);
    agent1.initialize();
    (agent1 as any).state.extractedProfile = mockProfile;

    const agent2 = new AssessmentAgent(mockInput);
    agent2.initialize();
    (agent2 as any).state.extractedProfile = mockProfile;

    // Run full pipeline twice
    await agent1.runIntelligenceOracles();
    agent1.generateNarrativeBlocks(mockProfile, (agent1 as any).state.oracleResults);
    agent1.generateStrategyBlocks(
      mockProfile,
      (agent1 as any).state.oracleResults,
      (agent1 as any).state.narrativeBlocks
    );
    const output1 = agent1.buildOutput();

    await agent2.runIntelligenceOracles();
    agent2.generateNarrativeBlocks(mockProfile, (agent2 as any).state.oracleResults);
    agent2.generateStrategyBlocks(
      mockProfile,
      (agent2 as any).state.oracleResults,
      (agent2 as any).state.narrativeBlocks
    );
    const output2 = agent2.buildOutput();

    // Results should be identical except for generatedAt timestamp
    expect(output1.profile).toEqual(output2.profile);
    expect(output1.oracles).toEqual(output2.oracles);
    expect(output1.narrative).toEqual(output2.narrative);
    expect(output1.strategy).toEqual(output2.strategy);
  });
});
