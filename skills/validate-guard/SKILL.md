---
name: validate-guard
description: Use when the user wants to check whether existing AI governance files are complete, consistent, and free of security issues. Triggers on "validate guard", "check governance quality", "audit CLAUDE.md", "verify guardrails", or "/validate-guard".
---

# Validate Guard

Check the quality and completeness of existing AI governance files in the current project.

## When to Use

- User wants to verify governance files after initialization.
- User asks for "验证治理文件", "validate guard", "check guardrails", "audit governance quality".
- User runs `/validate-guard`.

## Core Pattern

### 1. File existence check

Verify all required files exist:

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md
.claude/agents/architecture-reviewer.md
.claude/agents/implementation-engineer.md
.claude/agents/code-reviewer.md
.claude/agents/fix-bug.md
.claude/agents/refactor-guardian.md
.claude/agents/lessons-curator.md
```

### 2. Content quality checks

| Check | What to look for |
|-------|-----------------|
| Dangerous modules | Must not be empty or contain only `TODO` |
| Lessons | Must not be entirely template text without project specifics |
| Local context | Must contain current branch name |
| Contract Guard | Must list actual project contracts, not just `TODO` |
| Test commands | Must look plausible (not placeholder) |

### 3. Reference integrity

- Workflows that reference agents should list agent names that actually exist.
- Commands that reference workflows should list workflow files that actually exist.

### 4. Secret detection

Scan all governance files for:

- `password=`, `secret=`, `token=`, `accessKey=`, `privateKey=`, `apiKey=` followed by non-redacted values
- Long base64 strings that look like credentials
- Signed URLs with credentials in query parameters

### 5. Tier rule presence

Check that workflows reference risk tiers (Tier 0-3) and that Tier 3 workflows require human confirmation.

### 6. Agent permission review

Check that review/guardian agents are marked read-only and that fix/implementation agents specify stop conditions.

## Required Output

Produce a validation report:

```text
AI Project Guard Validation

PASS  required files exist
PASS  agents referenced by workflows exist
WARN  dangerous modules list is empty
WARN  no legacy modules declared
FAIL  possible secret found in CLAUDE.local.md: line 42
```

## Rules

- **Read-only.** Validate only, do not modify governance files.
- If secrets are found, report the file and line number but **do not print the value**.
- Suggest running `/init-guard` or manual edits to fix warnings and failures.
