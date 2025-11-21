import { JennyAssessmentStructured_v1 } from '../../schema/jennyAssessmentStructured_v1';
import {
  ExtractedProfile_v2,
  Activity,
  Award,
  Course,
} from '../../schema/extractedProfile_v2';
import { OracleResults_v2 } from '../../schema/oracleResults_v2';
import { NarrativeBlocks_v2 } from '../../schema/narrativeBlocks_v2';
import { StrategyBlocks_v2 } from '../../schema/strategyBlocks_v2';
import { AssessmentOutput_v2, assessmentOutputSchema_v2 } from '../../schema/assessmentOutput_v2';
import { runAptitudeOracle } from '../../adapters/v3-intelligence-oracles/aps/aptitude.oracle';
import { runPassionOracle } from '../../adapters/v3-intelligence-oracles/aps/passion.oracle';
import { runServiceOracle } from '../../adapters/v3-intelligence-oracles/aps/service.oracle';

/**
 * Mapping Layer: Jenny Structured Assessments → Canonical v4 Formats
 *
 * Transforms Jenny's structured assessment files into the platform's canonical schemas:
 * - ExtractedProfile_v2
 * - OracleResults_v2
 * - NarrativeBlocks_v2
 * - StrategyBlocks_v2
 * - AssessmentOutput_v2
 *
 * This enables Jenny's coaching DNA to be compatible with the v4 pipeline.
 */

/**
 * Map Jenny's academic standing to ExtractedProfile_v2.academics
 */
