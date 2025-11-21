/**
 * defaults.ts
 *
 * Default theme configuration for the assessment dashboard.
 * Uses design tokens to create a cohesive default theme.
 */

import type { AssessmentTheme } from '../types';
import { colors, typography, spacing, borderRadius, shadows } from './tokens';

/**
 * Default Assessment Theme
 *
 * This is the baseline theme used when no custom theme is provided.
 * All values can be overridden via the theme prop.
 */
export const defaultTheme: AssessmentTheme = {
  colors: {
    primary: colors.primary[600],
    secondary: colors.secondary[500],
    background: colors.neutral[0],
    surface: colors.neutral[50],
    text: colors.neutral[900],
    textSecondary: colors.neutral[600],
    border: colors.neutral[200],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],
  },
  typography: {
    fontFamily: typography.fontFamily.sans,
    headingFontFamily: typography.fontFamily.sans,
    fontSize: {
      xs: typography.fontSize.xs,
      sm: typography.fontSize.sm,
      md: typography.fontSize.md,
      lg: typography.fontSize.lg,
      xl: typography.fontSize.xl,
      xxl: typography.fontSize['2xl'],
    },
    fontWeight: {
      normal: typography.fontWeight.normal,
      medium: typography.fontWeight.medium,
      semibold: typography.fontWeight.semibold,
      bold: typography.fontWeight.bold,
    },
  },
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    xxl: spacing['2xl'],
  },
  borderRadius: {
    sm: borderRadius.sm,
    md: borderRadius.md,
    lg: borderRadius.lg,
    full: borderRadius.full,
  },
  shadows: {
    sm: shadows.sm,
    md: shadows.md,
    lg: shadows.lg,
  },
};

/**
 * Dark Theme Variant
 *
 * Alternative dark theme for the dashboard.
 */
export const darkTheme: AssessmentTheme = {
  colors: {
    primary: colors.primary[400],
    secondary: colors.secondary[400],
    background: colors.neutral[900],
    surface: colors.neutral[800],
    text: colors.neutral[50],
    textSecondary: colors.neutral[400],
    border: colors.neutral[700],
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],
  },
  typography: {
    fontFamily: typography.fontFamily.sans,
    headingFontFamily: typography.fontFamily.sans,
    fontSize: {
      xs: typography.fontSize.xs,
      sm: typography.fontSize.sm,
      md: typography.fontSize.md,
      lg: typography.fontSize.lg,
      xl: typography.fontSize.xl,
      xxl: typography.fontSize['2xl'],
    },
    fontWeight: {
      normal: typography.fontWeight.normal,
      medium: typography.fontWeight.medium,
      semibold: typography.fontWeight.semibold,
      bold: typography.fontWeight.bold,
    },
  },
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    xxl: spacing['2xl'],
  },
  borderRadius: {
    sm: borderRadius.sm,
    md: borderRadius.md,
    lg: borderRadius.lg,
    full: borderRadius.full,
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.3), 0 2px 4px -2px rgb(0 0 0 / 0.3)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)',
  },
};

/**
 * Merge Theme
 *
 * Deep merges a partial theme with the default theme.
 *
 * @param customTheme - Partial theme to merge
 * @param baseTheme - Base theme to merge into (defaults to defaultTheme)
 * @returns Merged complete theme
 */
export function mergeTheme(
  customTheme: Partial<AssessmentTheme> = {},
  baseTheme: AssessmentTheme = defaultTheme
): AssessmentTheme {
  return {
    colors: {
      ...baseTheme.colors,
      ...(customTheme.colors || {}),
    },
    typography: {
      ...baseTheme.typography,
      ...(customTheme.typography || {}),
      fontSize: {
        ...baseTheme.typography.fontSize,
        ...(customTheme.typography?.fontSize || {}),
      },
      fontWeight: {
        ...baseTheme.typography.fontWeight,
        ...(customTheme.typography?.fontWeight || {}),
      },
    },
    spacing: {
      ...baseTheme.spacing,
      ...(customTheme.spacing || {}),
    },
    borderRadius: {
      ...baseTheme.borderRadius,
      ...(customTheme.borderRadius || {}),
    },
    shadows: {
      ...baseTheme.shadows,
      ...(customTheme.shadows || {}),
    },
  };
}
