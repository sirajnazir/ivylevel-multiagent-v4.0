# Assessment Agent - Phase 2 Implementation Notes

**Document Version:** 1.0
**Phase:** Phase 2 - Scaffolding with Full Internal Flow Stubs
**Status:** Complete
**Date:** 2025-01-17

---

## Overview

Phase 2 establishes the complete internal flow architecture for the Assessment Agent (Jenny Twin) with fully typed stub implementations. This phase focuses on structure, type safety, and orchestration patterns without implementing actual LLM logic.

---

## Internal State Machine

The Assessment Agent operates through a sequential state machine with the following states:

```
INIT → EXTRACT_PROFILE → CALL_ORACLES → BUILD_NARRATIVE → BUILD_PLAN → BUILD_OUTPUT
```

### State Transitions

| State | Step Value | Input | Output | Purpose |
|-------|-----------|-------|--------|---------|
| **INIT** | `'init'` | `AssessmentInput_v1` | `AssessmentInternalState_v1` | Initialize state, validate input |
| **EXTRACT_PROFILE** | `'extract'` | `AssessmentInternalState_v1` | Updated state with `extractedProfile` | Extract student profile from transcript |
| **CALL_ORACLES** | `'oracles'` | State with profile | Updated state with `oracleResults` | Call v3 intelligence oracles |
| **BUILD_NARRATIVE** | `'narrative'` | State with profile + oracles | Updated state with `narrativeBlocks` | Generate narrative themes and positioning |
| **BUILD_PLAN** | `'strategy'` | State with all previous | Updated state with `strategyBlocks` | Generate tactical plan |
| **BUILD_OUTPUT** | `'output'` | Complete state | `AssessmentOutput_v1` | Format final output |

### State Schema

```typescript
{
  step: "init" | "extract" | "oracles" | "narrative" | "strategy" | "output",
  extractedProfile?: ProfileData,
  oracleResults?: OracleResults,
  narrativeBlocks?: NarrativeBlocks,
  strategyBlocks?: StrategyBlocks
}
```

---

## Transformation Steps

### 1. Profile Extraction (`extractProfile`)

**Purpose:** Extract structured student profile from raw transcript and context documents.

**Input:**
- Transcript text
- Raw conversation messages
- Context documents

**Output:**
```typescript
{
  academics: object,    // Course rigor, GPA, test scores, academic interests
  activities: object,   // Extracurriculars, leadership, depth, breadth
  awards: object,       // Recognition, competitions, honors
  personality: object   // Traits, passions, narrative threads
}
```

**Future Implementation (Phase 3):**
- RAG-based extraction using Pinecone
- LLM-powered structured parsing
- Entity recognition for courses, activities, awards
- Sentiment analysis for personality traits

---

### 2. Oracle Integration (`runIntelligenceOracles`)

**Purpose:** Call v3 intelligence oracles to compute rigor scores, identify weak spots, and extract narrative threads.

**Input:**
- Extracted profile data

**Output:**
```typescript
{
  ivyScore?: number,
  weakSpots?: string[],
  narrativeThreads?: string[],
  [key: string]: unknown
}
```

**Oracle Adapters (via `/packages/adapters/v3-intelligence-oracles`):**
- `callIvyScoreOracle()` - Academic rigor scoring
- `callWeakSpotsOracle()` - Gap identification

**Future Implementation (Phase 3):**
- Wire to actual v3 oracle implementations
- Add error handling and fallbacks
- Cache oracle results
- Aggregate multi-oracle insights

---

### 3. Narrative Generation (`generateNarrativeBlocks`)

**Purpose:** Generate thematic narrative blocks, identity threads, and positioning statements.

**Input:**
- Profile data
- Oracle results

**Output:**
```typescript
{
  themes: string[],           // Core thematic hubs (e.g., "STEM + Social Impact")
  identityThread: string,     // Cohesive identity narrative
  positioning: string         // Admissions positioning statement
}
```

**Future Implementation (Phase 3):**
- LLM-powered narrative synthesis
- Jenny-style voice and tone modeling
- Thematic pattern recognition
- Identity arc construction

---

### 4. Strategy Generation (`generateStrategyBlocks`)

**Purpose:** Generate tactical recommendations for college admissions strategy.

**Input:**
- Profile data
- Oracle results
- Narrative blocks

**Output:**
```typescript
{
  '12MonthPlan': string[],      // Month-by-month action items
  summerPlanning: string[],     // Summer program recommendations
  awardsTargets: string[]       // Competition and awards targets
}
```

**Future Implementation (Phase 3):**
- Program database matching
- Awards eligibility analysis
- Timeline optimization
- Spike development strategy

---

## Mapping to Jenny Logic (High Level)

The Assessment Agent replicates Jenny's 1-hour assessment session workflow:

### Jenny's Process → Agent Implementation

