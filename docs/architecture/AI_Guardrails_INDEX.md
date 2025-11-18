# AI Guardrails Index — Single Source of Truth

This file maps all guardrails, rules, and enforcement mechanisms inside the
ivylevel-multiagents-v4 project.

## Sections

### 1. High-Level Rules
- Folder boundaries
- Naming rules
- Schema governance
- v3 oracle protection
- Port runtime rules
- SDLC workflow

### 2. Files Enforcing Guardrails
- /claude/instructions.md
- /docs/contributors/Contributor_Ruleset_v1.0.md
- /docs/contributors/Contributor_Ruleset_v2.0.md
- /.vscode/claude-code.json
- /.vscode/settings.json
- /.claude/pre-commit.sh
- /.github/workflows/claude-guard.yml

### 3. SDLC Phases
- Spec freeze
- Implementation
- Testing
- Bug report
- Fix spec
- Patch
- Version bump
- Changelog update
- PR review
- Merge

### 4. Port/Runtime Control
- Ports: 3000 / 4000 / 5050 / 6060 / 7070 / 9090
- Run restrictions
- PID cleanup rules
- Dev server invocation protocol
