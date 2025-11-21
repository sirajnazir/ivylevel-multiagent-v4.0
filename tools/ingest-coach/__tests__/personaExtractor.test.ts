import { personaBundleSchema } from "../schemas/persona.schema";

describe("Persona Extractor", () => {
  it("validates correct persona bundle schema", () => {
    const validBundle = {
      personaTraits: [
        {
          id: "pt_001",
          name: "Big-sister empathy with accountability",
          description: "She uses warmth and relatability to lower defensiveness, then pivots into direct expectations.",
          evidence: [
            "I get why this feels overwhelming, but you're capable of more than you think.",
            "Let's reset and do this properly."
          ],
          tags: ["warm", "direct", "supportive"]
        }
      ],
      voiceCharacteristics: [
        {
          id: "vc_001",
          name: "Encouragement-first framing",
          description: "She begins with affirmation to build safety, then introduces critique.",
          evidence: ["You made progress, but let's refine…"],
          tags: ["eq", "feedback"]
        }
      ],
      signaturePhrases: [
        {
          id: "sp_001",
          name: "You've got this",
          description: "Repeated closing phrase to build confidence",
          evidence: ["You've got this.", "You've got this—let's do it."],
          tags: ["motivation", "signature"]
        }
      ],
      eqMicroPatterns: [
        {
          id: "eq_001",
          name: "Normalize → Reframe → Redirect",
          description: "Pattern of normalizing student anxiety, reframing the challenge, then redirecting to action.",
          evidence: ["It's normal to feel stuck here. But this is actually a good problem to have. Let's break it down."],
          tags: ["eq-pattern", "anxiety", "motivation"]
        }
      ],
      studentAdaptationBehaviors: [
        {
          id: "sa_001",
          name: "High achiever → challenge positioning",
          description: "With high achievers, Jenny frames tasks as exciting challenges rather than requirements.",
          evidence: ["This is where you get to push yourself beyond what most students attempt."],
          tags: ["adaptation", "high-achiever"]
        }
      ],
      exampleSnippets: [
        "You're making progress, but we need to tighten the narrative arc.",
        "Let's just lock one small win today. One. Then everything flows."
      ]
    };

    const result = personaBundleSchema.safeParse(validBundle);
    expect(result.success).toBe(true);
  });

  it("validates empty bundle", () => {
    const emptyBundle = {
      personaTraits: [],
      voiceCharacteristics: [],
      signaturePhrases: [],
      eqMicroPatterns: [],
      studentAdaptationBehaviors: [],
      exampleSnippets: []
    };

    const result = personaBundleSchema.safeParse(emptyBundle);
    expect(result.success).toBe(true);
  });

  it("rejects invalid bundle (missing required arrays)", () => {
    const invalidBundle = {
      personaTraits: [],
      voiceCharacteristics: []
      // missing signaturePhrases, eqMicroPatterns, studentAdaptationBehaviors, exampleSnippets
    };

    const result = personaBundleSchema.safeParse(invalidBundle);
    expect(result.success).toBe(false);
  });

  it("rejects persona item missing required fields", () => {
    const invalidBundle = {
      personaTraits: [
        {
          id: "pt_001",
          name: "Incomplete trait"
          // missing description, evidence, tags
        }
      ],
      voiceCharacteristics: [],
      signaturePhrases: [],
      eqMicroPatterns: [],
      studentAdaptationBehaviors: [],
      exampleSnippets: []
    };

    const result = personaBundleSchema.safeParse(invalidBundle);
    expect(result.success).toBe(false);
  });

  it("validates persona item with multiple evidence quotes", () => {
    const bundle = {
      personaTraits: [
        {
          id: "pt_002",
          name: "Direct but non-threatening",
          description: "Jenny is direct about gaps but frames them as solvable challenges.",
          evidence: [
            "Your EC depth is the gap we need to close.",
            "This is fixable—here's how we do it.",
            "Let's be honest about where you are so we can get you where you need to be."
          ],
          tags: ["direct", "honest", "constructive"]
        }
      ],
      voiceCharacteristics: [],
      signaturePhrases: [],
      eqMicroPatterns: [],
      studentAdaptationBehaviors: [],
      exampleSnippets: []
    };

    const result = personaBundleSchema.safeParse(bundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.personaTraits[0].evidence).toHaveLength(3);
    }
  });

  it("validates persona item with multiple tags", () => {
    const bundle = {
      personaTraits: [],
      voiceCharacteristics: [
        {
          id: "vc_002",
          name: "Multi-dimensional voice",
          description: "Voice characteristic with multiple dimensions",
          evidence: ["Example quote"],
          tags: ["warm", "direct", "empathetic", "strategic", "humorous"]
        }
      ],
      signaturePhrases: [],
      eqMicroPatterns: [],
      studentAdaptationBehaviors: [],
      exampleSnippets: []
    };

    const result = personaBundleSchema.safeParse(bundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.voiceCharacteristics[0].tags).toHaveLength(5);
    }
  });

  it("validates bundle with all categories populated", () => {
    const fullBundle = {
      personaTraits: [
        {
          id: "pt_001",
          name: "Trait 1",
          description: "Description",
          evidence: ["Evidence 1"],
          tags: ["tag1"]
        }
      ],
      voiceCharacteristics: [
        {
          id: "vc_001",
          name: "Voice 1",
          description: "Description",
          evidence: ["Evidence 2"],
          tags: ["tag2"]
        }
      ],
      signaturePhrases: [
        {
          id: "sp_001",
          name: "Phrase 1",
          description: "Description",
          evidence: ["Evidence 3"],
          tags: ["tag3"]
        }
      ],
      eqMicroPatterns: [
        {
          id: "eq_001",
          name: "Pattern 1",
          description: "Description",
          evidence: ["Evidence 4"],
          tags: ["tag4"]
        }
      ],
      studentAdaptationBehaviors: [
        {
          id: "sa_001",
          name: "Adaptation 1",
          description: "Description",
          evidence: ["Evidence 5"],
          tags: ["tag5"]
        }
      ],
      exampleSnippets: ["Snippet 1", "Snippet 2"]
    };

    const result = personaBundleSchema.safeParse(fullBundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.personaTraits).toHaveLength(1);
      expect(result.data.voiceCharacteristics).toHaveLength(1);
      expect(result.data.signaturePhrases).toHaveLength(1);
      expect(result.data.eqMicroPatterns).toHaveLength(1);
      expect(result.data.studentAdaptationBehaviors).toHaveLength(1);
      expect(result.data.exampleSnippets).toHaveLength(2);
    }
  });

  it("validates exampleSnippets as simple string array", () => {
    const bundle = {
      personaTraits: [],
      voiceCharacteristics: [],
      signaturePhrases: [],
      eqMicroPatterns: [],
      studentAdaptationBehaviors: [],
      exampleSnippets: [
        "You're making progress.",
        "Let's break this down.",
        "You've got this."
      ]
    };

    const result = personaBundleSchema.safeParse(bundle);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.exampleSnippets).toHaveLength(3);
    }
  });
});
