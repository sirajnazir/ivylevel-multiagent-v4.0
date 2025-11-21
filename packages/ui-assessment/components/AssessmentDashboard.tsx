/**
 * AssessmentDashboard.tsx
 *
 * Main dashboard component for displaying assessment results.
 *
 * This is a fully isolated, backend-agnostic UI component.
 * It consumes RenderModel_v1 and displays comprehensive assessment data.
 *
 * Usage:
 * ```tsx
 * // Option 1: Provide model directly
 * <AssessmentDashboard model={renderModel} />
 *
 * // Option 2: Fetch from API
 * <AssessmentDashboard
 *   sessionId="abc123"
 *   apiEndpoint="https://api.example.com/assessments"
 * />
 * ```
 */

import React from 'react';
import type { AssessmentDashboardProps } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';
import { useAssessmentModel } from '../hooks/useAssessmentModel';
import { LoadingState } from './LoadingState';
import { ScoreCard } from './ScoreCard';
import { NarrativeSection } from './NarrativeSection';
import { StrategyTimeline } from './StrategyTimeline';
import { SummerPlans } from './SummerPlans';
import { AwardsTargets } from './AwardsTargets';
import { AcademicsSummary } from './AcademicsSummary';

export function AssessmentDashboard({
  model: providedModel,
  sessionId,
  apiEndpoint,
  theme: customTheme,
  onLoading,
  onError,
  className = '',
  style = {},
}: AssessmentDashboardProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  // Fetch model using hook
  const { model, isLoading, error, refetch } = useAssessmentModel({
    model: providedModel,
    sessionId,
    apiEndpoint,
    onError,
  });

  // Notify parent of loading state
  React.useEffect(() => {
    if (onLoading) {
      onLoading(isLoading);
    }
  }, [isLoading, onLoading]);

  // Loading state
  if (isLoading) {
    return <LoadingState theme={customTheme} />;
  }

  // Error state
  if (error) {
    return (
      <div
        className={`assessment-dashboard-error ${className}`}
        style={{
          ...style,
          padding: theme.spacing.xxl,
          backgroundColor: theme.colors.background,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              marginBottom: theme.spacing.lg,
            }}
          >
            ⚠️
          </div>
          <h2
            style={{
              margin: 0,
              marginBottom: theme.spacing.md,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.error,
            }}
          >
            Error Loading Assessment
          </h2>
          <p
            style={{
              margin: 0,
              marginBottom: theme.spacing.lg,
              fontSize: theme.typography.fontSize.md,
              color: theme.colors.textSecondary,
            }}
          >
            {error.message}
          </p>
          <button
            onClick={refetch}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
              backgroundColor: theme.colors.primary,
              color: theme.colors.background,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold,
              cursor: 'pointer',
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No model available
  if (!model) {
    return (
      <div
        className={`assessment-dashboard-empty ${className}`}
        style={{
          ...style,
          padding: theme.spacing.xxl,
          backgroundColor: theme.colors.background,
          fontFamily: theme.typography.fontFamily,
          textAlign: 'center',
        }}
      >
        <p style={{ color: theme.colors.textSecondary }}>
          No assessment data available.
        </p>
      </div>
    );
  }

  // Render dashboard
  return (
    <div
      className={`assessment-dashboard ${className}`}
      style={{
        ...style,
        backgroundColor: theme.colors.background,
        fontFamily: theme.typography.fontFamily,
        padding: theme.spacing.lg,
      }}
    >
      {/* Header */}
      <header
        style={{
          marginBottom: theme.spacing.xxl,
          paddingBottom: theme.spacing.lg,
          borderBottom: `2px solid ${theme.colors.border}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: theme.spacing.md,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                marginBottom: theme.spacing.xs,
                fontSize: theme.typography.fontSize.xxl,
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.text,
              }}
            >
              Assessment Dashboard
            </h1>
            {model.metadata?.studentName && (
              <p
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.textSecondary,
                }}
              >
                {model.metadata.studentName}
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                backgroundColor: theme.colors.primary,
                color: theme.colors.background,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: theme.typography.fontWeight.semibold,
                borderRadius: theme.borderRadius.full,
                textTransform: 'capitalize',
              }}
            >
              {model.stage.replace('_', ' ')}
            </div>
            {model.metadata?.sessionDate && (
              <div
                style={{
                  marginTop: theme.spacing.xs,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.textSecondary,
                }}
              >
                {new Date(model.metadata.sessionDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Scores Section */}
      <section style={{ marginBottom: theme.spacing.xxl }}>
        <h2
          style={{
            margin: 0,
            marginBottom: theme.spacing.lg,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text,
          }}
        >
          Assessment Scores
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: theme.spacing.md,
          }}
        >
          <ScoreCard dimension={model.scores.overall} theme={customTheme} />
          <ScoreCard dimension={model.scores.academics} theme={customTheme} />
          <ScoreCard dimension={model.scores.extracurriculars} theme={customTheme} />
          <ScoreCard dimension={model.scores.personalGrowth} theme={customTheme} />
          <ScoreCard dimension={model.scores.collegeReadiness} theme={customTheme} />
        </div>
      </section>

      {/* Narrative Section */}
      {model.narrative && model.narrative.length > 0 && (
        <section style={{ marginBottom: theme.spacing.xxl }}>
          <NarrativeSection narratives={model.narrative} theme={customTheme} />
        </section>
      )}

      {/* Strategy Timeline */}
      {model.strategy && model.strategy.length > 0 && (
        <section style={{ marginBottom: theme.spacing.xxl }}>
          <StrategyTimeline strategies={model.strategy} theme={customTheme} />
        </section>
      )}

      {/* Academics Summary */}
      {model.academics && (
        <section style={{ marginBottom: theme.spacing.xxl }}>
          <AcademicsSummary academics={model.academics} theme={customTheme} />
        </section>
      )}

      {/* Summer Plans */}
      {model.summerPlans && model.summerPlans.length > 0 && (
        <section style={{ marginBottom: theme.spacing.xxl }}>
          <SummerPlans plans={model.summerPlans} theme={customTheme} />
        </section>
      )}

      {/* Awards Targets */}
      {model.awardsTargets && model.awardsTargets.length > 0 && (
        <section style={{ marginBottom: theme.spacing.xxl }}>
          <AwardsTargets awards={model.awardsTargets} theme={customTheme} />
        </section>
      )}

      {/* Footer */}
      <footer
        style={{
          marginTop: theme.spacing.xxl,
          paddingTop: theme.spacing.lg,
          borderTop: `1px solid ${theme.colors.border}`,
          textAlign: 'center',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSecondary,
          }}
        >
          Session ID: {model.sessionId}
          {model.metadata?.coachName && ` • Coach: ${model.metadata.coachName}`}
          {model.metadata?.version && ` • Version: ${model.metadata.version}`}
        </p>
      </footer>
    </div>
  );
}
