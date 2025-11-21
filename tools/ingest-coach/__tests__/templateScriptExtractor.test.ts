import { contentItemSchema, templateScriptBundleSchema } from "../schemas/templateScript.schema";

describe("Template & Script Extractor", () => {
  it("validates correct template/script bundle schema", () => {
    const validBundle = {
      templates: [
        {
          id: "tmp_001",
          name: "EC Kickoff Template",
          type: "template" as const,
          description: "Jenny's starter EC kickoff email outline",
          content: "Hi <student_name>, Here's your Week 0 EC kickoff plan...",
          placeholders: ["<student_name>", "<project_name>"],
          example_usage: "Hiba, here's your design lab EC kickoff plan:",
          tags: ["ec", "kickoff", "email"]
        }
      ],
      scripts: [
        {
          id: "sc_001",
          name: "Soft Feedback Script",
          type: "script" as const,
          description: "How Jenny gives tough feedback gently",
          content: "You're making progress, but we need to tighten...",
          placeholders: [],
          example_usage: "You're making progress, but the outline needs tightening.",
          tags: ["feedback", "eq"]
        }
      ],
      scaffolds: [],
      rubrics: []
    };

    const result = templateScriptBundleSchema.safeParse(validBundle);
    expect(result.success).toBe(true);
  });

  it("validates individual content item", () => {
    const validItem = {
      id: "tmp_002",
      name: "Weekly Check-in Template",
      type: "template" as const,
      description: "Weekly execution check-in structure",
      content: "Hi <student_name>, Quick check-in...",
      placeholders: ["<student_name>"],
      example_usage: "Hi Sarah, Quick check-in on your progress.",
      tags: ["execution", "email"]
    };

    const result = contentItemSchema.safeParse(validItem);
    expect(result.success).toBe(true);
  });

  it("validates all content types (template, script, scaffold, rubric)", () => {
    const types = ["template", "script", "scaffold", "rubric"] as const;

    types.forEach((type) => {
      const item = {
        id: "test_001",
        name: "Test Item",
        type,
        description: "Test description",
        content: "Test content",
        placeholders: [],
        example_usage: "Test example",
        tags: ["test"]
      };

      const result = contentItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });
  });

  it("rejects invalid bundle (missing required fields)", () => {
    const invalidBundle = {
      templates: [
        {
          id: "tmp_001",
          name: "Incomplete Template",
          type: "template" as const
          // missing description, content, placeholders, example_usage, tags
        }
      ],
      scripts: [],
      scaffolds: [],
      rubrics: []
    };

    const result = templateScriptBundleSchema.safeParse(invalidBundle);
    expect(result.success).toBe(false);
  });

  it("validates bundle with all categories populated", () => {
    const fullBundle = {
      templates: [
        {
          id: "tmp_001",
          name: "Template 1",
          type: "template" as const,
          description: "Desc",
          content: "Content",
          placeholders: [],
          example_usage: "Example",
          tags: ["tag1"]
        }
      ],
      scripts: [
        {
          id: "sc_001",
          name: "Script 1",
          type: "script" as const,
          description: "Desc",
          content: "Content",
          placeholders: [],
          example_usage: "Example",
          tags: ["tag2"]
        }
      ],
      scaffolds: [
        {
          id: "scf_001",
          name: "Scaffold 1",
          type: "scaffold" as const,
          description: "Desc",
          content: "Content",
          placeholders: [],
          example_usage: "Example",
          tags: ["tag3"]
        }
      ],
      rubrics: [
        {
          id: "rub_001",
          name: "Rubric 1",
          type: "rubric" as const,
          description: "Desc",
          content: "Content",
          placeholders: [],
          example_usage: "Example",
          tags: ["tag4"]
        }
      ]
    };

    const result = templateScriptBundleSchema.safeParse(fullBundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.templates).toHaveLength(1);
      expect(result.data.scripts).toHaveLength(1);
      expect(result.data.scaffolds).toHaveLength(1);
      expect(result.data.rubrics).toHaveLength(1);
    }
  });

  it("validates item with multiple placeholders", () => {
    const item = {
      id: "tmp_003",
      name: "Multi-placeholder Template",
      type: "template" as const,
      description: "Template with multiple placeholders",
      content: "Hi <student_name>, your <project_name> is due <deadline>.",
      placeholders: ["<student_name>", "<project_name>", "<deadline>"],
      example_usage: "Hi Alex, your robotics project is due Friday.",
      tags: ["execution", "deadline"]
    };

    const result = contentItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.placeholders).toHaveLength(3);
    }
  });

  it("validates item with multiple tags", () => {
    const item = {
      id: "tmp_004",
      name: "Multi-tag Template",
      type: "template" as const,
      description: "Template with multiple tags",
      content: "Content",
      placeholders: [],
      example_usage: "Example",
      tags: ["ec", "narrative", "email", "kickoff", "planning"]
    };

    const result = contentItemSchema.safeParse(item);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toHaveLength(5);
    }
  });

  it("validates empty bundle", () => {
    const emptyBundle = {
      templates: [],
      scripts: [],
      scaffolds: [],
      rubrics: []
    };

    const result = templateScriptBundleSchema.safeParse(emptyBundle);
    expect(result.success).toBe(true);
  });
});
