# Assessment Rendering Engine (RenderModel_v1)

This package converts the full `AssessmentOutput_v2` into a flattened, UI-friendly render model suitable for:

- Web dashboards
- Mobile apps
- PDF generation
- Progress monitoring
- Client reports

## Architecture

`RenderModel_v1` is deliberately **flattened**:

- No nested academic structures
- No optional chaining ambiguity
- Deterministic fields
- Simple arrays for UI iteration

## Files

- `renderModel_v1.ts` – Builder function
- `renderModel_v1.types.ts` – Types only
- `__tests__/renderModel_v1.test.ts` – Unit tests (10 tests)
- `index.ts` – Barrel exports

## Input → Output

### Input:
- `ExtractedProfile_v2` – Student profile with academics, activities, awards, personality
- `OracleResults_v2` – APS oracle scores
- `NarrativeBlocks_v2` – Thematic hubs, positioning, risks, opportunities
- `StrategyBlocks_v2` – 12-month plan, summer scenarios, awards targets

### Output:
- `RenderModel_v1` – UI-ready flattened model

## Usage

```typescript
import { buildRenderModel_v1 } from '@ivylevel/rendering/assessment';
import { AssessmentOutput_v2 } from '@ivylevel/schema/assessmentOutput_v2';

const assessmentOutput: AssessmentOutput_v2 = {
  profile: extractedProfile,
  oracles: oracleResults,
  narrative: narrativeBlocks,
  strategy: strategyBlocks,
  metadata: { ... }
};

const renderModel = buildRenderModel_v1({
  studentName: 'Aarav Sharma',
  profile: assessmentOutput.profile,
  oracles: assessmentOutput.oracles,
  narrative: assessmentOutput.narrative,
  strategy: assessmentOutput.strategy,
});

// Use renderModel for UI rendering, PDF generation, etc.
console.log(renderModel.academics.rigorLevel); // "High"
console.log(renderModel.oracles.composite); // 75
console.log(renderModel.strategy.months.length); // 12
```

## Design Principles

1. **Zero Computation** – Only rearrange & reformat data. No new fields. No new conclusions.
2. **Deterministic** – Same input always produces same output (except timestamps).
3. **Display-Ready** – All strings are formatted for direct UI display.
4. **Separation of Concerns** – RenderModel_v1 is pure presentation layer.

## What This Does NOT Do

- ❌ Invent new fields
- ❌ Modify the meaning of APS scores
- ❌ Rewrite narrative content
- ❌ Add "insights"
- ❌ Apply AI rewriting
- ❌ Compute new metrics

## Testing

Run the test suite:

```bash
npm test -- renderModel_v1.test.ts
```

All 10 tests validate:
- Correct data mapping
- Oracle composite calculation
- Narrative preservation
- 12-month plan structure
- Summer scenarios (baseline, stretch, moonshot)
- Awards targets
- Graceful handling of missing fields
- ISO timestamp generation
- Deterministic output
- Rigor level categorization
