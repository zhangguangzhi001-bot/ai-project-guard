# Claude Code basic example

This example documents a minimal v0.1 init run.

Sample command:

```bash
ai-project-guard init --profile claude-code --output ./legacy-project
```

Sample answers:

- Project name: Legacy Shop
- Summary: Existing commerce app with old and new order flows.
- Core business flow: Order creation and fulfillment.
- Main path: `src/orders/current`.
- Legacy path: `src/orders/legacy`.
- Dangerous modules: `src/auth`, `db/migration`, `src/payments`.
- Status contracts: `PENDING`, `PAID`, `FULFILLED`, `CANCELLED`.
- API contracts: `ApiResponse<T>`, `/api` prefix.
- Test commands: `npm test`, `npm run typecheck`.

Expected generated tree:

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md
.claude/agents/*
.claude/commands/*
.claude/workflows/*
```
