import { z } from 'zod';

/**
 * Jenny Assessment Structured Schema v1.0
 * Schema for structured student assessment files from Jenny's coaching sessions
 * Used to load and validate structured student data before mapping to canonical formats
 */

// ============================================================
// SESSION METADATA
// ============================================================

export const sessionMetadataSchema = z.object({
  student_archetype: z.string(),
  sub_archetype: z.string().optional(),
  alternate_archetype_labels: z.array(z.string()).optional(),
  grade_level: z.number(),
  session_duration_minutes: z.union([z.number(), z.record(z.string(), z.number())]).optional(),
  session_dates: z.record(z.string(), z.string()).optional(),
  session_type: z.string().optional(),
  school_type: z.string().optional(),
  school_name: z.string().optional(),
  location: z.string().optional(),
  coach_id: z.string().optional(),
  supporting_coaches: z.array(z.string()).optional(),
  session_date: z.string().optional(),
  student_readiness_score: z.number().optional(),
  narrative_clarity_start: z.number().optional(),
  narrative_clarity_end: z.number().optional(),
  parent_involvement: z.string().optional(),
  parent_present: z.string().optional(),
  intended_major_stated: z.string().optional(),
  intended_major_recommended: z.string().optional(),
  authentic_passion_level: z.number().optional(),
  discovery_vs_prescriptive_ratio: z.string().optional(),
  academic_score: z.number().optional(),
  ec_score: z.number().optional(),
  character_score: z.number().optional(),
  fit_score: z.number().optional(),
  signature_project_identified: z.boolean().optional(),
  signature_project: z.string().optional(),
  timeline_urgency: z.string().optional(),
  months_until_applications: z.number().optional(),
  application_deadline: z.string().optional(),
  primary_challenge: z.string().optional(),
  secondary_challenge: z.string().optional(),
  tertiary_challenge: z.string().optional(),
  geographic_location: z.string().optional(),
  school_context: z.string().optional(),
  cultural_background: z.string().optional(),
  family_support_level: z.string().optional(),
  family_context: z.string().optional(),
});

// ============================================================
// ACADEMICS
// ============================================================

export const academicStandingSchema = z.object({
  gpa_weighted: z.number().nullable(),
  gpa_unweighted: z.number().nullable(),
  sat_score: z.number().nullable(),
  sat_breakdown: z.string().optional(),
  sat_practice_potential: z.number().optional(),
  act_score: z.number().optional(),
  current_grades_junior: z.string().optional(),
  current_grades_senior: z.string().optional(),
  ap_scores: z.string().optional(),
  key_academic_issues: z.array(z.string()),
  current_courses: z.string(),
  planned_senior_courses: z.string(),
  academic_readiness_score: z.number(),
});

// ============================================================
// ACTIVITIES
// ============================================================

export const leadershipSchema = z.object({
  role: z.string(),
  organization: z.string(),
  description: z.string(),
  impact_metrics_missing: z.string().optional(),
  outcomes: z.array(z.string()).optional(),
  hours_per_week: z.number().optional(),
  years_involved: z.number().optional(),
});

export const clinicalExperienceSchema = z.object({
  program: z.string().optional(),
  planned: z.string().optional(),
  skills: z.string().optional(),
  significance: z.string().optional(),
  status: z.string().optional(),
});

export const volunteeringSchema = z.object({
  total_hours: z.string(),
  breakdown: z.array(
    z.object({
      activity: z.string(),
      hours: z.union([z.number(), z.string()]),
    })
  ),
});

export const currentInvolvementSchema = z.object({
  leadership: z.array(leadershipSchema),
  clinical_experience: z.array(clinicalExperienceSchema).optional(),
  volunteering: volunteeringSchema.optional(),
  recent_achievements: z.array(z.string()),
  other: z.string().optional(),
  ec_readiness_score: z.number(),
});

// ============================================================
// CAREER & PERSONALITY
// ============================================================

export const careerAspirationSchema = z.object({
  goal: z.string(),
  specialization_emerging: z.string().optional(),
  personal_motivation: z.string(),
  authenticity: z.string(),
  interests: z.string(),
  personal_hobbies: z.array(z.string()).optional(),
});

// ============================================================
// DEMOGRAPHICS & CONTEXT
// ============================================================

export const demographicsSchema = z.object({
  grade: z.string(),
  school: z.string(),
  location: z.string(),
  cultural_background: z.string(),
  family_context: z.string(),
});

export const studentProfileSchema = z.object({
  demographics: demographicsSchema,
  academic_standing: academicStandingSchema,
  current_involvement: currentInvolvementSchema,
  career_aspiration: careerAspirationSchema,
  character_readiness_score: z.number(),
  institutional_fit_score: z.number(),
});

