/**
 * Assessment Output to UI Render Model Adapter
 * 
 * Converts AssessmentOutput_v2 (agent output) into RenderModel_v1 (UI-friendly format)
 * This is the critical bridge between backend agent and frontend components
 */

import type { AssessmentOutput_v2 } from '../schema/assessmentOutput_v2';
import type { RenderModel_v1, NarrativeBlock, StrategyBlock, ScoresBlock, ScoreDimension, AcademicsSummary, SummerPlan, AwardTarget } from '../ui-assessment/types';

/**
 * Convert AssessmentOutput_v2 to RenderModel_v1
 * 
 * @param output - Full assessment output from AssessmentAgent
 * @param sessionId - Session identifier
 * @param studentName - Optional student name for metadata
 * @returns UI-ready render model
 */
export function convertToRenderModel(
  output: AssessmentOutput_v2,
  sessionId: string,
  studentName?: string
): RenderModel_v1 {
  return {
    sessionId,
    stage: 'completed', // Hardcoded for now, can be made dynamic
    narrative: convertNarrativeBlocks(output),
    strategy: convertStrategyBlocks(output),
    scores: convertScores(output),
    academics: convertAcademics(output),
    summerPlans: convertSummerPlans(output),
    awardsTargets: convertAwardsTargets(output),
    metadata: {
      studentName,
      coachName: 'Jenny Duan',
      sessionDate: output.metadata.generatedAt,
      version: output.metadata.modelVersion,
    },
  };
}

/**
 * Convert narrative blocks to UI format
 */
function convertNarrativeBlocks(output: AssessmentOutput_v2): NarrativeBlock[] {
  const narratives: NarrativeBlock[] = [];

  if (!output.narrative) return narratives;

  const {
    flagshipNarrative,
    thematicHubs = [],
    identityThread,
    positioning,
    opportunities = [],
    risks = [],
  } = output.narrative;

  // Add flagship narrative as main insight
  if (flagshipNarrative) {
    narratives.push({
      id: 'narr-flagship',
      type: 'insight',
      text: flagshipNarrative,
      confidence: 0.95,
    });
  }

  // Add thematic hubs as observations
  thematicHubs.forEach((hub, idx) => {
    narratives.push({
      id: `narr-hub-${idx}`,
      type: 'observation',
      text: hub,
      confidence: 0.85,
    });
  });

  // Add identity thread as validation
  if (identityThread) {
    narratives.push({
      id: 'narr-identity',
      type: 'validation',
      text: identityThread,
      confidence: 0.90,
    });
  }

  // Add positioning statement as insight
  if (positioning) {
    narratives.push({
      id: 'narr-positioning',
      type: 'insight',
      text: positioning,
      confidence: 0.88,
    });
  }

  // Add opportunities as validations
  opportunities.forEach((opp, idx) => {
    narratives.push({
      id: `narr-opp-${idx}`,
      type: 'validation',
      text: opp,
      confidence: 0.80,
    });
  });

  // Add risks as concerns
  risks.forEach((risk, idx) => {
    narratives.push({
      id: `narr-risk-${idx}`,
      type: 'concern',
      text: risk,
      confidence: 0.82,
    });
  });

  return narratives;
}

/**
 * Convert strategy blocks to UI format
 */
