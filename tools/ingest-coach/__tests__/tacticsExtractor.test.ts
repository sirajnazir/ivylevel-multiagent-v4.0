import { tacticSchema, tacticsArraySchema } from "../schemas/tactics.schema";

describe("Tactics Extractor", () => {
  it("validates correct tactic schema", () => {
    const validTactic = [
      {
        id: "tac_001",
        name: "Anchor the Student to One Clear Win",
        category: "motivation",
        trigger: "When student feels overwhelmed by too many tasks",
        action: "Jenny narrows focus to a single achievable micro-goal",
        outcome: "Student regains momentum + emotional stability",
        example_usage: "Let's just lock one small win today. One. Then everything flows.",
        notes: "She uses this repeatedly to reset anxious or low-agency students."
      }
    ];

    const result = tacticsArraySchema.safeParse(validTactic);
    expect(result.success).toBe(true);
  });

  it("validates tactic without optional notes field", () => {
    const validTactic = [
      {
        id: "tac_002",
        name: "Test Tactic",
        category: "planning",
        trigger: "When X happens",
        action: "Do Y",
        outcome: "Z result",
        example_usage: "Example quote here"
      }
    ];

    const result = tacticsArraySchema.safeParse(validTactic);
    expect(result.success).toBe(true);
  });

  it("rejects invalid tactic schema (missing required fields)", () => {
    const invalidTactic = [
      {
        id: "tac_001",
        name: "Some Tactic",
        category: "motivation"
        // missing trigger, action, outcome, example_usage
      }
    ];

    const result = tacticsArraySchema.safeParse(invalidTactic);
    expect(result.success).toBe(false);
  });

  it("validates expected tactic categories", () => {
    const validCategories = [
      "ec",
      "academics",
      "narrative",
      "motivation",
      "mindset",
      "time",
      "planning",
      "awards",
      "communication",
      "other"
    ];

    validCategories.forEach((category) => {
      const tactic = [
        {
          id: "tac_test",
          name: "Test Tactic",
          category,
          trigger: "When condition X",
          action: "Do action Y",
          outcome: "Result Z",
          example_usage: "Example quote"
        }
      ];

      const result = tacticsArraySchema.safeParse(tactic);
      expect(result.success).toBe(true);
    });
  });

  it("validates array of multiple tactics", () => {
    const multipleTactics = [
      {
        id: "tac_001",
        name: "First Tactic",
        category: "motivation",
        trigger: "Trigger 1",
        action: "Action 1",
        outcome: "Outcome 1",
        example_usage: "Example 1"
      },
      {
        id: "tac_002",
        name: "Second Tactic",
        category: "planning",
        trigger: "Trigger 2",
        action: "Action 2",
        outcome: "Outcome 2",
        example_usage: "Example 2",
        notes: "Optional notes"
      }
    ];

    const result = tacticsArraySchema.safeParse(multipleTactics);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });
});
