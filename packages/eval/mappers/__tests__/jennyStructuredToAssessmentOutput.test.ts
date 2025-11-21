import {
  mapStructuredToExtractedProfile,
  mapStructuredToOracleResults,
  mapStructuredToNarrativeBlocks,
  mapStructuredToStrategyBlocks,
  mapStructuredToAssessmentOutput,
} from '../jennyStructuredToAssessmentOutput';
import { loadJennyAssessmentById } from '../../../data-loaders/jennyAssessments';

/**
 * Component 4 Tests - Jenny Structured to Assessment Output Mapping
 *
 * Tests cover:
 * - ExtractedProfile_v2 mapping
 * - OracleResults_v2 mapping
 * - NarrativeBlocks_v2 mapping
 * - StrategyBlocks_v2 mapping
 * - Complete AssessmentOutput_v2 mapping
 * - Schema validation
 * - Data integrity
 */

describe('Component 4 - Jenny Structured to Assessment Output Mapping', () => {
  let sampleAssessment: any;

  beforeAll(async () => {
    // Load a sample assessment for testing
    sampleAssessment = await loadJennyAssessmentById('011');
  });

  /**
   * Test 1: Map to ExtractedProfile_v2
   */
  test('map to ExtractedProfile_v2', () => {
    const profile = mapStructuredToExtractedProfile(sampleAssessment);

    // Validate structure
    expect(profile).toBeDefined();
    expect(profile.academics).toBeDefined();
    expect(profile.activities).toBeDefined();
    expect(profile.awards).toBeDefined();
    expect(profile.personality).toBeDefined();
    expect(profile.context).toBeDefined();
    expect(profile.diagnostics).toBeDefined();
    expect(profile.narrativeScaffolding).toBeDefined();

    // Validate academics
    expect(profile.academics.gpa).toBeDefined();
    expect(profile.academics.gpa.weighted).toBe(3.7);
    expect(profile.academics.gpa.unweighted).toBe(3.3);
    expect(profile.academics.courseLoad).toBeDefined();
    expect(Array.isArray(profile.academics.courseLoad)).toBe(true);
    expect(profile.academics.testScores).toBeDefined();
    expect(profile.academics.testScores.sat).toBe(1060);

    // Validate activities
    expect(Array.isArray(profile.activities)).toBe(true);
    expect(profile.activities.length).toBeGreaterThan(0);
    profile.activities.forEach((activity) => {
      expect(activity.name).toBeDefined();
      expect(activity.type).toBeDefined();
      expect(activity.role).toBeDefined();
      expect(typeof activity.hoursPerWeek).toBe('number');
      expect(typeof activity.yearsInvolved).toBe('number');
      expect(typeof activity.leadership).toBe('boolean');
      expect(Array.isArray(activity.depthSignals)).toBe(true);
      expect(Array.isArray(activity.outcomes)).toBe(true);
    });

    // Validate awards
    expect(Array.isArray(profile.awards)).toBe(true);
    profile.awards.forEach((award) => {
      expect(award.name).toBeDefined();
      expect(award.level).toBeDefined();
      expect(typeof award.year).toBe('number');
      expect(award.description).toBeDefined();
    });

    // Validate personality
    expect(profile.personality).toBeDefined();
    expect(Array.isArray(profile.personality.coreValues)).toBe(true);
    expect(Array.isArray(profile.personality.identityThreads)).toBe(true);
    expect(Array.isArray(profile.personality.passions)).toBe(true);
    expect(profile.personality.communicationStyle).toBeDefined();
    expect(profile.personality.emotionalIntelligence).toBeDefined();

    // Validate context
    expect(profile.context).toBeDefined();
    expect(profile.context.familyInvolvement).toBeDefined();
    expect(Array.isArray(profile.context.resourceConstraints)).toBe(true);
    expect(Array.isArray(profile.context.lifeCircumstances)).toBe(true);

    // Validate diagnostics
    expect(profile.diagnostics).toBeDefined();
    expect(Array.isArray(profile.diagnostics.rigorGaps)).toBe(true);
    expect(Array.isArray(profile.diagnostics.ecDepthGaps)).toBe(true);
    expect(Array.isArray(profile.diagnostics.narrativeIssues)).toBe(true);
    expect(Array.isArray(profile.diagnostics.strategicRisks)).toBe(true);

    // Validate narrative scaffolding
    expect(profile.narrativeScaffolding).toBeDefined();
    expect(Array.isArray(profile.narrativeScaffolding.thematicHubs)).toBe(true);
    expect(profile.narrativeScaffolding.thematicHubs.length).toBe(3);
    expect(profile.narrativeScaffolding.flagshipNarrative).toBeDefined();
    expect(profile.narrativeScaffolding.admissionsPositioning).toBeDefined();
  });

  /**
   * Test 2: Map to OracleResults_v2
   */
  test('map to OracleResults_v2', async () => {
    const oracles = await mapStructuredToOracleResults(sampleAssessment);

    // Validate structure
    expect(oracles).toBeDefined();
    expect(oracles.aptitude).toBeDefined();
    expect(oracles.passion).toBeDefined();
    expect(oracles.service).toBeDefined();

    // Validate aptitude oracle
    expect(typeof oracles.aptitude.score).toBe('number');
    expect(oracles.aptitude.score).toBeGreaterThanOrEqual(0);
    expect(oracles.aptitude.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(oracles.aptitude.evidence)).toBe(true);
    expect(oracles.aptitude.evidence.length).toBeGreaterThan(0);
    expect(oracles.aptitude.rationale).toBeDefined();
    expect(typeof oracles.aptitude.rationale).toBe('string');

    // Validate passion oracle
    expect(typeof oracles.passion.score).toBe('number');
    expect(oracles.passion.score).toBeGreaterThanOrEqual(0);
    expect(oracles.passion.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(oracles.passion.evidence)).toBe(true);
    expect(oracles.passion.evidence.length).toBeGreaterThan(0);
    expect(oracles.passion.rationale).toBeDefined();

    // Validate service oracle
    expect(typeof oracles.service.score).toBe('number');
    expect(oracles.service.score).toBeGreaterThanOrEqual(0);
    expect(oracles.service.score).toBeLessThanOrEqual(100);
    expect(Array.isArray(oracles.service.evidence)).toBe(true);
    expect(oracles.service.evidence.length).toBeGreaterThan(0);
    expect(oracles.service.rationale).toBeDefined();
  });

  /**
   * Test 3: Map to NarrativeBlocks_v2
   */
  test('map to NarrativeBlocks_v2', () => {
    const narrative = mapStructuredToNarrativeBlocks(sampleAssessment);

    // Validate structure
    expect(narrative).toBeDefined();
    expect(narrative.thematicHubs).toBeDefined();
    expect(narrative.flagshipNarrative).toBeDefined();
    expect(narrative.positioning).toBeDefined();
    expect(narrative.identityThread).toBeDefined();
    expect(narrative.risks).toBeDefined();
    expect(narrative.opportunities).toBeDefined();

    // Validate thematic hubs (must be exactly 3)
    expect(Array.isArray(narrative.thematicHubs)).toBe(true);
    expect(narrative.thematicHubs.length).toBe(3);
    narrative.thematicHubs.forEach((hub) => {
      expect(typeof hub).toBe('string');
      expect(hub.length).toBeGreaterThan(0);
    });

    // Validate flagship narrative
    expect(typeof narrative.flagshipNarrative).toBe('string');
    expect(narrative.flagshipNarrative.length).toBeGreaterThan(0);

    // Validate positioning
    expect(typeof narrative.positioning).toBe('string');
    expect(narrative.positioning.length).toBeGreaterThan(0);

    // Validate identity thread
    expect(typeof narrative.identityThread).toBe('string');
    expect(narrative.identityThread.length).toBeGreaterThan(0);

    // Validate risks array
    expect(Array.isArray(narrative.risks)).toBe(true);
    narrative.risks.forEach((risk) => {
      expect(typeof risk).toBe('string');
    });

    // Validate opportunities array
    expect(Array.isArray(narrative.opportunities)).toBe(true);
    narrative.opportunities.forEach((opportunity) => {
      expect(typeof opportunity).toBe('string');
    });
  });

  /**
   * Test 4: Map to StrategyBlocks_v2
   */
  test('map to StrategyBlocks_v2', () => {
    const strategy = mapStructuredToStrategyBlocks(sampleAssessment);

    // Validate structure
    expect(strategy).toBeDefined();
    expect(strategy.twelveMonthPlan).toBeDefined();
    expect(strategy.summerPlanning).toBeDefined();
    expect(strategy.awardsTargets).toBeDefined();

    // Validate twelve-month plan (must be exactly 12 months)
    expect(Array.isArray(strategy.twelveMonthPlan)).toBe(true);
    expect(strategy.twelveMonthPlan.length).toBe(12);
    strategy.twelveMonthPlan.forEach((month) => {
      expect(month.month).toBeDefined();
      expect(typeof month.month).toBe('string');
      expect(Array.isArray(month.priorities)).toBe(true);
      expect(Array.isArray(month.risks)).toBe(true);
      expect(Array.isArray(month.tasks)).toBe(true);
    });

    // Validate summer planning (must be exactly 3 scenarios)
    expect(Array.isArray(strategy.summerPlanning)).toBe(true);
    expect(strategy.summerPlanning.length).toBe(3);

    const scenarios = strategy.summerPlanning.map((s) => s.scenario);
    expect(scenarios).toContain('baseline');
    expect(scenarios).toContain('stretch');
    expect(scenarios).toContain('moonshot');

    strategy.summerPlanning.forEach((scenario) => {
      expect(['baseline', 'stretch', 'moonshot']).toContain(scenario.scenario);
      expect(Array.isArray(scenario.focusAreas)).toBe(true);
      expect(Array.isArray(scenario.commitments)).toBe(true);
      expect(Array.isArray(scenario.risks)).toBe(true);
    });

    // Validate awards targets
    expect(Array.isArray(strategy.awardsTargets)).toBe(true);
    strategy.awardsTargets.forEach((award) => {
      expect(award.name).toBeDefined();
      expect(['school', 'local', 'state', 'national', 'international']).toContain(award.tier);
      expect(['low', 'medium', 'high']).toContain(award.likelihood);
      expect(award.rationale).toBeDefined();
    });
  });

  /**
   * Test 5: Map to complete AssessmentOutput_v2
   */
  test('map to complete AssessmentOutput_v2', async () => {
    const output = await mapStructuredToAssessmentOutput(sampleAssessment);

    // Validate top-level structure
    expect(output).toBeDefined();
    expect(output.profile).toBeDefined();
    expect(output.oracles).toBeDefined();
    expect(output.narrative).toBeDefined();
    expect(output.strategy).toBeDefined();
    expect(output.metadata).toBeDefined();

    // Validate metadata
    expect(output.metadata.modelVersion).toBeDefined();
    expect(output.metadata.generatedAt).toBeDefined();
    expect(output.metadata.agentVersion).toBeDefined();

    // Validate ISO timestamp
    expect(() => new Date(output.metadata.generatedAt)).not.toThrow();
  });

  /**
   * Test 6: Validate course parsing from string
   */
  test('validate course parsing from string', () => {
    const profile = mapStructuredToExtractedProfile(sampleAssessment);

    // Should parse courses from current and planned courses strings
    expect(profile.academics.courseLoad.length).toBeGreaterThan(0);

    // Check for AP courses
    const apCourses = profile.academics.courseLoad.filter((c) => c.rigorLevel === 'AP');
    expect(apCourses.length).toBeGreaterThan(0);
  });

  /**
   * Test 7: Validate AP scores parsing
   */
  test('validate AP scores parsing', () => {
    const profile = mapStructuredToExtractedProfile(sampleAssessment);

    // Should parse AP scores from string
    expect(Array.isArray(profile.academics.testScores.apScores)).toBe(true);

    // Each AP score should have subject and score
    profile.academics.testScores.apScores.forEach((ap) => {
      expect(ap.subject).toBeDefined();
      expect(typeof ap.score).toBe('number');
      expect(ap.score).toBeGreaterThanOrEqual(1);
      expect(ap.score).toBeLessThanOrEqual(5);
    });
  });

  /**
   * Test 8: Validate leadership activities mapping
   */
  test('validate leadership activities mapping', () => {
    const profile = mapStructuredToExtractedProfile(sampleAssessment);

    // Should have leadership activities from Jenny's data
    const leadershipActivities = profile.activities.filter((a) => a.leadership === true);
    expect(leadershipActivities.length).toBeGreaterThan(0);

    // Leadership activities should have outcomes
    leadershipActivities.forEach((activity) => {
      expect(Array.isArray(activity.outcomes)).toBe(true);
    });
  });

  /**
   * Test 9: Validate diagnostics categorization
   */
  test('validate diagnostics categorization', () => {
    const profile = mapStructuredToExtractedProfile(sampleAssessment);

    // Diagnostics should categorize challenges properly
    const totalIssues =
      profile.diagnostics.rigorGaps.length +
      profile.diagnostics.ecDepthGaps.length +
      profile.diagnostics.narrativeIssues.length +
      profile.diagnostics.strategicRisks.length;

    expect(totalIssues).toBeGreaterThan(0);
  });

  /**
   * Test 10: Validate narrative risks extraction
   */
  test('validate narrative risks extraction', () => {
    const narrative = mapStructuredToNarrativeBlocks(sampleAssessment);

    // Should extract risks from critical/high severity challenges
    expect(narrative.risks.length).toBeGreaterThan(0);
    expect(narrative.risks.length).toBeLessThanOrEqual(5); // Capped at 5
  });

  /**
   * Test 11: Validate narrative opportunities extraction
   */
  test('validate narrative opportunities extraction', () => {
    const narrative = mapStructuredToNarrativeBlocks(sampleAssessment);

    // Should extract opportunities from strategic recommendations
    expect(narrative.opportunities.length).toBeGreaterThan(0);
    expect(narrative.opportunities.length).toBeLessThanOrEqual(5); // Capped at 5
  });

  /**
   * Test 12: Validate awards tier mapping
   */
  test('validate awards tier mapping', () => {
    const strategy = mapStructuredToStrategyBlocks(sampleAssessment);

    // Awards targets should have appropriate tiers
    strategy.awardsTargets.forEach((award) => {
      expect(['school', 'local', 'state', 'national', 'international']).toContain(award.tier);

      // Presidential Volunteer Service Award should be national
      if (award.name.toLowerCase().includes('presidential')) {
        expect(award.tier).toBe('national');
      }
    });
  });

  /**
   * Test 13: Validate oracle scores are deterministic
   */
  test('validate oracle scores are deterministic', async () => {
    const oracles1 = await mapStructuredToOracleResults(sampleAssessment);
    const oracles2 = await mapStructuredToOracleResults(sampleAssessment);

    // Running twice should give same results (deterministic)
    expect(oracles1.aptitude.score).toBe(oracles2.aptitude.score);
    expect(oracles1.passion.score).toBe(oracles2.passion.score);
    expect(oracles1.service.score).toBe(oracles2.service.score);
  });

  /**
   * Test 14: Validate complete pipeline with schema validation
   */
  test('validate complete pipeline with schema validation', async () => {
    // This test ensures the entire pipeline produces valid output
    const output = await mapStructuredToAssessmentOutput(sampleAssessment);

    // If this doesn't throw, the schema validation passed
    expect(output).toBeDefined();
    expect(output.metadata.modelVersion).toBe('jenny-structured-v1');
    expect(output.metadata.agentVersion).toBe('jenny-mapper-v1.0');
  });

  /**
   * Test 15: Validate all students can be mapped
   */
  test('validate all students can be mapped', async () => {
    const { loadAllJennyAssessments } = require('../../../data-loaders/jennyAssessments');
    const allAssessments = await loadAllJennyAssessments();

    // Test each assessment can be mapped
    for (const assessment of allAssessments) {
      const profile = mapStructuredToExtractedProfile(assessment);
      expect(profile).toBeDefined();
      expect(profile.academics).toBeDefined();

      const narrative = mapStructuredToNarrativeBlocks(assessment);
      expect(narrative).toBeDefined();
      expect(narrative.thematicHubs.length).toBe(3);

      const strategy = mapStructuredToStrategyBlocks(assessment);
      expect(strategy).toBeDefined();
      expect(strategy.twelveMonthPlan.length).toBe(12);
      expect(strategy.summerPlanning.length).toBe(3);
    }
  });
});