function convertStrategyBlocks(output: AssessmentOutput_v2): StrategyBlock[] {
  const strategies: StrategyBlock[] = [];

  if (!output.strategy) return strategies;

  const { twelveMonthPlan, summerPlanning, awardsTargets } = output.strategy;

  // Convert 12-month plan to timeline-based strategies
  twelveMonthPlan.forEach((monthPlan, idx) => {
    const timeline: 'immediate' | 'short-term' | 'long-term' =
      idx < 2 ? 'immediate' : idx < 6 ? 'short-term' : 'long-term';

    // Create strategy for this month's priorities
    monthPlan.priorities.forEach((priority, pIdx) => {
      strategies.push({
        id: `strat-month-${idx}-${pIdx}`,
        title: priority,
        description: `Focus area for ${monthPlan.month}`,
        priority: monthPlan.risks.length > 0 ? 'high' : 'medium',
        timeline,
        category: 'academics', // Default, can be inferred from priority text
        actionSteps: monthPlan.tasks,
        relatedNarratives: [],
      });
    });
  });

  // Convert summer planning to summer-specific strategies
  summerPlanning.forEach((plan, idx) => {
    strategies.push({
      id: `strat-summer-${idx}`,
      title: `${plan.scenario.charAt(0).toUpperCase() + plan.scenario.slice(1)} Summer Plan`,
      description: `Summer ${plan.scenario} scenario focusing on: ${plan.focusAreas.join(', ')}`,
      priority: plan.scenario === 'moonshot' ? 'high' : plan.scenario === 'stretch' ? 'medium' : 'low',
      timeline: 'short-term',
      category: 'extracurriculars',
      actionSteps: plan.commitments,
      relatedNarratives: [],
    });
  });

  // Convert awards targets to strategy blocks
  awardsTargets.forEach((award, idx) => {
    const priority = award.tier === 'national' || award.tier === 'international' ? 'high' :
                     award.tier === 'state' ? 'medium' : 'low';

    strategies.push({
      id: `strat-award-${idx}`,
      title: `Target: ${award.name}`,
      description: award.rationale,
      priority,
      timeline: 'long-term',
      category: 'admissions',
      actionSteps: [award.rationale], // Use rationale as action step
      relatedNarratives: [],
    });
  });

  return strategies;
}

/**
 * Convert oracle results to score blocks
 */
function convertScores(output: AssessmentOutput_v2): ScoresBlock {
  const { oracles, profile } = output;

  // Calculate overall score as weighted average of oracle scores
  const aptitudeScore = oracles.aptitude?.score || 0;
  const passionScore = oracles.passion?.score || 0;
  const serviceScore = oracles.service?.score || 0;

  const overallScore = Math.round((aptitudeScore + passionScore + serviceScore) / 3);

  // Calculate academic score from profile
  const academicScore = calculateAcademicScore(profile);

  // Calculate EC score from oracles
  const ecScore = Math.round((passionScore + serviceScore) / 2);

  // Personal growth score (based on archetype and EQ)
  const personalGrowthScore = 75; // Can be enhanced with more data

  // College readiness (composite of all factors)
  const collegeReadinessScore = Math.round((overallScore + academicScore) / 2);

  return {
    overall: {
      score: overallScore,
      label: 'Overall Readiness',
      description: `Composite college readiness score across all dimensions`,
      trend: 'improving',
      insights: [
        `Strong foundation with ${aptitudeScore}% aptitude`,
        `${passionScore}% passion alignment`,
        `${serviceScore}% service impact`,
      ],
    },
    academics: {
      score: academicScore,
      label: 'Academic Profile',
      description: `GPA, course rigor, and test scores`,
      trend: 'stable',
      insights: extractAcademicInsights(profile),
    },
    extracurriculars: {
      score: ecScore,
      label: 'Extracurricular Profile',
      description: `Depth, leadership, and impact of activities`,
      trend: 'improving',
      insights: oracles.passion?.evidence.slice(0, 3) || [],
    },
    personalGrowth: {
      score: personalGrowthScore,
      label: 'Personal Development',
      description: `Self-awareness, resilience, and growth mindset`,
      trend: 'stable',
      insights: [
        'Strong self-awareness demonstrated',
        'Growth-oriented mindset',
      ],
    },
    collegeReadiness: {
      score: collegeReadinessScore,
      label: 'College Application Readiness',
      description: `Strategy execution and positioning`,
      trend: 'improving',
      insights: [
        'Clear academic trajectory',
        'Developing unique positioning',
      ],
    },
  };
}

/**
 * Calculate academic score from profile
 */
function calculateAcademicScore(profile: any): number {
  // Simple heuristic - can be enhanced
  const gpaScore = (profile.academics?.gpa?.weighted || 3.5) / 4.0 * 100;
  const rigorBonus = profile.academics?.courseLoad?.length >= 6 ? 10 : 0;
  return Math.min(Math.round(gpaScore + rigorBonus), 100);
}

/**
 * Extract academic insights from profile
 */
