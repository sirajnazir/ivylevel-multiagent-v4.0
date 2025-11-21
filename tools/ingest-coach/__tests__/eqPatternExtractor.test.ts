import { eqPatternSchema } from "../llm/eqPatternExtractor";

describe("EQ Pattern Extractor", () => {
  it("validates correct EQ pattern schema", () => {
    const validPattern = [
      {
        id: "eq_001",
        category: "scaffolding",
        pattern: "Breaks complex goals into simple next steps and checks emotional readiness before assigning.",
        example: "Let's not worry about the whole application right now. Let's just handle this one part together.",
        explanation: "Recurring structure: de-escalate overwhelm, sequence tasks, reassure capability."
      },
      {
        id: "eq_002",
        category: "empathy",
        pattern: "Reflects student's emotions before offering guidance.",
        example: "It makes sense you're feeling stuck—this is a lot.",
        explanation: "Shows emotional validation as first response."
      }
    ];

    const result = eqPatternSchema.safeParse(validPattern);
    expect(result.success).toBe(true);
  });

  it("rejects invalid EQ pattern schema (missing required fields)", () => {
    const invalidPattern = [
      {
        id: "eq_001",
        category: "scaffolding",
        pattern: "Some pattern"
        // missing example and explanation
      }
    ];

    const result = eqPatternSchema.safeParse(invalidPattern);
    expect(result.success).toBe(false);
  });

  it("validates expected categories", () => {
    const validCategories = [
      "tone",
      "empathy",
      "scaffolding",
      "encouragement",
      "boundary-setting",
      "clarity",
      "pacing"
    ];

    validCategories.forEach((category) => {
      const pattern = [
        {
          id: "eq_test",
          category,
          pattern: "Test pattern",
          example: "Test example",
          explanation: "Test explanation"
        }
      ];

      const result = eqPatternSchema.safeParse(pattern);
      expect(result.success).toBe(true);
    });
  });
});
