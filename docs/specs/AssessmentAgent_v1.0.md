
# ⭐ **IVYLEVEL v4.0 — ASSESSMENT AGENT v1.0 (JENNY-TWIN) SPEC**

**Document Version:** v0.1 (Immutable Draft)
**Owner:** Siraj
**Maintainer:** GPT-Architect (me)
**Location:** `/docs/specs/AssessmentAgent_v1.0.md`

---

# 1. OBJECTIVE AND SCOPE

### **1.1 Purpose**

The Assessment Agent v1.0 is the **first digital twin** in the IvyLevel v4.0 multi-agent ecosystem.
It must autonomously conduct and/or recreate:

1. A Jenny-style 60-minute adaptive assessment session
2. A complete extraction of ~80–120 student facts
3. A diagnostic reasoning run (Jenny’s cognitive engine)
4. A preliminary narrative framing
5. A structured output object identical to real Jenny’s post-assessment artifacts
6. A foundation for the Precision Game Plan

### **1.2 Success Criteria**

The agent must match **Jenny’s intelligence bar** across:

* Narrative reasoning
* Diagnostic accuracy
* Academic rigor interpretation
* EC depth diagnostics
* Weak-spot cluster identification
* EQ warmth (Jenny’s tone)
* Adaptive probing
* Parent/student engagement archetypes
* Clarity of articulation
* Consistency across students

If parents cannot distinguish the output from Jenny’s real work → PASS.

---

# 2. ARCHITECTURE CONTEXT (v4.0 Integration)

The Assessment Agent is an **application-level agent** under:

```
/apps/assessment-agent
```

It depends on:

1. **core-logic** → reasoning, planning, flow execution
2. **schemas** → the Assessment Output Schema
3. **kb** → past transcripts, CHIP patterns, Jenny exemplars
4. **oracles-v3** → IvyScore, Weak Spots, Narrative Engine, EQ Engine
5. **v4 Runtime** → task-graph, messaging, tool-calling
6. **Evaluation Layer** → correctness, completeness, consistency

The agent consumes the v3 engines but does *not* rewrite them.

---

# 3. INPUTS

### **3.1 Live Session Mode**

Agent receives:

* OpenAI Realtime audio/voice stream
* Transcribed text chunks
* Parent/student metadata
* School context
* Grade, GPA, course list (optional)

### **3.2 Offline Transcript Mode**

Agent receives:

* A full assessment transcript (one of the many .txt files you uploaded)

### **3.3 Required Metadata**

```
{
  student_id: string,
  student_name: string,
  grade: number,
  school: string | null,
  parent_profile: “high-anxiety” | “hands-off” | “supportive” | “directive” | null,
  session_type: “assessment”,
  input_mode: “live” | “transcript”
}
```

---

# 4. OUTPUTS

### **4.1 Assessment Output Object (AOO v1.0)**

Stored in `/packages/schemas/AssessmentOutput_v1.ts`

```
{
  profile: {
    academics: {...},
    ec_summary: {...},
    awards: {...},
    passions: {...},
    identity_themes: [...],
    narrative_hubs: [...],
    gaps: [...],
    standout_strengths: [...],
    execution_barriers: [...],
  },
  diagnostics: {
    academic_rigor_flag,
    testing_flag,
    ec_depth_flag,
    spike_likelihood_score,
    narrative_coherence_score,
    execution_score
  },
  recommendations: {
    short_term_actions: [...],
    summer_strategy: [...],
    awards_targets: [...],
    program_targets: [...],
    long_term_plan: [...]
  },
  meta: {
    session_duration,
    confidence_scores,
    agent_version: "AssessmentAgent_v1.0"
  }
}
```

---

# 5. THE FIVE-PHASE FLOW (JENNY MODEL)

The agent follows this strictly:

```
PHASE 1: Rapport & Context
PHASE 2: Deep Profile Extraction
PHASE 3: Diagnostic Reasoning Run
PHASE 4: Narrative Synthesis
PHASE 5: Recommendation Generation
```

Each phase uses **task graph nodes** + **tool functions**.

---

# 6. PHASE DETAILS

## **6.1 Phase 1 — Rapport & Context (5 minutes)**

**Goals:**

* Lower anxiety
* Set session expectations
* Create psychological safety
* Establish agency with the student
* Identify any parental over-shadowing
* Gather high-level goals

**Tools Required:**

```
tool.start_phase("rapport")
tool.ask("icebreaker")
tool.extract("goals")
tool.extract("family_context")
tool.extract("motivation")
```

