/**
 * AwardsTargets.tsx
 *
 * Displays recommended awards and recognitions to pursue.
 */

import React from 'react';
import type { AwardsTargetsProps, AwardTarget } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';

export function AwardsTargets({
  awards,
  theme: customTheme,
  className = '',
}: AwardsTargetsProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  // Category icons
  const getCategoryIcon = (category: AwardTarget['category']): string => {
    switch (category) {
      case 'academic':
        return '📚';
      case 'extracurricular':
        return '🎯';
      case 'leadership':
        return '👥';
      case 'service':
        return '💚';
      case 'creative':
        return '🎨';
      default:
        return '🏅';
    }
  };

  // Competitiveness color
  const getCompetitivenessColor = (competitiveness: AwardTarget['competitiveness']): string => {
    switch (competitiveness) {
      case 'highly-selective':
        return theme.colors.error;
      case 'selective':
        return theme.colors.warning;
      case 'achievable':
        return theme.colors.success;
      default:
        return theme.colors.textSecondary;
    }
  };

  if (awards.length === 0) {
    return (
      <div
        className={`awards-targets ${className}`}
        style={{
          fontFamily: theme.typography.fontFamily,
          padding: theme.spacing.lg,
        }}
      >
        <p style={{ color: theme.colors.textSecondary, textAlign: 'center' }}>
          No award recommendations available yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`awards-targets ${className}`} style={{ fontFamily: theme.typography.fontFamily }}>
      <h2
        style={{
          margin: 0,
          marginBottom: theme.spacing.lg,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text,
        }}
      >
        Target Awards & Recognition
      </h2>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: theme.spacing.md,
        }}
      >
        {awards.map((award) => (
          <div
            key={award.id}
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
                {getCategoryIcon(award.category)}
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
                {award.name}
              </h3>
            </div>

            {/* Competitiveness Badge */}
            <div style={{ marginBottom: theme.spacing.md }}>
              <span
                style={{
                  display: 'inline-block',
                  padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                  backgroundColor: getCompetitivenessColor(award.competitiveness),
                  color: theme.colors.background,
                  fontSize: theme.typography.fontSize.xs,
                  fontWeight: theme.typography.fontWeight.semibold,
                  borderRadius: theme.borderRadius.sm,
                  textTransform: 'capitalize',
                }}
              >
                {award.competitiveness.replace('-', ' ')}
              </span>
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
              {award.description}
            </p>

            {/* Why Recommended */}
            <div
              style={{
                marginBottom: theme.spacing.md,
                padding: theme.spacing.sm,
                backgroundColor: theme.colors.border,
                borderRadius: theme.borderRadius.sm,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  marginBottom: theme.spacing.xs,
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.primary,
                }}
              >
                Why This Award?
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text,
                }}
              >
                {award.whyRecommended}
              </p>
            </div>

            {/* Requirements */}
            {award.requirements.length > 0 && (
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
                  Requirements:
                </h4>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: theme.spacing.lg,
                    fontSize: theme.typography.fontSize.xs,
                    color: theme.colors.text,
                  }}
                >
                  {award.requirements.map((requirement, index) => (
                    <li key={index} style={{ marginBottom: theme.spacing.xs }}>
                      {requirement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Application Deadline */}
            {award.applicationDeadline && (
              <div
                style={{
                  marginBottom: theme.spacing.md,
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.textSecondary,
                }}
              >
                Application Deadline: {award.applicationDeadline}
              </div>
            )}

            {/* URL Link */}
            {award.url && (
              <div style={{ marginTop: 'auto' }}>
                <a
                  href={award.url}
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
