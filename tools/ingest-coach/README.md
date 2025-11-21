# Coach Data Ingestion Engine

**Extract emotional intelligence patterns from coach transcripts to build digital twins.**

---

## Overview

This tool processes coaching transcripts, iMessages, emails, and documents to extract:

1. **EQ Patterns** - Emotional intelligence markers (tone, warmth, scaffolding, empathy) ✅
2. **Frameworks** - Strategic/tactical frameworks (mental models, step-by-step structures) ✅
3. **Tactics** - Specific coaching techniques (future)
4. **Persona Traits** - Unique voice and style markers (future)

All extracted data is versioned and tracked in `data/coach/manifest.json`.

---

## Quick Start

### Process a single file

```bash
ts-node tools/ingest-coach/ingestCoach.ts path/to/transcript.txt
```

### Process a directory

```bash
ts-node tools/ingest-coach/ingestCoach.ts data/coach/raw/
```

---

## Directory Structure

```
tools/ingest-coach/
├── prompts/
│   ├── eqPatternExtract.prompt.md    # LLM system prompt for EQ extraction
│   └── frameworkExtract.prompt.md    # LLM system prompt for framework extraction
├── llm/
│   ├── eqPatternExtractor.ts         # TypeScript wrapper for EQ extraction
│   └── frameworkExtractor.ts         # TypeScript wrapper for framework extraction
├── __tests__/
│   ├── eqPatternExtractor.test.ts    # EQ validation tests
│   └── frameworkExtractor.test.ts    # Framework validation tests
├── manifest.schema.ts                # Manifest schema (Zod)
├── ingestCoach.ts                    # Main ingestion runner
└── README.md                         # This file

data/coach/
├── raw/                              # Place source transcripts here
├── curated/
│   ├── eq-patterns/                  # Extracted EQ patterns (JSON)
│   └── frameworks/                   # Extracted frameworks (JSON)
└── manifest.json                     # Ingestion tracking manifest
```

---

## EQ Pattern Extraction

### What is extracted?

- **Warmth** - How Jenny creates connection and safety
- **Emotional Containment** - How she holds space for difficult emotions
- **Motivational Scaffolding** - How she breaks down overwhelming goals
- **Reassurance Style** - How she builds belief and confidence
- **Boundary Setting** - How she challenges with kindness
- **Pacing** - How she sequences and times interventions
- **Clarity** - How she simplifies complex topics

### Example Output

```json
[
  {
    "id": "eq_001",
    "category": "scaffolding",
    "pattern": "Breaks complex goals into simple next steps and checks emotional readiness before assigning.",
    "example": "Let's not worry about the whole application right now. Let's just handle this one part together.",
    "explanation": "Recurring structure: de-escalate overwhelm, sequence tasks, reassure capability."
  },
  {
    "id": "eq_002",
    "category": "empathy",
    "pattern": "Reflects student's emotions before offering guidance.",
    "example": "It makes sense you're feeling stuck—this is a lot.",
    "explanation": "Shows emotional validation as first response."
  }
]
```

### Quality Rules

The extractor follows **10 strict rules** to prevent hallucination:

1. NO interpretation beyond what is in text
2. NO generalization — only literal patterns actually displayed
3. NO summarizing
4. NO personality adjectives unless explicitly demonstrated
5. Split long insights into multiple chips
6. Never invent a pattern Jenny didn't use
7. Preserve phrasing and nuance exactly
8. Extract even subtle micro-markers (pauses, reframes, check-ins)
9. Do not replicate content — abstract the *pattern*
10. Output pure JSON (no markdown, no prose)

---

## Environment Variables

```bash
OPENAI_API_KEY=your_key_here
```

---

## Running Tests

```bash
# Run EQ pattern extractor tests
npm test tools/ingest-coach/__tests__

# Validate schema
npm run test:watch tools/ingest-coach/__tests__/eqPatternExtractor.test.ts
```

---

## Manifest Schema

