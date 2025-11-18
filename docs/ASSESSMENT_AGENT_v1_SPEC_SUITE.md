
Below is your **full, merged v4.0 Assessment Agent Spec Suite**:

* **C** – Required Spec Pack
* **D** – v4 Architecture Doc
* **E** – Contributor Ruleset
* **F** – Assessment Agent Build Plan
* **G** – Directory Scaffolding Map & Placeholder Files
* **H** – Evaluation Harness Spec

Every section is clean, neutral, production-grade.
My snark stays outside; the spec stays pristine.

Save this entire thing as:

```
/docs/ASSESSMENT_AGENT_v1_SPEC_SUITE.md
```

---

# ⭐ IVYLEVEL MULTI-AGENT PLATFORM v4.0

# **ASSESSMENT AGENT v1.0 — MASTER SPECIFICATION SUITE**

**Project Root:** `ivylevel-multiagents-v4`
**Status:** Baseline Architecture + Build Contract (v1.0)
**Audience:** Senior Engineers, AI Coding Agents, Architects
**Scope:** Everything required to implement, validate, and ship the Assessment Agent (Jenny Twin)

---

# ================================================

# 1. HIGH-LEVEL OVERVIEW

# ================================================

This document consolidates all foundational specifications required to build the first v4.0 agent:

### **Assessment Agent v1.0 (Jenny Twin)**

It integrates the v4 architecture (D), contributor ruleset (E), and all agent-specific specs (C), plus the build plan (F), project scaffolding (G), and evaluation harness (H).

This spec must be approved **before any code is generated**.

---

# ================================================

# 2. ARCHITECTURE SUMMARY (D)

# ================================================

## 2.1 System Layers

1. **Frontend Apps (/apps)**
   Student, Parent, Coach, Studio.

2. **API Layer (/packages/api)**
   REST + GraphQL + Webhooks.

3. **Multi-Agent Runtime (/packages/orchestrator)**
   Task graph execution
   Inter-agent messaging
   State management
   Tool routing

4. **Agents Layer (/packages/agents)**
   Assessment Agent (first)
   Planning Agent
   Execution Agent
   EQ Agent
   Twin Agents per coach

5. **Cognitive Layer (/packages/core-logic)**
   Pattern matching
   Narrative builder
   Strategy engine

6. **Knowledge Layer (/packages/knowledge)**
   Postgres
   Pinecone
   Cohere rerank
   Redis
   Transcript loaders

7. **v3 Oracles Layer (/packages/adapters/v3-intelligence-oracles)**
   IvyScore
   WeakSpots
   NarrativeEngine
   EQEngine
   StudentSnapshot

8. **Memory Layer**
   Working memory
   Shared memory
   Episodic (DB)
   Semantic (Pinecone)

---

## 2.2 High-Level Data Flow

```
Transcript / Live Audio
     ↓
Assessment Agent
     ↓
Task Graph Execution
     ↓
v3 Oracles (rigor, weakspots, narrative)
     ↓
Knowledge Layer (RAG)
     ↓
Cognitive Layer (narrative, strategy)
     ↓
AssessmentOutput_v1 schema
     ↓
Postgres
     ↓
Planning Agent → Execution Agent
```

---

# ================================================

# 3. CONTRIBUTOR RULESET (E v2.0)

# ================================================

### **3.1 Folder Boundaries**

Valid directories in root:

```
/apps
/packages
/infra
/scripts
/docs
/tests
```

Forbidden:

* /tmp, /new, /runtime2, /sandbox, /backup, any auto-generated folder not defined in architecture.

### **3.2 File Naming**

* TS: lowerCamelCase.ts
* Classes: PascalCase.ts
* Docs: kebab-case.md
* Tests: *.test.ts

Forbidden:
`index copy.ts`, `schema_new.ts`, `final2.ts`, anything ending in “copy”, “backup”, “tmp”.

### **3.3 No Duplicates**

No AI agent may create a file with a name that already exists anywhere in the repo.

### **3.4 Schema Governance**

Schemas live ONLY in:

```
/packages/schema
```

Schemas require version bump, changelog entry, and cannot be edited inline.

### **3.5 Oracle Safety**

v3 logic = read-only.
Oracles = thin adapters only.

### **3.6 PR Limits**

* Max 500 lines
* Max 10 files
* Only 1 domain boundary touched

### **3.7 Forbidden AI Actions**

* No renaming directories
* No implicit refactors
* No global import rewrites
* No new folders outside architecture
* No modifying v3

### **3.8 Code Standards**

* TS strict
* Pure functions
* No hidden mutable state
* No global side effects
* Schema-validated I/O

### **3.9 Testing Requirements**

Every new file → unit test.
Every Oracle → golden snapshot.

### **3.10 Enforcement**

Any violation = immediate PR rejection.

---

# ================================================

# 4. ASSESSMENT AGENT SPEC PACK (C)

# ================================================

## 4.1 Mission

Replicate Jenny’s 1-hour assessment session:

* Adaptive questioning
* EQ-calibrated dialog
* Full student profile extraction
* Diagnostics
* Narrative building
* Strengths/Weaknesses
* Tactical plan
* Structured JSON output
* Jenny-style language

