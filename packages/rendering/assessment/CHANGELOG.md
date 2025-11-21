# Assessment Rendering Engine — CHANGELOG

All notable changes to the Assessment Rendering Engine are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-17

### Added
- **RenderModel_v1 Builder** – Pure transformation function converting `AssessmentOutput_v2` to UI-friendly format
- **RenderModel_v1 Types** – Type-safe interfaces for render model structure
- **Unit Tests** – Comprehensive test suite with 10 tests covering:
  - Data mapping correctness
  - Oracle composite calculation
  - Narrative preservation
  - 12-month plan structure validation
  - Summer scenarios (baseline, stretch, moonshot)
  - Awards targets mapping
  - Graceful handling of missing optional fields
  - ISO timestamp generation
  - Deterministic output validation
  - Rigor level categorization
- **Barrel Exports** – Clean export structure via `index.ts`
- **Documentation** – README with usage examples and design principles
- **CHANGELOG** – Version tracking

### Design Principles
- Zero computation (pure data transformation only)
- Deterministic output (same input → same output)
- Display-ready strings
- No business logic, no AI, no new insights

### Breaking Changes
- Initial stable release, no breaking changes from previous versions

### Migration Path
- This is the first stable release
- Future versions will document breaking changes and migration paths here

## Version Numbering

- **Major version (X.0.0)**: Breaking API changes
- **Minor version (0.X.0)**: Backward-compatible additions
- **Patch version (0.0.X)**: Bug fixes and documentation updates
