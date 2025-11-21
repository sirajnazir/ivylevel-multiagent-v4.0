/**
 * NarrativeSection.tsx
 *
 * Displays narrative blocks from Jenny's assessment.
 * Shows observations, insights, validations, and concerns.
 */

import React from 'react';
import type { NarrativeSectionProps, NarrativeBlock } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';

export function NarrativeSection({
  narratives,
  theme: customTheme,
  className = '',
}: NarrativeSectionProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  // Get icon for narrative type
  const getTypeIcon = (type: NarrativeBlock['type']): string => {
    switch (type) {
      case 'observation':
        return '👁';
      case 'insight':
        return '💡';
      case 'validation':
        return '✓';
      case 'concern':
        return '⚠';
      default:
        return '•';
    }
  };

  // Get color for narrative type
  const getTypeColor = (type: NarrativeBlock['type']): string => {
    switch (type) {
      case 'observation':
        return theme.colors.info;
      case 'insight':
        return theme.colors.secondary;
      case 'validation':
        return theme.colors.success;
      case 'concern':
        return theme.colors.warning;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (narratives.length === 0) {
    return (
      <div
        className={`narrative-section ${className}`}
        style={{
          fontFamily: theme.typography.fontFamily,
          padding: theme.spacing.lg,
        }}
      >
        <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          No narratives available yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`narrative-section ${className}`} style={{ fontFamily: theme.typography.fontFamily }}>
      <h2
        style={{
          margin: 0,
          marginBottom: theme.spacing.lg,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text,
        }}
      >
        Jenny's Insights
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
        {narratives.map((narrative) => (
          <div
            key={narrative.id}
            style={{
              backgroundColor: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderLeft: `4px solid ${getTypeColor(narrative.type)}`,
              borderRadius: theme.borderRadius.md,
              padding: theme.spacing.lg,
              boxShadow: theme.shadows.sm,
            }}
          >
            {/* Header: Icon + Type + Confidence */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: theme.spacing.sm,
                gap: theme.spacing.sm,
              }}
            >
              <span style={{ fontSize: theme.typography.fontSize.lg }}>
                {getTypeIcon(narrative.type)}
              </span>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: getTypeColor(narrative.type),
                  textTransform: 'capitalize',
                }}
              >
                {narrative.type}
              </span>

              {narrative.confidence !== undefined && (
                <span
                  style={{
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.textSecondary,
                    marginLeft: 'auto',
                  }}
                >
                  {Math.round(narrative.confidence * 100)}% confidence
                </span>
              )}
            </div>

            {/* Narrative Text */}
            <p
              style={{
                margin: 0,
                fontSize: theme.typography.fontSize.md,
                color: theme.colors.text,
                lineHeight: 1.6,
              }}
            >
              {narrative.text}
            </p>

            {/* EQ Chips */}
            {narrative.eqChips && narrative.eqChips.length > 0 && (
              <div
                style={{
                  marginTop: theme.spacing.md,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: theme.spacing.xs,
                }}
              >
                {narrative.eqChips.map((chip, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-block',
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      backgroundColor: theme.colors.primary,
                      color: theme.colors.background,
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: theme.typography.fontWeight.medium,
                      borderRadius: theme.borderRadius.full,
                    }}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}

            {/* Timestamp */}
            {narrative.timestamp && (
              <div
                style={{
                  marginTop: theme.spacing.sm,
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textSecondary,
                }}
              >
                {new Date(narrative.timestamp).toLocaleString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
