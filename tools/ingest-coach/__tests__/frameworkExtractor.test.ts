import { frameworkArraySchema } from "../schemas/framework.schema";

describe("Framework Extractor", () => {
  it("validates correct framework schema", () => {
    const validFramework = [
      {
        id: "fw_001",
        name: "APS Strength Mapping Framework",
        type: "strategy",
        description: "A framework Jenny uses to identify which vector should drive the student's flagship narrative.",
        steps: [
          "Extract Aptitude from academics and projects",
          "Extract Passion from EC depth and commitment",
          "Extract Service from community patterns and core values",
          "Compare APS scores",
          "Select dominant vector to anchor flagship narrative"
        ],
        decision_rules: [
          "If Passion is highest → narrative must be passion-led",
          "If Service is highest → narrative must have human impact center",
          "If Aptitude is highest → narrative must be skill or research anchored"
        ],
        intended_outcome: "Clear dominant narrative vector for the student",
        example_usage: "You're clearly strongest in Passion, so your narrative should revolve around your design-driven leadership.",
        student_fit: "All archetypes; especially dual-identities and quiet high-performers.",
        dependencies: ["tool_018: Weekly Execution Board"],
        tags: ["aps", "narrative", "prioritization"]
      }
    ];

    const result = frameworkArraySchema.safeParse(validFramework);
    expect(result.success).toBe(true);
  });

  it("rejects invalid framework schema (missing required fields)", () => {
    const invalidFramework = [
      {
        id: "fw_001",
        name: "Some Framework",
        type: "strategy"
        // missing description, steps, decision_rules, intended_outcome, example_usage, student_fit, dependencies, tags
      }
    ];

    const result = frameworkArraySchema.safeParse(invalidFramework);
    expect(result.success).toBe(false);
  });

  it("validates expected framework types", () => {
    const validTypes = [
      "strategy",
      "reasoning",
      "rubric",
      "prioritization",
      "narrative",
      "sequence",
      "evaluation",
      "mindset"
    ];

    validTypes.forEach((type) => {
      const framework = [
        {
          id: "fw_test",
          name: "Test Framework",
          type,
          description: "Test description",
          steps: ["Step 1", "Step 2"],
          decision_rules: ["Rule 1"],
          intended_outcome: "Test outcome",
          example_usage: "Test example",
          student_fit: "All students",
          dependencies: [],
          tags: ["test"]
        }
      ];

      const result = frameworkArraySchema.safeParse(framework);
      expect(result.success).toBe(true);
    });
  });

  it("validates framework with multiple steps and decision rules", () => {
    const framework = [
      {
        id: "fw_002",
        name: "Gap Analysis Framework",
        type: "evaluation",
        description: "Systematic approach to identify profile gaps against target schools",
        steps: [
          "Step 1: Assess current state",
          "Step 2: Identify target school requirements",
          "Step 3: Map gaps",
          "Step 4: Prioritize gaps by impact"
        ],
        decision_rules: [
          "Rigor gaps take precedence over EC gaps",
          "National awards close more gaps than local awards",
          "Narrative coherence trumps activity count"
        ],
        intended_outcome: "Prioritized list of gaps to address",
        example_usage: "Your gap analysis shows: no national awards, weak community impact, scattered narrative.",
        student_fit: "All students after initial assessment",
        dependencies: ["IvyScore Assessment", "Target School Profiles"],
        tags: ["assessment", "planning", "rigor"]
      }
    ];

    const result = frameworkArraySchema.safeParse(framework);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].steps).toHaveLength(4);
      expect(result.data[0].decision_rules).toHaveLength(3);
    }
  });

  it("validates framework with empty dependencies", () => {
    const framework = [
      {
        id: "fw_003",
        name: "Standalone Framework",
        type: "mindset",
        description: "A self-contained mindset shift approach",
        steps: ["Identify limiting belief", "Reframe"],
        decision_rules: ["Focus on evidence-based reframing"],
        intended_outcome: "Student adopts growth mindset",
        example_usage: "You're not 'bad at essays'—you just haven't learned the structure yet.",
        student_fit: "Students with imposter syndrome",
        dependencies: [],
        tags: ["mindset"]
      }
    ];

    const result = frameworkArraySchema.safeParse(framework);
    expect(result.success).toBe(true);
  });

  it("validates framework with multiple tags", () => {
    const framework = [
      {
        id: "fw_004",
        name: "Comprehensive Planning Framework",
        type: "sequence",
        description: "Multi-dimensional planning approach",
        steps: ["Assess", "Plan", "Execute", "Review"],
        decision_rules: ["Adjust based on results"],
        intended_outcome: "Complete execution plan",
        example_usage: "We'll use the full planning framework here.",
        student_fit: "High-achievers",
        dependencies: ["Multiple tools"],
        tags: ["aps", "rigor", "ec-depth", "narrative", "execution"]
      }
    ];

    const result = frameworkArraySchema.safeParse(framework);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].tags).toHaveLength(5);
    }
  });
});
