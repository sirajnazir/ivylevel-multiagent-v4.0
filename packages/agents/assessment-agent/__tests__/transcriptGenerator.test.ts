import {
  SessionTranscriptGenerator,
  createSessionTranscriptGenerator
} from "../runtime/transcript/transcriptGenerator";
import {
  TranscriptFormatter,
  createTranscriptFormatter
} from "../runtime/transcript/transcriptFormatter";
import { SessionMetadata, SessionTranscript, Turn } from "../runtime/transcript/transcript.types";
import { FlowState, initializeFlowState } from "../runtime/sessionFlow/flowState";
import { getJennyPersona } from "../src/jennyPersona";

/**
 * Component 16 Tests - Session Transcript Generator v1.0
 *
 * Tests cover:
 * - Transcript object generation
 * - Turn role mapping
 * - Timestamp normalization
 * - Summary generation
 * - Text cleaning (LLM noise removal)
 * - Emotional signals preservation
 * - Persona snapshots preservation
 * - Duration calculation
 * - Export formats (JSON, plain text, parent report)
 */

describe("Component 16 - Session Transcript Generator", () => {
  let generator: SessionTranscriptGenerator;
  let formatter: TranscriptFormatter;
  let mockState: FlowState;
  let sessionMeta: SessionMetadata;

  beforeEach(() => {
    formatter = createTranscriptFormatter();
    generator = createSessionTranscriptGenerator(formatter);

    // Create mock flow state with history
    const jennyPersona = getJennyPersona();
    mockState = initializeFlowState(jennyPersona);

    // Add some conversation history
    mockState.history = [
      {
        role: "assistant",
        content: "Hey! I'm Jenny. So excited to meet you. Tell me—what's on your mind about college?",
        timestamp: "2024-01-15T10:00:00.000Z"
      },
      {
        role: "user",
        content: "Hi Jenny! I'm pretty nervous about the whole process. My parents want me to apply to Ivies but I'm not sure.",
        timestamp: "2024-01-15T10:01:00.000Z"
      },
      {
        role: "assistant",
        content: "Totally get that. Parental pressure is real. Before we get into schools, I want to understand you first. What actually excites you?",
        timestamp: "2024-01-15T10:02:00.000Z"
      },
      {
        role: "user",
        content: "I love computer science and I've been doing research in machine learning. Also captain of the robotics team.",
        timestamp: "2024-01-15T10:03:30.000Z"
      }
    ];

    mockState.phase = "warmup";
    mockState.step = "warmup_background";
    mockState.turnCount = 4;

    sessionMeta = {
      sessionId: "sess_test_001",
      coachId: "jenny",
      studentId: "student_test_001"
    };
  });

  /**
   * Test 1: Builds valid transcript object
   */
  test("builds valid transcript object", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    expect(transcript).toBeDefined();
    expect(transcript.sessionId).toBe("sess_test_001");
    expect(transcript.coachId).toBe("jenny");
    expect(transcript.studentId).toBe("student_test_001");
    expect(transcript.metadata).toBeDefined();
    expect(transcript.turns).toBeDefined();
    expect(Array.isArray(transcript.turns)).toBe(true);
  });

  /**
   * Test 2: Correct turn role mapping
   */
  test("maps turn roles correctly", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    expect(transcript.turns[0].role).toBe("coach"); // assistant → coach
    expect(transcript.turns[1].role).toBe("student"); // user → student
    expect(transcript.turns[2].role).toBe("coach");
    expect(transcript.turns[3].role).toBe("student");
  });

  /**
   * Test 3: Timestamp normalization
   */
  test("normalizes timestamps correctly", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    transcript.turns.forEach(turn => {
      expect(turn.timestamp).toBeDefined();
      expect(typeof turn.timestamp).toBe("string");
      // Should be valid ISO string
      expect(() => new Date(turn.timestamp)).not.toThrow();
    });

    expect(transcript.metadata.startedAt).toBe("2024-01-15T10:00:00.000Z");
    expect(transcript.metadata.endedAt).toBe("2024-01-15T10:03:30.000Z");
  });

  /**
   * Test 4: Summary generation correct
   */
  test("generates summary correctly", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    expect(transcript.metadata.summary).toBeDefined();
    expect(transcript.metadata.summary).toContain("4 total turns");
    expect(transcript.metadata.summary).toContain("Student spoke 2 times");
    expect(transcript.metadata.summary).toContain("coach spoke 2 times");
  });

  /**
   * Test 5: Formatter cleans LLM noise
   */
  test("formatter cleans LLM noise", () => {
    const noisyText = "```json\n{\"message\": \"Hello\"}\n```  Extra   spaces   here";
    const cleaned = formatter.cleanText(noisyText);

    expect(cleaned).not.toContain("```");
    expect(cleaned).not.toContain("json");
    expect(cleaned).not.toContain("  "); // No double spaces
    expect(cleaned).toBe("{\"message\": \"Hello\"} Extra spaces here");
  });

  /**
   * Test 6: Emotional signals preserved
   */
  test("preserves emotional signals in turns", () => {
    mockState.emotionalSignals.frustration = 3;
    mockState.emotionalSignals.confidence = 2;

    const transcript = generator.buildTranscript(mockState, sessionMeta);

    transcript.turns.forEach(turn => {
      expect(turn.emotionalSignals).toBeDefined();
      expect(turn.emotionalSignals.frustration).toBe(3);
      expect(turn.emotionalSignals.confidence).toBe(2);
    });
  });

  /**
   * Test 7: Persona snapshots preserved
   */
  test("preserves persona snapshots in turns", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    transcript.turns.forEach(turn => {
      expect(turn.personaSnapshot).toBeDefined();
      expect(turn.personaSnapshot.identity.name).toBe("Jenny");
      expect(turn.personaSnapshot.identity.archetype).toBe("warm challenger");
    });
  });

  /**
   * Test 8: Duration calculation correctness
   */
  test("calculates duration correctly", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    // Duration from 10:00:00 to 10:03:30 = 3.5 minutes ≈ 4 minutes
    expect(transcript.metadata.totalDurationMinutes).toBeGreaterThanOrEqual(3);
    expect(transcript.metadata.totalDurationMinutes).toBeLessThanOrEqual(4);
  });

  /**
   * Test 9: Turn count matches history
   */
  test("turn count matches history length", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    expect(transcript.metadata.totalTurns).toBe(mockState.history.length);
    expect(transcript.turns.length).toBe(mockState.history.length);
  });

  /**
   * Test 10: Handles empty history gracefully
   */
  test("handles empty history gracefully", () => {
    mockState.history = [];

    const transcript = generator.buildTranscript(mockState, sessionMeta);

    expect(transcript.turns).toEqual([]);
    expect(transcript.metadata.totalTurns).toBe(0);
    expect(transcript.metadata.totalDurationMinutes).toBe(0);
  });

  /**
   * Test 11: Theme extraction works
   */
  test("extracts themes from conversation", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    expect(transcript.metadata.summary).toContain("research interest");
    expect(transcript.metadata.summary).toContain("leadership");
  });

  /**
   * Test 12: JSON export is valid
   */
  test("exports to valid JSON", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);
    const json = generator.exportToJSON(transcript);

    expect(json).toBeDefined();
    expect(typeof json).toBe("string");

    // Should be parseable
    const parsed = JSON.parse(json);
    expect(parsed.sessionId).toBe("sess_test_001");
    expect(parsed.turns.length).toBe(4);
  });

  /**
   * Test 13: Plain text export is readable
   */
  test("exports to readable plain text", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);
    const plainText = generator.exportToPlainText(transcript);

    expect(plainText).toContain("COACHING SESSION TRANSCRIPT");
    expect(plainText).toContain("Session ID: sess_test_001");
    expect(plainText).toContain("Coach: jenny");
    expect(plainText).toContain("Student: student_test_001");
    expect(plainText).toContain("[1] Coach");
    expect(plainText).toContain("[2] Student");
  });

  /**
   * Test 14: Parent report export works
   */
  test("exports parent-friendly report", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);
    const report = generator.exportForParentReport(transcript);

    expect(report).toContain("Session Highlights");
    expect(report).toContain("Key Student Insights");
    expect(report).toContain("Themes Discussed");
  });

  /**
   * Test 15: Phase and step captured in turns
   */
  test("captures phase and step in each turn", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    transcript.turns.forEach(turn => {
      expect(turn.phase).toBe("warmup");
      expect(turn.step).toBe("warmup_background");
    });
  });

  /**
   * Test 16: Text cleaning removes system tags
   */
  test("removes system tags from text", () => {
    const textWithTags = "<system>System message</system> Real content <assistant>Assistant speaks</assistant>";
    const cleaned = formatter.cleanText(textWithTags);

    expect(cleaned).not.toContain("<system>");
    expect(cleaned).not.toContain("</system>");
    expect(cleaned).not.toContain("<assistant>");
    expect(cleaned).toBe("System message Real content Assistant speaks");
  });

  /**
   * Test 17: Theme extraction detects multiple themes
   */
  test("detects multiple conversation themes", () => {
    // Add more history with varied themes
    mockState.history.push({
      role: "user",
      content: "I also volunteer at the local food bank and founded a tutoring program for immigrant kids.",
      timestamp: "2024-01-15T10:05:00.000Z"
    });

    const transcript = generator.buildTranscript(mockState, sessionMeta);

    expect(transcript.metadata.summary).toContain("service orientation");
    expect(transcript.metadata.summary).toContain("leadership");
  });

  /**
   * Test 18: Handles missing timestamps
   */
  test("handles missing timestamps gracefully", () => {
    mockState.history = [
      {
        role: "assistant",
        content: "Hello"
        // No timestamp
      },
      {
        role: "user",
        content: "Hi"
        // No timestamp
      }
    ];

    const transcript = generator.buildTranscript(mockState, sessionMeta);

    transcript.turns.forEach(turn => {
      expect(turn.timestamp).toBeDefined();
      expect(typeof turn.timestamp).toBe("string");
    });
  });

  /**
   * Test 19: Student vs coach turn counts are correct
   */
  test("counts student and coach turns separately", () => {
    const transcript = generator.buildTranscript(mockState, sessionMeta);

    const studentTurns = transcript.turns.filter(t => t.role === "student");
    const coachTurns = transcript.turns.filter(t => t.role === "coach");

    expect(studentTurns.length).toBe(2);
    expect(coachTurns.length).toBe(2);

    expect(transcript.metadata.summary).toContain("Student spoke 2 times");
    expect(transcript.metadata.summary).toContain("coach spoke 2 times");
  });

  /**
   * Test 20: Cleans excessive whitespace
   */
  test("normalizes excessive whitespace", () => {
    const textWithSpaces = "Hello     world    this   has    too    many    spaces";
    const cleaned = formatter.cleanText(textWithSpaces);

    expect(cleaned).toBe("Hello world this has too many spaces");
    expect(cleaned).not.toContain("  "); // No double spaces
  });
});
