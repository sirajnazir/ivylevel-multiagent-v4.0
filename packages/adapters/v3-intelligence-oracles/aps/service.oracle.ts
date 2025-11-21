import { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';

/**
 * Service Oracle
 * Evaluates community impact and service orientation
 * Returns deterministic stub values (Phase 3 PR-B)
 */

export interface ServiceOracleResult {
  score: number;
  evidence: string[];
  rationale: string;
}

export async function runServiceOracle(
  profile: ExtractedProfile_v2
): Promise<ServiceOracleResult> {
  // Deterministic placeholder logic
  // Real implementation will analyze service activities, impact metrics, community engagement

  const serviceActivities = profile.activities.filter(
    (activity) => activity.type === 'Volunteering'
  ).length;

  const totalServiceHours = profile.activities
    .filter((activity) => activity.type === 'Volunteering')
    .reduce((sum, activity) => sum + (activity.hoursPerWeek * activity.yearsInvolved * 40), 0);

  const coreValuesIncludeService = profile.personality.coreValues.some(
    (value) => value.toLowerCase().includes('service') ||
               value.toLowerCase().includes('impact') ||
               value.toLowerCase().includes('community')
  );

  // Stub score calculation
  const baseScore = 50;
  const activityBonus = serviceActivities * 15;
  const valuesBonus = coreValuesIncludeService ? 10 : 0;
  const score = Math.min(100, baseScore + activityBonus + valuesBonus);

  const evidence = [
    `${serviceActivities} service-oriented activities`,
    `Estimated ${totalServiceHours} total service hours`,
    `Service alignment in core values: ${coreValuesIncludeService ? 'Yes' : 'No'}`,
  ];

  const rationale = `Service score reflects community engagement breadth. ${serviceActivities} service activities indicate commitment to impact.`;

  return {
    score,
    evidence,
    rationale,
  };
}
