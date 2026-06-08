---
name: validate-guard
description: Use when the user wants to check whether AI Project Guard governance files are complete, consistent, and free of security issues. Triggers on "validate guard", "check governance quality", "audit CLAUDE.md", or "/validate-guard".
---

# Validate Guard

Validate existing AI Project Guard governance files in the current project.

This skill is read-only guidance for Claude Code. As the CLI matures, prefer the CLI's `validate` command when available. Until then, use this workflow to inspect generated files safely.

## When to Use

- User wants to verify governance files after running `ai-project-guard init`.
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
.claude/commands/daily-start.md
.claude/commands/daily-review.md
.claude/commands/diagnose.md
.claude/commands/quick-bugfix.md
.claude/commands/risky-plan.md
.claude/commands/verify.md
.claude/commands/requirement-clarify.md
.claude/workflows/README.md
.claude/workflows/workflow-diagnosis.md
.claude/workflows/workflow-bugfix.md
.claude/workflows/workflow-new-feature.md
.claude/workflows/workflow-dangerous-module.md
.claude/workflows/workflow-requirement-clarify.md
```

### 2. Content quality checks

| Check | What to look for |
|-------|-----------------|
| Dangerous modules | Must not be empty or contain only `TODO` |
| Lessons | Must not be entirely generic template text |
| Local context | Must contain current branch/focus |
| Contract Guard | Must list actual project contracts, not only `TODO` |
| Test commands | Must look plausible and project-specific |

### 3. Reference integrity

- Workflows that reference agents should list agent names that exist.
- Commands that reference workflows should list workflow files that exist.

### 4. Secret detection

Scan governance files for unredacted values following:

- `password=`
- `secret=`
- `token=`
- `accessKey=`
- `privateKey=`
- `apiKey=`
- Long base64-like strings
- Signed URLs with credentials in query parameters

### 5. Tier rule presence

Check that workflows reference Tier 0-3 and that Tier 3 requires planning/human confirmation.

### 6. Agent permission review

Check that review/guardian agents are read-only and that fix/implementation agents specify stop conditions.

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

Then recommend one of:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run
```

or, if CLI validation exists in the installed version:

```bash
ai-project-guard validate
```

## Rules

- Read-only. Validate only, do not modify governance files.
- If secrets are found, report file and line number but do not print the value.
- Suggest manual edits or rerunning the CLI with updated answers.
