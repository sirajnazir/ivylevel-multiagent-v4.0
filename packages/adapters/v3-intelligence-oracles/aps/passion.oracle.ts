import { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';

/**
 * Passion Oracle
 * Evaluates depth of student interests and commitment
 * Returns deterministic stub values (Phase 3 PR-B)
 */

export interface PassionOracleResult {
  score: number;
  evidence: string[];
  rationale: string;
}

export async function runPassionOracle(
  profile: ExtractedProfile_v2
): Promise<PassionOracleResult> {
  // Deterministic placeholder logic
  // Real implementation will analyze activity depth, time investment, outcomes

  const totalActivities = profile.activities.length;
  const leadershipActivities = profile.activities.filter(
    (activity) => activity.leadership
  ).length;
  const totalPassions = profile.personality.passions.length;

  // Stub score calculation
  const baseScore = 60;
  const leadershipBonus = leadershipActivities * 10;
  const passionBonus = totalPassions * 5;
  const score = Math.min(100, baseScore + leadershipBonus + passionBonus);

  const evidence = [
    `${totalActivities} extracurricular activities`,
    `${leadershipActivities} leadership roles`,
    `Core passions: ${profile.personality.passions.join(', ') || 'not specified'}`,
  ];

  const rationale = `Passion score reflects activity depth and leadership commitment. ${leadershipActivities} leadership positions demonstrate sustained engagement.`;

  return {
    score,
    evidence,
    rationale,
  };
}