The `manifest.json` tracks all ingestion runs:

```typescript
{
  version: string;
  lastUpdated: string;
  ingestionRuns: [
    {
      runId: string;
      timestamp: string;
      sourceFiles: string[];
      curatedFiles: string[];
      eqPatternFiles: string[];
      status: "pending" | "processing" | "completed" | "failed";
      errors?: string[];
    }
  ];
  totalSourceFiles: number;
  totalEqPatterns: number;
}
```

---

## Framework Extraction

### What is extracted?

- **Structured Methods** - Repeatable step-by-step approaches
- **Mental Models** - Consistent thinking patterns
- **Planning Sequences** - Strategic roadmapping frameworks
- **Decision Trees** - Prioritization and evaluation rubrics
- **Assessment Frameworks** - Diagnostic and evaluation structures

### Framework Categories

- **assessment** - Diagnostic frameworks for evaluating profiles
- **academics** - Academic planning, course selection
- **ecs** - Extracurricular analysis and development
- **narrative** - Story development, positioning
- **time-management** - Prioritization, execution
- **mindset** - Mental models for resilience, motivation
- **planning** - Strategic decomposition, roadmapping
- **motivation** - Discipline and momentum frameworks

### Example Output

```json
[
  {
    "id": "fw_001",
    "name": "Root Cause → Strategy → Action Framework",
    "category": "planning",
    "steps": [
      "Identify the underlying bottleneck",
      "Select a strategy to fix root cause",
      "Break into 1-2 immediate next actions"
    ],
    "principles": [
      "Solve upstream, not downstream",
      "Reduce overwhelm by sequencing"
    ],
    "example_usage": "Before we talk about essays, let's find the underlying reason the EC path isn't clear yet.",
    "explanation": "Jenny consistently uses a 3-level decomposition: diagnosis → strategy → step."
  }
]
```

See [Framework_Extractor_v1.0.md](../../docs/Framework_Extractor_v1.0.md) for complete documentation.

---

## Future Extractors

### Tactics Extractor (Phase 2)
- Specific coaching techniques
- Question patterns
- Intervention strategies

### Persona Compiler (Phase 2)
- Voice and tone markers
- Cultural context (immigrant hustle, first-gen grit)
- Signature phrases and expressions

### Coach Twin Builder (Phase 3)
- Combine all patterns into digital twin
- Memory model integration
- Activation layer for real-time coaching

---

## Integration with Assessment Agent

EQ patterns extracted here will be used in:

1. **RAG Context** - Augment assessment agent prompts with Jenny's style
2. **Chat Agent** - Apply EQ patterns to student conversations
3. **Narrative Generation** - Use Jenny's voice in written outputs
4. **Coach Twin** - Build full digital replica of Jenny

---

## Data Quality Gates

Before merging extracted patterns:

```bash
# Validate all EQ patterns
npm run validate:eq-patterns

# Check for duplicates
npm run check:eq-duplicates

# Run quality tests
npm test tools/ingest-coach
```

---

## Why This Matters

**EQ is the soul of the coach twin.**

This extractor captures:
- Relatability
- Warmth
- Immigrant hustle
- First-gen grit
- "I've been where you are" authenticity
- Firm but kind push
- Precision scaffolding
- Belief → action transformation

These patterns become **reusable assets** for all future digital twins.

---

## Contributing

Follow [Contributor Ruleset v2.0](../../docs/contributors/Contributor_Ruleset_v2.0.md):

- ✅ All schemas versioned
- ✅ No duplicate logic
- ✅ Tests required
- ✅ Manifest updated
- ✅ Quality gates enforced

---

## Status

**Phase 1:** ✅ EQ Pattern Extractor - Complete
**Phase 2:** ✅ Framework Extractor - Complete
**Phase 3:** 🚧 Tactics Extractor - Planned
**Phase 4:** 🚧 Persona Compiler - Planned
**Phase 5:** 🚧 Coach Twin Builder - Planned