function extractAcademicInsights(profile: any): string[] {
  const insights: string[] = [];

  if (profile.academics?.gradeLevel) {
    insights.push(`Grade ${profile.academics.gradeLevel} student`);
  }

  if (profile.academics?.courseLoad) {
    insights.push(`Taking ${profile.academics.courseLoad.length} courses`);
  }

  if (profile.academics?.academicInterests?.length > 0) {
    insights.push(`Interested in: ${profile.academics.academicInterests.slice(0, 2).join(', ')}`);
  }

  return insights;
}

/**
 * Convert academics to UI summary
 */
function convertAcademics(output: AssessmentOutput_v2): AcademicsSummary {
  const { profile } = output;
  const academics = profile.academics;

  return {
    gpa: academics.gpa?.unweighted?.toString(),
    gpaWeighted: academics.gpa?.weighted?.toString(),
    testScores: {
      sat: academics.testScores?.sat,
      act: academics.testScores?.act,
      ap: academics.testScores?.apScores?.map(s => `${s.subject}: ${s.score}`).join(', '),
    },
    courseRigor: inferCourseRigor(academics),
    classRank: undefined, // Not in schema
    academicInterests: academics.academicInterests || [],
    strengths: extractStrengths(profile, output.oracles),
    areasForGrowth: extractGrowthAreas(profile, output.oracles),
  };
}

/**
 * Infer course rigor level
 */
function inferCourseRigor(academics: any): 'most-rigorous' | 'very-rigorous' | 'rigorous' | 'moderate' {
  const apCount = academics.courseLoad?.filter((c: any) => c.rigorLevel === 'AP').length || 0;

  if (apCount >= 5) return 'most-rigorous';
  if (apCount >= 3) return 'very-rigorous';
  if (apCount >= 1) return 'rigorous';
  return 'moderate';
}

/**
 * Extract strengths from profile and oracles
 */
function extractStrengths(profile: any, oracles: any): string[] {
  const strengths: string[] = [];

  if (oracles.aptitude?.score > 80) {
    strengths.push('Strong academic aptitude');
  }

  if (oracles.passion?.score > 80) {
    strengths.push('Clear passion and engagement');
  }

  if (profile.leadership?.roles?.length > 0) {
    strengths.push('Leadership experience');
  }

  return strengths;
}

/**
 * Extract growth areas from profile and oracles
 */
function extractGrowthAreas(profile: any, oracles: any): string[] {
  const areas: string[] = [];

  if (oracles.aptitude?.score < 70) {
    areas.push('Academic performance needs attention');
  }

  if (profile.extracurriculars?.length < 3) {
    areas.push('Expand extracurricular involvement');
  }

  if (!profile.leadership?.roles || profile.leadership.roles.length === 0) {
    areas.push('Develop leadership roles');
  }

  return areas;
}

/**
 * Convert summer planning to UI format
 */
function convertSummerPlans(output: AssessmentOutput_v2): SummerPlan[] {
  if (!output.strategy?.summerPlanning) return [];

  return output.strategy.summerPlanning.map((plan, idx): SummerPlan => ({
    id: `summer-${idx}`,
    title: `${plan.scenario[0].toUpperCase() + plan.scenario.slice(1)} Summer Plan`,
    description: `Focus areas: ${plan.focusAreas.join(', ')}`,
    type: 'program',
    duration: '6–8 weeks',
    competitiveness:
      plan.scenario === 'moonshot'
        ? 'highly-selective'
        : plan.scenario === 'stretch'
        ? 'selective'
        : 'open',
    benefits: plan.commitments,
  }));
}

/**
 * Convert awards targets to UI format
 */
function convertAwardsTargets(output: AssessmentOutput_v2): AwardTarget[] {
  if (!output.strategy?.awardsTargets) return [];

  return output.strategy.awardsTargets.map((award, idx): AwardTarget => {
    const competitiveness: AwardTarget['competitiveness'] =
      award.tier === 'international' || award.tier === 'national'
        ? 'highly-selective'
        : award.tier === 'state'
        ? 'selective'
        : 'achievable';

    return {
      id: `award-${idx}`,
      name: award.name,
      description: award.rationale,
      category: 'academic', // We do NOT have structured categories yet
      competitiveness,
      requirements: [award.rationale],
      whyRecommended: award.rationale,
      url: undefined,
    };
  });
}
