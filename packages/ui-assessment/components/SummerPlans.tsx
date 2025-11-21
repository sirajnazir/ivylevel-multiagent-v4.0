/**
 * SummerPlans.tsx
 *
 * Displays recommended summer programs, internships, and activities.
 */

import React from 'react';
import type { SummerPlansProps, SummerPlan } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';

export function SummerPlans({
  plans,
  theme: customTheme,
  className = '',
}: SummerPlansProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  // Type icons
  const getTypeIcon = (type: SummerPlan['type']): string => {
    switch (type) {
      case 'program':
        return '🎓';
      case 'internship':
        return '💼';
      case 'research':
        return '🔬';
      case 'volunteer':
        return '🤝';
      case 'competition':
        return '🏆';
      default:
        return '📋';
    }
  };

  // Competitiveness color
  const getCompetitivenessColor = (competitiveness: SummerPlan['competitiveness']): string => {
    switch (competitiveness) {
      case 'highly-selective':
        return theme.colors.error;
      case 'selective':
        return theme.colors.warning;
      case 'open':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (plans.length === 0) {
    return (
      <div
        className={`summer-plans ${className}`}
        style={{
          fontFamily: theme.typography.fontFamily,
          padding: theme.spacing.lg,
        }}
      >
        <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          No summer plans available yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`summer-plans ${className}`} style={{ fontFamily: theme.typography.fontFamily }}>
      <h2
        style={{
          margin: 0,
          marginBottom: theme.spacing.lg,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text,
        }}
      >
        Recommended Summer Opportunities
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: theme.spacing.md,
        }}
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.lg,
              boxShadow: theme.shadows.sm,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header: Icon + Title */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing.sm,
                marginBottom: theme.spacing.sm,
              }}
            >
              <span style={{ fontSize: theme.typography.fontSize.xl }}>
                {getTypeIcon(plan.type)}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.lg,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.text,
                  flex: 1,
                }}
              >
                {plan.title}
              </h3>
            </div>

            {/* Description */}
            <p
              style={{
                margin: 0,
                marginBottom: theme.spacing.md,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text,
                lineHeight: 1.6,
              }}
            >
              {plan.description}
            </p>

            {/* Metadata: Duration, Competitiveness, Cost */}
            <div style={{ marginBottom: theme.spacing.md }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: theme.spacing.xs,
                  marginBottom: theme.spacing.xs,
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    backgroundColor: theme.colors.border,
                    color: theme.colors.text,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.medium,
                    borderRadius: theme.borderRadius.sm,
                  }}
                >
                  {plan.duration}
                </span>

                <span
                  style={{
                    display: 'inline-block',
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    backgroundColor: getCompetitivenessColor(plan.competitiveness),
                    color: theme.colors.background,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: theme.typography.fontWeight.semibold,
                    borderRadius: theme.borderRadius.sm,
                    textTransform: 'capitalize',
                  }}
                >
                  {plan.competitiveness.replace('-', ' ')}
                </span>
              </div>

              {plan.estimatedCost && (
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Cost: {plan.estimatedCost}
                </div>
              )}

              {plan.applicationDeadline && (
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSecondary,
                  }}
                >
                  Deadline: {plan.applicationDeadline}
                </div>
              )}
            </div>

            {/* Benefits */}
            {plan.benefits.length > 0 && (
              <div style={{ marginBottom: theme.spacing.md }}>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: theme.spacing.xs,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text,
                  }}
                >
                  Benefits:
                </h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: theme.spacing.lg,
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text,
                  }}
                >
                  {plan.benefits.map((benefit, index) => (
                    <li key={index} style={{ marginBottom: theme.spacing.xs }}>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* URL Link */}
            {plan.url && (
              <div style={{ marginTop: 'auto' }}>
                <a
                  href={plan.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.primary,
                    textDecoration: 'none',
                    fontWeight: theme.typography.fontWeight.medium,
                  }}
                >
                  Learn More →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
