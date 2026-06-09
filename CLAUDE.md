# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repository contains a product requirements document (`ai-project-guard-prd.md`) and a v0.1 TypeScript/Node CLI implementation for the planned `AI Project Guard` open source tool. There are no Cursor rules or Copilot instructions.

## Product purpose

`AI Project Guard` is planned as a local-first CLI that initializes AI coding governance files for existing/legacy projects. Its primary output is not business code changes, but project-specific guard rails such as `CLAUDE.md`, architecture context, lessons learned, dangerous module lists, workflows, commands, and agents.

Core product constraints from the PRD:

- Default to local scanning; do not upload code for analysis.
- Do not directly modify target project business code.
- Do not write real secret values into generated files.
- Do not silently overwrite existing governance files.
- MVP focuses on Claude Code output before expanding to Cursor, Copilot, Gemini, and generic agents.

## Common commands

Development commands from `package.json`:

```bash
npm install
npm run build
npm run dev -- init --profile claude-code --dry-run
npm run typecheck
npm run lint
npm run format
npm test
npm run test:watch
```

Run one test file:

```bash
npm test -- tests/generators/claude-generator.test.ts
```

Current implemented CLI surface:

```bash
ai-project-guard init
ai-project-guard init --profile claude-code
ai-project-guard init --profile claude-code --dry-run
ai-project-guard init --profile claude-code --output ./target-project
ai-project-guard init --profile claude-code --output ./target-project --force
ai-project-guard init --profile claude-code --no-scan
```

Planned later commands from the PRD: `scan`, `validate`, `doctor`, `local`, `template list`, and `template eject`.

## Planned implementation architecture

The PRD proposes a TypeScript-style CLI organized around these major areas:

```text
src/
  index.ts
  commands/      # CLI command entry points: init, scan, validate, doctor, local
  scanners/      # stack, git, test, language/framework, risk, and secret detection
  generators/    # governance file generation for Claude and future targets
  prompts/       # interactive knowledge collection prompts
  validators/    # file completeness, reference integrity, secret, and quality checks
  schemas/        # ProjectProfile, ScannerResult, TemplateContext models
  utils/          # filesystem, path, logger helpers

templates/
  claude-code/   # CLAUDE*.md, agents, commands, workflows templates
  generic/       # future generic AGENTS.md-style output

profiles/        # generic, claude-code, spring-vue, node-react, python-django
examples/        # fixture/example projects for different stacks
tests/           # scanner, generator, validator, CLI snapshot tests
```

The central internal data model is `ProjectProfile`, which aggregates stack detection, architecture facts, contracts, risks, tests, and local branch context. Scanners and interactive prompts populate this profile; generators render it into target-specific governance files; validators check generated output.

## Planned command responsibilities

- `init`: detect project root, scan stack and structure, ask interactive questions, generate governance files, and prompt for review/validation.
- `scan`: inspect a target project without writing files; report detected stack, build tools, tests, dangerous-module candidates, legacy candidates, contracts, and suggested questions.
- `validate`: check required files, `.claude` structure, workflow-to-agent references, command plausibility, dangerous modules, lessons, local context, contract guard coverage, and possible secrets.
- `doctor`: assess governance quality beyond existence checks, including empty dangerous modules, template-only lessons, stale local context, missing Tier rules, missing command stop conditions, and overly broad agent permissions.
- `local`: generate or update `CLAUDE.local.md` with current branch/iteration context.
- `template list` / `template eject`: inspect and export built-in templates for customization.

## Generated governance file model

The Claude Code profile should generate:

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md
.claude/agents/*
.claude/commands/*
.claude/workflows/*
```

`CLAUDE.md` is the top-level project rule file. `CLAUDE.architecture.md` stores stable architecture facts. `CLAUDE.lessons.md` stores historical mistakes and AI mis-edit patterns. `CLAUDE.local.md` stores temporary branch/iteration context and should not be treated as permanent architecture.

Default planned agents:

- `architecture-reviewer` — read-only architecture analysis before coding.
- `implementation-engineer` — code changes only after an approved plan.
- `code-reviewer` — read-only code review and risk identification.
- `fix-bug` — root-cause analysis and minimal fixes.
- `refactor-guardian` — read-only guard against over-refactoring and compatibility deletion.
- `lessons-curator` — suggest lessons after development.

Default planned commands include `/apg-daily-start`, `/apg-daily-review`, `/apg-diagnose`, `/apg-quick-bugfix`, `/apg-risky-plan`, `/apg-verify`, and `/apg-requirement-clarify`.

## Risk model and workflow tiers

The planned workflows route tasks by risk:

- Tier 0: documentation, comments, UI copy, and non-logic style changes.
- Tier 1: low-risk single-file bug fixes outside contracts, databases, external systems, auth, state machines, and dangerous modules.
- Tier 2: API/data contracts and frontend-backend linkage, including controllers, DTO/VO, TypeScript types, repositories/mappers, response structure, and query/write behavior.
- Tier 3: dangerous modules, external systems, state machines, migrations, legacy/compatibility layers, auth/security, payment/order/matching flows, LLM JSON parsing, and highly coupled frontend areas.

Tier 3 work must be analyzed first, planned before implementation, reviewed by a human when required, code-reviewed after implementation, and verified with focused checks.

## Contract Guard concepts

Generated workflows must preserve project-specific contracts such as:

- API response envelopes and API prefixes.
- Status strings shared by database, backend, frontend, tests, and historical data.
- DTO/VO/TypeScript API type compatibility.
- Database migrations and schema contracts.
- Manual SQL / mapper contracts.
- External authentication and signed URL behavior.
- LLM output parsing tolerance.
- Legacy modules and compatibility layers.
- Permission/auth assumptions.

## Security and privacy requirements

Secret handling is a product requirement, not optional polish:

- Scan results may mention that a sensitive field or file exists, but generated files must not contain real values.
- Secret-like fields include password, secret, token, access key, private key, and signed URL values.
- Existing files must not be overwritten without user confirmation; if overwriting is supported, back up first.
- `--dry-run` should preview output without writing.

## MVP scope

The first deliverable is intentionally narrow:

1. `init` command.
2. Claude Code profile.
3. Interactive project questions.
4. Generation of `CLAUDE*.md` files.
5. Generation of default agents, commands, and workflows.
6. `--dry-run`.
7. No silent overwrite of existing files.
8. README and at least one example.

Do not prioritize deep AST analysis, multi-AI target generation, intelligent merge, cloud scanning, or automatic business-code modification before the MVP is in place.

## Testing expectations from the PRD

When tests are added, cover these categories:

- Scanner unit tests using fixture projects for stack/build/test/risk detection.
- Template rendering tests for generated variables and expected files.
- Validator tests for missing files, broken references, empty risk/lesson sections, and secret detection.
- CLI snapshot tests for `init` output structure.

Focused test commands should be documented here once the test runner and package scripts exist.
