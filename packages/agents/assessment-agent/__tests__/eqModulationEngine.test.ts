import { eqTonePlanSchema, warmthDirectiveMatrix } from "../../../schema/eqTonePlan_v1";

describe("EQ Modulation Engine Tests", () => {
  it("validates correct EQ tone plan", () => {
    const validTonePlan = {
      toneGuidelines: [
        "Use a soothing, normalizing tone",
        "Frame stretch goals as incremental steps",
        "Validate uncertainty before offering solutions"
      ],
      languagePatterns: [
        "It's completely normal to feel uncertain here.",
        "Let's just raise one course level, not everything at once.",
        "You're already strong academically; this is about confidence-building."
      ],
      forbiddenPatterns: [
        "You should aim higher",
        "Don't be so anxious",
        "Just go for it"
      ],
      warmthLevel: 4,
      directiveLevel: 2,
      relatabilityHooks: [
        "I've worked with students who had your exact GPA.",
        "First-gen students often feel they need to be perfect."
      ],
      accountabilityStyle: "Gentle check-ins with frequent affirmation. Use 'What did you learn?' instead of 'What went wrong?'",
      microWinsStructure: [
        "Week 1: Add one AP course to your schedule",
        "Week 2: Attend first class and assess difficulty",
        "Week 3: Check in on confidence level"
      ]
    };

    const result = eqTonePlanSchema.safeParse(validTonePlan);
    expect(result.success).toBe(true);
  });

  it("validates tone plan with debug notes", () => {
    const tonePlanWithDebug = {
      toneGuidelines: [
        "Use concise, anchoring language",
        "Provide tight structure",
        "Limit open-ended exploration"
      ],
      languagePatterns: [
        "Here are your three priorities for this week.",
        "Let's pause and write this down.",
        "Which interest is your North Star right now?"
      ],
      forbiddenPatterns: [
        "Follow all your passions",
        "Explore everything",
        "You can do it all"
      ],
      warmthLevel: 3,
      directiveLevel: 5,
      relatabilityHooks: [
        "I've seen ambitious students like you who needed help narrowing focus.",
        "Your energy is an asset — let's channel it."
      ],
      accountabilityStyle: "Firm guardrails with weekly check-ins. Direct but supportive.",
      microWinsStructure: [
        "Week 1: Choose ONE flagship project",
        "Week 2: Deliver one tangible output",
        "Week 3: Reflect on progress"
      ],
      debugNotes: [
        "Student archetype: Chaotic Ambitious",
        "High passion score (88) but execution gaps",
        "Tone optimized for: structure + focus"
      ]
    };

    const result = eqTonePlanSchema.safeParse(tonePlanWithDebug);
    expect(result.success).toBe(true);
  });

  it("rejects tone plan with too few tone guidelines", () => {
    const invalidTonePlan = {
      toneGuidelines: ["Only one guideline", "Only two guidelines"],
      languagePatterns: ["Pattern 1", "Pattern 2", "Pattern 3"],
      forbiddenPatterns: ["Forbidden 1", "Forbidden 2", "Forbidden 3"],
      warmthLevel: 3,
      directiveLevel: 3,
      relatabilityHooks: ["Hook 1", "Hook 2"],
      accountabilityStyle: "Balanced accountability",
      microWinsStructure: ["Week 1", "Week 2", "Week 3"]
    };

    const result = eqTonePlanSchema.safeParse(invalidTonePlan);
    expect(result.success).toBe(false);
  });

  it("rejects tone plan with warmth level out of range", () => {
    const invalidTonePlan = {
      toneGuidelines: ["Guideline 1", "Guideline 2", "Guideline 3"],
      languagePatterns: ["Pattern 1", "Pattern 2", "Pattern 3"],
      forbiddenPatterns: ["Forbidden 1", "Forbidden 2", "Forbidden 3"],
      warmthLevel: 6,
      directiveLevel: 3,
      relatabilityHooks: ["Hook 1", "Hook 2"],
      accountabilityStyle: "Balanced accountability",
      microWinsStructure: ["Week 1", "Week 2", "Week 3"]
    };

    const result = eqTonePlanSchema.safeParse(invalidTonePlan);
    expect(result.success).toBe(false);
  });

  it("rejects tone plan with directive level out of range", () => {
    const invalidTonePlan = {
      toneGuidelines: ["Guideline 1", "Guideline 2", "Guideline 3"],
      languagePatterns: ["Pattern 1", "Pattern 2", "Pattern 3"],
      forbiddenPatterns: ["Forbidden 1", "Forbidden 2", "Forbidden 3"],
      warmthLevel: 3,
      directiveLevel: 0,
      relatabilityHooks: ["Hook 1", "Hook 2"],
      accountabilityStyle: "Balanced accountability",
      microWinsStructure: ["Week 1", "Week 2", "Week 3"]
    };

    const result = eqTonePlanSchema.safeParse(invalidTonePlan);
    expect(result.success).toBe(false);
  });

  it("rejects tone plan with too few relatability hooks", () => {
    const invalidTonePlan = {
      toneGuidelines: ["Guideline 1", "Guideline 2", "Guideline 3"],
      languagePatterns: ["Pattern 1", "Pattern 2", "Pattern 3"],
      forbiddenPatterns: ["Forbidden 1", "Forbidden 2", "Forbidden 3"],
      warmthLevel: 3,
      directiveLevel: 3,
      relatabilityHooks: ["Only one hook"],
      accountabilityStyle: "Balanced accountability",
      microWinsStructure: ["Week 1", "Week 2", "Week 3"]
    };

    const result = eqTonePlanSchema.safeParse(invalidTonePlan);
    expect(result.success).toBe(false);
  });

  it("rejects tone plan with too short accountability style", () => {
    const invalidTonePlan = {
      toneGuidelines: ["Guideline 1", "Guideline 2", "Guideline 3"],
      languagePatterns: ["Pattern 1", "Pattern 2", "Pattern 3"],
      forbiddenPatterns: ["Forbidden 1", "Forbidden 2", "Forbidden 3"],
      warmthLevel: 3,
      directiveLevel: 3,
      relatabilityHooks: ["Hook 1", "Hook 2"],
      accountabilityStyle: "Too short",
      microWinsStructure: ["Week 1", "Week 2", "Week 3"]
    };

    const result = eqTonePlanSchema.safeParse(invalidTonePlan);
    expect(result.success).toBe(false);
  });

  it("rejects tone plan with too few micro-wins", () => {
    const invalidTonePlan = {
      toneGuidelines: ["Guideline 1", "Guideline 2", "Guideline 3"],
      languagePatterns: ["Pattern 1", "Pattern 2", "Pattern 3"],
      forbiddenPatterns: ["Forbidden 1", "Forbidden 2", "Forbidden 3"],
      warmthLevel: 3,
      directiveLevel: 3,
      relatabilityHooks: ["Hook 1", "Hook 2"],
      accountabilityStyle: "Balanced accountability with support",
      microWinsStructure: ["Week 1", "Week 2"]
    };

    const result = eqTonePlanSchema.safeParse(invalidTonePlan);
    expect(result.success).toBe(false);
  });

  it("validates warmth-directive matrix for Anxious Achiever", () => {
    const matrix = warmthDirectiveMatrix["The Anxious Achiever"];
    expect(matrix.warmth).toBeGreaterThanOrEqual(4);
    expect(matrix.directive).toBeLessThanOrEqual(2);
  });

  it("validates warmth-directive matrix for Chaotic Ambitious", () => {
    const matrix = warmthDirectiveMatrix["The Chaotic Ambitious"];
    expect(matrix.directive).toBeGreaterThanOrEqual(4);
  });

  it("validates warmth-directive matrix for Low-Agency Bright Drifter", () => {
    const matrix = warmthDirectiveMatrix["The Low-Agency Bright Drifter"];
    expect(matrix.warmth).toBeGreaterThanOrEqual(4);
  });

  it("validates warmth-directive matrix for Transactional Student", () => {
    const matrix = warmthDirectiveMatrix["The Transactional Just-Tell-Me-What-To-Do Student"];
    expect(matrix.warmth).toBeLessThanOrEqual(3);
    expect(matrix.directive).toBeGreaterThanOrEqual(4);
  });

  it("validates all archetypes have warmth-directive matrix entries", () => {
    const archetypes = [
      "The Anxious Achiever",
      "The Chaotic Ambitious",
      "The Quiet High-Potential Thinker",
      "The Overcommitted Perfectionist",
      "The Low-Agency Bright Drifter",
      "The Narrative-Lost but Curious Freshman",
      "The Transactional Just-Tell-Me-What-To-Do Student"
    ];

    archetypes.forEach((archetype) => {
      const matrix = warmthDirectiveMatrix[archetype as keyof typeof warmthDirectiveMatrix];
      expect(matrix).toBeDefined();
      expect(matrix.warmth).toBeGreaterThanOrEqual(1);
      expect(matrix.warmth).toBeLessThanOrEqual(5);
      expect(matrix.directive).toBeGreaterThanOrEqual(1);
      expect(matrix.directive).toBeLessThanOrEqual(5);
    });
  });

  it("validates tone plan with maximum allowed arrays", () => {
    const maxTonePlan = {
      toneGuidelines: [
        "Guideline 1", "Guideline 2", "Guideline 3",
        "Guideline 4", "Guideline 5", "Guideline 6", "Guideline 7"
      ],
      languagePatterns: [
        "Pattern 1", "Pattern 2", "Pattern 3", "Pattern 4", "Pattern 5",
        "Pattern 6", "Pattern 7", "Pattern 8", "Pattern 9", "Pattern 10"
      ],
      forbiddenPatterns: [
        "Forbidden 1", "Forbidden 2", "Forbidden 3", "Forbidden 4", "Forbidden 5",
        "Forbidden 6", "Forbidden 7", "Forbidden 8", "Forbidden 9", "Forbidden 10"
      ],
      warmthLevel: 5,
      directiveLevel: 5,
      relatabilityHooks: [
        "Hook 1", "Hook 2", "Hook 3", "Hook 4", "Hook 5", "Hook 6", "Hook 7"
      ],
      accountabilityStyle: "This is a comprehensive accountability style description that meets the minimum length requirement",
      microWinsStructure: [
        "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6",
        "Week 7", "Week 8", "Week 9", "Week 10", "Week 11", "Week 12"
      ]
    };

    const result = eqTonePlanSchema.safeParse(maxTonePlan);
    expect(result.success).toBe(true);
  });
});
