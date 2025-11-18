
Below is the **Contributor Ruleset v1.0** — the laws that every AI coding agent (Claude, Cursor, Replit, Copilot, GPT Builder, etc.) MUST obey.

This is your firewall against chaos.

This spec is **final** unless you ask for changes.
Save this as:

```
/docs/contributors/Contributor_Ruleset_v1.0.md
```

Ready? Here comes the constitution.

---

# ⭐ **IVYLEVEL v4.0 — CONTRIBUTOR RULESET v1.0 (MANDATORY)**

**Document ID:** IVL-RULES-01
**Scope:** All human + AI contributors
**Enforced By:** Pre-commit hooks, PR review, Hound checks
**Status:** Required before any code is written

This document defines the **non-negotiable laws** governing how code, files, schemas, and docs may be created, modified, or organized inside the v4.0 monorepo.

Any AI coding agent must follow these rules *exactly* or its outputs will be rejected.

---

# 1. REPO BOUNDARIES (IMMUTABLE)

### ✔ Rule 1.1 — Code must live inside the approved folder map

Valid folders are ONLY:

```
/apps
/packages
/infra
/scripts
/docs
/tests
```

No new root-level folders may be added ever.

### ❌ Forbidden:

* `/new`
* `/runtime2`
* `/tmp`
* `/experiments`
* `/test2`
* `/samples`
* `/archive`

If an AI agent attempts to create such folders, PR must be rejected.

---

# 2. FILE CREATION RULES

### ✔ Rule 2.1 — No file may be created without:

* a spec (in `/docs/specs`)
* an approved folder path
* an approved name
* a corresponding test stub

### ✔ Rule 2.2 — All filenames must be:

* lowerCamelCase for JS/TS
* PascalCase only for classes
* kebab-case-only for Markdown
* `.ts` only for TypeScript
* `.md` for documentation

### ❌ Forbidden filenames:

* `utils2.ts`
* `index copy.ts`
* `runtime-final-final2.ts`
* Any file ending in `copy`, `backup`, `final`, `temp`, or numeric suffixes

---

# 3. DUPLICATION PREVENTION (CRITICAL)

### ✔ Rule 3.1 — No duplicate filenames allowed anywhere in repo

Before creating a file, every AI agent must search the repo:

**If the file name already exists → abort creation.**

### ✔ Rule 3.2 — All code must be unique to its domain

No repeated logic.
No duplicate schema definitions.
No copy-paste propagation.

---

# 4. SCHEMA GOVERNANCE RULES

Schemas are sacred.

They live ONLY in:

```
/packages/schemas
```

### ✔ Rule 4.1 — No schema may be created anywhere else.

If a model or interface exists in code, it MUST be generated from the schema.

### ✔ Rule 4.2 — Versioning required:

```
IvyScore_v1.ts
IvyScore_v2.ts
```

Never modify schema fields without:

* version bump
* migration note
* changelog entry

### ❌ Forbidden:

* silent schema field additions
* editing schema types inline
* ad-hoc JSON definitions in code

---

# 5. ORACLES LAYER PROTECTION

v3.3.5 logic must be protected from mutation.

### ✔ Rule 5.1 — v3 logic is read-only

No AI agent may modify:

* v3 engines
* v3 schemas
* v3 business logic
* v3 scoring algorithms

### ✔ Rule 5.2 — Oracles are thin adapters ONLY

They may:

* format input
* map output
* validate shape

They may NOT:

* add new logic
* override v3 logic
* “fix bugs” in v3
* generate alternative scoring

### ✔ Rule 5.3 — All oracle outputs must map to schemas

No free-form objects.

---

# 6. PR SIZE & SAFETY LIMITS

### ✔ Rule 6.1 — Max PR size:

* **500 lines changed**
* **10 files touched**
* **1 domain boundary** (apps OR packages, not both)

### ✔ Rule 6.2 — All PRs require:

* link to spec
* tests included
* code formatted (prettier)
* typed with strict TS

### ❌ Forbidden PRs:

* multi-module sweeping changes
* formatting-only PRs created by an AI
* “rewrite entire app” PRs

---

# 7. CODING STANDARDS (STRICT)

### ✔ Rule 7.1 — Code must be:

* deterministic
* pure when possible
* side-effect-free
* typed via TypeScript strict mode
* documented inline

### ✔ Rule 7.2 — No runtime mutations

Never modify shared global objects, caches, or imported modules.

### ✔ Rule 7.3 — No hidden state

State must be stored only in:

* DB
* Redis
* explicit state manager

### ✔ Rule 7.4 — No inline JSON schemas

Must reference from `/schemas`.

---

# 8. IMPLEMENTATION ORDER RULES

AI agents may only implement code in this order:

1. **folder structure**
2. **spec creation**
3. **schemas**
4. **adapters & oracles**
5. **runtime skeleton**
6. **core logic**
7. **agent logic**
8. **UI / CLI**

Trying to build agents before schemas → reject.

Trying to build logic before oracles → reject.

---

# 9. NO AUTONOMOUS REFACTORING

### ✔ Rule 9.1 — AI agents are not allowed to:

* rename files
* move directories
* rewrite imports globally
* reformat entire codebase

Unless explicitly asked.

This prevents cascade damage.

---

# 10. DOCUMENTATION REQUIREMENTS

### ✔ Rule 10.1 — Every module must have:

* a spec file in `/docs/specs`
* inline documentation for every function
* a README in its folder

### ✔ Rule 10.2 — Every commit modifying logic must update:

* changelog
* architecture doc OR module doc

---

# 11. TESTING REQUIREMENTS

### ✔ Rule 11.1 — Every new file must have:

* unit test
* integration test stub

### ✔ Rule 11.2 — Oracle outputs must have golden tests

Stored under:

```
/tests/oracles/goldens
```

No changes allowed unless version bumped.

---

# 12. RESTRICTED ACTIONS FOR AI AGENTS

AI agents are STRICTLY forbidden from:

* running migrations
* modifying infra files
* modifying v3 code
* touching production environment configs
* generating random files
* creating folders not in the architecture map
* altering CI/CD

---

# 13. COMMANDMENTS FOR CLAUDE / CURSOR / GPT AGENTS

When generating code, the agent MUST:

### ✔ Include references to the spec it’s implementing

### ✔ Only touch the specific file you direct

### ✔ Never create new files unless approved in advance

### ✔ Never modify other modules

### ✔ Ask before creating new utilities

### ✔ Ask before expanding the scope

### ✔ Validate against schemas

### ✔ Run nothing destructive

### ✔ Keep code minimal

---

# 14. VIOLATION RESPONSE POLICY

If an AI agent violates ANY rule:

1. PR is immediately rejected
2. File is deleted
3. Contributor token is revoked
4. Agent must regenerate the task with a restrictive prompt

No exceptions.

---

# ⭐ RULESET COMPLETE.

This stops Claude (and any other coding agent) from ever trashing your v4.0 platform.

