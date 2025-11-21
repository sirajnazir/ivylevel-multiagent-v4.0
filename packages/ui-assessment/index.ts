/**
 * index.ts
 *
 * Component 48 - Assessment Agent Dashboard (Modular UI Module)
 *
 * Main exports for the UI assessment package.
 * This is a fully isolated, backend-agnostic UI module.
 */

// Main Dashboard Component
export { AssessmentDashboard } from './components/AssessmentDashboard';

// Sub-components (can be used standalone)
export { ScoreCard } from './components/ScoreCard';
export { NarrativeSection } from './components/NarrativeSection';
export { StrategyTimeline } from './components/StrategyTimeline';
export { SummerPlans } from './components/SummerPlans';
export { AwardsTargets } from './components/AwardsTargets';
export { AcademicsSummary } from './components/AcademicsSummary';
export { LoadingState } from './components/LoadingState';

// Hooks
export { useAssessmentModel } from './hooks/useAssessmentModel';

// Theme System
export {
  defaultTheme,
  darkTheme,
  mergeTheme,
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  breakpoints,
} from './styles/theme';

// Types
export type {
  RenderModel_v1,
  AssessmentStage,
  NarrativeBlock,
  StrategyBlock,
  ScoresBlock,
  ScoreDimension,
  SummerPlan,
  AwardTarget,
  AcademicsSummary,
  AssessmentTheme,
  AssessmentDashboardProps,
  ScoreCardProps,
  NarrativeSectionProps,
  StrategyTimelineProps,
  SummerPlansProps,
  AwardsTargetsProps,
  AcademicsSummaryProps,
  LoadingStateProps,
  UseAssessmentModelOptions,
  UseAssessmentModelResult,
} from './types';
