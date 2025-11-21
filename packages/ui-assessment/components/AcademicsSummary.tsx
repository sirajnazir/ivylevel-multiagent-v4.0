/**
 * AcademicsSummary.tsx
 *
 * Displays comprehensive academic profile summary.
 * Shows GPA, test scores, course rigor, interests, strengths, and growth areas.
 */

import React from 'react';
import type { AcademicsSummaryProps } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';

export function AcademicsSummary({
  academics,
  theme: customTheme,
  className = '',
}: AcademicsSummaryProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  // Course rigor color
  const getRigorColor = (rigor: typeof academics.courseRigor): string => {
    switch (rigor) {
      case 'most-rigorous':
        return theme.colors.success;
      case 'very-rigorous':
        return theme.colors.info;
      case 'rigorous':
        return theme.colors.warning;
      case 'moderate':
        return theme.colors.textSecondary;
      default:
        return theme.colors.textSecondary;
    }
  };

  return (
    <div className={`academics-summary ${className}`} style={{ fontFamily: theme.typography.fontFamily }}>
      <h2
        style={{
          margin: 0,
          marginBottom: theme.spacing.lg,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text,
        }}
      >
        Academic Profile
      </h2>

      <div
        style={{
          backgroundColor: theme.colors.surface,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.lg,
          boxShadow: theme.shadows.sm,
        }}
      >
        {/* GPA Section */}
        {(academics.gpa || academics.gpaWeighted) && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text,
              }}
            >
              GPA
            </h3>
            <div style={{ display: 'flex', gap: theme.spacing.lg }}>
              {academics.gpa && (
                <div>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Unweighted:
                  </span>
                  <span
                    style={{
                      marginLeft: theme.spacing.xs,
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text,
                    }}
                  >
                    {academics.gpa}
                  </span>
                </div>
              )}
              {academics.gpaWeighted && (
                <div>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    Weighted:
                  </span>
                  <span
                    style={{
                      marginLeft: theme.spacing.xs,
                      fontSize: theme.typography.fontSize.xl,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text,
                    }}
                  >
                    {academics.gpaWeighted}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Test Scores */}
        {academics.testScores && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text,
              }}
            >
              Test Scores
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.md }}>
              {academics.testScores.sat && (
                <div>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    SAT:
                  </span>
                  <span
                    style={{
                      marginLeft: theme.spacing.xs,
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text,
                    }}
                  >
                    {academics.testScores.sat}
                  </span>
                </div>
              )}
              {academics.testScores.act && (
                <div>
                  <span
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    ACT:
                  </span>
                  <span
                    style={{
                      marginLeft: theme.spacing.xs,
                      fontSize: theme.typography.fontSize.lg,
                      fontWeight: theme.typography.fontWeight.bold,
                      color: theme.colors.text,
                    }}
                  >
                    {academics.testScores.act}
                  </span>
                </div>
              )}
            </div>

            {/* AP Scores */}
            {academics.testScores.ap && Object.keys(academics.testScores.ap).length > 0 && (
              <div style={{ marginTop: theme.spacing.md }}>
                <h4
                  style={{
                    margin: 0,
                    marginBottom: theme.spacing.xs,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.semibold,
                    color: theme.colors.text,
                  }}
                >
                  AP Scores:
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                  {Object.entries(academics.testScores.ap).map(([subject, score]) => (
                    <span
                      key={subject}
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
                      {subject}: {score}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Course Rigor */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <h3
            style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text,
            }}
          >
            Course Rigor
          </h3>
          <span
            style={{
              display: 'inline-block',
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: getRigorColor(academics.courseRigor),
              color: theme.colors.background,
              fontSize: theme.typography.fontSize.md,
              fontWeight: theme.typography.fontWeight.semibold,
              borderRadius: theme.borderRadius.md,
              textTransform: 'capitalize',
            }}
          >
            {academics.courseRigor.replace('-', ' ')}
          </span>
          {academics.classRank && (
            <div
              style={{
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.textSecondary,
              }}
            >
              Class Rank: {academics.classRank}
            </div>
          )}
        </div>

        {/* Academic Interests */}
        {academics.academicInterests.length > 0 && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.text,
              }}
            >
              Academic Interests
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.xs }}>
              {academics.academicInterests.map((interest, index) => (
                <span
                  key={index}
                  style={{
                    display: 'inline-block',
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: theme.typography.fontWeight.medium,
                    borderRadius: theme.borderRadius.full,
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Strengths */}
        {academics.strengths.length > 0 && (
          <div style={{ marginBottom: theme.spacing.lg }}>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.success,
              }}
            >
              Strengths
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: theme.spacing.lg,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text,
              }}
            >
              {academics.strengths.map((strength, index) => (
                <li key={index} style={{ marginBottom: theme.spacing.xs }}>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Areas for Growth */}
        {academics.areasForGrowth.length > 0 && (
          <div>
            <h3
              style={{
                margin: 0,
                marginBottom: theme.spacing.sm,
                fontSize: theme.typography.fontSize.lg,
                fontWeight: theme.typography.fontWeight.semibold,
                color: theme.colors.warning,
              }}
            >
              Areas for Growth
            </h3>
            <ul
              style={{
                margin: 0,
                paddingLeft: theme.spacing.lg,
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text,
              }}
            >
              {academics.areasForGrowth.map((area, index) => (
                <li key={index} style={{ marginBottom: theme.spacing.xs }}>
                  {area}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
