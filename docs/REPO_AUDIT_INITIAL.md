# Repository Audit & Cleanup Plan

**Date:** 2025-11-21
**Status:** Draft / Pending Approval

## 1. Directory Overview

The repository contains a mix of a well-structured monorepo (`apps`, `packages`) and significant clutter at the root and in the `data` directory.

- **Root**: Contains ~15 high-level status/markdown files that should be in `docs/`.
- **Data**: Contains conflicting structures:
  - `data/coaches` (Legacy structure with `extractions`)
  - `data/v4_organized` (New structure with `curated` matching the Spec)
  - `data/students` vs `data/v4_organized/students`
  - Loose scripts and JSON artifacts.
- **Apps**: `apps/assessment-agent` appears to be an abandoned skeleton, while `packages/agents/assessment-agent` is the active component.
- **Packages**: Contains 300+ items, likely due to granular internal packages or potential clutter (needs monitoring).

## 2. Identified Issues

### A. Documentation Clutter
The following files are at the root but belong in `docs/`:
- `CRITICAL_DISCOVERY_EMBEDDINGS_ALREADY_EXIST.md`
- `DEPLOYMENT_RUNBOOK.md`
- `EMBEDDING_STATUS_SUMMARY.md`
- `EXECUTE_NOW.md`
- `FINAL_STATUS.md`
- `HANDOVER_COMPLETE.md`
- `IMPLEMENTATION_COMPLETE.md`
- `MVP_COMPLETION_SUMMARY.md`
- `MVP_HANDOVER_PACKAGE.md`
- `MVP_LAUNCH_SUMMARY.md`
- `PHASE1_MVP_COMPLETE.md`
- `PINECONE_VECTOR_ANALYSIS_REPORT.md`
- `RAG_IMPLEMENTATION_COMPLETE.md`
- `REALITY_CHECK_FINAL.md`
- `SURGICAL_PATCHES.md`
- `UI_SPECIFICATION.md`

### B. Data Structure Inconsistency
- **Canonical Spec**: `data/PHASE3_SOURCE_OF_TRUTH_DATA_SPEC_v1.0.md` defines `data/coaches/jenny/{raw,curated}`.
- **Current State**:
  - `data/coaches` does NOT match spec (has `extractions`).
  - `data/v4_organized/coaches` DOES match spec (has `curated`).
- **Conclusion**: `data/v4_organized` is the correct source of truth and should be promoted to `data/`.

### C. Dead Code
- `apps/assessment-agent`: Contains only `.claude`, `src`, `tests` with no `package.json` or meaningful content, while `packages/agents/assessment-agent` is fully populated.

## 3. Proposed Cleanup Plan

### Step A: Docs Organization
**Goal**: Clean up repo root.
- Create `docs/project_status/` and `docs/runbooks/`.
- Move status reports (MVP_*, PHASE1_*, etc.) to `docs/project_status/`.
- Move technical docs (DEPLOYMENT_RUNBOOK, UI_SPECIFICATION) to `docs/` or `docs/specs/`.

### Step B: Data / JSON Structure Cleanup
**Goal**: Align with `PHASE3_SOURCE_OF_TRUTH_DATA_SPEC_v1.0.md`.
1. Create `data/archive/legacy_v3`.
2. Move legacy folders (`data/coaches`, `data/students`, `data/personas`) to `data/archive/legacy_v3/`.
3. Move `data/v4_organized/*` to `data/`.
4. Move root data scripts (`reorganize_data.py`, etc.) and artifacts (`PHASE1_FILE_INVENTORY.json`, etc.) to `data/archive/tools/`.
5. Remove empty `data/v4_organized`.

### Step C: Code / Folder Structure Cleanup
**Goal**: Remove zombie code.
1. Move `apps/assessment-agent` to `data/archive/code_spikes/apps_assessment_agent` (just in case).
2. Verify `packages/` for any obviously empty folders (best effort).

### Step D: Misc / Tooling
1. Ensure `jest.config.js` and `turbo.json` (if exists) are correctly placed.
2. Run final sanity check.

## 4. Verification
- `git status` should show a clean root.
- `data/` should match the Spec v1.0 exactly.
- No data is deleted, only archived.
