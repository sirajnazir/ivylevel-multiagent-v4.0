# Schema Package Changelog

All notable schema changes are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - v2.4.0

#### AssessmentOutput_v2
- **New Schema**: `assessmentOutput_v2.ts`
- **Purpose**: Complete output schema for Assessment Agent pipeline

**Structure:**
- **Profile**: ExtractedProfile_v2 - Full student profile with academics, activities, awards, personality
- **Oracles**: OracleResults_v2 - APS oracle scores with evidence and rationale
- **Narrative**: NarrativeBlocks_v2 - Thematic hubs, flagship narrative, positioning, risks, opportunities
- **Strategy**: StrategyBlocks_v2 - 12-month plan, summer scenarios, awards targets
- **Metadata**: Model version, generation timestamp, agent version

**Use Case:**
- Final output from `AssessmentAgent.buildOutput()`
- Consumed by downstream systems (report generation, UI display, strategy tracking)
- Provides complete assessment results in single structured object

**Migration Path:**
- This is a new schema (not a breaking change to existing schemas)
- Update `AssessmentAgent.buildOutput()` to return `AssessmentOutput_v2`
- Use `assessmentOutputSchema_v2.parse()` for validation

---

### Added - v2.3.0

#### StrategyBlocks_v2 (BREAKING CHANGE)
- **New Schema**: `strategyBlocks_v2.ts`
- **Purpose**: Structured strategy planning output from Assessment Agent

**Structure:**
- **Twelve-Month Plan**: Array of 12 monthly plan objects with priorities, tasks, and risks
- **Summer Planning**: Array of 3 summer scenario objects (baseline, stretch, moonshot) with focus areas, commitments, and risks
- **Awards Targets**: Array of award target objects with name, tier, likelihood, and rationale

**Use Case:**
- Output from `AssessmentAgent.generateStrategyBlocks()`
- Provides actionable 12-month roadmap for student development
- Identifies summer planning options and award opportunities

**Migration Path:**
- This is a new schema (not a breaking change to existing schemas)
- Update `AssessmentAgent.generateStrategyBlocks()` to return `StrategyBlocks_v2`
- Use `strategyBlocksSchema_v2.parse()` for validation

---

### Added - v2.2.0

#### NarrativeBlocks_v2
- **New Schema**: `narrativeBlocks_v2.ts`
- **Purpose**: Structured narrative modeling output from Assessment Agent

**Structure:**
- **Thematic Hubs**: Tuple of 3 core narrative dimensions (e.g., "STEM Research Leadership", "Community Health Advocacy", "Cultural Bridge-Building")
- **Flagship Narrative**: Central admissions story arc tying all hubs together
- **Positioning**: Admissions officer positioning statement
- **Identity Thread**: Core identity claim
- **Risks**: Array of narrative weaknesses or unclear areas
- **Opportunities**: Array of narrative strengthening opportunities

**Use Case:**
- Output from `AssessmentAgent.generateNarrativeBlocks()`
- Consumed by strategy engine for 12-month planning
- Informs essay topic recommendations and positioning strategy

**Migration Path:**
- This is a new schema (not a breaking change)
- Update `AssessmentAgent.generateNarrativeBlocks()` to return `NarrativeBlocks_v2`
- Use `narrativeBlocksSchema_v2.parse()` for validation

---

### Added - v2.1.0

#### OracleResults_v2 (BREAKING CHANGE)
- **New Schema**: `oracleResults_v2.ts`
- **Migration**: Replaces Phase 2 empty oracle results with structured APS oracle outputs

**Structure:**
- **Aptitude Oracle**: Score (0-100), evidence array, rationale string
- **Passion Oracle**: Score (0-100), evidence array, rationale string
- **Service Oracle**: Score (0-100), evidence array, rationale string
- **Future Integration**: ivyScore (optional), weakSpots (optional) for legacy v3 oracle compatibility

**Breaking Changes:**
- v1 returned empty object `{}`
- v2 enforces strict validation of all three APS oracle results
- All oracle pipeline calls must return `OracleResults_v2`

**Migration Path:**
- Update AssessmentAgent.runIntelligenceOracles() to return OracleResults_v2
- Use `oracleResultsSchema_v2.parse()` for validation
- Ensure all three oracles (aptitude, passion, service) are called

---

### Added - v2.0.0

#### ExtractedProfile_v2 (BREAKING CHANGE)
- **New Schema**: `extractedProfile_v2.ts`
- **Migration**: Replaces Phase 2 empty profile objects with full structured data

**Structure:**
- **Academics**: GPA (weighted/unweighted), course load with rigor levels, test scores, academic interests, planned courses, rigor gap analysis
- **Activities**: Per-activity depth scoring with name, type, role, hours/week, years involved, leadership flags, depth signals, outcomes
- **Awards**: Tiered awards (School/Local/State/National/International) with year and description
- **Personality**: 10-dimensional model including core values, identity threads, passions, communication style, emotional intelligence, growth mindset, resilience, creativity, leadership, empathy
- **Context**: Family involvement, resource constraints, life circumstances
- **Diagnostics**: Rigor gaps, EC depth gaps, narrative issues, strategic risks
- **Narrative Scaffolding**: 3 thematic hubs, flagship narrative, admissions positioning

**Breaking Changes:**
- v1 used empty objects `{}` for academics, activities, awards, personality
- v2 enforces strict schema validation with Zod
- All LLM extraction must now return structured data matching this schema

**Migration Path:**
- Update all references from Phase 2 stub profiles to ExtractedProfile_v2
- Use `extractedProfileSchema_v2.parse()` for validation
- Update AssessmentAgent.extractProfile() return type

---

## [1.0.0] - 2025-01-17

### Added

#### AssessmentInput_v1
- Student ID, transcript text, raw messages, context documents, existing profile
- Zod schema with strict validation

#### AssessmentOutput_v1
- Profile (academics, activities, awards, personality)
- Diagnostics (strengths, weaknesses, gaps)
- Narrative (themes, identity thread, positioning)
- Strategy (12-month plan, summer planning, awards targets)
- Metadata (model version, timestamp)

#### AssessmentInternalState_v1
- State machine steps: init, extract, oracles, narrative, strategy, output
- Internal state tracking for orchestrator

---

## Version Numbering

- **Major version (X.0.0)**: Breaking schema changes requiring migration
- **Minor version (0.X.0)**: Backward-compatible additions
- **Patch version (0.0.X)**: Documentation or non-breaking fixes