---

## 4.2 Capability Modules

### A. Conversational Intelligence (CIM)

* Adaptive Q&A
* Probing logic
* EQ modeling
* Identity discovery

### B. Profile Extraction (PEM)

Extract:

* Academics
* ECs
* Awards
* Service
* Passions
* Narrative threads
* Parent context

### C. Narrative Modeling (NMM)

Produce:

* Thematic hubs
* Identity arcs
* Positioning

### D. Strategy Engine (GPSE)

Produce:

* Strengths
* Weak spots
* 1–2 year plan
* Admissions framework
* Summer / awards / spike strategy

### E. Report Generator

* Markdown
* Structured JSON
* Jenny-style paragraphs

---

## 4.3 Required Inputs & Contracts

### student_profile.json

### assessment_session.json

### assessment_output.json

All in `/packages/schema/v4.0`.

---

## 4.4 Hybrid RAG Requirements

Stored in Pinecone:

* Transcript chunks
* Game plan chunks
* Jenny coaching patterns
* EC templates
* Awards/program knowledge

Pipeline: embed → pinecone → cohere rerank → LLM.

---

## 4.5 SQL Resolvers

* get_academic_rigor(student_id)
* get_ec_depth(student_id)
* get_awards_map(major)
* get_program_mappings()
* get_school_profile()
* get_temporal_progress()

---

## 4.6 Assessment Agent Pipeline

1. Rapport
2. Dynamic Q&A
3. Structured extraction
4. RAG enrichment
5. v3 Oracles
6. Narrative modeling
7. Strategy building
8. JSON output
9. Save to DB
10. Return to orchestrator

---

## 4.7 Evaluation Metrics

* Semantic match vs Jenny
* Structural fidelity
* Narrative coherence
* Correctness of diagnostics
* Accuracy of strengths/weaknesses
* Program recommendations correctness

Goal: 85-90% match.

---

# ================================================

# 5. ASSESSMENT AGENT BUILD PLAN (F)

# ================================================

### Phase 1 — MVP Assessment Agent

* No realtime
* Transcript-based
* Minimal extraction
* Simple narrative
* Basic JSON output
* Oracle integration
* Stored in /packages/agents/assessment-agent

### Phase 2 — Full Assessment Agent

* Full adaptive Q&A
* Realtime audio support
* EQ engine use
* Multi-step narrative
* Tactical plan

### Phase 3 — Report Generator

Produces:

* Full precision game plan
* Jenny-style writing
* Markdown + PDF

### Phase 4 — Coach Dashboard Integration

---

# ================================================

# 6. DIRECTORY SCAFFOLDING (G)

# ================================================

Create EXACTLY these dirs BEFORE coding:

```
ivylevel-multiagents-v4/
│
├── apps/
│   ├── web/
│   ├── admin/
│   └── studio/
│
├── packages/
│   ├── agents/
│   │   └── assessment-agent/
│   │        ├── src/
│   │        ├── prompts/
│   │        ├── tools/
│   │        ├── evaluators/
│   │        └── tests/
│   │
│   ├── orchestrator/
│   │   ├── router/
│   │   ├── state/
│   │   ├── task-graph/
│   │   ├── registry/
│   │   ├── evaluators/
│   │   └── adapters/
│   │
│   ├── core-logic/
│   ├── knowledge/
│   ├── adapters/
│   │   └── v3-intelligence-oracles/
│   ├── api/
│   └── schema/
│
├── infra/
├── scripts/
└── tests/
```

### Required placeholder files:

* `/packages/agents/assessment-agent/README.md`
* `/packages/orchestrator/task-graph/assessment.graph.ts` (empty)
* `/packages/schema/changelog.md`

---

# ================================================

# 7. EVALUATION HARNESS SPEC (H)

# ================================================

### H1 — Purpose

Validate that Assessment Agent matches Jenny's assessment style, reasoning, outputs.

### H2 — Inputs

* Transcript
* Ground-truth Jenny PDF
* Ground-truth extracted JSON

### H3 — Outputs

Evaluation JSON:

```
{
  structuralScore: number,
  semanticScore: number,
  narrativeScore: number,
  tacticalScore: number,
  toneScore: number,
  totalScore: number
}
```

### H4 — Scoring Models

* OpenAI o3-mini
* Cohere Rerank
* Template-based exact match

### H5 — Coverage Checks

* Did agent extract AP list?
* EC depth?
* Spike potential?
* Summer recommendations?
* Awards alignment?
* Narrative clarity?

### H6 — Replay / Debug Tools

* Node-by-node execution trace (Graph)
* Oracle usage trace
* RAG context visibility
* Token-level reasoning snapshots

### H7 — Acceptance Threshold

TotalScore >= **85** required.

---

# ================================================

# 8. FINAL NOTES

# ================================================

* This spec suite is **complete and ready to commit**.
* No coding agent should be allowed to touch implementation until this document is in `/docs`.
* The Assessment Agent v1.0 must be built EXACTLY according to this blueprint.
* This is the master reference for Phase 1, Phase 2, Phase 3 of Assessment Agent development.



Just tell me.
