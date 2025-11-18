🎯 CLAUDE IMPLEMENTATION INSTRUCTIONS FOR ivylevel-multiagents-v4

You MUST follow these rules at ALL times.

Your top priorities:

Respect folder boundaries

Prevent entropy

Never touch .env

Never start servers without permission

Never duplicate files

Never guess ports

Always obey specs

Ask whenever uncertain

🧭 MANDATORY RULESETS TO FOLLOW

Before doing ANY work, you MUST load and follow these:

/docs/contributors/Contributor_Ruleset_v1.0.md

/docs/contributors/Contributor_Ruleset_v2.0.md

/docs/ASSESSMENT_AGENT_v1_SPEC_SUITE.md

These define ALL boundaries, architecture, and processes.

🚫 NO AUTONOMOUS BEHAVIORS

You MUST NOT:

Create new folders unless explicitly asked

Modify architecture

Refactor ANY code

Modify v3 intelligence logic

Modify test frameworks

Modify CI/CD workflows

Modify .env, .env.example, or anything containing secrets

Start a dev server without explicit user command

Change ports

Attempt migrations

Guess schemas or create them without approval

📁 FOLDER BOUNDARIES (STRICT)

Allowed root directories:

/apps
/packages
/infra
/scripts
/docs
/tests
/claude
/.vscode
/.github


Forbidden:

tmp, new, runtime2, sandbox, playground,
backup, experiments, draft, archive

📌 FILE NAMING

Valid:

TS: lowerCamelCase.ts

Classes: PascalCase.ts

Docs: kebab-case.md

Tests: *.test.ts

Forbidden endings: copy, final, tmp, backup, new.

⚠️ NO DUPLICATE FILES

Before creating ANY file, search repo:

If filename exists ANYWHERE → STOP and ask user.

📑 SCHEMA GOVERNANCE

Schemas live ONLY in:

/packages/schema


You MUST:

Version bump on any change

Update /packages/schema/changelog.md

NEVER inline schemas

NEVER duplicate schema definitions

🔒 v3 ORACLES PROTECTION

Folder:

/packages/adapters/v3-intelligence-oracles


You MUST NOT:

Modify logic

Add fields

Change mapping

Rewrite data models

Only thin adapters allowed.

🔁 PR SAFETY LIMITS

Every change MUST respect limits:

≤ 500 lines

≤ 10 files

ONE domain boundary (agents OR orchestrator OR core-logic)

🧪 TESTING REQUIREMENTS

Every file requires:

unit tests

schema validation tests

golden tests (for oracles)

⚙️ PORT & RUNTIME CONTROL (STRICT)

Allowed ports ONLY:

3000 (frontend)
4000 (backend)
5050 (orchestrator)
6060 (studio)
7070 (mock)
9090 (proxy)


You MUST:

Check if port is in use

STOP and ask user if PID should be killed

NEVER auto-kill

NEVER choose new ports

NEVER start servers without explicit user request

NEVER run multiple servers simultaneously

🔐 ENV FILE PROTECTION

You MUST NOT:

edit .env

create .env.example

read .env

reference missing env vars

print env keys

Use ONLY:

import { env } from "@shared/config/env";

⛔ WHEN IN DOUBT, ASK

If ANY detail is unclear → STOP and ask user.

END .claude/instructions.md