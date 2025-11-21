# Persona Canonicalization Pipeline (Component 41)

Transforms messy raw persona data into structured, embedding-ready intelligence through 4 stages.

## Pipeline Stages

### Stage A: Normalize Raw Text
- Removes formatting artifacts, timestamps, emojis
- Fixes bullet structures and quote marks
- Cleans whitespace and special characters
- Preserves original meaning exactly

### Stage B: Extract Persona Concepts
- Mines persona-bearing concepts across 5 channels:
  - **Language**: Idioms, phrases, rhythm patterns
  - **EQ**: Validation, empathy, reframe strategies
  - **Coaching**: Heuristics, pattern detection
  - **Archetypes**: Student-type adaptations
  - **Safety**: Boundaries, anti-patterns

### Stage C: Canonicalize to Blocks
- Converts concepts into standardized blocks
- Merges duplicates
- Validates structure
- Sorts by channel and atomic_unit

### Stage D: Chunk for Embeddings
- Splits blocks into 150-250 token chunks
- Assigns channel weights
- Prepares for embedding (Component 40)

## Directory Structure

```
/data/personas/jenny/
  raw/          # Source messy files (.txt, .md)
  canonical/    # Cleaned, structured blocks (.canonical.json)
  chunks/       # Atomic chunks (.chunks.json)
  embedding/    # Embedding-ready (.embedding.json)
```

## Usage

### Run Full Pipeline

```bash
npx ts-node scripts/persona_canonicalize/run.ts
```

### Programmatic Usage

```typescript
import { runPipeline } from './scripts/persona_canonicalize';

await runPipeline({
  rawDir: './data/personas/jenny/raw',
  chunkSize: 200,
  verbose: true,
});
```

### Process Single File

```typescript
import {
  normalizeRawText,
  extractPersonaConcepts,
  canonicalizeConcepts,
  chunkPersonaBlocks,
} from './scripts/persona_canonicalize';

const raw = fs.readFileSync('raw_file.txt', 'utf8');

// Stage A
const normalized = await normalizeRawText(raw);

// Stage B
const concepts = await extractPersonaConcepts(normalized.data);

// Stage C
const blocks = await canonicalizeConcepts(concepts.data);

// Stage D
const chunks = await chunkPersonaBlocks(blocks.data);
```

## Output Format

### Canonical Block

```json
{
  "id": "jenny.language.001",
  "channel": "language",
  "atomic_unit": "signature_phrases",
  "rules": ["Use conversational language", "Avoid jargon"],
  "signature_phrases": ["Here's what I'm noticing", "This makes sense"],
  "usage_context": "Common phrases used by Jenny",
  "example_dialogue": ["Student: I'm worried. Jenny: Your reaction makes sense."],
  "negation_rules": ["Never say 'just get over it'"],
  "metadata": {
    "extracted_at": "2025-11-18T18:53:03.135Z",
    "source_channel": "language"
  }
}
```

### Embedding Chunk

```json
{
  "id": "jenny.language.001.chunk.0",
  "channel": "language",
  "text": "# signature phrases\\nChannel: language\\n\\nContext: Common phrases...\\n\\nSignature Phrases:\\n- Here's what I'm noticing",
  "block_id": "jenny.language.001",
  "token_count": 64,
  "weight": 0.35
}
```

## Integration with Component 40

The embedding-ready chunks are designed to feed directly into the Persona Embedding Engine:

```typescript
import { PersonaEmbeddingEngine } from '../packages/persona';
import { readJSON } from './scripts/persona_canonicalize/util';

// Load embedding chunks
const chunks = readJSON('./data/personas/jenny/embedding/sample.embedding.json');

// Initialize embedding engine with chunks
const engine = new PersonaEmbeddingEngine(config);
await engine.initializeFromChunks(chunks);
```

## Channel Weights

Default weights used for embeddings:
- **Language**: 35% (highest - distinctive voice)
- **EQ**: 30% (core coaching element)
- **Coaching**: 20% (tactical precision)
- **Archetypes**: 10% (student tailoring)
- **Safety**: 5% (critical for filtering)

## Benefits

1. **LLM-Driven**: Uses structured prompts for accurate extraction
2. **Reproducible**: Deterministic normalization and chunking
3. **Validated**: Checks structure at each stage
4. **Traceable**: Preserves lineage from raw → canonical → chunk
5. **Stats**: Provides detailed processing statistics
6. **Flexible**: Configurable chunk size, verbose logging

## Example Stats Output

```json
{
  "file": "sample_coaching_patterns.txt",
  "processed_at": "2025-11-18T18:53:03.143Z",
  "raw_chars": 1409,
  "normalized_chars": 1340,
  "blocks": {
    "total": 9,
    "byChannel": {
      "language": 2,
      "eq": 3,
      "coaching": 2,
      "archetypes": 1,
      "safety": 1
    },
    "avgRulesPerBlock": 1.89,
    "avgPhrasesPerBlock": 2.33
  },
  "chunks": {
    "total": 9,
    "byChannel": { "language": 2, "eq": 3, "coaching": 2, "archetypes": 1, "safety": 1 },
    "avgTokens": 63.56,
    "minTokens": 47,
    "maxTokens": 90
  }
}
```

## Future Enhancements

- [ ] OpenAI API integration for LLM normalization/extraction
- [ ] Batch processing with progress bars
- [ ] Duplicate detection across files
- [ ] Concept similarity merging
- [ ] Quality scoring for extracted concepts
