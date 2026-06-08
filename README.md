# AI Project Guard

Make legacy codebases governable by AI coding agents.

AI Project Guard is **CLI-first**. Its core job is to run inside any existing project and generate AI-readable governance files: `CLAUDE.md`, architecture context, lessons learned, dangerous-module guards, commands, agents, and workflows.

The Claude Code plugin/skills are optional convenience entry points. They help Claude Code discover and use the CLI correctly, but the reusable core logic lives in the CLI.

## Recommended usage

From any legacy or existing project:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code
```

Preview without writing files:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run
```

Or install globally from GitHub:

```bash
npm install -g github:zhangguangzhi001-bot/ai-project-guard
cd your-legacy-project
ai-project-guard init --profile claude-code
```

## Claude Code plugin

Claude Code users can also install the companion plugin:

```text
/plugin install zhangguangzhi001-bot/ai-project-guard
```

Then use the skills:

```text
/init-guard
/scan-guard
/validate-guard
```

The plugin does not replace the CLI. It gives Claude Code workflow guidance for when to run the CLI, what questions to ask, and how to avoid unsafe initialization in legacy projects.

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

## Skills

When installed as a Claude Code plugin, these skills are available:

| Skill | Trigger | What it does |
|-------|---------|-------------|
| `init-guard` | `/init-guard` or "initialize governance" | Guides Claude Code to run the CLI safely and initialize governance files |
| `scan-guard` | `/scan-guard` or "scan for risk" | Read-only risk scan guidance for dangerous modules, legacy code, and contracts |
| `validate-guard` | `/validate-guard` or "check governance quality" | Read-only validation guidance for existing governance files |

## Why

AI coding agents are powerful, but legacy projects are full of hidden rules:

- deprecated modules that must not be deleted
- status strings shared by database, backend, frontend, and tests
- placeholder tests that give false confidence
- external API quirks that look like bugs
- old and new business flows living side by side
- security/config assumptions that are not obvious from code

AI Project Guard helps teams encode those rules into AI-readable governance files.

## Safety behavior

- `--dry-run` prints the generated file plan and writes nothing.
- Existing generated files block writes unless `--force` is passed.
- Generated paths are restricted to root `CLAUDE*.md` files and `.claude/agents`, `.claude/commands`, `.claude/workflows` Markdown files.
- The CLI does not modify target business code.
- Prompts ask for names of sensitive fields/systems only, not real secret values.

## Future marketplace installation

After a dedicated marketplace repository exists, installation can follow the Superpowers-style marketplace flow:

```text
/plugin marketplace add zhangguangzhi001-bot/ai-project-guard-marketplace
/plugin install ai-project-guard@ai-project-guard-marketplace
```

Until then, use direct GitHub plugin install or the CLI-first `npx github:...` command above.

## Privacy

All scanning is local by default. No code is uploaded. Secrets are never written into generated files.

## Development

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