// ============================================================
// CHALLENGES
// ============================================================

export const challengeSchema = z.object({
  issue: z.string(),
  evidence: z.string(),
  gameplan_quote: z.string().optional(),
  severity: z.string(),
  priority: z.string(),
  impact: z.string(),
});

export const keyChallengesSchema = z.object({
  challenge_1: challengeSchema,
  challenge_2: challengeSchema.optional(),
  challenge_3: challengeSchema.optional(),
  challenge_4: challengeSchema.optional(),
  challenge_5: challengeSchema.optional(),
  challenge_6: challengeSchema.optional(),
});

// ============================================================
// FRAMEWORKS
// ============================================================

export const frameworkSchema = z.object({
  framework_name: z.string(),
  framework_type: z.string().optional(),
  introduced_in_section: z.string().optional(),
  trigger: z.string().optional(),
  key_components: z.array(z.string()).optional(),
  evaluation_criteria: z.array(z.string()).optional(),
  p0_examples: z.array(z.string()).optional(),
  p2_examples_what_not_to_do: z.array(z.string()).optional(),
  student_archetype_fit: z.array(z.string()).optional(),
  effectiveness_indicator: z.string().optional(),
  replicability: z.string().optional(),
  overall_score: z.string().optional(),
  category_scores: z.record(z.string(), z.number()).optional(),
  formula: z.string().optional(),
  beya_specific_application: z.record(z.string(), z.string()).optional(),
  core_narrative: z.string().optional(),
  narrative_components: z.record(z.string(), z.string()).optional(),
  differentiation_strategy: z.array(z.string()).optional(),
  uc_piq_mapping: z.record(z.string(), z.string()).optional(),
  positioning: z.string().optional(),
  key_principle: z.string().optional(),
  immediate_applications: z.array(z.string()).optional(),
  key_message: z.string().optional(),
  uc_admissions_rubric: z.record(z.string(), z.string()).optional(),
  purpose: z.union([z.array(z.string()), z.string()]).optional(),
  introduction_language: z.string().optional(),
  disclaimer: z.string().optional(),
  contrast_with_zainab: z.string().optional(),
  explicit_statement: z.string().optional(),
  other_applications: z.array(z.string()).optional(),
  award_categories_targeted: z.array(z.string()).optional(),
  strategy: z.string().optional(),
  timeline: z.string().optional(),
  project_components: z.array(z.string()).optional(),
  why_powerful: z.array(z.string()).optional(),
  competitive_comparison: z.string().optional(),
  specific_gaps_identified: z.array(z.string()).optional(),
});

// ============================================================
// STRATEGIC RECOMMENDATIONS
// ============================================================

export const academicStrategySchema = z.object({
  p0_priority: z.string(),
  senior_year_courses: z.string(),
  grade_optimization: z.array(z.string()),
  sat_strategy: z
    .object({
      current_score: z.number(),
      target_score: z.string(),
      evidence_of_potential: z.string().optional(),
      plan: z.string(),
    })
    .optional(),
  act_strategy: z
    .object({
      current_score: z.number().optional(),
      target_score: z.string(),
      plan: z.string(),
    })
    .optional(),
  rationale: z.string(),
});

export const signatureProjectSchema = z.object({
  name: z.string(),
  timeline: z.string(),
  components: z.array(z.string()),
  rationale: z.string(),
});

export const extracurricularStrategySchema = z.object({
  signature_project: signatureProjectSchema.optional(),
  red_cross_leadership: z.array(z.string()).optional(),
  healthcare_certifications: z.array(z.string()).optional(),
  clinical_experience: z.array(z.string()).optional(),
  what_not_to_do_p2: z.array(z.string()).optional(),
  other_activities: z.array(z.string()).optional(),
});

export const awardsStrategySchema = z.object({
  immediate_applications: z.array(z.string()),
  scholarship_applications: z.array(z.string()).optional(),
  hosa_competition: z.string().optional(),
  school_recognition: z.string().optional(),
  art_competitions: z.array(z.string()).optional(),
});

export const narrativeStrategySchema = z.object({
  core_message: z.string(),
  differentiation_from_generic_premed: z.array(z.string()).optional(),
  target_school_tailoring: z.array(z.string()).optional(),
  timeline: z.string(),
  thematic_hubs: z.array(z.string()).optional(),
});

export const collegeListStrategySchema = z.object({
  reach: z.array(z.string()),
  fit: z.array(z.string()),
  safety: z.array(z.string()),
  program_considerations: z.array(z.string()),
});

