import {
  studentTypeClassificationSchema,
  studentTypeInputSchema,
  StudentArchetype,
  type StudentTypeInput,
} from "../../../schema/studentType_v1";

describe("Student Type Classifier Schema Tests", () => {
  it("validates correct student type classification", () => {
    const validClassification = {
      primaryType: "The Anxious Achiever",
      confidence: 0.85,
      secondaryType: "The Overcommitted Perfectionist",
      evidence: [
        "High GPA (3.9) but low confidence markers",
        "Seeks reassurance in follow-up questions",
        "Risk-averse course selection despite high aptitude",
      ],
      coachingAdaptations: [
        "Use gentle stretch language",
        "Frequent affirmation of progress",
        "Normalize uncertainty and imperfection",
      ],
      frameworkPriority: ["rigor_stretch", "confidence_building", "normalize_uncertainty"],
      eqModulation: {
        warmth: "high",
        directness: "low",
        pace: "gradual",
        structure: "medium",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(validClassification);
    expect(result.success).toBe(true);
  });

  it("validates classification without secondary type", () => {
    const classification = {
      primaryType: "The Chaotic Ambitious",
      confidence: 0.92,
      evidence: [
        "High passion score (88) but execution gaps",
        "Multiple interests with shallow depth",
        "Needs external scaffolding for organization",
      ],
      coachingAdaptations: [
        "Provide tight structure with weekly check-ins",
        "Break big goals into micro-steps",
        "Use accountability frameworks",
      ],
      frameworkPriority: ["execution_framework", "prioritization_matrix"],
      eqModulation: {
        warmth: "high",
        directness: "high",
        pace: "gradual",
        structure: "tight",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(classification);
    expect(result.success).toBe(true);
  });

  it("rejects classification with invalid archetype", () => {
    const invalidClassification = {
      primaryType: "The Non-Existent Type",
      confidence: 0.85,
      evidence: ["Evidence 1", "Evidence 2", "Evidence 3"],
      coachingAdaptations: ["Adaptation 1", "Adaptation 2", "Adaptation 3"],
      frameworkPriority: ["framework1"],
      eqModulation: {
        warmth: "high",
        directness: "low",
        pace: "gradual",
        structure: "medium",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(invalidClassification);
    expect(result.success).toBe(false);
  });

  it("rejects classification with too few evidence items", () => {
    const invalidClassification = {
      primaryType: "The Anxious Achiever",
      confidence: 0.85,
      evidence: ["Only one evidence item", "Only two evidence items"],
      coachingAdaptations: ["Adaptation 1", "Adaptation 2", "Adaptation 3"],
      frameworkPriority: ["framework1"],
      eqModulation: {
        warmth: "high",
        directness: "low",
        pace: "gradual",
        structure: "medium",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(invalidClassification);
    expect(result.success).toBe(false);
  });

  it("rejects classification with too many evidence items", () => {
    const invalidClassification = {
      primaryType: "The Anxious Achiever",
      confidence: 0.85,
      evidence: [
        "Evidence 1",
        "Evidence 2",
        "Evidence 3",
        "Evidence 4",
        "Evidence 5",
        "Evidence 6",
      ],
      coachingAdaptations: ["Adaptation 1", "Adaptation 2", "Adaptation 3"],
      frameworkPriority: ["framework1"],
      eqModulation: {
        warmth: "high",
        directness: "low",
        pace: "gradual",
        structure: "medium",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(invalidClassification);
    expect(result.success).toBe(false);
  });

  it("rejects classification with confidence out of range", () => {
    const invalidClassification = {
      primaryType: "The Anxious Achiever",
      confidence: 1.5,
      evidence: ["Evidence 1", "Evidence 2", "Evidence 3"],
      coachingAdaptations: ["Adaptation 1", "Adaptation 2", "Adaptation 3"],
      frameworkPriority: ["framework1"],
      eqModulation: {
        warmth: "high",
        directness: "low",
        pace: "gradual",
        structure: "medium",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(invalidClassification);
    expect(result.success).toBe(false);
  });

  it("validates all 7 student archetypes", () => {
    const archetypes: StudentArchetype[] = [
      "The Anxious Achiever",
      "The Chaotic Ambitious",
      "The Quiet High-Potential Thinker",
      "The Overcommitted Perfectionist",
      "The Low-Agency Bright Drifter",
      "The Narrative-Lost but Curious Freshman",
      "The Transactional Just-Tell-Me-What-To-Do Student",
    ];

    archetypes.forEach((archetype) => {
      const classification = {
        primaryType: archetype,
        confidence: 0.85,
        evidence: ["Evidence 1", "Evidence 2", "Evidence 3"],
        coachingAdaptations: ["Adaptation 1", "Adaptation 2", "Adaptation 3"],
        frameworkPriority: ["framework1"],
        eqModulation: {
          warmth: "high",
          directness: "low",
          pace: "gradual",
          structure: "medium",
        },
      };

      const result = studentTypeClassificationSchema.safeParse(classification);
      expect(result.success).toBe(true);
    });
  });

  it("validates EQ modulation with all valid enum values", () => {
    const classification = {
      primaryType: "The Anxious Achiever",
      confidence: 0.85,
      evidence: ["Evidence 1", "Evidence 2", "Evidence 3"],
      coachingAdaptations: ["Adaptation 1", "Adaptation 2", "Adaptation 3"],
      frameworkPriority: ["framework1"],
      eqModulation: {
        warmth: "medium",
        directness: "medium",
        pace: "slow",
        structure: "loose",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(classification);
    expect(result.success).toBe(true);
  });

  it("rejects EQ modulation with invalid enum values", () => {
    const classification = {
      primaryType: "The Anxious Achiever",
      confidence: 0.85,
      evidence: ["Evidence 1", "Evidence 2", "Evidence 3"],
      coachingAdaptations: ["Adaptation 1", "Adaptation 2", "Adaptation 3"],
      frameworkPriority: ["framework1"],
      eqModulation: {
        warmth: "very-high",
        directness: "low",
        pace: "gradual",
        structure: "medium",
      },
    };

    const result = studentTypeClassificationSchema.safeParse(classification);
    expect(result.success).toBe(false);
  });

  it("validates student type input schema", () => {
    const validInput: StudentTypeInput = {
      profile: {
        gpa: 3.9,
        rigorLevel: "high",
        rigorDelta: 1,
        ecDepth: "deep",
        leadershipSignals: ["Debate Team: Captain", "Student Government: President"],
        personalityMarkers: ["Creativity: High", "Resilience: High"],
        motivationSignals: ["Self-driven", "Goal-oriented"],
        executionGaps: [],
        gradeLevel: 11,
      },
      oracleResults: {
        aptitudeScore: 92,
        passionScore: 88,
        serviceScore: 75,
      },
      narrative: {
        toneMarkers: ["Confident", "Articulate"],
        responsiveness: "High engagement",
        confidenceMarkers: ["Strong self-advocacy"],
        selfAwarenessSignals: ["Reflects on growth"],
        valueStatements: ["Equity", "Excellence"],
      },
    };

    const result = studentTypeInputSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("validates student type input with optional fields omitted", () => {
    const minimalInput: StudentTypeInput = {
      profile: {},
      oracleResults: {},
      narrative: {},
    };

    const result = studentTypeInputSchema.safeParse(minimalInput);
    expect(result.success).toBe(true);
  });

  it("rejects student type input with invalid oracle scores", () => {
    const invalidInput = {
      profile: {},
      oracleResults: {
        aptitudeScore: 150,
        passionScore: -10,
        serviceScore: 75,
      },
      narrative: {},
    };

    const result = studentTypeInputSchema.safeParse(invalidInput);
    expect(result.success).toBe(false);
  });
});
