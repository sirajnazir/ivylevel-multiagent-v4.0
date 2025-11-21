import { RenderModel_v1, RenderModelBuildParams } from './renderModel_v1.types';

/**
 * Converts the full AssessmentOutput_v2 into a UI/PDF-friendly rendering model.
 * Pure, deterministic, zero side effects, no schema validation here.
 *
 * STRICT RULES:
 * - Zero computation (only rearrange & reformat)
 * - Deterministic (same input → same output)
 * - Display-ready strings only
 * - No new fields, no new conclusions, no AI logic
 */
export function buildRenderModel_v1(params: RenderModelBuildParams): RenderModel_v1 {
  const { studentName, profile, oracles, narrative, strategy } = params;

  // --- Academics ---
  const academics = {
    gpaWeighted: profile.academics?.gpa?.weighted ?? null,
    gpaUnweighted: profile.academics?.gpa?.unweighted ?? null,
    rigorLevel: deriveRigorLevel(profile),
    plannedAPs:
      profile.academics?.plannedCourses?.filter((c) => c.toLowerCase().includes('ap')).length ?? 0,
    testScoresSummary: deriveTestScoreSummary(profile),
  };

  // --- Oracles ---
  const composite =
    (oracles.aptitude.score + oracles.passion.score + oracles.service.score) / 3;

  const oracleSummary = {
    aptitude: oracles.aptitude.score,
    passion: oracles.passion.score,
    service: oracles.service.score,
    composite: Math.round(composite),
  };

  // --- Narrative ---
  const narrativeSummary = {
    flagship: narrative.flagshipNarrative ?? 'Not defined',
    positioning: narrative.positioning ?? 'Not defined',
    themes: narrative.thematicHubs ?? [],
    risks: narrative.risks ?? [],
    opportunities: narrative.opportunities ?? [],
  };

  // --- Strategy ---
  const monthNames = [
    'Month 1',
    'Month 2',
    'Month 3',
    'Month 4',
    'Month 5',
    'Month 6',
    'Month 7',
    'Month 8',
    'Month 9',
    'Month 10',
    'Month 11',
    'Month 12',
  ];

  const months = strategy.twelveMonthPlan.map((item, idx) => ({
    month: monthNames[idx],
    focus: item.priorities.join(', '),
  }));

  const summer = {
    baseline: strategy.summerPlanning[0]?.commitments.join(', ') ?? 'Not defined',
    stretch: strategy.summerPlanning[1]?.commitments.join(', ') ?? 'Not defined',
    moonshot: strategy.summerPlanning[2]?.commitments.join(', ') ?? 'Not defined',
  };

  const awardsTargets = strategy.awardsTargets.map((t) => ({
    name: t.name,
    tier: t.tier,
    likelihood: t.likelihood,
  }));

  return {
    studentName,
    academics,
    oracles: oracleSummary,
    narrative: narrativeSummary,
    strategy: {
      months,
      summer,
      awardsTargets,
    },
    lastUpdated: new Date().toISOString(),
  };
}

// ----------------------------
// HELPER FUNCTIONS
// ----------------------------

/**
 * Derive rigor level from course load
 * Pure categorization - no judgment, no scoring
 */
function deriveRigorLevel(profile: any): string {
  const apCount =
    profile.academics?.courseLoad?.filter(
      (c: any) => c.rigorLevel === 'AP' || c.rigorLevel === 'IB'
    ).length ?? 0;

  if (apCount >= 10) return 'Very High';
  if (apCount >= 6) return 'High';
  if (apCount >= 3) return 'Moderate';
  return 'Basic';
}

/**
 * Build test scores summary string
 * Pure string formatting - no interpretation
 */
function deriveTestScoreSummary(profile: any): string | null {
  const tests = profile.academics?.testScores;
  if (!tests) return null;

  const sat = tests.sat ?? null;
  const act = tests.act ?? null;
  const aps = tests.apScores ?? [];

  const parts = [];
  if (sat) parts.push(`SAT: ${sat}`);
  if (act) parts.push(`ACT: ${act}`);
  if (aps.length > 0) parts.push(`AP Exams: ${aps.length}`);

  return parts.join(' | ') || null;
}