export const strategicRecommendationsSchema = z.object({
  academic_strategy: academicStrategySchema,
  extracurricular_strategy: extracurricularStrategySchema,
  awards_strategy: awardsStrategySchema,
  narrative_strategy: narrativeStrategySchema,
  college_list_strategy: collegeListStrategySchema,
});

// ============================================================
// TIMELINE & MILESTONES
// ============================================================

export const monthlyMilestoneSchema = z.object({
  priorities: z.array(z.string()),
  critical_deadline: z.string().optional(),
  critical_milestone: z.string().optional(),
  key_milestone: z.string().optional(),
});

export const timelineAndMilestonesSchema = z.object({
  immediate_may_2025: monthlyMilestoneSchema.optional(),
  summer_2025_may_to_august: monthlyMilestoneSchema.optional(),
  fall_2025_august_to_december: monthlyMilestoneSchema.optional(),
  spring_2025: monthlyMilestoneSchema.optional(),
  summer_2025: monthlyMilestoneSchema.optional(),
  fall_2025: monthlyMilestoneSchema.optional(),
  academic_year_2025_2026: monthlyMilestoneSchema.optional(),
});

// ============================================================
// NARRATIVE DEVELOPMENT
// ============================================================

export const initialStateSchema = z.object({
  clarity_score: z.number(),
  stated_interests: z.string(),
  career_goal: z.string(),
  connection_between_interests: z.string(),
  problem: z.string(),
});

export const discoveryProcessSchema = z.object({
  family_health_experiences: z.string().optional(),
  psychology_interest: z.string().optional(),
  personal_hobbies: z.string().optional(),
  cultural_identity: z.string().optional(),
  pediatric_focus: z.string().optional(),
  care_4_kids_leadership: z.string().optional(),
  art_interest: z.string().optional(),
  medical_illustration: z.string().optional(),
  key_discoveries: z.array(z.string()).optional(),
});

export const breakthroughSynthesisSchema = z.object({
  jenny_synthesis: z.string(),
  result: z.string(),
  narrative_arc: z.array(z.string()),
  clarity_score_after: z.number(),
  positioning: z.string(),
});

export const differentiationStrategySchema = z.object({
  contrast_generic_premed: z
    .object({
      generic: z.string(),
      beya: z.string().optional(),
      zainab: z.string().optional(),
      student: z.string().optional(),
    })
    .optional(),
  identity_integration: z.string().optional(),
  hobby_integration: z.string().optional(),
  unique_positioning: z.string().optional(),
  key_differentiators: z.array(z.string()).optional(),
});

export const narrativeDevelopmentSchema = z.object({
  initial_state: initialStateSchema,
  discovery_process: discoveryProcessSchema,
  breakthrough_synthesis: breakthroughSynthesisSchema,
  differentiation_strategy: differentiationStrategySchema,
});

// ============================================================
// COACHING TACTICS
// ============================================================

export const coachingTacticSchema = z.object({
  tactic: z.string(),
  example: z.string().optional(),
  examples: z.array(z.string()).optional(),
  effectiveness: z.string(),
  contrast_with_zainab: z.string().optional(),
  matrix_provided: z.string().optional(),
  p2_examples: z.string().optional(),
  overall_score: z.string().optional(),
  category_breakdown: z.string().optional(),
  comparison_data: z.string().optional(),
  opening: z.string().optional(),
  structure: z.string().optional(),
  academic_gap: z.string().optional(),
  feasibility_evidence: z.string().optional(),
  disclaimer: z.string().optional(),
  assignment: z.string().optional(),
  explicit_statement: z.string().optional(),
  rubric_provided: z.string().optional(),
});

export const coachingTacticsObservedSchema = z.object({
  urgency_creation: coachingTacticSchema.optional(),
  roi_based_prioritization: coachingTacticSchema.optional(),
  quantified_assessment: coachingTacticSchema.optional(),
  affirmation_before_criticism: coachingTacticSchema.optional(),
  data_backed_urgency: coachingTacticSchema.optional(),
  explicit_expectation_setting: coachingTacticSchema.optional(),
  team_based_coaching: coachingTacticSchema.optional(),
  immigrant_family_education: coachingTacticSchema.optional(),
});

// ============================================================
// KNOWLEDGE MOAT INSIGHTS
// ============================================================

export const knowledgeMoatInsightSchema = z.object({
  insight: z.string(),
  generic_advice_contrast: z.string(),
  beya_strategy: z.string().optional(),
  zainab_strategy: z.string().optional(),
  student_strategy: z.string().optional(),
  why_unique: z.string(),
  competitive_moat: z.string(),
});

// ============================================================
// FULL JENNY ASSESSMENT STRUCTURED v1
// ============================================================

