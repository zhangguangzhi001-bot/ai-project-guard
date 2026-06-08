# AI Project Guard

Make legacy codebases governable by AI coding agents.

AI Project Guard initializes project-specific AI governance files so Claude Code can understand architecture boundaries, dangerous modules, historical lessons, verification rules, and human review points before changing code.

## Status

This repository is implementing the v0.1 MVP from `ai-project-guard-prd.md`.

Implemented scope is intentionally narrow:

- `init` command.
- Claude Code profile.
- Interactive project knowledge collection.
- Generation of `CLAUDE*.md` and `.claude/*` governance files.
- `--dry-run`.
- No silent overwrite unless `--force` is explicit.

Planned later:

- `scan`.
- `validate`.
- `doctor`.
- `local`.
- Multiple AI tool targets.
- Custom templates.

## Quick start

```bash
npm install
npm run dev -- init --profile claude-code --dry-run
npm run dev -- init --profile claude-code --output ./target-project
```

After publishing, the intended usage is:

```bash
npx ai-project-guard init --profile claude-code
```

## Generated files

The Claude Code profile generates:

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

## Safety behavior

- `--dry-run` prints the generated file plan and writes nothing.
- Existing generated files block writes unless `--force` is passed.
- Generated paths are restricted to root `CLAUDE*.md` files and `.claude/agents`, `.claude/commands`, `.claude/workflows` Markdown files.
- The CLI does not modify target business code.
- Prompts ask for names of sensitive fields/systems only, not real secret values.

## Development commands

```bash
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

## Privacy

AI Project Guard is local-first. The MVP does not upload code, send telemetry, or call external analysis services.

## Limitations

The v0.1 MVP does not perform deep code scanning, AST analysis, intelligent merging, or multi-tool configuration generation. Generated governance files improve AI context but do not replace human review for high-risk changes.
