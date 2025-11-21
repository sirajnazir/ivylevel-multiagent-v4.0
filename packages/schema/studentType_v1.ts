import { z } from "zod";

/**
 * Student Type Classification Schema v1
 *
 * Defines the 7 student archetypes and classification output structure.
 * This classification drives coaching strategy adaptation, EQ modulation,
 * and framework selection.
 */

/**
 * The 7 Student Archetypes
 */
export const StudentArchetype = z.enum([
  "The Anxious Achiever",
  "The Chaotic Ambitious",
  "The Quiet High-Potential Thinker",
  "The Overcommitted Perfectionist",
  "The Low-Agency Bright Drifter",
  "The Narrative-Lost but Curious Freshman",
  "The Transactional Just-Tell-Me-What-To-Do Student"
]);

export type StudentArchetype = z.infer<typeof StudentArchetype>;

/**
 * EQ Modulation Settings
 *
 * Controls how the coaching agent adapts its communication style
 */
export const eqModulationSchema = z.object({
  /** Warmth level: high, medium, low */
  warmth: z.enum(["high", "medium", "low"]),

  /** Directness level: high, medium, low */
  directness: z.enum(["high", "medium", "low"]),

  /** Pace of progression: fast, gradual, slow */
  pace: z.enum(["fast", "gradual", "slow"]),

  /** Structure level: tight, medium, loose */
  structure: z.enum(["tight", "medium", "loose"])
});

export type EQModulation = z.infer<typeof eqModulationSchema>;

/**
 * Student Type Classification Output
 *
 * The complete classification result including primary/secondary types,
 * evidence, coaching adaptations, and EQ modulation settings.
 */
export const studentTypeClassificationSchema = z.object({
  /** Primary archetype (confidence >= 0.70) */
  primaryType: StudentArchetype,

  /** Confidence score (0.0-1.0) */
  confidence: z.number().min(0).max(1),

  /** Optional secondary archetype for mixed signals */
  secondaryType: StudentArchetype.optional(),

  /** Evidence bullets supporting the classification (3-5 items) */
  evidence: z.array(z.string()).min(3).max(5),

  /** Specific coaching adaptations for this student (3-5 items) */
  coachingAdaptations: z.array(z.string()).min(3).max(5),

  /** Prioritized framework IDs to use with this student */
  frameworkPriority: z.array(z.string()),

  /** EQ modulation settings */
  eqModulation: eqModulationSchema
});

export type StudentTypeClassification = z.infer<typeof studentTypeClassificationSchema>;

/**
 * Input data for student type classification
 *
 * This combines data from multiple pipeline stages:
 * - ExtractedProfile_v2 (from extraction)
 * - OracleResults_v2 (from intelligence scoring)
 * - NarrativeBlocks_v2 (from narrative generation)
 */
export const studentTypeInputSchema = z.object({
  /** Extracted profile data */
  profile: z.object({
    gpa: z.number().optional(),
    rigorLevel: z.string().optional(),
    rigorDelta: z.number().optional(),
    ecDepth: z.string().optional(),
    leadershipSignals: z.array(z.string()).optional(),
    personalityMarkers: z.array(z.string()).optional(),
    motivationSignals: z.array(z.string()).optional(),
    executionGaps: z.array(z.string()).optional(),
    gradeLevel: z.number().optional()
  }),

  /** Oracle intelligence scores */
  oracleResults: z.object({
    aptitudeScore: z.number().min(0).max(100).optional(),
    passionScore: z.number().min(0).max(100).optional(),
    serviceScore: z.number().min(0).max(100).optional()
  }),

  /** Narrative and EQ data */
  narrative: z.object({
    toneMarkers: z.array(z.string()).optional(),
    responsiveness: z.string().optional(),
    confidenceMarkers: z.array(z.string()).optional(),
    selfAwarenessSignals: z.array(z.string()).optional(),
    valueStatements: z.array(z.string()).optional()
  })
});

export type StudentTypeInput = z.infer<typeof studentTypeInputSchema>;

/**
 * Archetype Definitions (for reference and documentation)
 */
export const archetypeDefinitions = {
  "The Anxious Achiever": {
    corePattern: "High achievement + high anxiety + approval-seeking behavior",
    coachingAdaptation: "Gentle stretch + frequent affirmation + normalize uncertainty"
  },
  "The Chaotic Ambitious": {
    corePattern: "Big dreams + execution gaps + scattered energy",
    coachingAdaptation: "Tight structure + weekly check-ins + breaking big goals into micro-steps"
  },
  "The Quiet High-Potential Thinker": {
    corePattern: "Deep intellectual curiosity + understated presentation + needs narrative unlocking",
    coachingAdaptation: "Socratic questioning + reflection prompts + validate intellectual depth"
  },
  "The Overcommitted Perfectionist": {
    corePattern: "Maxed-out schedule + can't say no + burnout risk",
    coachingAdaptation: "Permission to prune + depth over breadth reframe + energy management"
  },
  "The Low-Agency Bright Drifter": {
    corePattern: "Capable but passive + follows path of least resistance + needs activation",
    coachingAdaptation: "Discovery prompts + small wins strategy + autonomy building"
  },
  "The Narrative-Lost but Curious Freshman": {
    corePattern: "Early in journey + open to guidance + high growth potential",
    coachingAdaptation: "Exploration roadmap + low-pressure experimentation + monthly milestone check-ins"
  },
  "The Transactional Just-Tell-Me-What-To-Do Student": {
    corePattern: "Views coaching as checklist + low intrinsic engagement + needs EQ bridge",
    coachingAdaptation: "Start transactional, layer in EQ gradually + tie actions to values over time"
  }
} as const;