export const jennyAssessmentStructuredSchema_v1 = z.object({
  student_id: z.string(),
  extraction_date: z.string().optional(),
  coach_id: z.string().optional(),
  additional_coaches: z.array(z.string()).optional(),
  session_metadata: sessionMetadataSchema,
  student_profile: z.union([studentProfileSchema, z.record(z.string(), z.any())]),
  key_challenges: z.union([keyChallengesSchema, z.array(z.any())]).optional(),
  breakthrough_moments: z.array(z.any()).optional(),
  critical_interventions: z.array(z.any()).optional(),
  narrative_development: z.union([narrativeDevelopmentSchema, z.record(z.string(), z.any())]).optional(),
  frameworks_introduced: z.array(frameworkSchema).optional(),
  strategic_recommendations: z.union([strategicRecommendationsSchema, z.record(z.string(), z.any())]).optional(),
  timeline_and_priorities: z.record(z.string(), z.any()).optional(),
  timeline_and_milestones: timelineAndMilestonesSchema.optional(),
  coaching_tactics_observed: z.union([coachingTacticsObservedSchema, z.record(z.string(), z.any())]).optional(),
  meta_coaching_moments: z.record(z.string(), z.any()).optional(),
  knowledge_moat_insights: z.union([z.array(knowledgeMoatInsightSchema), z.record(z.string(), z.any())]).optional(),
  questions_by_phase: z.record(z.string(), z.any()).optional(),
  archetype_specific_patterns: z.record(z.string(), z.any()).optional(),
  success_metrics_defined: z.record(z.string(), z.any()).optional(),
  effectiveness_indicators: z.record(z.string(), z.any()).optional(),
  gameplan_structure_analysis: z.record(z.string(), z.any()).optional(),
  comparison_with_zainab: z.record(z.string(), z.any()).optional(),
  validation_moments: z.record(z.string(), z.string()).optional(),
  conversation_history: z.record(z.string(), z.any()).optional(),
});

export type JennyAssessmentStructured_v1 = z.infer<typeof jennyAssessmentStructuredSchema_v1>;

// ============================================================
// SUB-TYPES FOR CONVENIENCE
// ============================================================

export type JennySessionMetadata = z.infer<typeof sessionMetadataSchema>;
export type JennyAcademicStanding = z.infer<typeof academicStandingSchema>;
export type JennyLeadership = z.infer<typeof leadershipSchema>;
export type JennyClinicalExperience = z.infer<typeof clinicalExperienceSchema>;
export type JennyVolunteering = z.infer<typeof volunteeringSchema>;
export type JennyCurrentInvolvement = z.infer<typeof currentInvolvementSchema>;
export type JennyCareerAspiration = z.infer<typeof careerAspirationSchema>;
export type JennyDemographics = z.infer<typeof demographicsSchema>;
export type JennyStudentProfile = z.infer<typeof studentProfileSchema>;
export type JennyChallenge = z.infer<typeof challengeSchema>;
export type JennyKeyChallenges = z.infer<typeof keyChallengesSchema>;
export type JennyFramework = z.infer<typeof frameworkSchema>;
export type JennyAcademicStrategy = z.infer<typeof academicStrategySchema>;
export type JennySignatureProject = z.infer<typeof signatureProjectSchema>;
export type JennyExtracurricularStrategy = z.infer<typeof extracurricularStrategySchema>;
export type JennyAwardsStrategy = z.infer<typeof awardsStrategySchema>;
export type JennyNarrativeStrategy = z.infer<typeof narrativeStrategySchema>;
export type JennyCollegeListStrategy = z.infer<typeof collegeListStrategySchema>;
export type JennyStrategicRecommendations = z.infer<typeof strategicRecommendationsSchema>;
export type JennyMonthlyMilestone = z.infer<typeof monthlyMilestoneSchema>;
export type JennyTimelineAndMilestones = z.infer<typeof timelineAndMilestonesSchema>;
export type JennyInitialState = z.infer<typeof initialStateSchema>;
export type JennyDiscoveryProcess = z.infer<typeof discoveryProcessSchema>;
export type JennyBreakthroughSynthesis = z.infer<typeof breakthroughSynthesisSchema>;
export type JennyDifferentiationStrategy = z.infer<typeof differentiationStrategySchema>;
export type JennyNarrativeDevelopment = z.infer<typeof narrativeDevelopmentSchema>;
export type JennyCoachingTactic = z.infer<typeof coachingTacticSchema>;
export type JennyCoachingTacticsObserved = z.infer<typeof coachingTacticsObservedSchema>;
export type JennyKnowledgeMoatInsight = z.infer<typeof knowledgeMoatInsightSchema>;
