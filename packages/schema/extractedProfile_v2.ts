import { z } from 'zod';

/**
 * Extracted Profile Schema v2.0
 * Breaking change from v1 (empty objects) to v2 (full structure)
 * Used by Assessment Agent for LLM-based profile extraction
 */

// ============================================================
// ACADEMICS
// ============================================================

export const gpaSchema = z.object({
  weighted: z.number().nullable(),
  unweighted: z.number().nullable(),
});

export const courseSchema = z.object({
  name: z.string(),
  rigorLevel: z.enum(['AP', 'IB', 'Honors', 'Regular', 'College']),
  subject: z.string(),
  grade: z.string(),
});

export const testScoresSchema = z.object({
  sat: z.number().nullable(),
  act: z.number().nullable(),
  apScores: z.array(
    z.object({
      subject: z.string(),
      score: z.number().min(1).max(5),
    })
  ),
});

export const academicsSchema = z.object({
  gpa: gpaSchema,
  courseLoad: z.array(courseSchema),
  testScores: testScoresSchema,
  academicInterests: z.array(z.string()),
  plannedCourses: z.array(z.string()),
  rigorGaps: z.array(z.string()),
});

// ============================================================
// ACTIVITIES (with depth scoring)
// ============================================================

export const activitySchema = z.object({
  name: z.string(),
  type: z.enum(['Sport', 'Club', 'Research', 'Volunteering', 'Work', 'Arts', 'Other']),
  role: z.string(),
  hoursPerWeek: z.number().min(0),
  yearsInvolved: z.number().min(0),
  leadership: z.boolean(),
  depthSignals: z.array(z.string()), // Competitions won, publications, etc.
  outcomes: z.array(z.string()), // Tangible results
});

// ============================================================
// AWARDS (with tiering)
// ============================================================

export const awardSchema = z.object({
  name: z.string(),
  level: z.enum(['School', 'Local', 'State', 'National', 'International']),
  year: z.number(),
  description: z.string(),
});

// ============================================================
// PERSONALITY (10-dimensional model)
// ============================================================

export const personalitySchema = z.object({
  coreValues: z.array(z.string()),
  identityThreads: z.array(z.string()),
  passions: z.array(z.string()),
  communicationStyle: z.string(),
  emotionalIntelligence: z.string(),
  growthMindset: z.string().optional(),
  resilience: z.string().optional(),
  creativity: z.string().optional(),
  leadership: z.string().optional(),
  empathy: z.string().optional(),
});

// ============================================================
// CONTEXT
// ============================================================

export const contextSchema = z.object({
  familyInvolvement: z.string(),
  resourceConstraints: z.array(z.string()),
  lifeCircumstances: z.array(z.string()),
});

// ============================================================
// DIAGNOSTICS
// ============================================================

export const diagnosticsSchema = z.object({
  rigorGaps: z.array(z.string()),
  ecDepthGaps: z.array(z.string()),
  narrativeIssues: z.array(z.string()),
  strategicRisks: z.array(z.string()),
});

// ============================================================
// NARRATIVE SCAFFOLDING
// ============================================================

export const narrativeScaffoldingSchema = z.object({
  thematicHubs: z.tuple([z.string(), z.string(), z.string()]), // Exactly 3 themes
  flagshipNarrative: z.string(),
  admissionsPositioning: z.string(),
});

// ============================================================
// FULL EXTRACTED PROFILE v2
// ============================================================

export const extractedProfileSchema_v2 = z.object({
  academics: academicsSchema,
  activities: z.array(activitySchema),
  awards: z.array(awardSchema),
  personality: personalitySchema,
  context: contextSchema,
  diagnostics: diagnosticsSchema,
  narrativeScaffolding: narrativeScaffoldingSchema,
});

export type ExtractedProfile_v2 = z.infer<typeof extractedProfileSchema_v2>;

// ============================================================
// SUB-TYPES FOR CONVENIENCE
// ============================================================

export type GPA = z.infer<typeof gpaSchema>;
export type Course = z.infer<typeof courseSchema>;
export type TestScores = z.infer<typeof testScoresSchema>;
export type Academics = z.infer<typeof academicsSchema>;
export type Activity = z.infer<typeof activitySchema>;
export type Award = z.infer<typeof awardSchema>;
export type Personality = z.infer<typeof personalitySchema>;
export type Context = z.infer<typeof contextSchema>;
export type Diagnostics = z.infer<typeof diagnosticsSchema>;
export type NarrativeScaffolding = z.infer<typeof narrativeScaffoldingSchema>;
