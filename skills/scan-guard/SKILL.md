---
name: scan-guard
description: Use when the user wants to scan a project for dangerous modules, legacy code, missing governance files, or security risks without generating files. Triggers on "scan guard", "scan project for risk", "audit governance", "check dangerous modules", or "/scan-guard".
---

# Scan Guard

Scan the current project for governance risks, dangerous module candidates, legacy modules, contract candidates, and missing governance files. Report only — do not generate files.

## When to Use

- User wants a risk overview before initializing governance files.
- User asks for "扫描项目风险", "audit project", "check governance", "scan guard".
- User runs `/scan-guard`.

## Core Pattern

### Step 1: Quick structural scan

Walk the project root and report:

- Package manager / build tool detected
- Framework indicators (Spring, Vue, React, Django, Express, etc.)
- Test framework indicators
- Database migration tool indicators
- Existing governance files (CLAUDE.md, .claude/, .cursor/rules/, etc.)

### Step 2: Dangerous module candidates

Flag files and patterns that typically represent high risk:

| Pattern | Risk |
|---------|------|
| `*Security*.java`, `*Auth*.ts`, `auth/*` | Authentication bypass risk |
| `*Scheduler*`, `*Cron*`, `*Job*` | Production job disruption |
| `db/migration/*`, `*migration*.sql` | Schema breakage risk |
| `mapper/*.xml`, `*Repository*.java` | Data access contract risk |
| `*Controller*`, `*Router*`, `*routes*` | API contract breakage |
| `application*.yml`, `.env*` | Configuration risk |
| Stripe/PayPal/third-party API clients | External integration risk |

### Step 3: Legacy module candidates

Flag files and patterns suggesting legacy/compatibility code:

- `deprecated`, `legacy`, `old`, `v1`, `compat`, `adapter`
- Comments containing "don't delete", "keep for compatibility", "历史原因"

### Step 4: Contract candidates

Identify likely contracts:

- `ApiResponse<T>`, response envelope classes
- Status enums and string constants
- TypeScript API type files
- Database migration files
- Shared DTO/VO/Entity classes

### Step 5: Missing governance assessment

Check whether governance files exist and report gaps:

```text
CLAUDE.md              [EXISTS / MISSING]
CLAUDE.architecture.md [EXISTS / MISSING]
CLAUDE.lessons.md      [EXISTS / MISSING]
CLAUDE.local.md        [EXISTS / MISSING]
.claude/agents/        [EXISTS / MISSING]
.claude/commands/      [EXISTS / MISSING]
.claude/workflows/     [EXISTS / MISSING]
```

## Required Output

Produce a scan report with sections:

1. Detected stack (with confidence: high/medium/low)
2. Dangerous module candidates
3. Legacy module candidates
4. Contract candidates
5. Governance file status
6. Suggested questions for the user to answer during `/init-guard`

## Important Rules

- **Never print real secret values.** If a config file contains secrets, report the field name and file only.
- **Mark all findings with confidence.** Do not claim certainty where only heuristics were used.
- **This is read-only.** Do not write or modify any files.
