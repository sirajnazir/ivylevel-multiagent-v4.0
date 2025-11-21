/**
 * Component 22 Tests - EQ Router & Persona Blending Engine
 *
 * Tests cover:
 * - Stage-based EQ mode routing
 * - Archetype-based overrides
 * - Emotional keyword detection
 * - Persona blending correctness
 * - Style validation
 * - Trace generation
 */

import { routeEQ, routeEQSimple, ConversationStage } from "../eqRouter";
import { blendStyle, getStyleSummary, validateStyleCompatibility } from "../styleBlender";
import { getEQMode, getModeBySignature } from "../eqModes";
import {
  isForbiddenPhrase,
  getRandomPhrase,
  getAuthenticityScore
} from "../personaStyles";
import { ArchetypeProfile } from "../../../archetype/archetypeTypes";

describe("Component 22 - EQ Router & Persona Blending Engine", () => {
  /**
   * Test 1: Stage default routing - warmup → gentle
   */
  test("warmup stage defaults to gentle mode", () => {
    const archetype: ArchetypeProfile = { type: "uncertain" };
    const result = routeEQ("I'm not sure where to start", archetype, "warmup");

    expect(result.eqMode).toBe("gentle");
  });

  /**
   * Test 2: Stage default routing - diagnose → mentor
   */
  test("diagnose stage defaults to mentor mode", () => {
    const archetype: ArchetypeProfile = { type: "uncertain" };
    const result = routeEQ("Tell me about my profile", archetype, "diagnose");

    expect(result.eqMode).toBe("mentor");
  });

  /**
   * Test 3: Stage default routing - deep-dive → direct
   */
  test("deep-dive stage defaults to direct mode", () => {
    const archetype: ArchetypeProfile = { type: "uncertain" };
    const result = routeEQ("What should I do about my GPA?", archetype, "deep-dive");

    expect(result.eqMode).toBe("direct");
  });

  /**
   * Test 4: Stage default routing - solution → motivational
   */
  test("solution stage defaults to motivational mode", () => {
    const archetype: ArchetypeProfile = { type: "uncertain" };
    const result = routeEQ("How do I get started?", archetype, "solution");

    expect(result.eqMode).toBe("motivational");
  });

  /**
   * Test 5: High achiever + academics → direct mode
   */
  test("high achiever asking about academics gets direct mode", () => {
    const archetype: ArchetypeProfile = { type: "high_achiever" };
    const result = routeEQ("What GPA do I need for MIT?", archetype, "warmup");

    // Should override warmup default (gentle) → direct
    expect(result.eqMode).toBe("direct");
    expect(result.intent).toBe("academics");
  });

  /**
   * Test 6: Burnout archetype → always gentle
   */
  test("burnout student gets gentle mode regardless of intent", () => {
    const archetype: ArchetypeProfile = { type: "burnout" };

    const result1 = routeEQ("What about my test scores?", archetype, "deep-dive");
    const result2 = routeEQ("Tell me about activities", archetype, "deep-dive");

    // Should override deep-dive default (direct) → gentle
    expect(result1.eqMode).toBe("gentle");
    expect(result2.eqMode).toBe("gentle");
  });

  /**
   * Test 7: Late starter → motivational or mentor
   */
  test("late starter gets motivational or mentor mode", () => {
    const archetype: ArchetypeProfile = { type: "late_starter" };

    const result1 = routeEQ("How do I build my spike using a framework?", archetype, "diagnose");
    const result2 = routeEQ("Tell me about general college strategy", archetype, "diagnose");

    // Framework intent → motivational for late starter
    // General intent → mentor for late starter
    expect(["motivational", "mentor"]).toContain(result1.eqMode);
    expect(["motivational", "mentor"]).toContain(result2.eqMode);
  });

  /**
   * Test 8: Quiet builder + EQ intent → mentor mode
   */
  test("quiet builder asking EQ questions gets mentor mode", () => {
    const archetype: ArchetypeProfile = { type: "quiet_builder" };
    const result = routeEQ("What are my core values?", archetype, "warmup");

    expect(result.eqMode).toBe("mentor");
    expect(result.intent).toBe("eq");
  });

  /**
   * Test 9: Emotional override - overwhelmed → gentle
   */
  test("overwhelmed keywords override to gentle mode", () => {
    const archetype: ArchetypeProfile = { type: "high_achiever" };

    const result1 = routeEQ("I'm feeling overwhelmed by everything", archetype, "deep-dive");
    const result2 = routeEQ("I'm so stressed about this", archetype, "deep-dive");
    const result3 = routeEQ("I'm burnt out and tired", archetype, "deep-dive");

    // Should override deep-dive (direct) and archetype (direct) → gentle
    expect(result1.eqMode).toBe("gentle");
    expect(result2.eqMode).toBe("gentle");
    expect(result3.eqMode).toBe("gentle");
  });

  /**
   * Test 10: Emotional override - stuck/confused → mentor
   */
  test("confusion keywords override to mentor mode", () => {
    const archetype: ArchetypeProfile = { type: "high_achiever" };

    const result1 = routeEQ("I'm stuck and don't know what to do", archetype, "solution");
    const result2 = routeEQ("I'm lost and confused", archetype, "solution");

    // Should override solution (motivational) → mentor
    expect(result1.eqMode).toBe("mentor");
    expect(result2.eqMode).toBe("mentor");
  });

  /**
   * Test 11: Emotional override - excited/ready → motivational
   */
  test("energy keywords override to motivational mode", () => {
    const archetype: ArchetypeProfile = { type: "quiet_builder" };

    const result1 = routeEQ("I'm excited to get started!", archetype, "diagnose");
    const result2 = routeEQ("I'm ready, let's go!", archetype, "diagnose");

    // Should override diagnose (mentor) → motivational
    expect(result1.eqMode).toBe("motivational");
    expect(result2.eqMode).toBe("motivational");
  });

  /**
   * Test 12: Tactical keywords → direct mode
   */
  test("tactical keywords trigger direct mode", () => {
    const archetype: ArchetypeProfile = { type: "uncertain" };

    const result = routeEQ("Tell me exactly what I should do", archetype, "warmup");

    // Should override warmup (gentle) → direct
    expect(result.eqMode).toBe("direct");
  });

  /**
   * Test 13: Persona blending includes Jenny traits
   */
  test("blended persona includes Jenny identity traits", () => {
    const persona = blendStyle("gentle");

    expect(persona.identityTraits).toContain("first-gen immigrant");
    expect(persona.identityTraits).toContain("tactical clarity over platitudes");
    expect(persona.tone).toContain("Jenny");
  });

  /**
   * Test 14: Gentle mode selects reassurance phrases
   */
  test("gentle mode emphasizes reassurance phrases", () => {
    const persona = blendStyle("gentle");

    expect(persona.primaryPhrases.some(p => p.includes("I get it"))).toBe(true);
  });

  /**
   * Test 15: Direct mode selects clarity markers
   */
  test("direct mode emphasizes clarity markers", () => {
    const persona = blendStyle("direct");

    expect(
      persona.primaryPhrases.some(p => p.includes("key thing") || p.includes("break this down"))
    ).toBe(true);
  });

  /**
   * Test 16: Motivational mode selects motivation boosters
   */
  test("motivational mode emphasizes motivation boosters", () => {
    const persona = blendStyle("motivational");

    expect(persona.primaryPhrases.some(p => p.includes("can do this"))).toBe(true);
  });

  /**
   * Test 17: Mentor mode selects questioning techniques
   */
  test("mentor mode emphasizes questioning techniques", () => {
    const persona = blendStyle("mentor");

    expect(
      persona.primaryPhrases.some(p => p.includes("What") || p.includes("Why"))
    ).toBe(true);
  });

  /**
   * Test 18: Forbidden phrases are detected
   */
  test("forbidden phrase detection works correctly", () => {
    expect(isForbiddenPhrase("Best of luck with your application!")).toBe(true);
    expect(isForbiddenPhrase("Good luck on your essays!")).toBe(true);
    expect(isForbiddenPhrase("You can do this!")).toBe(false);
    expect(isForbiddenPhrase("Here's what matters:")).toBe(false);
  });

  /**
   * Test 19: Authenticity scoring detects Jenny markers
   */
  test("authenticity score detects Jenny voice markers", () => {
    const authentic = "I've seen students do this with less. You're in a good spot.";
    const generic = "Please note that you should submit your application on time.";

    const authenticScore = getAuthenticityScore(authentic);
    const genericScore = getAuthenticityScore(generic);

    expect(authenticScore).toBeGreaterThan(genericScore);
    expect(authenticScore).toBeGreaterThanOrEqual(0.5);
  });

  /**
   * Test 20: Mode signature matching
   */
  test("mode can be inferred from EQ signals", () => {
    const gentleSignals = ["supportive", "empathetic"];
    const directSignals = ["straight", "firm"];

    const gentleMode = getModeBySignature(gentleSignals);
    const directMode = getModeBySignature(directSignals);

    expect(gentleMode).toBe("gentle");
    expect(directMode).toBe("direct");
  });

  /**
   * Test 21: Routing trace includes all metadata
   */
  test("routing trace includes comprehensive metadata", () => {
    const archetype: ArchetypeProfile = { type: "high_achiever" };
    const result = routeEQ("What GPA do I need?", archetype, "diagnose");

    expect(result.trace).toContain("stage:diagnose");
    expect(result.trace).toContain("archetype:high_achiever");
    expect(result.trace.some(t => t.startsWith("intent:"))).toBe(true);
    expect(result.trace.some(t => t.startsWith("mode:"))).toBe(true);
  });

  /**
   * Test 22: Confidence scores are reasonable
   */
  test("routing confidence scores are in valid range", () => {
    const archetype: ArchetypeProfile = { type: "high_achiever" };

    const result1 = routeEQ("I'm overwhelmed", archetype, "diagnose");
    const result2 = routeEQ("What about my GPA?", archetype, "diagnose");

    // Emotional override should have high confidence
    expect(result1.confidence).toBeGreaterThanOrEqual(0.8);

    // Archetype override should have moderate confidence
    expect(result2.confidence).toBeGreaterThanOrEqual(0.5);
  });

  /**
   * Test 23: Warnings are generated for incompatible modes
   */
  test("warnings generated for burnout + direct mode", () => {
    const archetype: ArchetypeProfile = { type: "burnout" };

    // Force direct mode through tactical keywords
    const result = routeEQ(
      "Tell me exactly how many hours I need to study",
      archetype,
      "deep-dive"
    );

    // Burnout override should prevent direct mode, but if it didn't, there should be warnings
    if (result.eqMode === "direct") {
      expect(result.warnings.length).toBeGreaterThan(0);
    } else {
      // Should override to gentle
      expect(result.eqMode).toBe("gentle");
    }
  });

  /**
   * Test 24: Simple routing works without full archetype
   */
  test("routeEQSimple works with minimal input", () => {
    const result = routeEQSimple("I'm feeling overwhelmed");

    expect(result.eqMode).toBe("gentle");
    expect(result.persona).toBeDefined();
    expect(result.intent).toBeDefined();
  });

  /**
   * Test 25: Style compatibility validation
   */
  test("style compatibility validation detects mismatches", () => {
    const motivationalStyle = blendStyle("motivational");

    const warnings = validateStyleCompatibility(motivationalStyle, {
      overwhelmed: true
    });

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("performative");
  });

  /**
   * Test 26: EQ mode definitions have all required fields
   */
  test("EQ mode definitions are complete", () => {
    const gentleMode = getEQMode("gentle");

    expect(gentleMode.label).toBe("gentle");
    expect(gentleMode.tone).toBeDefined();
    expect(gentleMode.pacing).toBeDefined();
    expect(gentleMode.signature.length).toBeGreaterThan(0);
    expect(gentleMode.whenToUse.length).toBeGreaterThan(0);
    expect(gentleMode.avoidWhen.length).toBeGreaterThan(0);
  });
});
