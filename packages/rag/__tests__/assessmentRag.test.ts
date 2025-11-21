import { retrieveAssessmentContext } from "../assessmentRag";

describe("assessment RAG", () => {
  it("returns empty array when no results", async () => {
    const res = await retrieveAssessmentContext(
      "student has strong ECs but scattered narrative",
      { topicTags: ["narrative"] }
    );
    expect(Array.isArray(res)).toBe(true);
  });

  // Later: add golden query tests once Pinecone wiring is done
});
