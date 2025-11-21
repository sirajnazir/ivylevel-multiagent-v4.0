# 📚 SOURCE OF TRUTH DATA SPECIFICATION v1.0

**Document Version:** v1.0
**Date:** 2025-11-19
**Purpose:** Official data taxonomy and transformation pipeline for IvyLevel v4.0 Assessment Agent MVP
**Scope:** Complete reference for all coaching intelligence, student data, and persona materials

---

## TABLE OF CONTENTS

1. [Official Data Taxonomy](#1-official-data-taxonomy)
2. [Atomic Coaching Intelligence Units](#2-atomic-coaching-intelligence-units)
3. [Chip Families & Definitions](#3-chip-families--definitions)
4. [Jenny Persona & EQ Signal Schema](#4-jenny-persona--eq-signal-schema)
5. [Evidence Surfaces for Assessment Agent](#5-evidence-surfaces-for-assessment-agent)
6. [Transformation Pipeline](#6-transformation-pipeline)
7. [Input-to-Component Mapping](#7-input-to-component-mapping)
8. [Complete Huda Material Reference Index](#8-complete-huda-material-reference-index)
9. [V4 Canonical File Structure](#9-v4-canonical-file-structure)

---

## 1. OFFICIAL DATA TAXONOMY

IvyLevel v4.0 organizes all coaching data into **five tiers**:

### 1.1 **TIER 1: RAW DATA**

**Definition:** Unprocessed source materials in their original format

**Formats:** PDF, DOCX, TXT, VTT (video transcripts), JSON (raw API outputs)

**Categories:**
- Assessment session transcripts (60-90 min initial meetings)
- Full coaching session transcripts (weekly 1:1s)
- Game Plan reports (structured PDFs)
- Execution documents (weekly planning docs)
- iMessage conversations (Jenny ↔ Student)
- College application materials (essays, activities lists)
- Parent communication logs

**Location in v4:**
```
/coaches/jenny/raw/
  ├── huda/
  │   ├── 01_assess_session/
  │   ├── 02_gameplan_reports/
  │   ├── 03_session_transcripts/
  │   ├── 04_exec_docs/
  │   ├── 05_imessage/
  │   └── 06_college_apps/
  └── other_students/
      ├── assess/
      ├── gameplans/
      └── misc/
```

**Current Inventory:**
- 247 RAW files
- 70.25 MB total size
- Formats: PDF (15), DOCX (97), TXT (21), JSON (114)

---

### 1.2 **TIER 2: FIRST-ORDER INTEL (Session-Level Chips)**

**Definition:** Atomic intelligence units extracted from single source sessions

**Chip Types:**
1. **ASSESS chips** — Facts/insights from assessment sessions
2. **SESSION chips** — Tactical moments from regular coaching sessions
3. **IMSG chips** — Key exchanges from iMessage threads
4. **EXEC chips** — Strategic insights from execution docs

**Schema:** KB_v6 (see Section 3)

**Example:**
```json
{
  "chip_id": "w045_kb_001",
  "chip_type": "session_intel",
  "week": 45,
  "phase": "P3-JUNIOR",
  "date": "2024-05-14",
  "context": "Summer Architecture and 10-Spot Strategy Development",
  "fact": "Student expressed anxiety about balancing 3 summer programs",
  "jenny_tactic": "Introduced 168-hour framework to visualize capacity",
  "outcome": "Student gained confidence; created time-blocked plan",
  "tags": ["time_management", "summer_strategy", "anxiety_management"]
}
```

**Location in v4:**
```
/coaches/jenny/curated/kb_chips/
  ├── session/          # w001-w093 session chips
  ├── imsg/             # iMessage chips
  ├── exec/             # Execution doc chips
  └── assess_gameplan/  # Assessment/GamePlan chips
```

**Current Inventory:**
- 333 KB chip files
- JSON, JSONL, MD formats
- Covers 93 weeks of Huda coaching

---

### 1.3 **TIER 3: HIGHER-ORDER INTEL (Frameworks, Strategies, Narrative)**

**Definition:** Meta-patterns and reusable frameworks synthesized across multiple sessions

**Categories:**

#### A. **Strategic Frameworks**
Cross-cutting methodologies Jenny uses repeatedly:
- 168-hour framework (time management)
- 10-Spot Strategy (EC portfolio architecture)
- IvyScore engine (college fit assessment)
- Weak-Spot Clustering (diagnostic pattern recognition)

#### B. **Narrative Templates**
Story arcs and identity themes:
- Immigrant daughter archetype
- Tech-for-good narrative
- Gaming guilt → gaming pride transformation
- Parent-inspired journeys

#### C. **Tactical Playbooks**
Situation-specific response patterns:
- SAT score disappointment recovery
- Teacher rec crisis management
- Essay pivot strategies
- College visit debrief protocols

**Location in v4:**
```
/coaches/jenny/curated/frameworks/
  ├── strategic/
  ├── narrative/
  └── tactical/
```

**Current Inventory:**
- 2 framework files
- Extracted from EXEC docs and session synthesis

---

### 1.4 **TIER 4: META INTEL (EQ Chips & Communication Patterns)**

**Definition:** Jenny's tone, EQ modulation, and emotional intelligence signals

**EQ Chip Schema:**
```json
{
  "eq_chip_id": "eq_w007_001",
  "week": 7,
  "context": "Student received rejection from NCWIT",
  "student_emotion": "discouraged",
  "jenny_tone": "validating_then_reframing",
  "exact_phrase": "I hear you. That stings. But let's look at what you learned...",
  "eq_tactic": "acknowledge_feelings + future_focus",
  "outcome": "Student shifted from defeat to next-step planning"
}
```

**Pattern Categories:**
- **Tone Modulation:** When to be directive vs. Socratic
- **Validation Patterns:** How Jenny acknowledges emotions
- **Reframing Techniques:** Turning setbacks into insights
- **Parent Management:** Anxiety reduction, boundary setting
- **Crisis Responses:** SAT disappointment, rejection handling

**Location in v4:**
```
/coaches/jenny/curated/eq_chips/
  ├── sessions/    # EQ from coaching sessions
  ├── imsg/        # EQ from iMessage exchanges
  └── patterns/    # Aggregated EQ pattern files
```

**Current Inventory:**
- 96 EQ chip files
- JSON format with session/iMessage splits

---

### 1.5 **TIER 5: STUDENT-STRUCTURED-DATA (Assessment Outputs)**

**Definition:** Structured JSON outputs from Assessment Agent runs

**Schema:** `AssessmentOutput_v2.ts`

```typescript
{
  student_id: string;
  student_name: string;
  session_date: string;
  profile: {
    academics: AcademicProfile;
    ec_summary: ECProfile;
    awards: Award[];
    passions: string[];
    identity_themes: string[];
    narrative_hubs: NarrativeHub[];
    gaps: Gap[];
    standout_strengths: string[];
    execution_barriers: string[];
  };
  diagnostics: {
    academic_rigor_flag: boolean;
    testing_flag: boolean;
    ec_depth_flag: boolean;
    spike_likelihood_score: number;
    narrative_coherence_score: number;
    execution_score: number;
  };
  recommendations: {
    short_term_actions: string[];
    summer_strategy: string[];
    awards_targets: string[];
    program_targets: string[];
    long_term_plan: string[];
  };
  meta: {
    session_duration: number;
    confidence_scores: ConfidenceScore[];
    agent_version: string;
  };
}
```

**Location in v4:**
```
/students/jenny_assessments_v1/
  ├── student_001_anoushka_structured.json
  ├── student_002_ananyaa_structured.json
  ├── ...
  └── student_011_beya_structured.json
```

**Current Inventory:**
- 11 student assessment JSONs
- Size: 15-52 KB each

---

## 2. ATOMIC COACHING INTELLIGENCE UNITS

### 2.1 Definition

An **Atomic Coaching Intelligence Unit** (ACIU) is:
- The smallest unit of reusable coaching knowledge
- Extracted from a single source session/exchange
- Self-contained (context + fact + tactic + outcome)
- Tagged for semantic retrieval
- Timestamped and phase-aware

### 2.2 Core Properties

Every ACIU must contain:
1. **Provenance:** Week, phase, date, student, source
2. **Context:** What was happening in that moment
3. **Fact/Insight:** What was discovered or said
4. **Jenny Tactic:** How Jenny responded/coached
5. **Outcome:** What happened as a result
6. **Tags:** Semantic labels for retrieval

### 2.3 Why ACIUs Matter for v4

The Assessment Agent uses ACIUs to:
- Retrieve relevant past coaching moments via RAG
- Match current student patterns to historical precedents
- Generate Jenny-style responses by analogy
- Ensure consistency across different students
- Ground recommendations in actual past tactics

---

## 3. CHIP FAMILIES & DEFINITIONS

### 3.1 Chip Type Hierarchy

```
CHIP_FAMILIES
├── ASSESS (Assessment Session Chips)
│   └── Initial diagnostic insights
├── GAMEPLAN (Game Plan Report Chips)
│   └── Strategic recommendations
├── SESSION (Weekly Coaching Chips)
│   └── Tactical coaching moments
├── EXEC (Execution Doc Chips)
│   └── Week-by-week planning insights
├── IMSG (iMessage Chips)
│   └── Async communication patterns
└── EQ (Emotional Intelligence Chips)
    └── Tone/modulation/crisis handling
```

### 3.2 KB Chip Schema (v6)

**File:** `/packages/schema/kbChip_v6.ts`

```typescript
interface KBChip_v6 {
  chip_id: string;              // e.g., "w045_kb_001"
  chip_type: ChipType;          // "session_intel" | "imsg_intel" | "exec_intel"
  week: number;                 // 1-93
  phase: Phase;                 // "P1-FOUNDATION" | "P2-BUILDING" | etc.
  date: string;                 // ISO 8601
  student: string;              // "huda" (default for now)
  context: string;              // 1-2 sentence situational context
  fact: string;                 // The core insight/fact
  jenny_tactic: string;         // What Jenny did/said
  outcome: string;              // Result of the tactic
  tags: string[];               // ["essay_development", "stanford_rea", etc.]
  source_file: string;          // Provenance link
  confidence: number;           // 0.0-1.0 (extraction confidence)
}
```

### 3.3 EQ Chip Schema (v2)

**File:** `/packages/schema/eqChip_v2.ts`

```typescript
interface EQChip_v2 {
  eq_chip_id: string;
  week: number;
  phase: Phase;
  date: string;
  context: string;
  student_emotion: string;      // "anxious" | "excited" | "defeated" | etc.
  jenny_tone: string;           // "validating" | "directive" | "Socratic" | etc.
  exact_phrase: string;         // Verbatim quote from Jenny
  eq_tactic: string;            // "acknowledge_feelings + reframe"
  outcome: string;
  tags: string[];
  source_file: string;
}
```

---

## 4. JENNY PERSONA & EQ SIGNAL SCHEMA

### 4.1 Persona Components

Jenny's digital twin personality is encoded across:

#### A. **Core Language Patterns** (`core_language.md`)
- Signature phrases ("let's architect this", "I'm seeing a pattern")
- Question styles (Socratic vs. directive)
- Transition phrases ("Okay, zooming out...")

#### B. **Heuristics** (`heuristics.json`)
- When to probe deeper vs. move on
- How to handle parent anxiety
- When to celebrate vs. push harder

#### C. **Golden Thread** (`golden_thread.md`)
- Jenny's North Star principles:
  - Student agency over parent anxiety
  - Narrative coherence > random achievements
  - Execution > ideation
  - Truth-telling > false hope

#### D. **EQ Patterns** (`eq_patterns.md`)
- Tone modulation rules
- Crisis response patterns
- Validation → Reframe sequences

#### E. **Archetype Mappings** (`archetype_mappings.json`)
- Student archetypes (over-achiever, scattered creative, etc.)
- Parent archetypes (helicopter, hands-off, etc.)
- Matching response strategies

**Location in v4:**
```
/coaches/jenny/curated/narrative/persona/
  ├── core_language.md
  ├── heuristics.json
  ├── golden_thread.md
  ├── eq_patterns.md
  └── archetype_mappings.json
```

### 4.2 EQ Signal Schema for Assessment Agent

During assessment, the agent monitors and modulates:

```typescript
interface EQTonePlan_v1 {
  student_archetype: string;
  parent_archetype: string;
  anxiety_level: "low" | "medium" | "high";
  recommended_tone: string;
  validation_frequency: "high" | "medium" | "low";
  directive_vs_socratic: number;  // 0.0 (Socratic) to 1.0 (directive)
  crisis_protocols: string[];
}
```

---

## 5. EVIDENCE SURFACES FOR ASSESSMENT AGENT

The Assessment Agent retrieves evidence from these surfaces:

### 5.1 Primary Surfaces (High Confidence)

1. **KB Session Chips** (w001-w093)
   - Use: Analogical reasoning ("I've seen this pattern before in week 45...")
   - Retrieval: Vector search on `context + fact + tags`

2. **EQ Session Chips**
   - Use: Tone calibration ("When student shows X emotion, Jenny does Y")
   - Retrieval: Emotion + context matching

3. **Assessment Exemplars** (11 other students)
   - Use: Template matching, question sequencing
   - Retrieval: Similar student archetypes

### 5.2 Secondary Surfaces (Contextual Enhancement)

4. **iMessage Chips**
   - Use: Async communication style, follow-up patterns
   - Retrieval: Tag-based (e.g., "essay_feedback")

5. **Exec Doc Chips**
   - Use: Strategic planning frameworks (168-hour, 10-spot)
   - Retrieval: Framework name exact match

6. **Narrative Templates**
   - Use: Identity theme recognition
   - Retrieval: Keyword + archetype matching

### 5.3 Tertiary Surfaces (Persona Grounding)

7. **Core Language Patterns**
   - Use: Response generation style
   - Retrieval: N/A (embedded in prompts)

8. **Golden Thread Principles**
   - Use: Decision-making constraints
   - Retrieval: N/A (hard-coded rules)

---

## 6. TRANSFORMATION PIPELINE

### 6.1 Pipeline Stages

```
RAW → CLEAN → CURATED → CHIPS → EMBEDDING → PINECONE
```

#### **STAGE 1: RAW → CLEAN**
- Input: PDF, DOCX, VTT
- Process: Text extraction, OCR if needed
- Output: Plain text or structured JSON
- Tools: `pdfplumber`, `python-docx`, `vtt-to-txt`

#### **STAGE 2: CLEAN → CURATED**
- Input: Clean text/JSON
- Process: LLM extraction (GPT-4)
- Output: Structured intelligence (TRANS-INTEL.docx)
- Schema: Session-level summaries

#### **STAGE 3: CURATED → CHIPS**
- Input: TRANS-INTEL extractions
- Process: Chunking + KB_v6 schema population
- Output: Individual chip JSON files
- Tools: Custom extractors (see `/docs/*_Extractor_v*.md`)

#### **STAGE 4: CHIPS → EMBEDDING**
- Input: Chip JSON files
- Process: Text concatenation + embedding (OpenAI `text-embedding-3-large`)
- Output: Vector arrays (1536-dim)
- Embedding fields: `context + fact + jenny_tactic + tags`

#### **STAGE 5: EMBEDDING → PINECONE**
- Input: Chip + vector
- Process: Upsert to Pinecone namespace
- Output: Indexed, retrievable intelligence
- Namespaces:
  - `jenny_kb_chips`
  - `jenny_eq_chips`
  - `jenny_assess_exemplars`

### 6.2 Current Status (As of 2025-11-19)

| Stage | Status | File Count | Notes |
|-------|--------|------------|-------|
| RAW → CLEAN | ✅ Complete | 247 files | All Huda sessions |
| CLEAN → CURATED | ✅ Complete | 596 files | TRANS-INTEL extractions done |
| CURATED → CHIPS | ✅ Complete | 333 KB chips | w001-w093 coverage |
| CHIPS → EMBEDDING | 🟡 Partial | ~50% | Session chips done, iMessage in progress |
| EMBEDDING → PINECONE | 🟡 Partial | ~30% | Assess/GamePlan chips uploaded |

---

## 7. INPUT-TO-COMPONENT MAPPING

### 7.1 Which Pipeline Component Uses What?

| Input Type | Used By | Purpose | Priority |
|------------|---------|---------|----------|
| **Assessment Transcripts (RAW)** | Assessment Agent | Question sequencing, probe patterns | P0 |
| **Session KB Chips** | Assessment Agent | Analogical retrieval, precedent matching | P0 |
| **EQ Chips** | Assessment Agent | Tone calibration, crisis handling | P0 |
| **Persona Files** | Assessment Agent | Response generation style | P0 |
| **Assessment Structured JSONs** | Evaluation Layer | Correctness benchmarking | P0 |
| **Game Plan Reports (PDF)** | Game Plan Agent (future) | Template structure | P1 |
| **Exec Doc Chips** | Exec Agent (future) | Weekly planning logic | P2 |
| **iMessage Chips** | Async Coach Agent (future) | Communication style | P2 |
| **College App Materials** | Reference only | Not used in MVP | P3 |

### 7.2 Assessment Agent MVP Data Dependencies

**MUST HAVE (P0):**
1. Huda's raw assessment transcript
2. 11 other student structured assessment JSONs
3. KB session chips (w001-w093)
4. EQ session chips
5. Jenny persona files (core_language, heuristics, golden_thread)

**NICE TO HAVE (P1):**
6. iMessage EQ chips (for async tone examples)
7. Exec doc strategic frameworks

**NOT NEEDED (P2+):**
8. Game plan report PDFs
9. College application materials
10. QA/validation scripts

---

## 8. COMPLETE HUDA MATERIAL REFERENCE INDEX

### 8.1 By Content Type

#### **A. Assessment Session**
- **RAW:** `01_assess_session/` (1 PDF + JSON)
- **CURATED:** `01-assess-session/` (5 .docx extractions)
- **CHIPS:** `assess_gameplan/` (assessment chips in KB format)

#### **B. Game Plan Reports**
- **RAW:** `02_gameplan_reports/` (1 PDF)
- **CURATED:** `02-gameplan-report/` (4 .docx extractions)
- **CHIPS:** `assess_gameplan/` (game plan chips)

#### **C. Full Coaching Sessions (w001-w093)**
- **RAW:** `03_session_transcripts/` (93 JSON files, ~100-200 KB each)
- **CURATED:** `03-all-session/` (93 .docx TRANS-INTEL extractions)
- **CHIPS:** `session/` (w001-w093 chips in JSON/JSONL/MD)

#### **D. Execution Docs**
- **RAW:** `04_exec_docs/` (2 large DOCX files, 1.7 MB)
- **CURATED:** `04-execdoc/` (15 .docx extractions)
- **CHIPS:** `exec/` (exec chips JSONL)

#### **E. iMessage Conversations**
- **RAW:** `05_imessage/` (3 JSON parts, 100-113 KB each)
- **CURATED:** `05-imessage/` (7 .docx extractions)
- **CHIPS:** `imsg/` (iMessage chips)

#### **F. EQ Extractions**
- **CURATED:** `07-eq-chips/sessions/` (96 session EQ chips)
- **CURATED:** `07-eq-chips/imsg/` (7 iMessage EQ chips)

#### **G. College Application Materials**
- **RAW:** `06_college_apps/` (9 files: essays, EC lists)
- **CURATED:** None (reference only)

### 8.2 Phase Coverage (w001-w093)

| Phase | Weeks | Status |
|-------|-------|--------|
| **P1: FOUNDATION** | w001-w009 | ✅ Complete |
| **P2: BUILDING** | w010-w043 | ✅ Complete |
| **P3: JUNIOR** | w044-w064 | ✅ Complete |
| **P4: SUMMER** | w065-w080 | ✅ Complete |
| **P5: SENIOR** | w081-w093 | ✅ Complete |

**Total:** 93 weeks of coaching data (June 2023 - December 2024)

---

## 9. V4 CANONICAL FILE STRUCTURE

### 9.1 Recommended v4 Data Architecture

```
/data/
├── coaches/
│   └── jenny/
│       ├── raw/                          # TIER 1: RAW DATA
│       │   ├── huda/
│       │   │   ├── 01_assess_session/
│       │   │   ├── 02_gameplan_reports/
│       │   │   ├── 03_session_transcripts/
│       │   │   ├── 04_exec_docs/
│       │   │   ├── 05_imessage/
│       │   │   └── 06_college_apps/
│       │   └── other_students/
│       │       ├── assess/
│       │       └── gameplans/
│       │
│       └── curated/                      # TIER 2-4: PROCESSED INTEL
│           ├── kb_chips/                 # TIER 2: First-order intel
│           │   ├── session/              # w001-w093 session chips
│           │   ├── imsg/                 # iMessage chips
│           │   ├── exec/                 # Exec doc chips
│           │   ├── assess_gameplan/      # Assessment/GamePlan chips
│           │   ├── session_extractions/  # TRANS-INTEL.docx files
│           │   ├── imsg_extractions/
│           │   └── exec_extractions/
│           │
│           ├── eq_chips/                 # TIER 4: Meta intel
│           │   ├── sessions/
│           │   ├── imsg/
│           │   └── patterns/
│           │
│           ├── frameworks/               # TIER 3: Higher-order intel
│           │   ├── strategic/
│           │   ├── tactical/
│           │   └── persona/
│           │
│           └── narrative/                # TIER 3: Narrative templates
│               ├── archetypes/
│               ├── templates/
│               └── persona/
│
├── students/                             # TIER 5: Student outputs
│   └── jenny_assessments_v1/
│       ├── student_001_anoushka_structured.json
│       ├── student_002_ananyaa_structured.json
│       └── ...
│
├── reports/                              # Published reports
│   └── *.pdf
│
└── archive/                              # Deprecated/system files
    ├── system/
    ├── qa_tools/
    ├── tools/
    └── misc/
```

### 9.2 File Counts by Bucket (Current State)

| Bucket | Files | Size | Status |
|--------|-------|------|--------|
| `raw/` | 237 | 45 MB | ✅ Organized |
| `kb_chips/` | 455 | 18 MB | ✅ Complete |
| `eq_chips/` | 107 | 2 MB | ✅ Complete |
| `frameworks/` | 2 | 12 KB | 🟡 Needs extraction |
| `narrative/` | 5 | 28 KB | 🟡 Needs expansion |
| `assessments/` | 22 | 450 KB | ✅ Complete |
| `reports/` | 0 | 0 | 🟡 Need to add PDFs |
| `archive/` | 41 | 5 MB | 🟡 Needs cleanup |

---

## 10. DATA QUALITY & PROVENANCE

### 10.1 Completeness Metrics

| Dataset | Completeness | Notes |
|---------|--------------|-------|
| **Huda Assessment** | 100% | 1 full session + extractions |
| **Huda Sessions** | 100% | w001-w093 (93 weeks) |
| **Huda iMessage** | 100% | 3-year thread (3 parts) |
| **Huda Exec Docs** | 100% | Part 1 + Part 2 |
| **Other Student Assessments** | 100% | 11 students |
| **EQ Chips** | 85% | Sessions done, iMessage partial |
| **KB Chips** | 95% | w001-w093 done, some QA pending |

### 10.2 Data Lineage Tracking

Every chip must trace back to:
1. **Source File:** RAW file path
2. **Extraction Date:** When curated
3. **Extractor Version:** Which script/LLM
4. **Confidence Score:** 0.0-1.0 (LLM certainty)

Example:
```json
{
  "chip_id": "w045_kb_001",
  "source_file": "/raw/huda/03_session_transcripts/2024-05-14_W045_P3-JUNIOR_TRANS-RAW.json",
  "extraction_date": "2024-09-16",
  "extractor": "gpt-4-turbo-2024-04-09",
  "confidence": 0.92
}
```

---

## 11. EMBEDDING & RETRIEVAL STRATEGY

### 11.1 Embedding Fields

**For KB Chips:**
```
embedded_text = f"{context}\n{fact}\n{jenny_tactic}\n{tags}"
```

**For EQ Chips:**
```
embedded_text = f"{context}\n{student_emotion}\n{jenny_tone}\n{eq_tactic}"
```

### 11.2 Pinecone Namespaces

| Namespace | Records | Metadata Fields |
|-----------|---------|-----------------|
| `jenny_kb_chips` | ~333 | week, phase, tags, chip_type |
| `jenny_eq_chips` | ~96 | week, phase, student_emotion, jenny_tone |
| `jenny_assess_exemplars` | 11 | student_archetype, grade, school |

### 11.3 Retrieval Query Pattern

```python
# Example: Find relevant coaching moments for "essay anxiety"
query = "Student anxious about essay not being good enough"
results = pinecone_index.query(
    vector=embed(query),
    top_k=5,
    namespace="jenny_kb_chips",
    filter={"tags": {"$in": ["essay_development", "anxiety_management"]}}
)
```

---

## 12. MAINTENANCE & EVOLUTION

### 12.1 Adding New Students

1. Add RAW files to `/raw/<student_name>/`
2. Run extraction pipeline
3. Generate chips → embed → upload to Pinecone
4. Add structured assessment JSON to `/students/jenny_assessments_v1/`

### 12.2 Schema Versioning

- All schemas versioned (e.g., `KBChip_v6`, `EQChip_v2`)
- Breaking changes require new namespace in Pinecone
- Migration scripts in `/tools/migrations/`

### 12.3 Quality Assurance

- **Precision Probes:** Semantic retrieval accuracy tests
- **Validation Reports:** Schema compliance checks
- **Drift Detection:** Monitor embedding distribution shift

---

## 13. SUMMARY: KEY TAKEAWAYS

### ✅ **What We Have**
1. **869 files** across RAW and CURATED tiers
2. **93 weeks** of Huda coaching intelligence (June 2023 - Dec 2024)
3. **333 KB chips** + **96 EQ chips** ready for RAG
4. **11 student assessment exemplars** for benchmarking
5. **Complete persona encoding** (language, heuristics, EQ patterns)

### 🎯 **What Assessment Agent MVP Needs**
1. KB chips (session-level intelligence)
2. EQ chips (tone calibration)
3. Assessment exemplars (question sequencing)
4. Persona files (response generation style)

### 🔄 **Next Steps for Production**
1. Complete embedding of all KB/EQ chips
2. Upload to Pinecone with proper namespaces
3. Validate retrieval accuracy with precision probes
4. Integrate into Assessment Agent task graph

---

**END OF DOCUMENT**

*This specification is the single source of truth for all data operations in IvyLevel v4.0 Assessment Agent MVP.*
