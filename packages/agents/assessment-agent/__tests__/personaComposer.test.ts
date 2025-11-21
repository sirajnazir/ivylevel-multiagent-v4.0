import { buildJennyPersonaInstruction, applyPhaseAdjustments, getPersonaPhaseContext } from "../src/personaComposer";
import { getJennyPersona, JENNY_PERSONA_BASELINE } from "../src/jennyPersona";
import { detectPersonaDrift, shouldRewriteMessage } from "../src/personaDriftAlert";
import { buildPersonaSystemPrompt, buildCompactPersonaPrompt } from "../src/personaToLLM";
import { initializeConversationMemory } from "../../../schema/conversationMemory_v1";
import { createNeutralToneInstruction } from "../../../schema/toneInstruction_v1";
import { coachPersonaSchema_v3 } from "../../../schema/coachPersona_v3";

/**
 * Component 14 Tests - Jenny Persona Composer v3.0
 *
 * Tests cover:
 * - Persona composition from emotional signals
 * - Warmth/energy/empathy modulation
 * - Phase-based adjustments
 * - Persona drift detection
 * - Forbidden phrase detection
 * - Voice principles application
 * - Schema validation
 * - Persona continuity across turns
 */

describe("Component 14 - Jenny Persona Composer", () => {
  /**
   * Test 1: Warmth increases when motivation drops
   */
  test("warmth increases when motivation drops", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.motivation = 1; // Very low motivation
    const toneInstruction = createNeutralToneInstruction();

    const persona = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);

    expect(persona.tone.energy).toBe("medium-high");
    expect(persona.microTraits.motivationPattern).toBe("micro-wins momentum push");
  });

  /**
   * Test 2: Empathy type switches during overwhelm
   */
  test("empathy type switches during overwhelm", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.overwhelm = 4; // High overwhelm
    const toneInstruction = createNeutralToneInstruction();

    const persona = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);

    expect(persona.tone.firmness).toBe("gentle");
    expect(persona.tone.energy).toBe("calm");
    expect(persona.microTraits.pacing).toBe("slow-reassuring");
    expect(persona.microTraits.sentenceStyle).toBe("short calming sentences");
  });

  /**
   * Test 3: Humor disabled when student is distressed
   */
  test("humor disabled when student is distressed", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.frustration = 4;
    memory.emotionalSignals.overwhelm = 4;
    const toneInstruction = createNeutralToneInstruction();

    const persona = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);

    // High frustration + overwhelm should result in supportive, not playful
    expect(persona.tone.warmth).toBe("very high");
    expect(persona.tone.empathyType).toBe("reflective");
  });

  /**
   * Test 4: Coach does not become overly chatty
   */
  test("coach does not become overly chatty", () => {
    const message = "A".repeat(700); // Over 600 chars
    const persona = getJennyPersona();

    const driftAlert = detectPersonaDrift(message, persona);

    expect(driftAlert.hasDrift).toBe(true);
    expect(driftAlert.violations.some(v => v.type === "too_long")).toBe(true);
  });

  /**
   * Test 5: SentenceStyle shifts properly
   */
  test("sentenceStyle shifts properly", () => {
    const memory = initializeConversationMemory();
    const toneInstruction = createNeutralToneInstruction();

    // Low confidence → validating
    memory.emotionalSignals.confidence = 1;
    const persona1 = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);
    expect(persona1.tone.empathyType).toBe("validating");

    // High overwhelm → short calming sentences
    memory.emotionalSignals.confidence = 3;
    memory.emotionalSignals.overwhelm = 4;
    const persona2 = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);
    expect(persona2.microTraits.sentenceStyle).toBe("short calming sentences");
  });

  /**
   * Test 6: Boundaries enforcement - no forbidden phrases
   */
  test("boundaries enforcement: no forbidden phrases", () => {
    const message = "As an AI, I can help you with that.";
    const persona = getJennyPersona();

    const driftAlert = detectPersonaDrift(message, persona);

    expect(driftAlert.hasDrift).toBe(true);
    expect(driftAlert.violations.some(v => v.type === "forbidden_phrase")).toBe(true);
    expect(driftAlert.action).toBe("rewrite");
  });

  /**
   * Test 7: Persona continuity maintained across turns
   */
  test("persona continuity maintained across turns", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.confidence = 4;
    memory.emotionalSignals.motivation = 4;
    const toneInstruction = createNeutralToneInstruction();

    // Turn 1: High confidence + motivation
    const persona1 = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);
    expect(persona1.tone.firmness).toBe("direct-supportive");
    expect(persona1.microTraits.motivationPattern).toBe("challenge with encouragement");

    // Turn 2: Confidence drops
    memory.emotionalSignals.confidence = 2;
    const persona2 = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);
    expect(persona2.tone.warmth).toBe("high");
    expect(persona2.tone.empathyType).toBe("validating");

    // Archetype and identity remain consistent
    expect(persona1.identity.archetype).toBe(persona2.identity.archetype);
    expect(persona1.identity.name).toBe(persona2.identity.name);
  });

  /**
   * Test 8: Jenny baseline persona passes schema validation
   */
  test("Jenny baseline persona passes schema validation", () => {
    const jenny = getJennyPersona();

    // Should not throw
    const validated = coachPersonaSchema_v3.parse(jenny);

    expect(validated.identity.name).toBe("Jenny");
    expect(validated.identity.archetype).toBe("warm challenger");
    expect(validated.tone.warmth).toBe("high");
    expect(validated.tone.empathyType).toBe("cognitive");
    expect(validated.boundaries.avoid.length).toBeGreaterThan(5);
    expect(validated.boundaries.neverSay.length).toBeGreaterThan(5);
  });

  /**
   * Test 9: System prompt generation includes all key elements
   */
  test("system prompt generation includes all key elements", () => {
    const persona = getJennyPersona();
    const systemPrompt = buildPersonaSystemPrompt(persona);

    expect(systemPrompt).toContain("You are Jenny");
    expect(systemPrompt).toContain("warm challenger");
    expect(systemPrompt).toContain("YOUR BACKGROUND");
    expect(systemPrompt).toContain("YOUR EXPERTISE");
    expect(systemPrompt).toContain("YOUR TONE");
    expect(systemPrompt).toContain("YOUR CONVERSATIONAL STYLE");
    expect(systemPrompt).toContain("HOW TO SOUND LIKE YOU");
    expect(systemPrompt).toContain("PATTERNS TO AVOID");
    expect(systemPrompt).toContain("NEVER SAY");
    expect(systemPrompt).toContain("CRITICAL DON'TS");
  });

  /**
   * Test 10: Compact prompt maintains essentials
   */
  test("compact prompt maintains essentials", () => {
    const persona = getJennyPersona();
    const compactPrompt = buildCompactPersonaPrompt(persona);

    expect(compactPrompt).toContain("Jenny");
    expect(compactPrompt).toContain("warm challenger");
    expect(compactPrompt).toContain("Tone:");
    expect(compactPrompt).toContain("Style:");
    expect(compactPrompt).toContain("Avoid:");
    expect(compactPrompt).toContain("Never say:");
    expect(compactPrompt.length).toBeLessThan(1000); // Keep it compact
  });

  /**
   * Test 11: Detects corporate speak drift
   */
  test("detects corporate speak drift", () => {
    const message = "Let's leverage this opportunity to optimize your strategy and facilitate growth.";
    const persona = getJennyPersona();

    const driftAlert = detectPersonaDrift(message, persona);

    expect(driftAlert.hasDrift).toBe(true);
    expect(driftAlert.violations.some(v => v.type === "too_formal")).toBe(true);
  });

  /**
   * Test 12: Detects lecturing tone
   */
  test("detects lecturing tone", () => {
    const message = "You should definitely apply early. You need to study harder. You must complete your essays.";
    const persona = getJennyPersona();

    const driftAlert = detectPersonaDrift(message, persona);

    expect(driftAlert.hasDrift).toBe(true);
    expect(driftAlert.violations.some(v => v.type === "wrong_tone")).toBe(true);
  });

  /**
   * Test 13: Detects lack of empathy in longer messages
   */
  test("detects lack of empathy in longer messages", () => {
    const message = "You need to submit your application by December. Make sure you complete all the requirements. Don't forget the deadlines.";
    const persona = getJennyPersona();

    const driftAlert = detectPersonaDrift(message, persona);

    expect(driftAlert.hasDrift).toBe(true);
    expect(driftAlert.violations.some(v => v.type === "lacks_empathy")).toBe(true);
  });

  /**
   * Test 14: Phase adjustments work correctly
   */
  test("phase adjustments work correctly", () => {
    const basePersona = getJennyPersona();

    // Rapport-building phase
    const rapportPersona = applyPhaseAdjustments(basePersona, "rapport-building");
    expect(rapportPersona.tone.warmth).toBe("high");
    expect(rapportPersona.tone.firmness).toBe("gentle");

    // Strategic phase
    const strategicPersona = applyPhaseAdjustments(basePersona, "strategic");
    expect(strategicPersona.tone.firmness).toBe("gentle-firm");
  });

  /**
   * Test 15: Phase detection based on turn count
   */
  test("phase detection based on turn count", () => {
    expect(getPersonaPhaseContext(1)).toBe("rapport-building");
    expect(getPersonaPhaseContext(3)).toBe("rapport-building");
    expect(getPersonaPhaseContext(5)).toBe("diagnostic");
    expect(getPersonaPhaseContext(10)).toBe("diagnostic");
    expect(getPersonaPhaseContext(15)).toBe("strategic");
  });

  /**
   * Test 16: Handles high confidence + high motivation correctly
   */
  test("handles high confidence + high motivation correctly", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.confidence = 5;
    memory.emotionalSignals.motivation = 5;
    const toneInstruction = createNeutralToneInstruction();

    const persona = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);

    expect(persona.tone.firmness).toBe("direct-supportive");
    expect(persona.tone.humor).toBe("light teasing");
    expect(persona.microTraits.motivationPattern).toBe("challenge with encouragement");
  });

  /**
   * Test 17: Low agency triggers empowerment mode
   */
  test("low agency triggers empowerment mode", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.agency = 1;
    const toneInstruction = createNeutralToneInstruction();

    const persona = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);

    expect(persona.tone.firmness).toBe("gentle-encouraging");
    expect(persona.microTraits.motivationPattern).toBe("encourage ownership + empower decision");
  });

  /**
   * Test 18: Generic phrase detection works
   */
  test("generic phrase detection works", () => {
    const message = "Here are some tips you might want to consider. Let me know if you have questions.";
    const persona = getJennyPersona();

    const driftAlert = detectPersonaDrift(message, persona);

    expect(driftAlert.hasDrift).toBe(true);
    expect(driftAlert.violations.some(v => v.type === "too_generic")).toBe(true);
  });

  /**
   * Test 19: shouldRewriteMessage correctly identifies severe drift
   */
  test("shouldRewriteMessage correctly identifies severe drift", () => {
    const severeMessage = "As an AI, I'm programmed to help you.";
    const persona = getJennyPersona();

    const alert = detectPersonaDrift(severeMessage, persona);

    expect(shouldRewriteMessage(alert)).toBe(true);
    expect(alert.severity).toBe(3);
    expect(alert.action).toBe("rewrite");
  });

  /**
   * Test 20: Tone instruction integration modifies persona
   */
  test("tone instruction integration modifies persona", () => {
    const memory = initializeConversationMemory();
    const toneInstruction = createNeutralToneInstruction();
    toneInstruction.warmth = "high";
    toneInstruction.pacing = "slower";
    toneInstruction.avoid = ["robotic phrasing", "lecturing"];

    const persona = buildJennyPersonaInstruction(memory.emotionalSignals, toneInstruction);

    expect(persona.tone.warmth).toBe("high");
    expect(persona.microTraits.pacing).toBe("slow-reassuring");
    expect(persona.boundaries.avoid).toContain("robotic phrasing");
    expect(persona.boundaries.avoid).toContain("lecturing");
  });
});
