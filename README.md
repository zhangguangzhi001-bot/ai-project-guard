# AI Project Guard

Make legacy codebases governable by AI coding agents.

AI Project Guard gives AI coding agents project-specific context, architecture boundaries, dangerous-module guards, historical lessons, and risk-tiered workflows so they can work safely inside existing codebases.

## Installation

Installation differs by harness. If you use more than one, install AI Project Guard separately for each one.

### Claude Code

AI Project Guard is available as a Claude Code plugin.

**Install from marketplace:**

Register the marketplace:

```text
/plugin marketplace add zhangguangzhi001-bot/ai-project-guard-marketplace
```

Install the plugin:

```text
/plugin install ai-project-guard@ai-project-guard-marketplace
```

**Install directly from GitHub:**

```text
/plugin install zhangguangzhi001-bot/ai-project-guard
```

**Install via npm (CLI):**

```bash
npm install -g github:zhangguangzhi001-bot/ai-project-guard
cd your-legacy-project
ai-project-guard init --profile claude-code
```

### Cursor

In Cursor Agent chat, install from source:

```text
/add-plugin zhangguangzhi001-bot/ai-project-guard
```

Or search for "ai-project-guard" in the plugin marketplace.

### Gemini CLI

Install the extension:

```bash
gemini extensions install https://github.com/zhangguangzhi001-bot/ai-project-guard
```

Update later:

```bash
gemini extensions update ai-project-guard
```

### Codex CLI

Register the marketplace:

```text
/plugin marketplace add zhangguangzhi001-bot/ai-project-guard-marketplace
```

Install the plugin:

```text
/plugin install ai-project-guard@ai-project-guard-marketplace
```

### GitHub Copilot CLI

Register the marketplace:

```bash
copilot plugin marketplace add zhangguangzhi001-bot/ai-project-guard-marketplace
```

Install the plugin:

```bash
copilot plugin install ai-project-guard@ai-project-guard-marketplace
```

### Factory Droid

Register the marketplace:

```bash
droid plugin marketplace add https://github.com/zhangguangzhi001-bot/ai-project-guard
```

Install the plugin:

```bash
droid plugin install ai-project-guard@ai-project-guard
```

## What it does

Once installed, AI Project Guard provides skills and commands to initialize AI governance files in any project:

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
| `init-guard` | `/init-guard` or "initialize governance" | Interactive project scan and governance file generation |
| `scan-guard` | `/scan-guard` or "scan for risk" | Read-only project risk scan — reports dangerous modules, legacy code, contracts |
| `validate-guard` | `/validate-guard` or "check governance quality" | Validates existing governance files for completeness and security |

## Why

AI coding agents are powerful, but legacy projects are full of hidden rules:

- deprecated modules that must not be deleted
- status strings shared by database, backend, frontend, and tests
- placeholder tests that give false confidence
- external API quirks that look like bugs
- old and new business flows living side by side
- security/config assumptions that are not obvious from code

AI Project Guard helps teams encode those rules into AI-readable governance files.

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
