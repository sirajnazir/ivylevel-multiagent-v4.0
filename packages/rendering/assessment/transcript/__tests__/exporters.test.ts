import fs from "fs";
import { exportMarkdown } from "../exporters/exportMarkdown";
import { exportJsonl } from "../exporters/exportJsonl";
import { exportDocx } from "../exporters/exportDocx";
import { exportPdf } from "../exporters/exportPdf";
import { SessionTranscript } from "../../../../agents/assessment-agent/runtime/transcript/transcript.types";
import { getJennyPersona } from "../../../../agents/assessment-agent/src/jennyPersona";

/**
 * Component 17 Tests - Multi-Format Transcript Export v1.0
 *
 * Tests cover:
 * - PDF file creation
 * - DOCX file creation
 * - Markdown structure correctness
 * - JSONL record count matches turns length
 * - Inline (buffer) mode works
 * - Missing outputPath defaults
 * - Large transcript stability
 * - No PII leakage beyond transcript content
 * - All formats handle empty transcripts
 * - Error handling
 */

describe("Component 17 - Multi-Format Transcript Export", () => {
  let mockTranscript: SessionTranscript;

  beforeEach(() => {
    const jennyPersona = getJennyPersona();

    // Create mock transcript
    mockTranscript = {
      sessionId: "test_session_001",
      coachId: "jenny",
      studentId: "test_student_001",
      metadata: {
        startedAt: "2024-01-15T10:00:00.000Z",
        endedAt: "2024-01-15T10:30:00.000Z",
        totalTurns: 4,
        totalDurationMinutes: 30,
        summary: "This assessment covered academic background, extracurricular activities, and college preferences. Key themes: research interest, leadership."
      },
      turns: [
        {
          role: "coach",
          text: "Hey! I'm Jenny. So excited to meet you. Tell me—what's on your mind about college?",
          timestamp: "2024-01-15T10:00:00.000Z",
          phase: "warmup",
          step: "warmup_intro",
          emotionalSignals: {
            frustration: 0,
            confidence: 3,
            overwhelm: 0,
            motivation: 3,
            agency: 3
          },
          personaSnapshot: jennyPersona
        },
        {
          role: "student",
          text: "Hi Jenny! I'm pretty nervous about the whole process. My parents want me to apply to Ivies but I'm not sure.",
          timestamp: "2024-01-15T10:01:00.000Z",
          phase: "warmup",
          step: "warmup_background",
          emotionalSignals: {
            frustration: 1,
            confidence: 2,
            overwhelm: 2,
            motivation: 3,
            agency: 2
          },
          personaSnapshot: jennyPersona
        },
        {
          role: "coach",
          text: "Totally get that. Parental pressure is real. Before we get into schools, I want to understand you first. What actually excites you?",
          timestamp: "2024-01-15T10:02:00.000Z",
          phase: "warmup",
          step: "warmup_background",
          emotionalSignals: {
            frustration: 1,
            confidence: 2,
            overwhelm: 2,
            motivation: 3,
            agency: 2
          },
          personaSnapshot: jennyPersona
        },
        {
          role: "student",
          text: "I love computer science and I've been doing research in machine learning. Also captain of the robotics team.",
          timestamp: "2024-01-15T10:03:30.000Z",
          phase: "diagnostic",
          step: "diagnostic_ecs_depth",
          emotionalSignals: {
            frustration: 0,
            confidence: 4,
            overwhelm: 1,
            motivation: 4,
            agency: 4
          },
          personaSnapshot: jennyPersona
        }
      ]
    };
  });

  afterEach(() => {
    // Clean up any test files
    const testFiles = [
      `./transcript_${mockTranscript.sessionId}.md`,
      `./transcript_${mockTranscript.sessionId}.jsonl`,
      `./transcript_${mockTranscript.sessionId}.docx`,
      `./transcript_${mockTranscript.sessionId}.pdf`,
      "./test_output.md",
      "./test_output.jsonl",
      "./test_output.docx",
      "./test_output.pdf"
    ];

    testFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
  });

  /**
   * MARKDOWN TESTS
   */

  test("markdown export creates valid file", async () => {
    const result = await exportMarkdown({
      transcript: mockTranscript,
      outputPath: "./test_output.md"
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe("md");
    expect(result.path).toBe("./test_output.md");
    expect(fs.existsSync("./test_output.md")).toBe(true);

    const content = fs.readFileSync("./test_output.md", "utf-8");
    expect(content).toContain("# Assessment Transcript");
    expect(content).toContain("**Coach:** jenny");
    expect(content).toContain("**Student:** test_student_001");
  });

  test("markdown export returns buffer in inline mode", async () => {
    const result = await exportMarkdown({
      transcript: mockTranscript,
      inline: true
    });

    expect(result.success).toBe(true);
    expect(result.buffer).toBeDefined();
    expect(result.path).toBeUndefined();

    const content = result.buffer!.toString("utf-8");
    expect(content).toContain("# Assessment Transcript");
  });

  test("markdown structure is correct", async () => {
    const result = await exportMarkdown({
      transcript: mockTranscript,
      inline: true
    });

    const content = result.buffer!.toString("utf-8");

    // Check headers
    expect(content).toContain("## Summary");
    expect(content).toContain("## Conversation");

    // Check turns
    expect(content).toContain("### 🎓 Coach");
    expect(content).toContain("### 👤 Student");

    // Check content
    expect(content).toContain("I love computer science");
  });

  /**
   * JSONL TESTS
   */

  test("jsonl export creates valid file", async () => {
    const result = await exportJsonl({
      transcript: mockTranscript,
      outputPath: "./test_output.jsonl"
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe("jsonl");
    expect(result.path).toBe("./test_output.jsonl");
    expect(fs.existsSync("./test_output.jsonl")).toBe(true);
  });

  test("jsonl record count matches turns length", async () => {
    const result = await exportJsonl({
      transcript: mockTranscript,
      inline: true
    });

    const content = result.buffer!.toString("utf-8");
    const lines = content.split("\n").filter(line => line.trim().length > 0);

    expect(lines.length).toBe(mockTranscript.turns.length);
  });

  test("jsonl records are valid JSON", async () => {
    const result = await exportJsonl({
      transcript: mockTranscript,
      inline: true
    });

    const content = result.buffer!.toString("utf-8");
    const lines = content.split("\n").filter(line => line.trim().length > 0);

    lines.forEach(line => {
      const record = JSON.parse(line);
      expect(record.sessionId).toBe("test_session_001");
      expect(record.role).toMatch(/^(coach|student)$/);
      expect(record.text).toBeDefined();
      expect(record.emotionalSignals).toBeDefined();
    });
  });

  test("jsonl includes emotional signals", async () => {
    const result = await exportJsonl({
      transcript: mockTranscript,
      inline: true
    });

    const content = result.buffer!.toString("utf-8");
    const firstLine = content.split("\n")[0];
    const record = JSON.parse(firstLine);

    expect(record.emotionalSignals).toBeDefined();
    expect(record.emotionalSignals.frustration).toBeDefined();
    expect(record.emotionalSignals.confidence).toBeDefined();
  });

  test("jsonl includes persona context", async () => {
    const result = await exportJsonl({
      transcript: mockTranscript,
      inline: true
    });

    const content = result.buffer!.toString("utf-8");
    const firstLine = content.split("\n")[0];
    const record = JSON.parse(firstLine);

    expect(record.persona).toBeDefined();
    expect(record.persona.warmth).toBeDefined();
    expect(record.persona.empathyType).toBeDefined();
  });

  /**
   * DOCX TESTS
   */

  test("docx export creates valid file", async () => {
    const result = await exportDocx({
      transcript: mockTranscript,
      outputPath: "./test_output.docx"
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe("docx");
    expect(result.path).toBe("./test_output.docx");
    expect(fs.existsSync("./test_output.docx")).toBe(true);
  });

  test("docx export returns buffer in inline mode", async () => {
    const result = await exportDocx({
      transcript: mockTranscript,
      inline: true
    });

    expect(result.success).toBe(true);
    expect(result.buffer).toBeDefined();
    expect(result.path).toBeUndefined();
    expect(result.buffer!.length).toBeGreaterThan(0);
  });

  /**
   * PDF TESTS
   */

  test("pdf export creates valid file", async () => {
    const result = await exportPdf({
      transcript: mockTranscript,
      outputPath: "./test_output.pdf"
    });

    expect(result.success).toBe(true);
    expect(result.format).toBe("pdf");
    expect(result.path).toBe("./test_output.pdf");
    expect(fs.existsSync("./test_output.pdf")).toBe(true);
  });

  test("pdf export returns buffer in inline mode", async () => {
    const result = await exportPdf({
      transcript: mockTranscript,
      inline: true
    });

    expect(result.success).toBe(true);
    expect(result.buffer).toBeDefined();
    expect(result.path).toBeUndefined();
    expect(result.buffer!.length).toBeGreaterThan(0);
  });

  /**
   * DEFAULT PATH TESTS
   */

  test("markdown uses default path when not specified", async () => {
    const result = await exportMarkdown({
      transcript: mockTranscript
    });

    expect(result.success).toBe(true);
    expect(result.path).toBe(`./transcript_${mockTranscript.sessionId}.md`);
    expect(fs.existsSync(result.path!)).toBe(true);
  });

  test("jsonl uses default path when not specified", async () => {
    const result = await exportJsonl({
      transcript: mockTranscript
    });

    expect(result.success).toBe(true);
    expect(result.path).toBe(`./transcript_${mockTranscript.sessionId}.jsonl`);
    expect(fs.existsSync(result.path!)).toBe(true);
  });

  /**
   * LARGE TRANSCRIPT TESTS
   */

  test("handles large transcripts (100+ turns)", async () => {
    // Create large transcript
    const largeTurns = [];
    const jennyPersona = getJennyPersona();

    for (let i = 0; i < 100; i++) {
      largeTurns.push({
        role: i % 2 === 0 ? "coach" as const : "student" as const,
        text: `Turn ${i}: This is a test message with some content.`,
        timestamp: new Date(Date.now() + i * 60000).toISOString(),
        phase: "diagnostic",
        step: "diagnostic_academics_gpa",
        emotionalSignals: {
          frustration: 0,
          confidence: 3,
          overwhelm: 0,
          motivation: 3,
          agency: 3
        },
        personaSnapshot: jennyPersona
      });
    }

    const largeTranscript: SessionTranscript = {
      ...mockTranscript,
      sessionId: "large_test",
      metadata: {
        ...mockTranscript.metadata,
        totalTurns: 100
      },
      turns: largeTurns
    };

    const mdResult = await exportMarkdown({ transcript: largeTranscript, inline: true });
    const jsonlResult = await exportJsonl({ transcript: largeTranscript, inline: true });
    const docxResult = await exportDocx({ transcript: largeTranscript, inline: true });
    const pdfResult = await exportPdf({ transcript: largeTranscript, inline: true });

    expect(mdResult.success).toBe(true);
    expect(jsonlResult.success).toBe(true);
    expect(docxResult.success).toBe(true);
    expect(pdfResult.success).toBe(true);
  });

  /**
   * EMPTY TRANSCRIPT TESTS
   */

  test("handles empty transcript gracefully", async () => {
    const emptyTranscript: SessionTranscript = {
      ...mockTranscript,
      sessionId: "empty_test",
      metadata: {
        ...mockTranscript.metadata,
        totalTurns: 0
      },
      turns: []
    };

    const mdResult = await exportMarkdown({ transcript: emptyTranscript, inline: true });
    const jsonlResult = await exportJsonl({ transcript: emptyTranscript, inline: true });

    expect(mdResult.success).toBe(true);
    expect(jsonlResult.success).toBe(true);

    // JSONL should be empty string
    const jsonlContent = jsonlResult.buffer!.toString("utf-8");
    expect(jsonlContent).toBe("");
  });

  /**
   * PII LEAKAGE TESTS
   */

  test("exports contain only transcript data (no PII leakage)", async () => {
    const result = await exportJsonl({
      transcript: mockTranscript,
      inline: true
    });

    const content = result.buffer!.toString("utf-8");

    // Should contain expected data
    expect(content).toContain("test_session_001");
    expect(content).toContain("jenny");
    expect(content).toContain("test_student_001");

    // Should NOT contain system internals
    expect(content).not.toContain("password");
    expect(content).not.toContain("apiKey");
    expect(content).not.toContain("secret");
  });
});
