# Schema Package Changelog

All notable schema changes are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