| Jenny Step | Agent Component | Implementation Status |
|------------|-----------------|----------------------|
| **Rapport Building** | Initial conversation flow | Phase 3 |
| **Academic Deep Dive** | Profile extraction (academics) | Stub (Phase 2) |
| **EC Exploration** | Profile extraction (activities) | Stub (Phase 2) |
| **Awards Review** | Profile extraction (awards) | Stub (Phase 2) |
| **Personality Assessment** | Profile extraction (personality) | Stub (Phase 2) |
| **Rigor Analysis** | IvyScore oracle | Stub (Phase 2) |
| **Gap Identification** | WeakSpots oracle | Stub (Phase 2) |
| **Narrative Synthesis** | Narrative blocks generation | Stub (Phase 2) |
| **Strategic Planning** | Strategy blocks generation | Stub (Phase 2) |
| **Written Report** | Output formatting | Stub (Phase 2) |

### Jenny's Characteristics Preserved

- **Adaptive Questioning:** Future: Dynamic Q&A based on student responses
- **EQ Calibration:** Future: Tone and empathy modeling
- **Depth over Breadth:** Focus on spike identification and depth metrics
- **Tactical Precision:** Actionable recommendations, not generic advice
- **Voice Consistency:** Jenny-style language patterns in narrative and strategy

---

## Expected LLM Placeholders (Phase 3)

The following LLM integration points are currently stubbed:

### 1. Profile Extraction LLM Call
```typescript
// TODO: Implement in Phase 3
const extractionPrompt = buildExtractionPrompt(transcriptText, contextDocs);
const llmResponse = await callLLM(extractionPrompt);
const parsedProfile = parseProfileFromLLM(llmResponse);
```

### 2. Narrative Generation LLM Call
```typescript
// TODO: Implement in Phase 3
const narrativePrompt = buildNarrativePrompt(profile, oracleResults);
const llmResponse = await callLLM(narrativePrompt);
const narrativeBlocks = parseNarrativeFromLLM(llmResponse);
```

### 3. Strategy Generation LLM Call
```typescript
// TODO: Implement in Phase 3
const strategyPrompt = buildStrategyPrompt(profile, oracleResults, narrative);
const llmResponse = await callLLM(strategyPrompt);
const strategyBlocks = parseStrategyFromLLM(llmResponse);
```

---

## File Structure

```
/packages/agents/assessment-agent/
├── src/
│   ├── AssessmentAgent.ts          # Main agent class with transformation chain
│   └── index.ts                     # Barrel exports
├── prompts/
│   └── assessment.prompt.md        # LLM prompt templates (placeholder)
├── tools/
│   └── assessmentTools.ts          # Agent tools (empty)
├── evaluators/
│   └── assessmentEvaluator.ts      # Evaluation logic (empty)
└── tests/
    └── assessmentAgent.test.ts     # Comprehensive unit tests

/packages/orchestrator/
├── handlers/
│   └── assessmentHandler.ts        # Orchestrator bridge handler
├── registry/
│   └── agentRegistry.ts            # Agent registration
├── task-graph/
│   └── assessment.graph.ts         # Task graph with INIT and EXTRACT_PROFILE nodes
└── index.ts                         # Orchestrator exports

/packages/schema/
├── assessmentInput_v1.ts           # Input schema (zod)
├── assessmentOutput_v1.ts          # Output schema (zod)
└── assessmentInternalState_v1.ts   # Internal state schema (zod)

/packages/types/
└── assessment.d.ts                  # Type-only definitions

/packages/mock-server/
└── routes/
    └── assessment.mock.ts           # Mock API route for testing
```

---

## Testing Strategy

Current test coverage (Phase 2):
- ✅ Agent initialization
- ✅ Profile extraction return types
- ✅ Oracle integration return types
- ✅ Narrative generation return types
- ✅ Strategy generation return types
- ✅ Full transformation chain execution
- ✅ No external service dependencies

Future test coverage (Phase 3):
- LLM integration tests with mocked responses
- RAG retrieval accuracy tests
- Oracle adapter integration tests
- End-to-end assessment session tests
- Jenny voice similarity evaluation

---

## Phase 3 Roadmap

1. **RAG Integration**
   - Pinecone vector store setup
   - Cohere rerank integration
   - Transcript chunking and embedding
   - Context retrieval pipeline

2. **LLM Integration**
   - Prompt engineering for extraction, narrative, strategy
   - Response parsing and validation
   - Error handling and retries
   - Token optimization

3. **Oracle Wiring**
   - Connect to v3 IvyScore oracle
   - Connect to v3 WeakSpots oracle
   - Add oracle result caching
   - Aggregate multi-oracle insights

4. **Evaluation Harness**
   - Jenny baseline comparisons
   - Semantic similarity scoring
   - Structural fidelity checks
   - Target: 85%+ match with Jenny assessments

---

## References

- **Spec:** `/docs/ASSESSMENT_AGENT_v1_SPEC_SUITE.md`
- **Contributor Rules:** `/docs/contributors/Contributor_Ruleset_v2.0.md`
- **Guardrails:** `/.claude/instructions.md`

---

**Phase 2 Status: Complete ✅**
