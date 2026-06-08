---
name: init-guard
description: Use when the user wants to initialize AI governance files for a legacy or existing project. Guides Claude Code to use the AI Project Guard CLI safely. Triggers on "init guard", "initialize governance", "setup CLAUDE.md", "add guardrails to project", or "/init-guard".
---

# Init Guard

Guide Claude Code through using the **AI Project Guard CLI** to initialize governance files in the current project.

This skill is a workflow entry point. The CLI is the source of truth for generation logic.

## When to Use

- User enters a legacy project and wants to set up Claude Code governance files.
- User asks for "初始化 AI 治理", "生成 CLAUDE.md", "add guardrails", "setup project guard".
- User runs `/init-guard` or says "init guard".

## Core Principle

Prefer the CLI command over hand-generating files:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code
```

For preview-only mode:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run
```

If the CLI is already installed globally:

```bash
ai-project-guard init --profile claude-code
```

## Workflow

### Step 1: Confirm target project

Before running anything, confirm:

- The current directory is the target project root.
- The user wants governance files written into this project.
- Whether to run `--dry-run` first.

### Step 2: Run dry-run first when unsure

Recommended first command:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run
```

This previews generated files and detects conflicts without writing.

### Step 3: Run init

If the user approves, run:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code
```

The CLI will ask project-specific questions about:

1. Project name
2. One-sentence project summary
3. Current core business flow
4. Legacy path / compatibility flow that still matters
5. Dangerous modules/files
6. Status strings or business constants that must not be renamed
7. API contracts that must not change
8. Sensitive external systems (names only, never secrets)
9. Real test/build commands
10. Placeholder or untrusted tests
11. Current branch name and focus
12. Changes that require human review

### Step 4: Review generated files

After generation, inspect the generated file list:

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md
.claude/agents/*
.claude/commands/*
.claude/workflows/*
```

Call out any remaining `TODO: human review required` sections.

## Safety Rules

- Do not manually duplicate the CLI's template logic unless the CLI cannot run.
- Never include real secret values or tokens in generated files.
- Do not overwrite existing governance files unless the user explicitly requests `--force`.
- Only initialize governance files; do not modify target business code.

## Required Output

After completion, report:

1. Command run
2. Files generated or conflicts found
3. Remaining TODOs
4. Recommended next step: `/validate-guard`
