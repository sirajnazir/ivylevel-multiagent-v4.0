/**
 * ScoreCard.tsx
 *
 * Score card component displaying a single dimension score.
 * Shows score, label, trend indicator, and insights.
 */

import React from 'react';
import type { ScoreCardProps } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';

export function ScoreCard({
  dimension,
  theme: customTheme,
  className = '',
}: ScoreCardProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  // Determine score color based on value
  const getScoreColor = (score: number): string => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.info;
    if (score >= 40) return theme.colors.warning;
    return theme.colors.error;
  };

  // Trend icon
  const getTrendIcon = (trend?: 'improving' | 'stable' | 'declining'): string => {
    if (trend === 'improving') return '↗';
    if (trend === 'declining') return '↘';
    return '→';
  };

  const getTrendColor = (trend?: 'improving' | 'stable' | 'declining'): string => {
    if (trend === 'improving') return theme.colors.success;
    if (trend === 'declining') return theme.colors.error;
    return theme.colors.textSecondary;
  };

  const scoreColor = getScoreColor(dimension.score);

  return (
    <div
      className={`score-card ${className}`}
      style={{
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.lg,
        boxShadow: theme.shadows.sm,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {/* Header: Label + Trend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.sm,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.semibold,
            color: theme.colors.text,
          }}
        >
          {dimension.label}
        </h3>

        {dimension.trend && (
          <span
            style={{
              fontSize: theme.typography.fontSize.xl,
              color: getTrendColor(dimension.trend),
              fontWeight: theme.typography.fontWeight.bold,
            }}
            title={dimension.trend}
          >
            {getTrendIcon(dimension.trend)}
          </span>
        )}
      </div>

      {/* Score Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          marginBottom: theme.spacing.md,
        }}
      >
        <span
          style={{
            fontSize: theme.typography.fontSize.xxl,
            fontWeight: theme.typography.fontWeight.bold,
            color: scoreColor,
          }}
        >
          {dimension.score}
        </span>
        <span
          style={{
            fontSize: theme.typography.fontSize.lg,
            color: theme.colors.textSecondary,
            marginLeft: theme.spacing.xs,
          }}
        >
          / 100
        </span>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '8px',
          backgroundColor: theme.colors.border,
          borderRadius: theme.borderRadius.full,
          overflow: 'hidden',
          marginBottom: theme.spacing.md,
        }}
      >
        <div
          style={{
            width: `${dimension.score}%`,
            height: '100%',
            backgroundColor: scoreColor,
            borderRadius: theme.borderRadius.full,
            transition: 'width 0.3s ease-in-out',
          }}
        />
      </div>

      {/* Description */}
      {dimension.description && (
        <p
          style={{
            margin: 0,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.md,
          }}
        >
          {dimension.description}
        </p>
      )}

      {/* Insights */}
      {dimension.insights && dimension.insights.length > 0 && (
        <ul
          style={{
            margin: 0,
            paddingLeft: theme.spacing.lg,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text,
          }}
        >
          {dimension.insights.map((insight, index) => (
            <li key={index} style={{ marginBottom: theme.spacing.xs }}>
              {insight}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
