import { toolChipSchema, toolingArraySchema } from "../schemas/tooling.schema";

describe("Tooling Extractor", () => {
  it("validates correct tooling schema", () => {
    const validTooling = [
      {
        id: "tool_001",
        name: "Weekly Execution Board",
        type: "tracker",
        description: "A student-facing Notion board used to track weekly deliverables.",
        when_used: "Jenny sets this up immediately after the assessment session.",
        how_used: "She breaks each major priority into micro-tasks and assigns weekly checkpoints.",
        benefit: "Students gain clarity and accountability, reduces overwhelm.",
        example_usage: "Let's convert this into a weekly execution board so you always know your next step.",
        student_fit: "Best for low-agency and overwhelmed archetypes.",
        tags: ["execution", "time", "ec"]
      }
    ];

    const result = toolingArraySchema.safeParse(validTooling);
    expect(result.success).toBe(true);
  });

  it("validates tooling with all valid types", () => {
    const validTypes = [
      "software",
      "template",
      "workflow",
      "rubric",
      "scoring",
      "tracker",
      "board",
      "document",
      "method",
      "other"
    ];

    validTypes.forEach((type) => {
      const tooling = [
        {
          id: "tool_test",
          name: "Test Tool",
          type,
          description: "Test description",
          when_used: "When condition X",
          how_used: "Steps Y",
          benefit: "Benefit Z",
          example_usage: "Example quote",
          student_fit: "All students",
          tags: ["execution"]
        }
      ];

      const result = toolingArraySchema.safeParse(tooling);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid tooling schema (missing required fields)", () => {
    const invalidTooling = [
      {
        id: "tool_001",
        name: "Some Tool",
        type: "tracker"
        // missing description, when_used, how_used, benefit, example_usage, student_fit, tags
      }
    ];

    const result = toolingArraySchema.safeParse(invalidTooling);
    expect(result.success).toBe(false);
  });

  it("validates array of multiple tooling items", () => {
    const multipleTooling = [
      {
        id: "tool_001",
        name: "Notion Board",
        type: "software",
        description: "Digital workspace",
        when_used: "During planning",
        how_used: "Create boards",
        benefit: "Organization",
        example_usage: "Let's set up your Notion",
        student_fit: "All archetypes",
        tags: ["execution", "time"]
      },
      {
        id: "tool_002",
        name: "2x2 Matrix",
        type: "method",
        description: "Prioritization tool",
        when_used: "When prioritizing",
        how_used: "Map items to quadrants",
        benefit: "Clarity on priorities",
        example_usage: "Let's use a 2x2 matrix",
        student_fit: "Overwhelmed students",
        tags: ["planning", "time"]
      }
    ];

    const result = toolingArraySchema.safeParse(multipleTooling);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
    }
  });

  it("validates tooling with empty tags array", () => {
    const tooling = [
      {
        id: "tool_003",
        name: "Generic Tool",
        type: "other",
        description: "A generic tool",
        when_used: "Various contexts",
        how_used: "As needed",
        benefit: "Flexible application",
        example_usage: "Use this when appropriate",
        student_fit: "Context-dependent",
        tags: []
      }
    ];

    const result = toolingArraySchema.safeParse(tooling);
    expect(result.success).toBe(true);
  });

  it("validates tooling with multiple tags", () => {
    const tooling = [
      {
        id: "tool_004",
        name: "Comprehensive Tracker",
        type: "tracker",
        description: "Multi-purpose tracking system",
        when_used: "Throughout process",
        how_used: "Track all activities",
        benefit: "Complete visibility",
        example_usage: "This tracker covers everything",
        student_fit: "High-achievers",
        tags: ["execution", "ec", "awards", "time", "study", "narrative"]
      }
    ];

    const result = toolingArraySchema.safeParse(tooling);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].tags).toHaveLength(6);
    }
  });
});
