# Assessment Agent Changelog

All notable changes to the Assessment Agent will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Full LLM system prompt v2.0 with Jenny-EQ calibration
- Structured extraction ontology for academics, activities, awards, personality
- Diagnostic questioning patterns for rapport building
- Narrative scaffolding guidelines
- Safety and ethics guidelines for student interactions
- JSON output contract with deterministic formatting rules
- Example extractions for academic and EC depth analysis

### Changed
- assessment.prompt.md upgraded from placeholder to production-ready prompt
- Token budget set to ≤8000 tokens per extraction
- Model specification: claude-3-5-sonnet-20241022

## [1.0.0] - 2025-01-17

### Added
- Initial Assessment Agent scaffolding (Phase 2)
- Empty transformation chain stubs
- Type-safe method signatures
- Orchestrator bridge handler
- Mock API routes
- Comprehensive test suite (10 tests)
- Agent registry integration
- Task graph skeleton with INIT and EXTRACT_PROFILE nodes
- Schema foundations (v1): AssessmentInput, AssessmentOutput, AssessmentInternalState

### Documentation
- Phase 2 implementation notes
- Internal state machine documentation
- Transformation step specifications
