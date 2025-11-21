import type { ExtractedProfile_v2 } from '../../schema/extractedProfile_v2';
import type { OracleResults_v2 } from '../../schema/oracleResults_v2';
import type { NarrativeBlocks_v2 } from '../../schema/narrativeBlocks_v2';
import type { StrategyBlocks_v2 } from '../../schema/strategyBlocks_v2';

/**
 * Render-friendly flattened model for client/UI/PDF consumption.
 * No nested complexity. No schema burden. No optionality conflicts.
 * Pure presentation layer - NO business logic, NO computation, NO intelligence.
 */
export interface RenderModel_v1 {
  studentName: string;

  academics: {
    gpaWeighted: number | null;
    gpaUnweighted: number | null;
    rigorLevel: string;
    plannedAPs: number;
    testScoresSummary: string | null;
  };

  oracles: {
    aptitude: number;
    passion: number;
    service: number;
    composite: number; // average of three
  };

  narrative: {
    flagship: string;
    positioning: string;
    themes: string[];
    risks: string[];
    opportunities: string[];
  };

  strategy: {
    months: { month: string; focus: string }[];
    summer: {
      baseline: string;
      stretch: string;
      moonshot: string;
    };
    awardsTargets: {
      name: string;
      tier: string;
      likelihood: string;
    }[];
  };

  lastUpdated: string; // ISO timestamp
}

/**
 * Builder input parameters
 * All required - no optional fields to avoid undefined chaos
 */
export interface RenderModelBuildParams {
  studentName: string;
  profile: ExtractedProfile_v2;
  oracles: OracleResults_v2;
  narrative: NarrativeBlocks_v2;
  strategy: StrategyBlocks_v2;
}
