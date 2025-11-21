import { buildRenderModel_v1 } from '../renderModel_v1';
import { RenderModel_v1 } from '../renderModel_v1.types';
import { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';
import { OracleResults_v2 } from '../../../schema/oracleResults_v2';
import { NarrativeBlocks_v2 } from '../../../schema/narrativeBlocks_v2';
import { StrategyBlocks_v2 } from '../../../schema/strategyBlocks_v2';

describe('RenderModel_v1 Builder', () => {
  let mockProfile: ExtractedProfile_v2;
  let mockOracles: OracleResults_v2;
  let mockNarrative: NarrativeBlocks_v2;
  let mockStrategy: StrategyBlocks_v2;

  beforeEach(() => {
    mockProfile = {
      academics: {
        gpa: { weighted: 4.3, unweighted: 3.9 },
        courseLoad: [
          { name: 'AP Calculus AB', rigorLevel: 'AP', subject: 'Math', grade: 'A' },
          { name: 'AP Physics 1', rigorLevel: 'AP', subject: 'Science', grade: 'A-' },
          { name: 'Honors English', rigorLevel: 'Honors', subject: 'English', grade: 'B+' },
        ],
        testScores: { sat: 1500, act: null, apScores: [{ subject: 'Calculus AB', score: 5 }] },
        academicInterests: ['STEM', 'Engineering'],
        plannedCourses: ['AP Physics C', 'AP Statistics'],
        rigorGaps: [],
      },
      activities: [],
      awards: [],
      personality: {
        coreValues: ['Excellence', 'Innovation'],
        identityThreads: ['STEM leader'],
        passions: ['Mathematics', 'Physics'],
        communicationStyle: 'Clear',
        emotionalIntelligence: 'High',
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
        thematicHubs: ['STEM Excellence', 'Academic Leadership', 'Innovation'],
        flagshipNarrative: 'Future engineer driving innovation through mathematics',
        admissionsPositioning: 'High-aptitude STEM specialist',
      },
    };

    mockOracles = {
      aptitude: {
        score: 85,
        evidence: ['3 AP courses'],
        rationale: 'Strong academic rigor',
      },
      passion: {
        score: 75,
        evidence: ['Leadership activities'],
        rationale: 'Clear passion signals',
      },
      service: {
        score: 65,
        evidence: ['Volunteering'],
        rationale: 'Moderate service commitment',
      },
    };

    mockNarrative = {
      thematicHubs: ['STEM Excellence', 'Academic Leadership', 'Innovation'],
      flagshipNarrative: 'Future engineer driving innovation through mathematics',
      positioning: 'High-aptitude STEM specialist with research potential',
      identityThread: 'Excellence-driven STEM advocate',
      risks: ['Limited extracurricular depth'],
      opportunities: ['Summer research could strengthen profile'],
    };

    mockStrategy = {
      twelveMonthPlan: Array.from({ length: 12 }).map((_, idx) => ({
        month: `Month ${idx + 1}`,
        priorities: ['Increase AP rigor', 'Deepen STEM theme'],
        tasks: ['Weekly tracking', 'Monthly reflection'],
        risks: [],
      })),
      summerPlanning: [
        {
          scenario: 'baseline' as const,
          focusAreas: ['STEM Excellence'],
          commitments: ['Local internship', '10 hrs/week'],
          risks: ['Limited impact'],
        },
        {
          scenario: 'stretch' as const,
          focusAreas: ['Academic Leadership'],
          commitments: ['University research program', 'Leadership role'],
          risks: ['Time management'],
        },
        {
          scenario: 'moonshot' as const,
          focusAreas: ['Innovation'],
          commitments: ['Major research project', 'Publication attempt'],
          risks: ['High difficulty'],
        },
      ],
      awardsTargets: [
        {
          name: 'AIME Qualifier',
          tier: 'national' as const,
          likelihood: 'medium' as const,
          rationale: 'Strong math background',
        },
      ],
    };
  });

  it('should build a correct render model from complete inputs', () => {
    const output = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(output.studentName).toBe('Aarav Sharma');
    expect(output.academics.gpaWeighted).toBe(4.3);
    expect(output.academics.gpaUnweighted).toBe(3.9);
    expect(output.academics.rigorLevel).toBe('Basic'); // 2 AP courses
    expect(output.academics.plannedAPs).toBe(2); // AP Physics C, AP Statistics
  });

  it('should correctly calculate oracle composite score', () => {
    const output = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    // (85 + 75 + 65) / 3 = 75
    expect(output.oracles.composite).toBe(75);
    expect(output.oracles.aptitude).toBe(85);
    expect(output.oracles.passion).toBe(75);
    expect(output.oracles.service).toBe(65);
  });

  it('should preserve narrative content without modification', () => {
    const output = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(output.narrative.flagship).toBe('Future engineer driving innovation through mathematics');
    expect(output.narrative.positioning).toBe('High-aptitude STEM specialist with research potential');
    expect(output.narrative.themes).toEqual(['STEM Excellence', 'Academic Leadership', 'Innovation']);
    expect(output.narrative.risks).toEqual(['Limited extracurricular depth']);
    expect(output.narrative.opportunities).toEqual(['Summer research could strengthen profile']);
  });

  it('should generate exactly 12 monthly plans', () => {
    const output = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(output.strategy.months).toHaveLength(12);
    expect(output.strategy.months[0].month).toBe('Month 1');
    expect(output.strategy.months[11].month).toBe('Month 12');

    output.strategy.months.forEach((month, idx) => {
      expect(month.month).toBe(`Month ${idx + 1}`);
      expect(typeof month.focus).toBe('string');
    });
  });

  it('should generate exactly 3 summer scenarios (baseline, stretch, moonshot)', () => {
    const output = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(output.strategy.summer.baseline).toBeTruthy();
    expect(output.strategy.summer.stretch).toBeTruthy();
    expect(output.strategy.summer.moonshot).toBeTruthy();
  });

  it('should copy awards targets without modification', () => {
    const output = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(output.strategy.awardsTargets).toHaveLength(1);
    expect(output.strategy.awardsTargets[0].name).toBe('AIME Qualifier');
    expect(output.strategy.awardsTargets[0].tier).toBe('national');
    expect(output.strategy.awardsTargets[0].likelihood).toBe('medium');
  });

  it('should handle missing optional fields gracefully', () => {
    const minimalProfile = {
      ...mockProfile,
      academics: {
        ...mockProfile.academics,
        gpa: { weighted: null, unweighted: null },
        testScores: { sat: null, act: null, apScores: [] },
      },
    };

    const output = buildRenderModel_v1({
      studentName: 'Test Student',
      profile: minimalProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(output.academics.gpaWeighted).toBeNull();
    expect(output.academics.gpaUnweighted).toBeNull();
    expect(output.academics.testScoresSummary).toBeNull();
  });

  it('should generate a valid ISO timestamp for lastUpdated', () => {
    const output = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(output.lastUpdated).toBeTruthy();
    expect(() => new Date(output.lastUpdated)).not.toThrow();
    expect(new Date(output.lastUpdated).toISOString()).toBe(output.lastUpdated);
  });

  it('should produce deterministic results for same input', () => {
    const output1 = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    // Wait 1ms to ensure different timestamps
    const now1 = output1.lastUpdated;

    const output2 = buildRenderModel_v1({
      studentName: 'Aarav Sharma',
      profile: mockProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    // All fields except lastUpdated should be identical
    expect(output1.studentName).toBe(output2.studentName);
    expect(output1.academics).toEqual(output2.academics);
    expect(output1.oracles).toEqual(output2.oracles);
    expect(output1.narrative).toEqual(output2.narrative);
    expect(output1.strategy).toEqual(output2.strategy);
  });

  it('should categorize rigor levels correctly', () => {
    // Test Very High (10+ AP)
    const veryHighProfile = {
      ...mockProfile,
      academics: {
        ...mockProfile.academics,
        courseLoad: Array(12)
          .fill(null)
          .map((_, i) => ({
            name: `AP Course ${i}`,
            rigorLevel: 'AP' as const,
            subject: 'Science',
            grade: 'A',
          })),
      },
    };

    const veryHighOutput = buildRenderModel_v1({
      studentName: 'Test',
      profile: veryHighProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(veryHighOutput.academics.rigorLevel).toBe('Very High');

    // Test High (6-9 AP)
    const highProfile = {
      ...mockProfile,
      academics: {
        ...mockProfile.academics,
        courseLoad: Array(7)
          .fill(null)
          .map((_, i) => ({
            name: `AP Course ${i}`,
            rigorLevel: 'AP' as const,
            subject: 'Science',
            grade: 'A',
          })),
      },
    };

    const highOutput = buildRenderModel_v1({
      studentName: 'Test',
      profile: highProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(highOutput.academics.rigorLevel).toBe('High');

    // Test Moderate (3-5 AP)
    const moderateProfile = {
      ...mockProfile,
      academics: {
        ...mockProfile.academics,
        courseLoad: Array(4)
          .fill(null)
          .map((_, i) => ({
            name: `AP Course ${i}`,
            rigorLevel: 'AP' as const,
            subject: 'Science',
            grade: 'A',
          })),
      },
    };

    const moderateOutput = buildRenderModel_v1({
      studentName: 'Test',
      profile: moderateProfile,
      oracles: mockOracles,
      narrative: mockNarrative,
      strategy: mockStrategy,
    });

    expect(moderateOutput.academics.rigorLevel).toBe('Moderate');
  });
});
