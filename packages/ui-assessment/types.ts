/**
 * types.ts
 *
 * Component 48 - Assessment Agent Dashboard UI
 *
 * Type definitions for the UI assessment package.
 * All types are backend-agnostic and driven by RenderModel_v1.
 */

/**
 * RenderModel_v1
 *
 * The complete data model that drives the UI.
 * Produced by the assessment agent's rendering layer.
 */
export interface RenderModel_v1 {
  sessionId: string;
  stage: AssessmentStage;
  narrative: NarrativeBlock[];
  strategy: StrategyBlock[];
  scores: ScoresBlock;
  summerPlans?: SummerPlan[];
  awardsTargets?: AwardTarget[];
  academics?: AcademicsSummary;
  metadata?: {
    studentName?: string;
    coachName?: string;
    sessionDate?: string;
    version?: string;
  };
}

/**
 * Assessment Stage
 */
export type AssessmentStage =
  | 'rapport'
  | 'current_state'
  | 'diagnostic'
  | 'preview'
  | 'completed';

/**
 * Narrative Block
 *
 * A conversational insight or observation from Jenny.
 */
export interface NarrativeBlock {
  id: string;
  type: 'observation' | 'insight' | 'validation' | 'concern';
  text: string;
  eqChips?: string[];  // EQ chips that influenced this narrative
  confidence?: number; // 0-1
  timestamp?: string;
}

/**
 * Strategy Block
 *
 * An actionable strategy recommendation with timeline.
 */
export interface StrategyBlock {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  timeline: 'immediate' | 'short-term' | 'long-term';  // 0-2mo, 2-6mo, 6-12mo
  category: 'academics' | 'extracurriculars' | 'personal' | 'admissions';
  actionSteps?: string[];
  relatedNarratives?: string[];  // IDs of related narrative blocks
}

/**
 * Scores Block
 *
 * Quantitative assessment scores across multiple dimensions.
 */
export interface ScoresBlock {
  overall: ScoreDimension;
  academics: ScoreDimension;
  extracurriculars: ScoreDimension;
  personalGrowth: ScoreDimension;
  collegeReadiness: ScoreDimension;
}

/**
 * Score Dimension
 *
 * A single scored dimension with score, label, and insights.
 */
export interface ScoreDimension {
  score: number;  // 0-100
  label: string;
  description?: string;
  trend?: 'improving' | 'stable' | 'declining';
  insights?: string[];
}

/**
 * Summer Plan
 *
 * A recommended summer activity or program.
 */
export interface SummerPlan {
  id: string;
  title: string;
  description: string;
  type: 'program' | 'internship' | 'research' | 'volunteer' | 'competition' | 'other';
  duration: string;  // e.g., "2 weeks", "6 weeks", "full summer"
  competitiveness: 'highly-selective' | 'selective' | 'open';
  applicationDeadline?: string;
  estimatedCost?: string;
  benefits: string[];
  url?: string;
}

/**
 * Award Target
 *
 * A recommended award or recognition to pursue.
 */
export interface AwardTarget {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'extracurricular' | 'leadership' | 'service' | 'creative' | 'other';
  competitiveness: 'highly-selective' | 'selective' | 'achievable';
  applicationDeadline?: string;
  requirements: string[];
  whyRecommended: string;
  url?: string;
}

/**
 * Academics Summary
 *
 * High-level summary of academic profile.
 */
export interface AcademicsSummary {
  gpa?: string;
  gpaWeighted?: string;
  testScores?: {
    sat?: number;
    act?: number;
    satSubject?: Record<string, number>;
    ap?: Record<string, number>;
  };
  courseRigor: 'most-rigorous' | 'very-rigorous' | 'rigorous' | 'moderate';
  classRank?: string;
  academicInterests: string[];
  strengths: string[];
  areasForGrowth: string[];
}

/**
 * Assessment Theme
 *
 * Theming configuration for the dashboard.
 * Allows full customization of colors, fonts, spacing.
 */
export interface AssessmentTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    headingFontFamily?: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}

/**
 * Assessment Dashboard Props
 *
 * Props for the main AssessmentDashboard component.
 */
export interface AssessmentDashboardProps {
  /**
   * The render model to display.
   * Can be provided directly or fetched via sessionId + endpoint.
   */
  model?: RenderModel_v1;

  /**
   * Session ID to fetch render model from API.
   * Used with apiEndpoint to fetch data dynamically.
   */
  sessionId?: string;

  /**
   * API endpoint to fetch render model.
   * Expected to return RenderModel_v1 at GET {apiEndpoint}/{sessionId}
   */
  apiEndpoint?: string;

  /**
   * Custom theme for the dashboard.
   * If not provided, default theme is used.
   */
  theme?: Partial<AssessmentTheme>;

  /**
   * Loading state callback.
   * Called when data is being fetched.
   */
  onLoading?: (isLoading: boolean) => void;

  /**
   * Error callback.
   * Called when data fetch fails.
   */
  onError?: (error: Error) => void;

  /**
   * Custom class name for root element.
   */
  className?: string;

  /**
   * Custom styles for root element.
   */
  style?: React.CSSProperties;
}

/**
 * Score Card Props
 */
export interface ScoreCardProps {
  dimension: ScoreDimension;
  theme?: Partial<AssessmentTheme>;
  className?: string;
}

/**
 * Narrative Section Props
 */
export interface NarrativeSectionProps {
  narratives: NarrativeBlock[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}

/**
 * Strategy Timeline Props
 */
export interface StrategyTimelineProps {
  strategies: StrategyBlock[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}

/**
 * Summer Plans Props
 */
export interface SummerPlansProps {
  plans: SummerPlan[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}

/**
 * Awards Targets Props
 */
export interface AwardsTargetsProps {
  awards: AwardTarget[];
  theme?: Partial<AssessmentTheme>;
  className?: string;
}

/**
 * Academics Summary Props
 */
export interface AcademicsSummaryProps {
  academics: AcademicsSummary;
  theme?: Partial<AssessmentTheme>;
  className?: string;
}

/**
 * Loading State Props
 */
export interface LoadingStateProps {
  message?: string;
  theme?: Partial<AssessmentTheme>;
  className?: string;
}

/**
 * Use Assessment Model Hook Options
 */
export interface UseAssessmentModelOptions {
  sessionId?: string;
  apiEndpoint?: string;
  model?: RenderModel_v1;
  onError?: (error: Error) => void;
  refetchInterval?: number;  // Auto-refetch interval in ms (optional)
}

/**
 * Use Assessment Model Hook Result
 */
export interface UseAssessmentModelResult {
  model: RenderModel_v1 | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
