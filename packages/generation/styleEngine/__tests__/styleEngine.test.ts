/**
 * Component 24 Tests - Style-Aware Generation Pipeline
 *
 * Tests cover:
 * - EQ mode → tone shift verification
 * - Archetype → communication shift verification
 * - Persona signature injection
 * - Prompt construction correctness
 * - Style compatibility validation
 * - Persona violation detection
 * - Mock LLM generation
 * - End-to-end composition
 */

import { buildPrompt, validatePromptInput, getPromptStats, buildSystemPrompt } from "../buildPrompt";
import { styleAdapter, getStyleSummary, validateStyleCompatibility } from "../styleAdapter";
import {
  personaAdapter,
  validateResponseAgainstPersona,
  getPersonaSummary
} from "../personaAdapter";
import { composeCoachResponse, getCompositionSummary } from "../messageComposer";
import { mockLLMCaller, estimateTokenCount, validateAPIKey } from "../llmCaller";

describe("Component 24 - Style-Aware Generation Pipeline", () => {
  /**
   * Test 1: Gentle mode produces high warmth, low directness
   */
  test("gentle mode produces high warmth style", () => {
    const style = styleAdapter("gentle", "uncertain");

    expect(style.metadata?.warmthLevel).toBeGreaterThan(0.7);
    expect(style.metadata?.directnessLevel).toBeLessThan(0.5);
    expect(style.directives).toContain("emotional mirroring");
  });

  /**
   * Test 2: Direct mode produces low warmth, high directness
   */
  test("direct mode produces high directness style", () => {
    const style = styleAdapter("direct", "uncertain");

    expect(style.metadata?.directnessLevel).toBeGreaterThan(0.7);
    expect(style.metadata?.warmthLevel).toBeLessThan(0.5);
    expect(style.directives).toContain("crisp, direct instructions");
  });

  /**
   * Test 3: Motivational mode produces energizing tone
   */
  test("motivational mode produces energizing style", () => {
    const style = styleAdapter("motivational", "uncertain");

    expect(style.metadata?.warmthLevel).toBeGreaterThan(0.5);
    expect(style.directives).toContain("energizing language");
    expect(style.directives).toContain("upward framing");
  });

  /**
   * Test 4: Mentor mode produces balanced wisdom tone
   */
  test("mentor mode produces balanced wisdom style", () => {
    const style = styleAdapter("mentor", "uncertain");

    expect(style.metadata?.warmthLevel).toBeGreaterThanOrEqual(0.5);
    expect(style.metadata?.directnessLevel).toBeGreaterThanOrEqual(0.4);
    expect(style.directives).toContain("calm");
    expect(style.directives).toContain("authority");
  });

  /**
   * Test 5: Burnout archetype reduces urgency
   */
  test("burnout archetype reduces urgency and directness", () => {
    const baseStyle = styleAdapter("direct", "uncertain");
    const burnoutStyle = styleAdapter("direct", "burnout");

    expect(burnoutStyle.metadata?.warmthLevel).toBeGreaterThan(baseStyle.metadata?.warmthLevel!);
    expect(burnoutStyle.directives).toContain("Reduce urgency");
    expect(burnoutStyle.directives).toContain("Limit step count");
  });

  /**
   * Test 6: High achiever archetype increases rigor
   */
  test("high achiever archetype increases rigor", () => {
    const baseStyle = styleAdapter("mentor", "uncertain");
    const achieverStyle = styleAdapter("mentor", "high_achiever");

    expect(achieverStyle.metadata?.directnessLevel).toBeGreaterThan(
      baseStyle.metadata?.directnessLevel!
    );
    expect(achieverStyle.directives).toContain("rigor");
    expect(achieverStyle.directives).toContain("competitive");
  });

  /**
   * Test 7: Late starter archetype builds confidence
   */
  test("late starter archetype builds confidence", () => {
    const style = styleAdapter("mentor", "late_starter");

    expect(style.directives).toContain("Build confidence");
    expect(style.directives).toContain("Celebrate progress");
    expect(style.metadata?.pacingSpeed).toBe("slow");
  });

  /**
   * Test 8: Quiet builder archetype respects introspection
   */
  test("quiet builder archetype respects introspection", () => {
    const style = styleAdapter("motivational", "quiet_builder");

    expect(style.directives).toContain("introspection");
    expect(style.directives).toContain("frameworks");
    expect(style.directives).toContain("substance over flash");
  });

  /**
   * Test 9: Explorer archetype encourages curiosity
   */
  test("explorer archetype encourages curiosity", () => {
    const style = styleAdapter("mentor", "explorer");

    expect(style.directives).toContain("curiosity");
    expect(style.directives).toContain("multiple paths");
    expect(style.directives).toContain("open-ended questions");
  });

  /**
   * Test 10: Style compatibility validation detects mismatches
   */
  test("style validation detects burnout + high directness conflict", () => {
    const style = styleAdapter("direct", "uncertain");
    // Manually override for testing
    style.metadata!.archetype = "burnout";
    style.metadata!.directnessLevel = 0.9;

    const warnings = validateStyleCompatibility(style);

    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings[0]).toContain("burnout");
  });

  /**
   * Test 11: Persona adapter injects Jenny's identity
   */
  test("persona adapter includes Jenny's identity traits", () => {
    const persona = personaAdapter();

    expect(persona.signature).toContain("First-generation immigrant");
    expect(persona.signature).toContain("Tactical clarity");
    expect(persona.signature).toContain("Empathetic realism");
    expect(persona.metadata?.identityTraits.length).toBeGreaterThan(5);
  });

  /**
   * Test 12: Persona adapter includes signature moves
   */
  test("persona adapter includes signature coaching moves", () => {
    const persona = personaAdapter();

    expect(persona.signature).toContain("Reframing");
    expect(persona.signature).toContain("Scaffolding");
    expect(persona.signature).toContain("Socratic questioning");
    expect(persona.metadata?.signatureMoves.length).toBeGreaterThan(5);
  });

  /**
   * Test 13: Persona adapter includes forbidden phrases
   */
  test("persona adapter lists forbidden corporate phrases", () => {
    const persona = personaAdapter();

    expect(persona.signature).toContain("Best of luck");
    expect(persona.signature).toContain("I'd be happy to");
    expect(persona.metadata?.forbiddenPhrases.length).toBeGreaterThan(10);
  });

  /**
   * Test 14: Persona validation detects forbidden phrases
   */
  test("persona validation catches forbidden phrase usage", () => {
    const persona = personaAdapter();
    const badResponse = "Best of luck with your college applications! I'd be happy to help.";

    const violations = validateResponseAgainstPersona(badResponse, persona);

    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some(v => v.includes("Best of luck"))).toBe(true);
    expect(violations.some(v => v.includes("I'd be happy to"))).toBe(true);
  });

  /**
   * Test 15: Persona validation detects corporate tone
   */
  test("persona validation catches corporate tone markers", () => {
    const persona = personaAdapter();
    const corporateResponse = "Please note that you should feel free to reach out.";

    const violations = validateResponseAgainstPersona(corporateResponse, persona);

    expect(violations.some(v => v.toLowerCase().includes("corporate"))).toBe(true);
  });

  /**
   * Test 16: Persona validation detects formal transitions
   */
  test("persona validation catches overly formal transitions", () => {
    const persona = personaAdapter();
    const formalResponse =
      "Furthermore, you should consider this. Additionally, think about that. In conclusion, good luck.";

    const violations = validateResponseAgainstPersona(formalResponse, persona);

    expect(violations.some(v => v.includes("formal"))).toBe(true);
  });

  /**
   * Test 17: Persona validation warns on missing contractions
   */
  test("persona validation warns when no contractions used", () => {
    const persona = personaAdapter();
    const formalResponse =
      "I understand your concern. You are not alone in this. It is important to focus. You will succeed. This is a longer response to ensure we have enough sentences to trigger the warning.";

    const violations = validateResponseAgainstPersona(formalResponse, persona);

    expect(violations.some(v => v.includes("contraction"))).toBe(true);
  });

  /**
   * Test 18: Prompt construction includes all sections
   */
  test("prompt includes all required sections", () => {
    const style = styleAdapter("gentle", "uncertain");
    const persona = personaAdapter();

    const prompt = buildPrompt({
      userMessage: "I'm feeling overwhelmed",
      chips: ["Depth over breadth is key", "Focus on one spike"],
      eqMode: "gentle",
      archetype: "uncertain",
      intent: "eq",
      persona,
      style
    });

    expect(prompt).toContain("# ROLE");
    expect(prompt).toContain("# EQ MODE");
    expect(prompt).toContain("# ARCHETYPE");
    expect(prompt).toContain("# COACHING INTENT");
    expect(prompt).toContain("# STYLE RULES");
    expect(prompt).toContain("# PERSONA SIGNATURE");
    expect(prompt).toContain("# HIGH-QUALITY CONTEXT");
    expect(prompt).toContain("# USER MESSAGE");
    expect(prompt).toContain("# REQUIRED OUTPUT");
  });

  /**
   * Test 19: Prompt includes user message and chips
   */
  test("prompt correctly embeds user message and chips", () => {
    const style = styleAdapter("direct", "high_achiever");
    const persona = personaAdapter();

    const prompt = buildPrompt({
      userMessage: "What GPA do I need for Harvard?",
      chips: ["Aim for 3.9+ unweighted", "Take 10-12 AP courses"],
      eqMode: "direct",
      archetype: "high_achiever",
      intent: "academics",
      persona,
      style
    });

    expect(prompt).toContain("What GPA do I need for Harvard?");
    expect(prompt).toContain("Aim for 3.9+ unweighted");
    expect(prompt).toContain("Take 10-12 AP courses");
  });

  /**
   * Test 20: Prompt validation catches empty user message
   */
  test("prompt validation warns on empty user message", () => {
    const style = styleAdapter("gentle", "uncertain");
    const persona = personaAdapter();

    const warnings = validatePromptInput({
      userMessage: "",
      chips: ["Some chip"],
      eqMode: "gentle",
      archetype: "uncertain",
      intent: "general",
      persona,
      style
    });

    expect(warnings.some(w => w.includes("empty"))).toBe(true);
  });

  /**
   * Test 21: Prompt validation warns on missing chips
   */
  test("prompt validation warns when no chips provided", () => {
    const style = styleAdapter("gentle", "uncertain");
    const persona = personaAdapter();

    const warnings = validatePromptInput({
      userMessage: "Help me with my profile",
      chips: [],
      eqMode: "gentle",
      archetype: "uncertain",
      intent: "general",
      persona,
      style
    });

    expect(warnings.some(w => w.toLowerCase().includes("chip"))).toBe(true);
  });

  /**
   * Test 22: System prompt construction
   */
  test("system prompt defines Jenny's role", () => {
    const systemPrompt = buildSystemPrompt();

    expect(systemPrompt).toContain("Jenny");
    expect(systemPrompt).toContain("IvyLevel");
    expect(systemPrompt).toContain("empathetic");
    expect(systemPrompt).toContain("high-performance");
  });

  /**
   * Test 23: Prompt stats calculation
   */
  test("prompt stats correctly estimate tokens", () => {
    const prompt = "This is a test prompt with some characters.";
    const stats = getPromptStats(prompt);

    expect(stats.totalChars).toBe(43);
    expect(stats.estimatedTokens).toBe(11);
  });

  /**
   * Test 24: Mock LLM responds to gentle mode
   */
  test("mock LLM generates appropriate gentle response", async () => {
    const style = styleAdapter("gentle", "burnout");
    const persona = personaAdapter();

    const prompt = buildPrompt({
      userMessage: "I'm overwhelmed",
      chips: [],
      eqMode: "gentle",
      archetype: "burnout",
      intent: "eq",
      persona,
      style
    });

    const response = await mockLLMCaller(prompt, "You are Jenny");

    expect(response).toContain("I get it");
    expect(response.length).toBeGreaterThan(20);
  });

  /**
   * Test 25: Mock LLM responds to direct mode
   */
  test("mock LLM generates appropriate direct response", async () => {
    const style = styleAdapter("direct", "high_achiever");
    const persona = personaAdapter();

    const prompt = buildPrompt({
      userMessage: "What should I do?",
      chips: [],
      eqMode: "direct",
      archetype: "high_achiever",
      intent: "framework",
      persona,
      style
    });

    const response = await mockLLMCaller(prompt, "You are Jenny");

    expect(response).toContain("what you need to do");
  });

  /**
   * Test 26: End-to-end composition with mock LLM
   */
  test("full composition pipeline produces valid result", async () => {
    const result = await composeCoachResponse({
      userMessage: "I'm feeling overwhelmed by college apps",
      chips: ["Focus on one thing at a time", "Depth over breadth"],
      eqMode: "gentle",
      archetype: "burnout",
      intent: "eq",
      callLLM: mockLLMCaller
    });

    expect(result.response).toBeDefined();
    expect(result.response.length).toBeGreaterThan(20);
    expect(result.metadata.eqMode).toBe("gentle");
    expect(result.metadata.archetype).toBe("burnout");
    expect(result.metadata.chipsUsed).toBe(2);
    expect(result.trace.length).toBeGreaterThan(5);
  });

  /**
   * Test 27: Composition metadata includes style settings
   */
  test("composition result includes style metadata", async () => {
    const result = await composeCoachResponse({
      userMessage: "What GPA do I need?",
      chips: ["Aim for 3.9+"],
      eqMode: "direct",
      archetype: "high_achiever",
      intent: "academics",
      callLLM: mockLLMCaller
    });

    expect(result.metadata.styleMetadata).toBeDefined();
    expect(result.metadata.styleMetadata.warmthLevel).toBeDefined();
    expect(result.metadata.styleMetadata.directnessLevel).toBeDefined();
    expect(result.metadata.styleMetadata.pacingSpeed).toBeDefined();
  });

  /**
   * Test 28: Composition summary is readable
   */
  test("composition summary provides readable overview", async () => {
    const result = await composeCoachResponse({
      userMessage: "Help me build my spike",
      chips: ["Focus deeply on one domain"],
      eqMode: "mentor",
      archetype: "quiet_builder",
      intent: "framework",
      callLLM: mockLLMCaller
    });

    const summary = getCompositionSummary(result);

    expect(summary).toContain("Generation Summary");
    expect(summary).toContain("EQ Mode: mentor");
    expect(summary).toContain("Archetype: quiet_builder");
    expect(summary).toContain("Warmth:");
    expect(summary).toContain("Directness:");
  });

  /**
   * Test 29: Token estimation is reasonable
   */
  test("token estimation provides ballpark accuracy", () => {
    const text = "This is a test sentence with multiple words.";
    const tokens = estimateTokenCount(text);

    // Rough check: English text is ~4 chars per token
    expect(tokens).toBeGreaterThan(5);
    expect(tokens).toBeLessThan(20);
  });

  /**
   * Test 30: Style summary is readable
   */
  test("style summary provides readable overview", () => {
    const style = styleAdapter("gentle", "burnout");
    const summary = getStyleSummary(style);

    expect(summary).toContain("Style Profile");
    expect(summary).toContain("gentle");
    expect(summary).toContain("burnout");
    expect(summary).toContain("Warmth:");
    expect(summary).toContain("Directness:");
  });

  /**
   * Test 31: Persona summary is readable
   */
  test("persona summary provides readable overview", () => {
    const persona = personaAdapter();
    const summary = getPersonaSummary(persona);

    expect(summary).toContain("Jenny");
    expect(summary).toContain("Persona Profile");
    expect(summary).toContain("Identity Traits");
    expect(summary).toContain("Signature Moves");
  });

  /**
   * Test 32: Conversation stage is included when provided
   */
  test("conversation stage is embedded in prompt when provided", () => {
    const style = styleAdapter("mentor", "uncertain");
    const persona = personaAdapter();

    const prompt = buildPrompt({
      userMessage: "Tell me about my profile",
      chips: [],
      eqMode: "mentor",
      archetype: "uncertain",
      intent: "general",
      persona,
      style,
      conversationStage: "diagnose"
    });

    expect(prompt).toContain("CONVERSATION STAGE");
    expect(prompt).toContain("diagnose");
  });
});