function mapAcademics(data: JennyAssessmentStructured_v1): ExtractedProfile_v2['academics'] {
  const { academic_standing } = data.student_profile;

  // Parse courses from string format to Course array
  const courseLoad: Course[] = [];
  const currentCoursesStr = academic_standing.current_courses || '';
  const plannedCoursesStr = academic_standing.planned_senior_courses || '';

  // Extract courses from comma-separated string
  // Example: "AP Biology, Honors Chemistry, Math 3"
  const parseCourses = (coursesStr: string): Course[] => {
    if (!coursesStr) return [];
    return coursesStr.split(',').map((courseStr) => {
      const trimmed = courseStr.trim();
      let rigorLevel: Course['rigorLevel'] = 'Regular';
      let subject = trimmed;
      let name = trimmed;

      if (trimmed.startsWith('AP ')) {
        rigorLevel = 'AP';
        subject = trimmed.substring(3);
      } else if (trimmed.includes('Honors') || trimmed.includes('H')) {
        rigorLevel = 'Honors';
        subject = trimmed.replace(/Honors?|H/g, '').trim();
      } else if (trimmed.startsWith('IB ')) {
        rigorLevel = 'IB';
        subject = trimmed.substring(3);
      }

      return {
        name,
        rigorLevel,
        subject,
        grade: 'N/A', // Not provided in Jenny's format
      };
    });
  };

  courseLoad.push(...parseCourses(currentCoursesStr));
  courseLoad.push(...parseCourses(plannedCoursesStr));

  // Parse AP scores from string
  const apScores: { subject: string; score: number }[] = [];
  const apScoresStr = academic_standing.ap_scores || '';
  // Example format: "AP World History (3), AP Biology (4)"
  const apMatches = apScoresStr.matchAll(/AP\s+([^(]+)\s*\((\d+)\)/g);
  for (const match of apMatches) {
    const subject = match[1].trim();
    const score = parseInt(match[2], 10);
    if (score >= 1 && score <= 5) {
      apScores.push({ subject, score });
    }
  }

  // Extract SAT/ACT scores
  const sat = academic_standing.sat_score || null;
  const act = academic_standing.act_score || null;

  // Extract academic interests from career aspiration and narrative
  const academicInterests: string[] = [];
  if (data.student_profile.career_aspiration?.interests) {
    academicInterests.push(data.student_profile.career_aspiration.interests);
  }

  // Planned courses
  const plannedCourses = plannedCoursesStr.split(',').map((c) => c.trim()).filter(Boolean);

  // Rigor gaps from diagnostics
  const rigorGaps = academic_standing.key_academic_issues || [];

  return {
    gpa: {
      weighted: academic_standing.gpa_weighted,
      unweighted: academic_standing.gpa_unweighted,
    },
    courseLoad,
    testScores: {
      sat,
      act,
      apScores,
    },
    academicInterests,
    plannedCourses,
    rigorGaps,
  };
}

/**
 * Map Jenny's activities to ExtractedProfile_v2.activities
 */
function mapActivities(data: JennyAssessmentStructured_v1): Activity[] {
  const { current_involvement } = data.student_profile;
  const activities: Activity[] = [];

  // Map leadership activities
  if (current_involvement.leadership) {
    for (const leadership of current_involvement.leadership) {
      activities.push({
        name: leadership.organization,
        type: 'Club', // Default type, could be refined
        role: leadership.role,
        hoursPerWeek: leadership.hours_per_week || 5, // Default estimate
        yearsInvolved: leadership.years_involved || 1, // Default estimate
        leadership: true,
        depthSignals: [], // Not explicitly in Jenny's format
        outcomes: leadership.outcomes || [],
      });
    }
  }

  // Map clinical experience
  if (current_involvement.clinical_experience) {
    for (const clinical of current_involvement.clinical_experience) {
      if (clinical.program) {
        activities.push({
          name: clinical.program,
          type: 'Work',
          role: 'Intern',
          hoursPerWeek: 10, // Default estimate
          yearsInvolved: 1, // Default estimate
          leadership: false,
          depthSignals: clinical.skills ? [clinical.skills] : [],
          outcomes: clinical.significance ? [clinical.significance] : [],
        });
      }
    }
  }

  // Map volunteering
  if (current_involvement.volunteering) {
    for (const vol of current_involvement.volunteering.breakdown) {
      activities.push({
        name: vol.activity,
        type: 'Volunteering',
        role: 'Volunteer',
        hoursPerWeek: typeof vol.hours === 'number' ? vol.hours / 52 : 2, // Estimate weekly from total
        yearsInvolved: 1, // Default estimate
        leadership: false,
        depthSignals: [],
        outcomes: [],
      });
    }
  }

  return activities;
}

/**
 * Map Jenny's achievements to ExtractedProfile_v2.awards
 */
function mapAwards(data: JennyAssessmentStructured_v1): Award[] {
  const { current_involvement } = data.student_profile;
  const awards: Award[] = [];

  if (current_involvement.recent_achievements) {
    for (const achievement of current_involvement.recent_achievements) {
      // Parse achievement string to extract level
      let level: Award['level'] = 'School';
      if (achievement.toLowerCase().includes('national')) {
        level = 'National';
      } else if (achievement.toLowerCase().includes('state')) {
        level = 'State';
      } else if (achievement.toLowerCase().includes('local')) {
        level = 'Local';
      }

      awards.push({
        name: achievement,
        level,
        year: new Date().getFullYear(), // Current year as default
        description: achievement,
      });
    }
  }

  return awards;
}

/**
 * Map Jenny's personality and context to ExtractedProfile_v2
 */
function mapPersonalityAndContext(
  data: JennyAssessmentStructured_v1
): {
  personality: ExtractedProfile_v2['personality'];
  context: ExtractedProfile_v2['context'];
} {
  const { career_aspiration, demographics } = data.student_profile;

  const personality: ExtractedProfile_v2['personality'] = {
    coreValues: career_aspiration.interests.split(',').map((i) => i.trim()),
    identityThreads: [demographics.cultural_background],
    passions: career_aspiration.personal_hobbies || [],
    communicationStyle: 'Collaborative and empathetic', // Default based on coaching context
    emotionalIntelligence: 'High', // Inferred from character score
    growthMindset: 'Strong',
    resilience: 'Developing',
    creativity: 'Moderate',
    leadership: 'Emerging',
    empathy: 'High',
  };

  const context: ExtractedProfile_v2['context'] = {
    familyInvolvement: data.session_metadata.family_support_level,
    resourceConstraints: [], // Would need to be extracted from challenges
    lifeCircumstances: [demographics.family_context],
  };

  return { personality, context };
}

/**
 * Map Jenny's diagnostics to ExtractedProfile_v2.diagnostics
 */
function mapDiagnostics(data: JennyAssessmentStructured_v1): ExtractedProfile_v2['diagnostics'] {
  const challenges = Object.values(data.key_challenges).filter((c) => c !== undefined);

  const rigorGaps: string[] = [];
  const ecDepthGaps: string[] = [];
  const narrativeIssues: string[] = [];
  const strategicRisks: string[] = [];

  for (const challenge of challenges) {
    if (!challenge) continue;

    if (challenge.issue.toLowerCase().includes('academic')) {
      rigorGaps.push(challenge.issue);
    } else if (challenge.issue.toLowerCase().includes('leadership') ||
               challenge.issue.toLowerCase().includes('impact') ||
               challenge.issue.toLowerCase().includes('metrics')) {
      ecDepthGaps.push(challenge.issue);
    } else if (challenge.issue.toLowerCase().includes('narrative') ||
               challenge.issue.toLowerCase().includes('differentiation')) {
      narrativeIssues.push(challenge.issue);
    } else {
      strategicRisks.push(challenge.issue);
    }
  }

  return {
    rigorGaps,
    ecDepthGaps,
    narrativeIssues,
    strategicRisks,
  };
}

/**
 * Map Jenny's narrative to ExtractedProfile_v2.narrativeScaffolding
 */
function mapNarrativeScaffolding(
  data: JennyAssessmentStructured_v1
): ExtractedProfile_v2['narrativeScaffolding'] {
  const { narrative_development, strategic_recommendations } = data;

  // Extract thematic hubs from narrative strategy or breakthrough synthesis
  let thematicHubs: [string, string, string] = ['', '', ''];

  if (strategic_recommendations.narrative_strategy.thematic_hubs &&
      strategic_recommendations.narrative_strategy.thematic_hubs.length >= 3) {
    thematicHubs = [
      strategic_recommendations.narrative_strategy.thematic_hubs[0],
      strategic_recommendations.narrative_strategy.thematic_hubs[1],
      strategic_recommendations.narrative_strategy.thematic_hubs[2],
    ];
  } else if (narrative_development?.breakthrough_synthesis?.narrative_arc) {
    // Use first 3 elements of narrative arc as thematic hubs
    const arc = narrative_development.breakthrough_synthesis.narrative_arc;
    thematicHubs = [
      arc[0] || 'Personal Identity',
      arc[1] || 'Academic/Career Journey',
      arc[2] || 'Service & Impact',
    ];
  } else {
    // Default thematic hubs
    thematicHubs = ['Academic Excellence', 'Leadership & Service', 'Personal Growth'];
  }

  const flagshipNarrative =
    narrative_development?.breakthrough_synthesis?.result ||
    strategic_recommendations.narrative_strategy.core_message;

  const admissionsPositioning =
    narrative_development?.breakthrough_synthesis?.positioning ||
    strategic_recommendations.narrative_strategy.core_message;

  return {
    thematicHubs,
    flagshipNarrative,
    admissionsPositioning,
  };
}

/**
 * Map Jenny's structured assessment to ExtractedProfile_v2
 */
export function mapStructuredToExtractedProfile(
  data: JennyAssessmentStructured_v1
): ExtractedProfile_v2 {
  const academics = mapAcademics(data);
  const activities = mapActivities(data);
  const awards = mapAwards(data);
  const { personality, context } = mapPersonalityAndContext(data);
  const diagnostics = mapDiagnostics(data);
  const narrativeScaffolding = mapNarrativeScaffolding(data);

  return {
    academics,
    activities,
    awards,
    personality,
    context,
    diagnostics,
    narrativeScaffolding,
  };
}

/**
 * Map ExtractedProfile_v2 to OracleResults_v2 using deterministic APS oracles
 */
export async function mapStructuredToOracleResults(
  data: JennyAssessmentStructured_v1
): Promise<OracleResults_v2> {
  // First, map to ExtractedProfile_v2
  const profile = mapStructuredToExtractedProfile(data);

  // Run APS oracles
  const aptitude = await runAptitudeOracle(profile);
  const passion = await runPassionOracle(profile);
  const service = await runServiceOracle(profile);

  return {
    aptitude: {
      score: aptitude.score,
      evidence: aptitude.evidence,
      rationale: aptitude.rationale,
    },
    passion: {
      score: passion.score,
      evidence: passion.evidence,
      rationale: passion.rationale,
    },
    service: {
      score: service.score,
      evidence: service.evidence,
      rationale: service.rationale,
    },
  };
}

/**
 * Map Jenny's narrative to NarrativeBlocks_v2
 */
export function mapStructuredToNarrativeBlocks(
  data: JennyAssessmentStructured_v1
): NarrativeBlocks_v2 {
  const { narrative_development, strategic_recommendations } = data;

  // Extract thematic hubs
  let thematicHubs: [string, string, string] = ['', '', ''];

  if (strategic_recommendations.narrative_strategy.thematic_hubs &&
      strategic_recommendations.narrative_strategy.thematic_hubs.length >= 3) {
    thematicHubs = [
      strategic_recommendations.narrative_strategy.thematic_hubs[0],
      strategic_recommendations.narrative_strategy.thematic_hubs[1],
      strategic_recommendations.narrative_strategy.thematic_hubs[2],
    ];
  } else if (narrative_development?.breakthrough_synthesis?.narrative_arc) {
    const arc = narrative_development.breakthrough_synthesis.narrative_arc;
    thematicHubs = [
      arc[0] || 'Personal Identity',
      arc[1] || 'Academic/Career Journey',
      arc[2] || 'Service & Impact',
    ];
  } else {
    thematicHubs = ['Academic Excellence', 'Leadership & Service', 'Personal Growth'];
  }

  const flagshipNarrative =
    narrative_development?.breakthrough_synthesis?.result ||
    strategic_recommendations.narrative_strategy.core_message;

  const positioning =
    narrative_development?.breakthrough_synthesis?.positioning ||
    strategic_recommendations.narrative_strategy.core_message;

  const identityThread =
    data.student_profile.demographics.cultural_background + ' student pursuing ' +
    data.student_profile.career_aspiration.goal;

  // Extract risks from challenges and diagnostics
  const risks: string[] = [];
  const challenges = Object.values(data.key_challenges).filter((c) => c !== undefined);
  for (const challenge of challenges) {
    if (!challenge) continue;
    if (challenge.severity === 'CRITICAL' || challenge.severity === 'HIGH') {
      risks.push(challenge.issue);
    }
  }

  // Extract opportunities from strategic recommendations
  const opportunities: string[] = [];

  // Add signature project as opportunity
  if (strategic_recommendations.extracurricular_strategy.signature_project) {
    opportunities.push(
      `Launch signature project: ${strategic_recommendations.extracurricular_strategy.signature_project.name}`
    );
  }

  // Add awards targets as opportunities
  if (strategic_recommendations.awards_strategy.immediate_applications) {
    opportunities.push(
      `Awards sprint: ${strategic_recommendations.awards_strategy.immediate_applications.length} target applications`
    );
  }

  // Add from differentiation strategies
  if (strategic_recommendations.narrative_strategy.differentiation_from_generic_premed) {
    opportunities.push(...strategic_recommendations.narrative_strategy.differentiation_from_generic_premed);
  }

  return {
    thematicHubs,
    flagshipNarrative,
    positioning,
    identityThread,
    risks: risks.slice(0, 5), // Top 5 risks
    opportunities: opportunities.slice(0, 5), // Top 5 opportunities
  };
}

/**
 * Map Jenny's strategy to StrategyBlocks_v2
 */
export function mapStructuredToStrategyBlocks(
  data: JennyAssessmentStructured_v1
): StrategyBlocks_v2 {
  const { timeline_and_milestones, strategic_recommendations } = data;

  // Create 12-month plan from timeline milestones
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const twelveMonthPlan = monthNames.map((month, index) => {
    // Map timeline sections to months
    let priorities: string[] = [];
    let risks: string[] = [];
    let tasks: string[] = [];

    // Extract from timeline_and_milestones based on season
    if (index >= 4 && index <= 7) { // May-August (Summer)
      const summer = timeline_and_milestones.summer_2025_may_to_august ||
                    timeline_and_milestones.summer_2025;
      if (summer) {
        priorities = summer.priorities || [];
        tasks = summer.priorities || [];
      }
    } else if (index >= 8 && index <= 11) { // September-December (Fall)
      const fall = timeline_and_milestones.fall_2025_august_to_december ||
                  timeline_and_milestones.fall_2025;
      if (fall) {
        priorities = fall.priorities || [];
        tasks = fall.priorities || [];
      }
    } else if (index === 4) { // May specifically
      const may = timeline_and_milestones.immediate_may_2025;
      if (may) {
        priorities = may.priorities || [];
        tasks = may.priorities || [];
      }
    }

    // Extract risks from challenges
    const challenges = Object.values(data.key_challenges).filter((c) => c !== undefined);
    risks = challenges
      .filter((c) => c && (c.severity === 'CRITICAL' || c.severity === 'HIGH'))
      .map((c) => c!.issue)
      .slice(0, 3);

    return {
      month,
      priorities: priorities.slice(0, 5),
      risks: risks.slice(0, 3),
      tasks: tasks.slice(0, 5),
    };
  });

  // Map summer scenarios
  const summerPlanning = [
    {
      scenario: 'baseline' as const,
      focusAreas: strategic_recommendations.academic_strategy.grade_optimization.slice(0, 3),
      commitments: strategic_recommendations.extracurricular_strategy.clinical_experience?.slice(0, 3) || [],
      risks: ['Limited time for new initiatives', 'Academic workload pressure'],
    },
    {
      scenario: 'stretch' as const,
      focusAreas: [
        strategic_recommendations.extracurricular_strategy.signature_project?.name || 'Signature project launch',
        ...(strategic_recommendations.academic_strategy.sat_strategy ? ['SAT intensive prep'] : []),
      ],
      commitments: strategic_recommendations.extracurricular_strategy.healthcare_certifications?.slice(0, 3) || [],
      risks: ['Overcommitment', 'Burnout risk'],
    },
    {
      scenario: 'moonshot' as const,
      focusAreas: [
        'Launch signature project with measurable impact',
        'Awards sprint across multiple categories',
        'Build flagship narrative',
      ],
      commitments: [
        ...(strategic_recommendations.awards_strategy.immediate_applications.slice(0, 2) || []),
        strategic_recommendations.extracurricular_strategy.signature_project?.name || 'Signature project',
      ],
      risks: ['Unsustainable pace', 'Quality over quantity trade-offs'],
    },
  ];

  // Map awards targets
  const awardsTargets = strategic_recommendations.awards_strategy.immediate_applications.map((award) => {
    // Determine tier from award name
    let tier: 'school' | 'local' | 'state' | 'national' | 'international' = 'local';
    const lowerAward = award.toLowerCase();

    if (lowerAward.includes('presidential') || lowerAward.includes('national')) {
      tier = 'national';
    } else if (lowerAward.includes('state')) {
      tier = 'state';
    } else if (lowerAward.includes('school')) {
      tier = 'school';
    }

    // Determine likelihood based on current achievements
    let likelihood: 'low' | 'medium' | 'high' = 'medium';

    if (lowerAward.includes('volunteer') || lowerAward.includes('scholarship')) {
      likelihood = 'high'; // More achievable
    } else if (lowerAward.includes('national') || lowerAward.includes('international')) {
      likelihood = 'low'; // More competitive
    }

    return {
      name: award,
      tier,
      likelihood,
      rationale: `Based on current profile strengths and timeline constraints`,
    };
  });

  return {
    twelveMonthPlan,
    summerPlanning,
    awardsTargets,
  };
}

/**
 * Map Jenny's structured assessment to complete AssessmentOutput_v2
 */
export async function mapStructuredToAssessmentOutput(
  data: JennyAssessmentStructured_v1
): Promise<AssessmentOutput_v2> {
  const profile = mapStructuredToExtractedProfile(data);
  const oracles = await mapStructuredToOracleResults(data);
  const narrative = mapStructuredToNarrativeBlocks(data);
  const strategy = mapStructuredToStrategyBlocks(data);

  const output: AssessmentOutput_v2 = {
    profile,
    oracles,
    narrative,
    strategy,
    metadata: {
      modelVersion: 'jenny-structured-v1',
      generatedAt: new Date().toISOString(),
      agentVersion: 'jenny-mapper-v1.0',
    },
  };

  // Validate using schema before returning
  const validated = assessmentOutputSchema_v2.parse(output);

  return validated;
}
