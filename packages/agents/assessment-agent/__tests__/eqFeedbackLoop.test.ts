import { generateToneInstruction, detectToneViolations } from "../src/eqFeedbackLoop";
import { correctToneHeuristic, validateToneAlignment } from "../src/toneDriftCorrector";
import { initializeConversationMemory } from "../../../schema/conversationMemory_v1";
import { toneInstructionSchema } from "../../../schema/toneInstruction_v1";

/**
 * Component 13 Tests - EQ Feedback Loop + Tone Drift Correction v1.0
 *
 * Tests cover:
 * - Tone instruction generation based on emotional signals
 * - Tone drift detection (robotic, academic, corporate)
 * - Tone violation detection
 * - Heuristic tone correction
 * - Validation of tone alignment
 */

describe("Component 13 - EQ Feedback Loop + Tone Drift Correction", () => {
  /**
   * Test 1: Lowers pacing if overwhelm high
   *
   * When student is overwhelmed, pacing should slow down and avoid long lists.
   */
  test("lowers pacing if overwhelm high", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.overwhelm = 4; // High overwhelm

    const instruction = generateToneInstruction(memory, "");

    expect(instruction.pacing).toBe("slower");
    expect(instruction.avoid).toContain("giving long lists");
    expect(instruction.mustInclude).toContain("simplify the next step");
  });

  /**
   * Test 2: Increases warmth when frustration high
   *
   * High frustration should trigger de-escalation mode with high warmth.
   */
  test("increases warmth in frustration", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.frustration = 4; // High frustration

    const instruction = generateToneInstruction(memory, "");

    expect(instruction.warmth).toBe("high");
    expect(instruction.empathy).toBe("reflective");
    expect(instruction.coachingStyle).toBe("de-escalate");
    expect(instruction.mustInclude).toContain("acknowledge emotion");
  });

  /**
   * Test 3: Demands validation phrases if confidence low
   *
   * Low confidence should trigger validation mode.
   */
  test("demands validation phrases if confidence low", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.confidence = 1; // Low confidence

    const instruction = generateToneInstruction(memory, "");

    expect(instruction.warmth).toBe("high");
    expect(instruction.empathy).toBe("validating");
    expect(instruction.coachingStyle).toBe("reinforce strengths");
    expect(instruction.mustInclude).toContain("validate their concern");
  });

  /**
   * Test 4: Checks for robotic tone
   *
   * Detects "as an AI" and similar robotic language.
   */
  test("checks for robotic tone", () => {
    const memory = initializeConversationMemory();
    const roboticMessage = "As an AI, I can help you with that.";

    const instruction = generateToneInstruction(memory, roboticMessage);

    expect(instruction.avoid).toContain("robotic phrasing");
    expect(instruction.mustInclude).toContain("use conversational warmth");
  });

  /**
   * Test 5: Rewrites when tone violation occurs
   *
   * Heuristic corrector removes robotic phrases.
   */
  test("rewrites when tone violation occurs", () => {
    const message = "As an AI, I think you should consider AP Calculus.";
    const instruction = generateToneInstruction(initializeConversationMemory(), "");
    instruction.avoid = ["robotic phrasing", "lecturing"];

    const corrected = correctToneHeuristic(message, instruction);

    expect(corrected).not.toContain("As an AI");
    expect(corrected).not.toContain("you should");
  });

  /**
   * Test 6: Keeps original message when aligned
   *
   * Validation should pass for messages without violations.
   */
  test("keeps original message when aligned", () => {
    const message = "I hear you. Let's explore that together.";
    const instruction = generateToneInstruction(initializeConversationMemory(), "");

    const isAligned = validateToneAlignment(message, instruction);

    expect(isAligned).toBe(true);
  });

  /**
   * Test 7: Corrects "As an AI" leakage
   *
   * Heuristic corrector removes AI self-reference.
   */
  test("corrects 'As an AI' leakage", () => {
    const message = "As an AI language model, I can provide guidance.";
    const instruction = generateToneInstruction(initializeConversationMemory(), "");
    instruction.avoid = ["robotic phrasing", "AI self-reference"];

    const corrected = correctToneHeuristic(message, instruction);

    expect(corrected).not.toContain("as an ai");
    expect(corrected).not.toContain("language model");
  });

  /**
   * Test 8: Ensures JSON structure integrity
   *
   * Generated tone instructions must pass Zod validation.
   */
  test("ensures JSON structure integrity", () => {
    const memory = initializeConversationMemory();
    const instruction = generateToneInstruction(memory, "");

    // Should not throw
    const validated = toneInstructionSchema.parse(instruction);

    expect(validated.warmth).toBeDefined();
    expect(validated.empathy).toBeDefined();
    expect(validated.pacing).toBeDefined();
    expect(validated.coachingStyle).toBeDefined();
    expect(Array.isArray(validated.avoid)).toBe(true);
    expect(Array.isArray(validated.mustInclude)).toBe(true);
  });

  /**
   * Test 9: Prevents academic tone if flagged
   *
   * Academic transitions should be replaced with conversational ones.
   */
  test("prevents academic tone if flagged", () => {
    const message = "However, you must consider the consequences. Therefore, it's important.";
    const instruction = generateToneInstruction(initializeConversationMemory(), "");
    instruction.avoid = ["academic tone", "lecturing"];

    const corrected = correctToneHeuristic(message, instruction);

    expect(corrected).not.toContain("However");
    expect(corrected).not.toContain("Therefore");
    expect(corrected).toContain("but");
    expect(corrected).toContain("so");
  });

  /**
   * Test 10: Ensures mustInclude elements appear
   *
   * Validation detects missing required elements.
   */
  test("ensures mustInclude elements appear", () => {
    const messageWithoutEmpathy = "You should apply to Stanford.";
    const instruction = generateToneInstruction(initializeConversationMemory(), "");
    instruction.mustInclude = ["acknowledge emotion", "include empathy marker"];

    const violations = detectToneViolations(messageWithoutEmpathy, instruction);

    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some(v => v.includes("Missing"))).toBe(true);
  });

  /**
   * Test 11: Detects corporate speak
   *
   * Corporate jargon should trigger correction.
   */
  test("detects corporate speak", () => {
    const corporateMessage = "Let's leverage this opportunity to optimize your strategy.";
    const instruction = generateToneInstruction(initializeConversationMemory(), corporateMessage);

    expect(instruction.avoid).toContain("corporate speak");
    expect(instruction.mustInclude).toContain("use everyday language");
  });

  /**
   * Test 12: Handles low motivation with momentum sparking
   *
   * Low motivation should trigger momentum mode with actionable steps.
   */
  test("handles low motivation with momentum sparking", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.motivation = 1; // Very low motivation

    const instruction = generateToneInstruction(memory, "");

    expect(instruction.coachingStyle).toBe("spark momentum");
    expect(instruction.mustInclude).toContain("suggest small actionable next step");
    expect(instruction.avoid).toContain("overwhelming them with options");
  });

  /**
   * Test 13: Detects over-explaining (wall of text)
   *
   * Long messages should trigger brevity instructions.
   */
  test("detects over-explaining (wall of text)", () => {
    const longMessage = "A".repeat(600); // Over 500 chars
    const instruction = generateToneInstruction(initializeConversationMemory(), longMessage);

    expect(instruction.avoid).toContain("over-explaining");
    expect(instruction.mustInclude).toContain("keep response under 3 sentences");
  });

  /**
   * Test 14: Trims long messages in heuristic correction
   *
   * Heuristic corrector should truncate to 3 sentences max.
   */
  test("trims long messages in heuristic correction", () => {
    const longMessage = "Sentence one is here. Sentence two follows. Sentence three appears. Sentence four is extra. Sentence five is too much.";
    const instruction = generateToneInstruction(initializeConversationMemory(), "");
    instruction.avoid = ["over-explaining"];

    const corrected = correctToneHeuristic(longMessage, instruction);
    const sentenceCount = corrected.split(/[.!?]+/).filter(s => s.trim().length > 0).length;

    expect(sentenceCount).toBeLessThanOrEqual(3);
  });

  /**
   * Test 15: Handles low agency with empowerment language
   *
   * Low agency should trigger ownership encouragement.
   */
  test("handles low agency with empowerment language", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.agency = 1; // Very low agency

    const instruction = generateToneInstruction(memory, "");

    expect(instruction.coachingStyle).toBe("encourage ownership");
    expect(instruction.mustInclude).toContain("use empowerment language");
    expect(instruction.avoid).toContain("telling them what to do");
  });

  /**
   * Test 16: Detects lecturing tone and replaces it
   *
   * "You should" language should be softened.
   */
  test("detects lecturing tone and replaces it", () => {
    const lecturingMessage = "You should apply early. You need to study harder. You must complete this.";
    const instruction = generateToneInstruction(initializeConversationMemory(), "");
    instruction.avoid = ["lecturing", "directive language"];

    const corrected = correctToneHeuristic(lecturingMessage, instruction);

    expect(corrected).not.toContain("you should");
    expect(corrected).not.toContain("you need to");
    expect(corrected).not.toContain("you must");
  });

  /**
   * Test 17: Responds to parental pressure pattern
   *
   * Parental pressure should add validation for student's voice.
   */
  test("responds to parental pressure pattern", () => {
    const memory = initializeConversationMemory();
    memory.detectedPatterns = ["parental_pressure_expressed"];

    const instruction = generateToneInstruction(memory, "");

    expect(instruction.mustInclude).toContain("validate student's own voice");
    expect(instruction.avoid).toContain("reinforcing parent expectations");
  });

  /**
   * Test 18: Celebrates micro-wins
   *
   * Micro-win pattern should increase warmth and add celebration.
   */
  test("celebrates micro-wins", () => {
    const memory = initializeConversationMemory();
    memory.detectedPatterns = ["micro_win_celebration"];

    const instruction = generateToneInstruction(memory, "");

    expect(instruction.mustInclude).toContain("celebrate the progress");
    expect(instruction.warmth).toBe("high");
  });

  /**
   * Test 19: Adds empathy marker when emotionless
   *
   * Messages without empathy should trigger empathy addition.
   * Note: "you need to" also triggers lecturing detection.
   */
  test("adds empathy marker when emotionless", () => {
    const emotionlessMessage = "You need to complete your application by December.";
    const instruction = generateToneInstruction(initializeConversationMemory(), emotionlessMessage);

    // This message triggers lecturing detection (due to "you need to")
    // which adds "use invitational language"
    expect(instruction.mustInclude.length).toBeGreaterThan(0);
    expect(instruction.avoid).toContain("lecturing");

    // When we add the empathy requirement explicitly
    instruction.mustInclude.push("include empathy marker");

    // Heuristic corrector should add empathy
    const corrected = correctToneHeuristic(emotionlessMessage, instruction);
    expect(corrected).toMatch(/\b(i hear you|feel|understand|makes sense)\b/i);
  });

  /**
   * Test 20: Validates combined emotional signals
   *
   * Multiple emotional signals should combine correctly.
   */
  test("validates combined emotional signals", () => {
    const memory = initializeConversationMemory();
    memory.emotionalSignals.frustration = 4;
    memory.emotionalSignals.confidence = 1;
    memory.emotionalSignals.overwhelm = 3;

    const instruction = generateToneInstruction(memory, "");

    // Should have high warmth from both frustration and low confidence
    expect(instruction.warmth).toBe("high");

    // Should have reflective or validating empathy
    expect(["reflective", "validating"]).toContain(instruction.empathy);

    // Should avoid long lists from overwhelm
    expect(instruction.avoid).toContain("giving long lists");

    // Should include emotion acknowledgment from frustration
    expect(instruction.mustInclude).toContain("acknowledge emotion");
  });
});
