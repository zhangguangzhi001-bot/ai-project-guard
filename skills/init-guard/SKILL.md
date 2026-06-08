---
name: init-guard
description: Use when the user wants to initialize AI governance files (CLAUDE.md, architecture, lessons, dangerous modules, workflows) for a legacy or existing project. Triggers on "init guard", "initialize governance", "setup CLAUDE.md", "add guardrails to project", or "/init-guard".
---

# Init Guard

Initialize AI coding governance files so Claude Code understands project boundaries, dangerous modules, contracts, and risk tiers before editing code.

## When to Use

- User enters a legacy project and wants to set up Claude Code governance files.
- User asks for "初始化 AI 治理", "生成 CLAUDE.md", "add guardrails", "setup project guard".
- User runs `/init-guard` or says "init guard".

## What This Skill Does

Guides Claude Code through creating a complete AI governance layer in the current project:

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

## Core Pattern

### Step 1: Lightweight scan

Quickly scan the project root for:

- `package.json`, `pom.xml`, `build.gradle` → stack hints
- `package.json` scripts → test/build command candidates
- Existing `CLAUDE.md` or `.claude/` → conflict detection
- `src/` directories → module boundaries
- `.git` directory → branch context

Present findings as *advisory suggestions*, not authoritative facts.

### Step 2: Interactive questions

Ask the user these required questions (do not skip):

1. Project name
2. One-sentence project summary
3. Current core business flow (the main path)
4. Legacy path / compatibility flow that still matters
5. Most dangerous modules/files — what should AI be most careful with?
6. Status strings or business constants that must never be renamed
7. API contracts that must not change
8. Sensitive external systems (names only, never secrets)
9. Real test/build commands to verify changes
10. Placeholder or untrusted tests
11. Current branch name and focus
12. Changes that always require human review

### Step 3: Generate governance files

Based on answers, generate each file using the templates described in the sections below.

**Important rules:**
- Never include real secret values or tokens in generated files.
- If a critical answer is blank, write `TODO: human review required`.
- Check for existing files before writing — refuse to overwrite unless the user explicitly confirms.
- Only write allowed governance paths (root `CLAUDE*.md` and `.claude/**/*.md`).

### Step 4: Validation checklist

After generation, verify:

- All required files exist.
- Dangerous modules list is not empty.
- Lessons include at least the 5 common legacy-project lessons.
- Local context includes current branch.
- Contract Guard sections reference the user's actual contracts.

## Required Output

After completion, output:

1. List of generated files
2. Remaining TODOs the user should fill in manually
3. Suggested next command: `/verify`

## Common Mistakes

- Skipping the interactive questions and generating generic files — the files must be project-specific.
- Writing into `CLAUDE.md` without checking it already exists.
- Failing to label dangerous modules clearly enough for future Claude Code sessions.

## Real-World Impact

A properly initialized project gives Claude Code enough context to:

- Avoid deleting legacy compatibility layers.
- Preserve shared status strings and API contracts.
- Escalate dangerous-module changes to Tier 3 with human review.
- Use real test commands instead of placeholder tests.
