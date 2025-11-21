import { jennyAssessmentStructuredSchema_v1, JennyAssessmentStructured_v1 } from '../jennyAssessmentStructured_v1';

/**
 * Component 2 Tests - Jenny Assessment Structured Schema v1
 *
 * Tests cover:
 * - Schema validation for complete assessment
 * - Required field validation
 * - Optional field handling
 * - Nested object validation
 * - Type coercion and strict mode
 */

describe('Component 2 - Jenny Assessment Structured Schema v1', () => {
  /**
   * Test 1: Valid complete assessment passes validation
   */
  test('valid complete assessment passes validation', () => {
    const validAssessment: JennyAssessmentStructured_v1 = {
      student_id: 'test_student_001',
      session_metadata: {
        student_archetype: 'Emerging Creative Pre-Med',
        alternate_archetype_labels: ['High-EQ Low-GPA Pre-Med Junior'],
        grade_level: 11,
        session_duration_minutes: 60,
        coach_id: 'Jenny Duan',
        supporting_coaches: ['Coach A', 'Coach B'],
        session_date: '2025-04-24',
        student_readiness_score: 6.0,
        academic_score: 5.5,
        ec_score: 7.0,
        character_score: 7.0,
        fit_score: 5.0,
        signature_project_identified: true,
        signature_project: 'Mental Wellness for Kids',
        timeline_urgency: 'CRITICAL',
        months_until_applications: 4,
        application_deadline: 'UC applications open August 2025',
        primary_challenge: 'Academic performance below target',
        geographic_location: 'Mountain House, CA',
        school_context: 'Mountain House High School',
        cultural_background: 'Muslim-American',
        family_support_level: 'high',
        family_context: 'Immigrant family context',
      },
      student_profile: {
        demographics: {
          grade: '11th (Junior)',
          school: 'Mountain House High School',
          location: 'Mountain House, CA',
          cultural_background: 'Muslim-American',
          family_context: 'Immigrant family',
        },
        academic_standing: {
          gpa_weighted: 3.7,
          gpa_unweighted: 3.3,
          sat_score: 1060,
          key_academic_issues: ['GPA below UC Davis range'],
          current_courses: 'AP Psychology, Physics, Math 3',
          planned_senior_courses: 'AP Biology, AP Calculus AB',
          academic_readiness_score: 5.5,
        },
        current_involvement: {
          leadership: [
            {
              role: 'Founder & President',
              organization: 'Care 4 Kids Club',
              description: 'Provides STEM education to children',
            },
          ],
          recent_achievements: ['UCLA Pre-Med Scholars acceptance', 'HOSA 3rd place'],
          ec_readiness_score: 7.0,
        },
        career_aspiration: {
          goal: 'Doctor, specifically pediatrics',
          personal_motivation: 'Family illness experiences',
          authenticity: 'Authentic - sustained commitment',
          interests: 'Psychology/mental health, pediatrics',
        },
        character_readiness_score: 7.0,
        institutional_fit_score: 5.0,
      },
      key_challenges: {
        challenge_1: {
          issue: 'Academic performance below target',
          evidence: 'GPA 3.7W below UC Davis range',
          severity: 'CRITICAL',
          priority: 'P0 Weak Spot #1',
          impact: 'Without GPA/SAT improvement, all other efforts may not matter',
        },
      },
      frameworks_introduced: [
        {
          framework_name: 'ROI-Based Prioritization Matrix',
          framework_type: 'Time Management / Strategic Focus',
        },
      ],
      strategic_recommendations: {
        academic_strategy: {
          p0_priority: 'Senior Year Academic Performance',
          senior_year_courses: 'AP Biology, AP Calculus AB, AP Literature',
          grade_optimization: ['Weekly grade monitoring', 'Subject-specific tutoring'],
          rationale: 'Academic metrics remain strongest predictor',
        },
        extracurricular_strategy: {},
        awards_strategy: {
          immediate_applications: ['Presidential Volunteer Service Award'],
        },
        narrative_strategy: {
          core_message: 'Muslim-American girl committed to holistic pediatric care',
          timeline: 'Narrative must be finalized by August 2025',
        },
        college_list_strategy: {
          reach: ['UC Davis', 'UC Irvine'],
          fit: ['San Diego State', 'CSU Fullerton'],
          safety: ['Arizona State'],
          program_considerations: ['Direct-admit nursing programs'],
        },
      },
      timeline_and_milestones: {},
      narrative_development: {
        initial_state: {
          clarity_score: 4,
          stated_interests: 'Pre-med, pediatrics',
          career_goal: 'Doctor, specifically pediatrics',
          connection_between_interests: 'Minimal',
          problem: 'Generic pre-med profile',
        },
        discovery_process: {},
        breakthrough_synthesis: {
          jenny_synthesis: 'Connected Muslim-American identity + family illness',
          result: 'Healing Mind and Body in Muslim American Community',
          narrative_arc: ['Personal Catalyst', 'Intellectual Journey', 'Service Through Leadership'],
          clarity_score_after: 8,
          positioning: 'Future Muslim American healthcare provider',
        },
        differentiation_strategy: {},
      },
      coaching_tactics_observed: {},
      knowledge_moat_insights: [
        {
          insight: 'ROI-Based Prioritization for time-constrained students',
          generic_advice_contrast: 'Do everything you can to improve profile',
          beya_strategy: 'P0/P1/P2 framework explicitly says what NOT to do',
          why_unique: 'Most counselors add suggestions; Jenny strategically eliminates options',
          competitive_moat: 'Framework for systematically triaging weak spots',
        },
      ],
    };

    const result = jennyAssessmentStructuredSchema_v1.safeParse(validAssessment);
    expect(result.success).toBe(true);
  });

  /**
   * Test 2: Missing required fields fail validation
   */
  test('missing required fields fail validation', () => {
    const invalidAssessment = {
      student_id: 'test_student_001',
      // Missing session_metadata
      student_profile: {
        demographics: {
          grade: '11th',
          school: 'Test School',
          location: 'Test Location',
          cultural_background: 'Test Background',
          family_context: 'Test Context',
        },
      },
    };

    const result = jennyAssessmentStructuredSchema_v1.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });

  /**
   * Test 3: Optional fields can be omitted
   */
  test('optional fields can be omitted', () => {
    const minimalAssessment: Partial<JennyAssessmentStructured_v1> = {
      student_id: 'test_student_002',
      session_metadata: {
        student_archetype: 'Test Archetype',
        alternate_archetype_labels: [],
        grade_level: 11,
        session_duration_minutes: 60,
        coach_id: 'Test Coach',
        supporting_coaches: [],
        session_date: '2025-04-24',
        student_readiness_score: 6.0,
        academic_score: 5.5,
        ec_score: 7.0,
        character_score: 7.0,
        fit_score: 5.0,
        signature_project_identified: false,
        timeline_urgency: 'MEDIUM',
        months_until_applications: 12,
        application_deadline: 'Next year',
        primary_challenge: 'Test challenge',
        geographic_location: 'Test Location',
        school_context: 'Test School',
        cultural_background: 'Test Background',
        family_support_level: 'medium',
        family_context: 'Test Context',
      },
      student_profile: {
        demographics: {
          grade: '11th',
          school: 'Test School',
          location: 'Test Location',
          cultural_background: 'Test Background',
          family_context: 'Test Context',
        },
        academic_standing: {
          gpa_weighted: null,
          gpa_unweighted: null,
          sat_score: null,
          key_academic_issues: [],
          current_courses: 'None',
          planned_senior_courses: 'None',
          academic_readiness_score: 5.0,
        },
        current_involvement: {
          leadership: [],
          recent_achievements: [],
          ec_readiness_score: 5.0,
        },
        career_aspiration: {
          goal: 'Undecided',
          personal_motivation: 'None',
          authenticity: 'N/A',
          interests: 'None',
        },
        character_readiness_score: 5.0,
        institutional_fit_score: 5.0,
      },
      key_challenges: {
        challenge_1: {
          issue: 'Test issue',
          evidence: 'Test evidence',
          severity: 'LOW',
          priority: 'P2',
          impact: 'Test impact',
        },
      },
      frameworks_introduced: [],
      strategic_recommendations: {
        academic_strategy: {
          p0_priority: 'Test priority',
          senior_year_courses: 'Test courses',
          grade_optimization: [],
          rationale: 'Test rationale',
        },
        extracurricular_strategy: {},
        awards_strategy: {
          immediate_applications: [],
        },
        narrative_strategy: {
          core_message: 'Test message',
          timeline: 'Test timeline',
        },
        college_list_strategy: {
          reach: [],
          fit: [],
          safety: [],
          program_considerations: [],
        },
      },
      timeline_and_milestones: {},
      narrative_development: {
        initial_state: {
          clarity_score: 1,
          stated_interests: 'None',
          career_goal: 'Unknown',
          connection_between_interests: 'None',
          problem: 'None',
        },
        discovery_process: {},
        breakthrough_synthesis: {
          jenny_synthesis: 'None',
          result: 'None',
          narrative_arc: [],
          clarity_score_after: 1,
          positioning: 'None',
        },
        differentiation_strategy: {},
      },
      coaching_tactics_observed: {},
      knowledge_moat_insights: [],
    };

    const result = jennyAssessmentStructuredSchema_v1.safeParse(minimalAssessment);
    expect(result.success).toBe(true);
  });

  /**
   * Test 4: Validate nested object structures
   */
  test('validate nested object structures', () => {
    const assessment = {
      student_id: 'test_student_003',
      session_metadata: {
        student_archetype: 'Test',
        alternate_archetype_labels: ['Label 1', 'Label 2'],
        grade_level: 11,
        session_duration_minutes: 60,
        coach_id: 'Jenny',
        supporting_coaches: ['Coach A'],
        session_date: '2025-04-24',
        student_readiness_score: 6.0,
        academic_score: 5.5,
        ec_score: 7.0,
        character_score: 7.0,
        fit_score: 5.0,
        signature_project_identified: true,
        signature_project: 'Test Project',
        timeline_urgency: 'HIGH',
        months_until_applications: 6,
        application_deadline: 'Test Deadline',
        primary_challenge: 'Test Challenge',
        geographic_location: 'Test Location',
        school_context: 'Test School',
        cultural_background: 'Test Background',
        family_support_level: 'high',
        family_context: 'Test Context',
      },
      student_profile: {
        demographics: {
          grade: '11th',
          school: 'Test School',
          location: 'Test Location',
          cultural_background: 'Test Background',
          family_context: 'Test Context',
        },
        academic_standing: {
          gpa_weighted: 3.5,
          gpa_unweighted: 3.2,
          sat_score: 1200,
          sat_breakdown: '600 Reading, 600 Math',
          current_grades_junior: 'All As and Bs',
          ap_scores: 'AP World History (4)',
          key_academic_issues: ['Needs improvement in Math'],
          current_courses: 'AP Biology, Honors Chemistry',
          planned_senior_courses: 'AP Calculus, AP Physics',
          academic_readiness_score: 7.0,
        },
        current_involvement: {
          leadership: [
            {
              role: 'President',
              organization: 'Science Club',
              description: 'Leading science initiatives',
              hours_per_week: 5,
              years_involved: 2,
              outcomes: ['Organized science fair', 'Increased membership by 50%'],
            },
          ],
          clinical_experience: [
            {
              program: 'Hospital Volunteering',
              skills: 'Patient care',
              significance: 'Gained healthcare experience',
            },
          ],
          volunteering: {
            total_hours: '200+',
            breakdown: [
              { activity: 'Hospital', hours: 150 },
              { activity: 'Library', hours: 50 },
            ],
          },
          recent_achievements: ['Science Fair Winner', 'Honor Roll'],
          other: 'National Honor Society member',
          ec_readiness_score: 8.0,
        },
        career_aspiration: {
          goal: 'Physician',
          specialization_emerging: 'Cardiology',
          personal_motivation: 'Family medical history',
          authenticity: 'Strong',
          interests: 'Medicine, biology, helping others',
          personal_hobbies: ['Reading', 'Running'],
        },
        character_readiness_score: 8.0,
        institutional_fit_score: 7.0,
      },
      key_challenges: {
        challenge_1: {
          issue: 'GPA needs improvement',
          evidence: 'Below target school requirements',
          gameplan_quote: 'Focus on senior year grades',
          severity: 'HIGH',
          priority: 'P0',
          impact: 'Critical for admissions',
        },
        challenge_2: {
          issue: 'Limited leadership depth',
          evidence: 'Only one major leadership role',
          severity: 'MEDIUM',
          priority: 'P1',
          impact: 'Moderate impact on profile',
        },
      },
      frameworks_introduced: [
        {
          framework_name: 'Test Framework',
          framework_type: 'Assessment',
          introduced_in_section: 'Section 1',
          trigger: 'Student needs assessment',
          key_components: ['Component 1', 'Component 2'],
          student_archetype_fit: ['All students'],
          effectiveness_indicator: 'High effectiveness',
          replicability: 'HIGH',
        },
      ],
      strategic_recommendations: {
        academic_strategy: {
          p0_priority: 'Improve GPA',
          senior_year_courses: 'AP Calculus, AP Physics',
          grade_optimization: ['Weekly tutoring', 'Study groups'],
          sat_strategy: {
            current_score: 1200,
            target_score: '1400+',
            plan: 'Daily practice, monthly tests',
          },
          rationale: 'Academic excellence is critical',
        },
        extracurricular_strategy: {
          signature_project: {
            name: 'Community Health Initiative',
            timeline: 'June-November 2025',
            components: ['Health workshops', 'Community outreach'],
            rationale: 'Demonstrates leadership and service',
          },
          healthcare_certifications: ['CPR', 'First Aid'],
          what_not_to_do_p2: ['Start new clubs', 'Join too many organizations'],
        },
        awards_strategy: {
          immediate_applications: ['Science Olympiad', 'Regional competitions'],
          scholarship_applications: ['Merit scholarships', 'Need-based aid'],
          school_recognition: 'Departmental awards',
        },
        narrative_strategy: {
          core_message: 'Aspiring physician with community focus',
          differentiation_from_generic_premed: [
            'Unique community health angle',
            'Strong leadership in science',
          ],
          target_school_tailoring: ['Research programs at each school'],
          timeline: 'Finalize by August 2025',
          thematic_hubs: ['Academic Excellence', 'Community Service', 'Healthcare Innovation'],
        },
        college_list_strategy: {
          reach: ['Stanford', 'UC Berkeley'],
          fit: ['UC Davis', 'UC Irvine'],
          safety: ['UC Merced', 'UC Riverside'],
          program_considerations: ['Pre-med programs', 'Research opportunities'],
        },
      },
      timeline_and_milestones: {
        immediate_may_2025: {
          priorities: ['Finalize senior courses', 'Start SAT prep'],
          critical_deadline: 'Course selection due May 15',
        },
        summer_2025_may_to_august: {
          priorities: ['SAT intensive', 'Launch signature project', 'Healthcare certifications'],
          critical_milestone: 'Complete signature project planning',
        },
        fall_2025_august_to_december: {
          priorities: ['UC applications', 'Continue project', 'Final SAT attempt'],
          critical_deadline: 'UC applications due November 30',
          key_milestone: 'All essays drafted by August',
        },
      },
      narrative_development: {
        initial_state: {
          clarity_score: 5,
          stated_interests: 'Medicine, science',
          career_goal: 'Physician',
          connection_between_interests: 'Moderate',
          problem: 'Generic pre-med profile',
        },
        discovery_process: {
          family_health_experiences: 'Grandparent with heart disease',
          personal_hobbies: 'Running marathons',
          key_discoveries: ['Connection between fitness and health', 'Community health needs'],
        },
        breakthrough_synthesis: {
          jenny_synthesis: 'Connected family health history + running passion + science interests',
          result: 'Aspiring cardiologist focused on preventive health through community fitness',
          narrative_arc: [
            'Personal catalyst from family health',
            'Developed passion for fitness and health',
            'Leading community health initiatives',
          ],
          clarity_score_after: 9,
          positioning: 'Future physician-scientist promoting preventive cardiology',
        },
        differentiation_strategy: {
          contrast_generic_premed: {
            generic: 'Wants to help people, hospital volunteering',
            student: 'Preventive cardiology through community fitness programs',
          },
          identity_integration: 'Fitness athlete identity integrated into medical aspirations',
          unique_positioning: 'Only pre-med combining marathon running with cardiology focus',
        },
      },
      coaching_tactics_observed: {
        urgency_creation: {
          tactic: 'Timeline pressure',
          example: '6 months until applications',
          effectiveness: 'High - creates focus',
        },
      },
      knowledge_moat_insights: [
        {
          insight: 'Hobby integration into career narrative',
          generic_advice_contrast: 'Keep hobbies separate from career goals',
          student_strategy: 'Integrate running into preventive cardiology narrative',
          why_unique: 'Creates distinctive positioning',
          competitive_moat: 'Understanding how to authentically connect personal interests to career',
        },
      ],
    };

    const result = jennyAssessmentStructuredSchema_v1.safeParse(assessment);
    expect(result.success).toBe(true);
  });

  /**
   * Test 5: Invalid data types fail validation
   */
  test('invalid data types fail validation', () => {
    const invalidAssessment = {
      student_id: 'test_student_004',
      session_metadata: {
        student_archetype: 'Test',
        alternate_archetype_labels: ['Label'],
        grade_level: '11', // Should be number, not string
        session_duration_minutes: 60,
        coach_id: 'Jenny',
        supporting_coaches: [],
        session_date: '2025-04-24',
        student_readiness_score: 6.0,
        academic_score: 5.5,
        ec_score: 7.0,
        character_score: 7.0,
        fit_score: 5.0,
        signature_project_identified: true,
        timeline_urgency: 'HIGH',
        months_until_applications: 6,
        application_deadline: 'Test',
        primary_challenge: 'Test',
        geographic_location: 'Test',
        school_context: 'Test',
        cultural_background: 'Test',
        family_support_level: 'high',
        family_context: 'Test',
      },
    };

    const result = jennyAssessmentStructuredSchema_v1.safeParse(invalidAssessment);
    expect(result.success).toBe(false);
  });
});
