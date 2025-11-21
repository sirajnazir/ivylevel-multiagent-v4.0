import { strategyBundleSchema } from "../schemas/strategy.schema";

describe("Strategy & Tactic Extractor", () => {
  it("validates correct strategy bundle schema", () => {
    const validBundle = {
      frameworks: [
        {
          id: "fw_rigor01",
          name: "Rigor Stretch Model",
          steps: [
            "Identify current rigor baseline.",
            "Map 1–2 level stretch target.",
            "Anchor choices in narrative goals.",
            "Implement incremental increase."
          ],
          conditions: ["If student shows capacity but low confidence"],
          evidence: [
            "Let's raise just one course level here—no need to jump everything."
          ],
          tags: ["rigor", "planning"]
        }
      ],
      tacticalSequences: [],
      playbooks: [],
      decisionHeuristics: [],
      studentTypeAdaptations: [],
      examples: []
    };

    const result = strategyBundleSchema.safeParse(validBundle);
    expect(result.success).toBe(true);
  });

  it("validates empty bundle", () => {
    const emptyBundle = {
      frameworks: [],
      tacticalSequences: [],
      playbooks: [],
      decisionHeuristics: [],
      studentTypeAdaptations: [],
      examples: []
    };

    const result = strategyBundleSchema.safeParse(emptyBundle);
    expect(result.success).toBe(true);
  });

  it("rejects invalid bundle (missing required arrays)", () => {
    const invalidBundle = {
      frameworks: [],
      tacticalSequences: []
      // missing playbooks, decisionHeuristics, studentTypeAdaptations, examples
    };

    const result = strategyBundleSchema.safeParse(invalidBundle);
    expect(result.success).toBe(false);
  });

  it("rejects strategy item missing required fields", () => {
    const invalidBundle = {
      frameworks: [
        {
          id: "fw_001",
          name: "Incomplete Framework"
          // missing steps, evidence, tags
        }
      ],
      tacticalSequences: [],
      playbooks: [],
      decisionHeuristics: [],
      studentTypeAdaptations: [],
      examples: []
    };

    const result = strategyBundleSchema.safeParse(invalidBundle);
    expect(result.success).toBe(false);
  });

  it("validates strategy item with optional conditions", () => {
    const bundle = {
      frameworks: [
        {
          id: "fw_002",
          name: "Framework with Conditions",
          steps: ["Step 1", "Step 2"],
          conditions: ["When student is overwhelmed", "If rigor gap > 2 levels"],
          evidence: ["Evidence quote"],
          tags: ["planning"]
        }
      ],
      tacticalSequences: [],
      playbooks: [],
      decisionHeuristics: [],
      studentTypeAdaptations: [],
      examples: []
    };

    const result = strategyBundleSchema.safeParse(bundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frameworks[0].conditions).toHaveLength(2);
    }
  });

  it("validates strategy item without conditions", () => {
    const bundle = {
      frameworks: [
        {
          id: "fw_003",
          name: "Framework without Conditions",
          steps: ["Step 1", "Step 2"],
          evidence: ["Evidence quote"],
          tags: ["planning"]
        }
      ],
      tacticalSequences: [],
      playbooks: [],
      decisionHeuristics: [],
      studentTypeAdaptations: [],
      examples: []
    };

    const result = strategyBundleSchema.safeParse(bundle);
    expect(result.success).toBe(true);
  });

  it("validates bundle with all categories populated", () => {
    const fullBundle = {
      frameworks: [
        {
          id: "fw_001",
          name: "Framework 1",
          steps: ["Step 1"],
          evidence: ["Evidence 1"],
          tags: ["tag1"]
        }
      ],
      tacticalSequences: [
        {
          id: "ts_001",
          name: "Tactical Sequence 1",
          steps: ["Step 1"],
          evidence: ["Evidence 2"],
          tags: ["tag2"]
        }
      ],
      playbooks: [
        {
          id: "pb_001",
          name: "Playbook 1",
          steps: ["Step 1"],
          evidence: ["Evidence 3"],
          tags: ["tag3"]
        }
      ],
      decisionHeuristics: [
        {
          id: "dh_001",
          name: "Decision Heuristic 1",
          steps: ["If X then Y"],
          evidence: ["Evidence 4"],
          tags: ["tag4"]
        }
      ],
      studentTypeAdaptations: [
        {
          id: "sa_001",
          name: "Adaptation 1",
          steps: ["Adapt behavior for high achievers"],
          evidence: ["Evidence 5"],
          tags: ["tag5"]
        }
      ],
      examples: ["Example 1", "Example 2"]
    };

    const result = strategyBundleSchema.safeParse(fullBundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frameworks).toHaveLength(1);
      expect(result.data.tacticalSequences).toHaveLength(1);
      expect(result.data.playbooks).toHaveLength(1);
      expect(result.data.decisionHeuristics).toHaveLength(1);
      expect(result.data.studentTypeAdaptations).toHaveLength(1);
      expect(result.data.examples).toHaveLength(2);
    }
  });

  it("validates strategy item with multiple steps and evidence", () => {
    const bundle = {
      frameworks: [
        {
          id: "fw_004",
          name: "Multi-step Framework",
          steps: [
            "Step 1: Assess baseline",
            "Step 2: Identify gaps",
            "Step 3: Create action plan",
            "Step 4: Execute and monitor"
          ],
          evidence: [
            "First we assess where you are.",
            "Then we identify the gaps.",
            "Finally we build the action plan."
          ],
          tags: ["assessment", "planning", "execution"]
        }
      ],
      tacticalSequences: [],
      playbooks: [],
      decisionHeuristics: [],
      studentTypeAdaptations: [],
      examples: []
    };

    const result = strategyBundleSchema.safeParse(bundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frameworks[0].steps).toHaveLength(4);
      expect(result.data.frameworks[0].evidence).toHaveLength(3);
    }
  });
});
