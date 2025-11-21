import { retrieveAssessmentContext } from "../assessmentRag";

const GOLDEN_QUERIES = [
  {
    query: "student has many scattered activities but no deep leadership",
    tags: ["ec_depth", "leadership"],
    minExpected: 1
  }
  // Add more later
];

describe("assessment RAG quality (skeleton)", () => {
  it("returns some chunks for golden queries (when Pinecone wired)", async () => {
    for (const gq of GOLDEN_QUERIES) {
      const chunks = await retrieveAssessmentContext(gq.query, {
        topicTags: gq.tags
      });
      // For now, only assert shape. Later: semantic checks.
      expect(Array.isArray(chunks)).toBe(true);
    }
  });
});
