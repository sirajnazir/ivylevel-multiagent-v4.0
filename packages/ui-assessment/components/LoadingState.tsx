/**
 * LoadingState.tsx
 *
 * Loading state component for the assessment dashboard.
 * Displays a spinner and optional message while data is loading.
 */

import React from 'react';
import type { LoadingStateProps } from '../types';
import { defaultTheme, mergeTheme } from '../styles/defaults';

export function LoadingState({
  message = 'Loading assessment...',
  theme: customTheme,
  className = '',
}: LoadingStateProps): React.ReactElement {
  const theme = mergeTheme(customTheme);

  return (
    <div
      className={`assessment-loading ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xxl,
        minHeight: '400px',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: '48px',
          height: '48px',
          border: `4px solid ${theme.colors.border}`,
          borderTopColor: theme.colors.primary,
          borderRadius: theme.borderRadius.full,
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* Message */}
      <p
        style={{
          marginTop: theme.spacing.lg,
          fontSize: theme.typography.fontSize.md,
          color: theme.colors.textSecondary,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {message}
      </p>

      {/* CSS Animation */}
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
    </div>
  );
}
