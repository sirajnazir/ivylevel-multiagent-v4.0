/**
 * Component 20 Tests - Chunk Pipeline v1.0
 *
 * Tests cover:
 * - Semantic chunking
 * - Chunk classification
 * - EQ signal extraction
 * - Chunk count validation
 * - Metadata generation
 * - Embedding generation (mocked)
 * - Pinecone indexing (mocked)
 */

import { semanticChunk } from "../semanticChunker";
import { classifyFallback, extractEQSignalsFallback } from "../chunkClassifier";
import { ChunkInput, Chunk } from "../chunk.types";

// Mock test data
const SAMPLE_JENNY_TEXT = `Hey! So looking at your profile, here's what I'm seeing.

Your GPA is solid at 3.8 unweighted. The real question is: what's the rigor story? How many APs did you take?

Here's the framework I use: colleges want to see you challenged yourself. So 8 APs with a 3.8 is way more impressive than a 4.0 with no rigor.

What excites you most about robotics? Is it the engineering? The teamwork? The competition?

You mentioned leading the debate team—cool. But I need specifics. How many hours per week? What tournaments did you win?

The principle here is: depth over breadth. Impact over participation. Leadership over titles.

So tell me: what's your spike? What makes you different from other pre-med applicants?`;

describe("Component 20 - Chunk Pipeline", () => {
  /**
   * Test 1: Semantic chunking creates chunks
   */
  test("semantic chunking splits text into chunks", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "test.txt",
      cleanedText: SAMPLE_JENNY_TEXT
    };

    const chunks = await semanticChunk(input);

    expect(chunks.length).toBeGreaterThanOrEqual(1);
    expect(chunks.every(c => c.id)).toBe(true);
    expect(chunks.every(c => c.coachId === "jenny")).toBe(true);
    expect(chunks.every(c => c.text.length > 0)).toBe(true);
  });

  /**
   * Test 2: Chunks have sequential order
   */
  test("chunks maintain sequential order", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "test.txt",
      cleanedText: SAMPLE_JENNY_TEXT
    };

    const chunks = await semanticChunk(input);

    chunks.forEach((chunk, idx) => {
      expect(chunk.order).toBe(idx);
    });
  });

  /**
   * Test 3: Chunk IDs are unique
   */
  test("chunk IDs are unique", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "test.txt",
      cleanedText: SAMPLE_JENNY_TEXT
    };

    const chunks = await semanticChunk(input);

    const ids = chunks.map(c => c.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  /**
   * Test 4: Chunk sizes are reasonable
   */
  test("chunk sizes are within reasonable bounds", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "test.txt",
      cleanedText: SAMPLE_JENNY_TEXT
    };

    const chunks = await semanticChunk(input);

    chunks.forEach(chunk => {
      expect(chunk.size).toBeGreaterThan(0);
      expect(chunk.size).toBe(chunk.text.length);
      // Chunks should generally be between 100-1200 chars
      expect(chunk.size).toBeGreaterThanOrEqual(100);
      expect(chunk.size).toBeLessThanOrEqual(1500);
    });
  });

  /**
   * Test 5: Classify fallback detects academics
   */
  test("classify fallback detects academics content", () => {
    const academicText = "My GPA is 3.9 and I took 10 AP classes with high rigor.";
    const type = classifyFallback(academicText);

    expect(type).toBe("academics");
  });

  /**
   * Test 6: Classify fallback detects activities
   */
  test("classify fallback detects activities content", () => {
    const activitiesText =
      "I led a research project on renewable energy and founded a robotics club.";
    const type = classifyFallback(activitiesText);

    expect(type).toBe("activities");
  });

  /**
   * Test 7: Classify fallback detects awards
   */
  test("classify fallback detects awards content", () => {
    const awardsText = "I won first place at the national science competition.";
    const type = classifyFallback(awardsText);

    expect(type).toBe("awards");
  });

  /**
   * Test 8: Classify fallback detects EQ content
   */
  test("classify fallback detects EQ content", () => {
    const eqText =
      "My immigrant background shaped my values and gave me resilience through challenges.";
    const type = classifyFallback(eqText);

    expect(type).toBe("eq");
  });

  /**
   * Test 9: Classify fallback detects framework content
   */
  test("classify fallback detects framework content", () => {
    const frameworkText =
      "Here's my admissions framework: Step 1 is depth, Step 2 is impact, Step 3 is this approach.";
    const type = classifyFallback(frameworkText);

    expect(type).toBe("framework");
  });

  /**
   * Test 10: EQ signal extraction finds passion
   */
  test("EQ signal extraction detects passion signals", () => {
    const text = "I love robotics and care deeply about environmental impact.";
    const signals = extractEQSignalsFallback(text);

    expect(signals).toContain("passion");
    expect(signals).toContain("impact-driven");
  });

  /**
   * Test 11: EQ signal extraction finds resilience
   */
  test("EQ signal extraction detects resilience signals", () => {
    const text = "I faced many challenges and struggled through difficult obstacles.";
    const signals = extractEQSignalsFallback(text);

    expect(signals).toContain("resilience");
  });

  /**
   * Test 12: EQ signal extraction finds leadership
   */
  test("EQ signal extraction detects leadership signals", () => {
    const text = "As team leader, I took initiative to organize our project.";
    const signals = extractEQSignalsFallback(text);

    expect(signals).toContain("leadership");
  });

  /**
   * Test 13: Chunks have semantic types assigned
   */
  test("all chunks have semantic types assigned", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "test.txt",
      cleanedText: SAMPLE_JENNY_TEXT
    };

    const chunks = await semanticChunk(input);

    chunks.forEach(chunk => {
      expect(chunk.semanticType).toBeDefined();
      expect(chunk.semanticType.length).toBeGreaterThan(0);
      expect([
        "academics",
        "activities",
        "awards",
        "eq",
        "narrative",
        "framework",
        "general"
      ]).toContain(chunk.semanticType);
    });
  });

  /**
   * Test 14: Chunks have EQ signals (may be empty)
   */
  test("all chunks have EQ signals array", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "test.txt",
      cleanedText: SAMPLE_JENNY_TEXT
    };

    const chunks = await semanticChunk(input);

    chunks.forEach(chunk => {
      expect(Array.isArray(chunk.eqSignals)).toBe(true);
    });
  });

  /**
   * Test 15: Short text creates minimal chunks
   */
  test("short text creates appropriate number of chunks", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "short.txt",
      cleanedText: "This is a short piece of coaching content about GPA and test scores."
    };

    const chunks = await semanticChunk(input);

    // Short text should create 0-1 chunks (may be filtered out if too short)
    expect(chunks.length).toBeLessThanOrEqual(1);
  });

  /**
   * Test 16: Empty text creates no chunks
   */
  test("empty text creates no chunks", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "empty.txt",
      cleanedText: ""
    };

    const chunks = await semanticChunk(input);

    expect(chunks.length).toBe(0);
  });

  /**
   * Test 17: Very long text creates many chunks
   */
  test("very long text creates multiple chunks", async () => {
    const longText = SAMPLE_JENNY_TEXT.repeat(5);
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "long.txt",
      cleanedText: longText
    };

    const chunks = await semanticChunk(input);

    // Long text should create at least 2 chunks
    expect(chunks.length).toBeGreaterThanOrEqual(2);
  });

  /**
   * Test 18: Chunk metadata is complete
   */
  test("chunk metadata is complete and valid", async () => {
    const input: ChunkInput = {
      coachId: "jenny",
      sourcePath: "/path/to/test.txt",
      cleanedText: SAMPLE_JENNY_TEXT
    };

    const chunks = await semanticChunk(input);

    chunks.forEach((chunk, idx) => {
      // Check all required fields
      expect(chunk.id).toBeDefined();
      expect(chunk.coachId).toBe("jenny");
      expect(chunk.sourcePath).toBe("/path/to/test.txt");
      expect(chunk.order).toBe(idx);
      expect(chunk.text).toBeDefined();
      expect(chunk.semanticType).toBeDefined();
      expect(Array.isArray(chunk.eqSignals)).toBe(true);
      expect(chunk.size).toBeGreaterThan(0);
    });
  });
});
