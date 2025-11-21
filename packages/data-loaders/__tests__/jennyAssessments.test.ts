import {
  listJennyAssessmentFiles,
  loadJennyAssessmentById,
  loadAllJennyAssessments,
  isJennyAssessmentStructured,
  listJennyStudentIds,
} from '../jennyAssessments';

/**
 * Component 3 Tests - Jenny Assessment Data Loader
 *
 * Tests cover:
 * - Listing assessment files
 * - Loading assessment by ID
 * - Loading all assessments
 * - Type guard validation
 * - Error handling for missing files
 * - Error handling for invalid JSON
 * - Error handling for validation failures
 */

describe('Component 3 - Jenny Assessment Data Loader', () => {
  /**
   * Test 1: List all Jenny assessment files
   */
  test('list all Jenny assessment files', async () => {
    const files = await listJennyAssessmentFiles();

    expect(Array.isArray(files)).toBe(true);
    expect(files.length).toBeGreaterThan(0);

    // All files should be JSON files
    files.forEach((file) => {
      expect(file).toMatch(/\.json$/);
    });
  });

  /**
   * Test 2: Load Jenny assessment by student ID
   */
  test('load Jenny assessment by student ID', async () => {
    // Using a known student ID from the sample file
    const assessment = await loadJennyAssessmentById('011');

    expect(assessment).toBeDefined();
    expect(assessment.student_id).toBeDefined();
    expect(assessment.session_metadata).toBeDefined();
    expect(assessment.student_profile).toBeDefined();
  });

  /**
   * Test 3: Load Jenny assessment by full student ID
   */
  test('load Jenny assessment by full student ID', async () => {
    const assessment = await loadJennyAssessmentById('beya_bareeha_011');

    expect(assessment).toBeDefined();
    expect(assessment.student_id).toBe('beya_bareeha_011');
  });

  /**
   * Test 4: Load all Jenny assessments
   */
  test('load all Jenny assessments', async () => {
    const assessments = await loadAllJennyAssessments();

    expect(Array.isArray(assessments)).toBe(true);
    expect(assessments.length).toBeGreaterThan(0);

    // All assessments should have required fields
    assessments.forEach((assessment) => {
      expect(assessment.student_id).toBeDefined();
      expect(assessment.session_metadata).toBeDefined();
      expect(assessment.student_profile).toBeDefined();
      expect(assessment.key_challenges).toBeDefined();
      expect(assessment.frameworks_introduced).toBeDefined();
      expect(assessment.strategic_recommendations).toBeDefined();
      expect(assessment.timeline_and_milestones).toBeDefined();
      expect(assessment.narrative_development).toBeDefined();
      expect(assessment.coaching_tactics_observed).toBeDefined();
      expect(assessment.knowledge_moat_insights).toBeDefined();
    });
  });

  /**
   * Test 5: Type guard returns true for valid assessment
   */
  test('type guard returns true for valid assessment', async () => {
    const assessment = await loadJennyAssessmentById('011');

    expect(isJennyAssessmentStructured(assessment)).toBe(true);
  });

  /**
   * Test 6: Type guard returns false for invalid object
   */
  test('type guard returns false for invalid object', () => {
    const invalidObject = {
      student_id: 'test',
      // Missing required fields
    };

    expect(isJennyAssessmentStructured(invalidObject)).toBe(false);
  });

  /**
   * Test 7: List all student IDs
   */
  test('list all student IDs', async () => {
    const studentIds = await listJennyStudentIds();

    expect(Array.isArray(studentIds)).toBe(true);
    expect(studentIds.length).toBeGreaterThan(0);

    // All IDs should be non-empty strings
    studentIds.forEach((id) => {
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  /**
   * Test 8: Error handling for non-existent student ID
   */
  test('error handling for non-existent student ID', async () => {
    await expect(loadJennyAssessmentById('nonexistent_student_999')).rejects.toThrow();
  });

  /**
   * Test 9: Validate assessment structure
   */
  test('validate assessment structure', async () => {
    const assessment = await loadJennyAssessmentById('011');

    // Session metadata validation
    expect(assessment.session_metadata).toHaveProperty('student_archetype');
    expect(assessment.session_metadata).toHaveProperty('grade_level');
    expect(assessment.session_metadata).toHaveProperty('coach_id');
    expect(typeof assessment.session_metadata.grade_level).toBe('number');

    // Student profile validation
    expect(assessment.student_profile).toHaveProperty('demographics');
    expect(assessment.student_profile).toHaveProperty('academic_standing');
    expect(assessment.student_profile).toHaveProperty('current_involvement');
    expect(assessment.student_profile).toHaveProperty('career_aspiration');

    // Academic standing validation
    expect(assessment.student_profile.academic_standing).toHaveProperty('academic_readiness_score');
    expect(typeof assessment.student_profile.academic_standing.academic_readiness_score).toBe('number');

    // Current involvement validation
    expect(assessment.student_profile.current_involvement).toHaveProperty('leadership');
    expect(Array.isArray(assessment.student_profile.current_involvement.leadership)).toBe(true);
    expect(assessment.student_profile.current_involvement).toHaveProperty('recent_achievements');
    expect(Array.isArray(assessment.student_profile.current_involvement.recent_achievements)).toBe(true);

    // Challenges validation
    expect(assessment.key_challenges).toHaveProperty('challenge_1');
    if (assessment.key_challenges.challenge_1) {
      expect(assessment.key_challenges.challenge_1).toHaveProperty('issue');
      expect(assessment.key_challenges.challenge_1).toHaveProperty('evidence');
      expect(assessment.key_challenges.challenge_1).toHaveProperty('severity');
    }

    // Frameworks validation
    expect(Array.isArray(assessment.frameworks_introduced)).toBe(true);

    // Strategic recommendations validation
    expect(assessment.strategic_recommendations).toHaveProperty('academic_strategy');
    expect(assessment.strategic_recommendations).toHaveProperty('awards_strategy');
    expect(assessment.strategic_recommendations).toHaveProperty('narrative_strategy');
    expect(assessment.strategic_recommendations).toHaveProperty('college_list_strategy');

    // Narrative development validation
    expect(assessment.narrative_development).toHaveProperty('initial_state');
    expect(assessment.narrative_development).toHaveProperty('discovery_process');
    expect(assessment.narrative_development).toHaveProperty('breakthrough_synthesis');

    // Knowledge moat insights validation
    expect(Array.isArray(assessment.knowledge_moat_insights)).toBe(true);
  });

  /**
   * Test 10: Validate all loaded assessments have consistent structure
   */
  test('validate all loaded assessments have consistent structure', async () => {
    const assessments = await loadAllJennyAssessments();

    assessments.forEach((assessment) => {
      // Every assessment should have these core fields
      expect(assessment.student_id).toBeDefined();
      expect(assessment.session_metadata).toBeDefined();
      expect(assessment.student_profile).toBeDefined();
      expect(assessment.key_challenges).toBeDefined();
      expect(assessment.strategic_recommendations).toBeDefined();
      expect(assessment.narrative_development).toBeDefined();

      // Session metadata should have required fields
      expect(assessment.session_metadata.grade_level).toBeDefined();
      expect(typeof assessment.session_metadata.grade_level).toBe('number');
      expect(assessment.session_metadata.coach_id).toBeDefined();

      // Student profile should have required fields
      expect(assessment.student_profile.demographics).toBeDefined();
      expect(assessment.student_profile.academic_standing).toBeDefined();
      expect(assessment.student_profile.current_involvement).toBeDefined();
      expect(assessment.student_profile.career_aspiration).toBeDefined();

      // Scores should be numbers
      expect(typeof assessment.session_metadata.student_readiness_score).toBe('number');
      expect(typeof assessment.session_metadata.academic_score).toBe('number');
      expect(typeof assessment.session_metadata.ec_score).toBe('number');
      expect(typeof assessment.session_metadata.character_score).toBe('number');
      expect(typeof assessment.session_metadata.fit_score).toBe('number');
    });
  });

  /**
   * Test 11: Validate GPA fields accept null values
   */
  test('validate GPA fields accept null values', async () => {
    const assessments = await loadAllJennyAssessments();

    assessments.forEach((assessment) => {
      const { gpa_weighted, gpa_unweighted } = assessment.student_profile.academic_standing;

      // GPA can be null or number
      if (gpa_weighted !== null) {
        expect(typeof gpa_weighted).toBe('number');
      }

      if (gpa_unweighted !== null) {
        expect(typeof gpa_unweighted).toBe('number');
      }
    });
  });

  /**
   * Test 12: Validate arrays are properly structured
   */
  test('validate arrays are properly structured', async () => {
    const assessment = await loadJennyAssessmentById('011');

    // Leadership should be an array
    expect(Array.isArray(assessment.student_profile.current_involvement.leadership)).toBe(true);

    // Recent achievements should be an array of strings
    expect(Array.isArray(assessment.student_profile.current_involvement.recent_achievements)).toBe(true);
    assessment.student_profile.current_involvement.recent_achievements.forEach((achievement) => {
      expect(typeof achievement).toBe('string');
    });

    // Frameworks introduced should be an array
    expect(Array.isArray(assessment.frameworks_introduced)).toBe(true);

    // Knowledge moat insights should be an array
    expect(Array.isArray(assessment.knowledge_moat_insights)).toBe(true);
  });
});