**Jenny-Style Behaviors:**

* Warm tone
* Gentle probing
* Future-oriented framing (“I want to understand who you *are* first”)

---

## **6.2 Phase 2 — Deep Profile Extraction (30–35 minutes)**

This is the backbone.

### Categories:

1. **Academics** (rigor, course map, AP trajectory)
2. **ECs** (breadth → depth → spike pattern)
3. **Awards** (validation layer)
4. **Passions** (identity domain)
5. **Narrative threads**
6. **Personality markers**
7. **Execution habits**
8. **Parent dynamic**

### Tools:

```
tool.extract("academics")
tool.extract("ec_list")
tool.extract("awards")
tool.extract("summer_history")
tool.extract("passions")
tool.extract("identity")
tool.extract("execution_patterns")
tool.extract("family_role")
```

### Adaptivity Rules:

* If student shows hesitation → probe deeper
* If little EC depth → shift to discovery questioning
* If no narrative → use story cascade

These are encoded in `kb/question-tree` DSL.

---

## **6.3 Phase 3 — Diagnostic Reasoning Run (10 minutes)**

Agent calculates:

* academic rigor
* EC coherence
* spike probability
* narrative coherence
* weak spot clusters
* execution barrier types
* parent influence

**This phase uses:**

```
oracles-v3/IvyScore
oracles-v3/WeakSpots
oracles-v3/Narrative
oracles-v3/EQ
core-logic: pattern matcher
core-logic: archetype classifier
```

---

## **6.4 Phase 4 — Narrative Synthesis (5 minutes)**

Agent outputs:

* 2–3 narrative hubs
* 5–7 standout strengths
* 3–5 weak spots
* identity thread
* admissions framing

Uses:

```
kb/narrative-templates
core-logic/narrative-builder
eq-engine/tone
```

---

## **6.5 Phase 5 — Recommendations (5 minutes)**

Short-term:

* EC depth action items
* Course load
* SAT / ACT pathway
* Summer programs
* Awards targets

Long-term:

* Spike domain
* Hook development
* Narrative projects
* College category fit

Uses:

```
core-logic/strategy
kb/program-mapping
kb/award-mapping
oracles-v3/narrative-suggestions
```

---

# 7. RUNTIME & TASK GRAPH (v4 Integration)

### The agent uses:

* **OpenAI Realtime** (live mode)
* **Tool calling** via v4 runtime
* **State machine** per phase
* **Task graph** for adaptive flows

```
task.start("phase1")
  → node.extract_goals
  → node.extract_motivation
  → node.advance_if_ready
task.start("phase2")
  → node.extract_ECs
  → node.extract_academics
  → node.branch_if_missing_awards
...
```

Stored in `/apps/assessment-agent/flow/graph.ts`

---

# 8. DSL FOR QUESTION TREE

Located at `docs/dsl/assessment-tree.md`

Simple YAML-like DSL:

```
academics:
  ask: “Tell me about your classes this year…”
  fields:
    - course_load
    - rigor
    - favorites
    - pain_points
  probes:
    if: low_rigor
    then: ask("rigor_expand")
```

This ensures **no agent** rewrites question flows.

---

# 9. SAFETY GUARDRAILS

### The agent must not:

* give admissions predictions
* mention specific schools unless prompted
* contradict IvyScore or WeakSpots
* produce medical/mental health advice
* bypass v4 runtime
* output signals outside schemas

---

# 10. EVALUATION METRICS

### Each session is graded on:

* Coverage completeness
* Diagnostic accuracy
* EQ quality
* Narrative clarity
* Strategic soundness
* Jenny-style match score
* Parent-management quality
* Actionability of plan

Scored via: `/scripts/eval/assessment_evaluator.ts`

---

# 11. IMPLEMENTATION PLAN (Phased)

### **Phase A — Minimal Viable Jenny Twin**

* Transcript → AssessmentOutput_v1
* No realtime
* No EQ voice layer
* Validate accuracy vs Jenny reports

### **Phase B — Jenny Twin Live**

* Realtime
* Agent adaptivity
* Tool calling

### **Phase C — Jenny Twin Deep Diagnostic**

* Full diagnostic engine
* v3 oracles integration

### **Phase D — Jenny Twin v1.0**

* Production-grade
* Scoring, schemas, DSL
* Multi-agent compatibility

---

# ⭐ SPEC COMPLETE.

This is the **master document**.
Nothing gets coded until this is committed to `/docs/specs/AssessmentAgent_v1.0.md`.

---
