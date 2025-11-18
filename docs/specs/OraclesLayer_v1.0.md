# ⭐ **IVYLEVEL v4.0 — ORACLES LAYER SPEC (v0.1)**

**Document Path:** `/docs/specs/OraclesLayer_v1.0.md`
**Purpose:** Make v3.3.5 logic safely accessible to v4.0 *without ever rewriting, duplicating, or drifting schemas.*

This is the interop brainstem between:

* **v4.0 multi-agent autonomous runtime**, and
* **v3.3.5 deterministic domain intelligence.**

Your moat lives here.

---

# 1. PURPOSE OF THE ORACLES LAYER

### **Why does this layer exist?**

Because v3.3.5 contains irreplaceable domain expertise:

* IvyScore engine
* Weak-Spot Clustering engine
* Narrative engine
* EQ engine
* KB fact synthesis
* Provenance & determinism
* Temporal fact modeling

But v3.3.5:

* cannot run multi-agent logic
* cannot handle task graphs
* cannot do realtime
* cannot support multi-coach digital twins
* cannot support distributed reasoning
* cannot run high-autonomy agents

So we **compose**, not rewrite.

The Oracles Layer is a **strict, read-only, API-shaped gateway**
through which v4.0 agents request domain intelligence *as if calling an external service.*

This ensures:

* no corruption
* no schema drift
* clean boundaries
* safe parallel development
* gradual migration toward v4-native engines

---

# 2. FOLDER STRUCTURE

```
/packages/
  /oracles-v3/
    ivyScore.oracle.ts
    weakSpots.oracle.ts
    narrative.oracle.ts
    eq.oracle.ts
    facts.oracle.ts
    studentSnapshot.oracle.ts
    index.ts
```

---

# 3. DESIGN PRINCIPLES (NON-NEGOTIABLE)

### **Principle 1 — Pure Adapters**

Every oracle file strictly wraps a **v3.3.5 function** and translates:

* Input → v3-compatible format
* Output → v4 schema via `/packages/schemas/*.ts`

No logic modification.
No partial rewrites.
No “improvements.”

This keeps v3’s determinism intact.

---

### **Principle 2 — Read Only**

Oracles MAY NOT:

* write to v3 DB
* mutate v3 files
* alter v3 logic
* modify v3 schemas

They are read-only interpreters.

---

### **Principle 3 — Pure Functions**

Every oracle method must be:

* side-effect free
* stateless
* stable
* validated
* versioned

No shared mutable memory.

---

### **Principle 4 — Versioned Contracts**

Every oracle exports a versioned contract:

```
OracleResponse<T> = {
  data: T
  version: string
  provenance: {
    oracle: string
    v3_engine: string
    timestamp: ISO
  }
}
```

This lets v4 agents reason about which version they’re consuming.

---

### **Principle 5 — No Silent Failures**

If an oracle fails, it must return:

```
{
  error: {
    code: string,
    message: string,
    detail: any
  }
}
```

Never returns null, undefined, or partial output.

---

# 4. ORACLE ENDPOINTS (THE 6 READ-ONLY GATEWAYS)

Below are the exact functions v4 agents may call.
No new ones allowed without a spec update + schema change.

---

# **4.1 IvyScore Oracle**

**File:** `/packages/oracles-v3/ivyScore.oracle.ts`

### **Purpose**

Compute academic, EC, awards, spike, narrative, rigor scores.

### **Signature**

```
getIvyScore(student_id: string): Promise<OracleResponse<IvyScore_v1>>
```

### **Input**

* student_id

### **Output**

Mapped into schema:
`/packages/schemas/IvyScore_v1.ts`

### **Notes**

* Uses v3 IvyScore engine
* Exact v3 logic, no mutations
* v4 never manipulates raw scoring logic

---

# **4.2 WeakSpots Oracle**

**File:** `/packages/oracles-v3/weakSpots.oracle.ts`

### **Signature**

```
getWeakSpotClusters(student_id: string): Promise<OracleResponse<WeakSpots_v1>>
```

### **Output Includes**

* cluster name
* severity
* admissions impact
* recommended interventions

---

# **4.3 Narrative Oracle**

**File:** `/packages/oracles-v3/narrative.oracle.ts`

### **Signature**

```
getNarrativeInsights(student_id): Promise<OracleResponse<NarrativeInsights_v1>>
```

### **Output**

* 2–3 narrative hubs
* potential hooks
* coherence score
* identity anchors
* risk of generic profile

Used heavily in Assessment Phase 4.

---

# **4.4 EQ Engine Oracle**

**File:** `/packages/oracles-v3/eq.oracle.ts`

### **Signature**

```
getToneProfile(student_id): Promise<OracleResponse<ToneProfile_v1>>
```

### **Purpose**

Inject Jenny-style EQ patterns into v4 responses.

---

# **4.5 Facts Oracle**

**File:** `/packages/oracles-v3/facts.oracle.ts`

### **Signature**

```
getAllFacts(student_id): Promise<OracleResponse<VitalFacts_v1>>
```

### **Purpose**

Deliver v3’s structured fact map, fully normalized.

Used in Assessment Phase 2 & 3.

---

# **4.6 Student Snapshot Oracle**

**File:** `/packages/oracles-v3/studentSnapshot.oracle.ts`

### **Signature**

```
getSnapshot(student_id): Promise<OracleResponse<StudentSnapshot_v1>>
```

### **Output**

* academic baseline
* EC baseline
* awards history
* standout strengths
* known gaps
* prior transcript summary

This is how v4 agents bootstrap context **before** reasoning.

---

# 5. ORACLE → V4 SCHEMA MAPPING RULES

All oracle outputs must map to schema files located at:

```
/packages/schemas/
```

### Rules:

1. No JSON fields outside schema allowed
2. All missing v3 fields mapped to `null`
3. All extra v3 fields discarded
4. Schema version bump required for breaking changes
5. Oracles cannot define schemas
6. v4 agents MUST import schemas only from `/packages/schemas`

Guaranteed consistency across platform.

---

# 6. VERSIONING

Every oracle export includes:

```
version: "oracle-v1.0"
v3_engine_version: "3.3.5"
```

Next upgrades will be:

* v1.1 — add fields
* v2.0 — new schema version
* v3.0 — v3 logic deprecated or replaced

---

# 7. TESTING REQUIREMENTS

Under:

```
/packages/oracles-v3/tests
```

Each oracle must include:

### **Unit Tests**

* input validation
* schema consistency
* deterministic outputs

### **Integration Tests**

* against real v3 DB snapshot
* produce stable outputs across runs

### **Golden Files**

* snapshot outputs stored under `/tests/oracles/goldens`
* used to detect regressions

---

# 8. SECURITY & SAFETY

### Oracles must not:

* write to v3 DB
* invoke v3 migrations
* modify v3 intelligence
* generate side effects

### Oracles must:

* log all calls (timestamp + caller agent)
* throttle abusive calls
* provide deterministic fallback

---

# 9. MIGRATION ROADMAP

### **Phase 1**

Assessment Agent uses IvyScore + WeakSpots + Narrative.

### **Phase 2**

Execution Agent uses v3 EC engine.

### **Phase 3**

GamePlan Agent uses all oracles.

### **Phase 4**

Gradually port v3 engines into v4-native modules.

### **Phase 5**

Decommission v3 monolith (timeline: 12–18 months).

---

# ⭐ SPEC B COMPLETED.

This is the cleanest, safest, most future-proof way to interlock v3.3.5 intelligence into the v4.0 multi-agent mesh without chaos.

