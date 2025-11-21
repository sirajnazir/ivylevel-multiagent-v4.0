import { ExtractedProfile_v2 } from '../../../schema/extractedProfile_v2';

/**
 * Aptitude Oracle
 * Evaluates academic potential and intellectual capacity
 * Returns deterministic stub values (Phase 3 PR-B)
 */

export interface AptitudeOracleResult {
  score: number;
  evidence: string[];
  rationale: string;
}

export async function runAptitudeOracle(
  profile: ExtractedProfile_v2
): Promise<AptitudeOracleResult> {
  // Deterministic placeholder logic
  // Real implementation will analyze course rigor, test scores, academic trajectory

  const courseCount = profile.academics.courseLoad.length;
  const apCount = profile.academics.courseLoad.filter(
    (course) => course.rigorLevel === 'AP'
  ).length;

  // Stub score calculation
  const baseScore = 70;
  const rigorBonus = apCount * 5;
  const score = Math.min(100, baseScore + rigorBonus);

  const evidence = [
    `${apCount} AP courses identified`,
    `Total course load: ${courseCount} courses`,
    `Academic interests: ${profile.academics.academicInterests.join(', ') || 'not specified'}`,
  ];

  const rationale = `Aptitude score based on course rigor analysis. ${apCount} AP courses indicate strong academic foundation.`;

  return {
    score,
    evidence,
    rationale,
  };
}
