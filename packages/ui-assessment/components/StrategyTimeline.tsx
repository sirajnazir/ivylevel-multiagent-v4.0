/**
 * StrategyTimeline.tsx
 *
 * Displays strategic recommendations in a timeline format.
 * Groups strategies by timeline (immediate, short-term, long-term).
 */

import React from 'react';
import type { StrategyTimelineProps, StrategyBlock } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';

export function StrategyTimeline({
  strategies,
  theme: customTheme,
  className = '',
}: StrategyTimelineProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  // Group strategies by timeline
  const groupedStrategies = {
    immediate: strategies.filter((s) => s.timeline === 'immediate'),
    'short-term': strategies.filter((s) => s.timeline === 'short-term'),
    'long-term': strategies.filter((s) => s.timeline === 'long-term'),
  };

  // Priority colors
  const getPriorityColor = (priority: StrategyBlock['priority']): string => {
    switch (priority) {
      case 'high':
        return theme.colors.error;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.info;
      default:
        return theme.colors.textSecondary;
    }
  };

  // Timeline labels
  const timelineLabels = {
    immediate: 'Immediate (0-2 months)',
    'short-term': 'Short-term (2-6 months)',
    'long-term': 'Long-term (6-12 months)',
  };

  if (strategies.length === 0) {
    return (
      <div
        className={`strategy-timeline ${className}`}
        style={{
          fontFamily: theme.typography.fontFamily,
          padding: theme.spacing.lg,
        }}
      >
        <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          No strategies available yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`strategy-timeline ${className}`} style={{ fontFamily: theme.typography.fontFamily }}>
      <h2
        style={{
          margin: 0,
          marginBottom: theme.spacing.lg,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text,
        }}
      >
        Strategic Recommendations
      </h2>

      {/* Timeline Groups */}
      {(['immediate', 'short-term', 'long-term'] as const).map((timeline) => {
        const items = groupedStrategies[timeline];
        if (items.length === 0) return null;

        return (
          <div key={timeline} style={{ marginBottom: theme.spacing.xl }}>
            {/* Timeline Header */}
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.md,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.primary,
              }}
            >
              {timelineLabels[timeline]}
            </h3>

            {/* Strategy Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {items.map((strategy) => (
                <div
                  key={strategy.id}
                  style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: theme.borderRadius.md,
                    padding: theme.spacing.lg,
                    boxShadow: theme.shadows.sm,
                  }}
                >
                  {/* Header: Title + Priority Badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: theme.spacing.sm,
                    }}
                  >
                    <h4
                      style={{
                        margin: 0,
                        fontSize: theme.typography.fontSize.lg,
                        fontWeight: theme.typography.fontWeight.semibold,
                        color: theme.colors.text,
                        flex: 1,
                      }}
                    >
                      {strategy.title}
                    </h4>

                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        backgroundColor: getPriorityColor(strategy.priority),
                        color: theme.colors.background,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.semibold,
                        borderRadius: theme.borderRadius.full,
                        textTransform: 'uppercase',
                      }}
                    >
                      {strategy.priority}
                    </span>
                  </div>

                  {/* Description */}
                  <p
                    style={{
                      margin: 0,
                      marginBottom: theme.spacing.md,
                      fontSize: theme.typography.fontSize.md,
                      color: theme.colors.text,
                      lineHeight: 1.6,
                    }}
                  >
                    {strategy.description}
                  </p>

                  {/* Category Badge */}
                  <div style={{ marginBottom: theme.spacing.md }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                        backgroundColor: theme.colors.border,
                        color: theme.colors.text,
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium,
                        borderRadius: theme.borderRadius.sm,
                        textTransform: 'capitalize',
                      }}
                    >
                      {strategy.category}
                    </span>
                  </div>

                  {/* Action Steps */}
                  {strategy.actionSteps && strategy.actionSteps.length > 0 && (
                    <div>
                      <h5
                        style={{
                          margin: 0,
                          marginBottom: theme.spacing.sm,
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: theme.typography.fontWeight.semibold,
                          color: theme.colors.text,
                        }}
                      >
                        Action Steps:
                      </h5>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: theme.spacing.lg,
                          fontSize: theme.typography.fontSize.sm,
                          color: theme.colors.text,
                        }}
                      >
                        {strategy.actionSteps.map((step, index) => (
                          <li key={index} style={{ marginBottom: theme.spacing.xs }}>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
