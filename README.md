# AI Project Guard

Make legacy codebases governable by AI coding agents.

让历史项目 / 存量项目变得更适合 AI Coding Agent 安全协作。

> English | [中文](#中文说明)

---

## English

AI Project Guard is **CLI-first**. Its core job is to run inside any existing project and generate AI-readable governance files: `CLAUDE.md`, architecture context, lessons learned, dangerous-module guards, commands, agents, and workflows.

The Claude Code plugin/skills are optional convenience entry points. They help Claude Code discover and use the CLI correctly, but the reusable core logic lives in the CLI.

### Recommended usage

Use these commands from the root directory of the project you want to initialize.

#### Which command should I use?

| Situation | Use this command | Why |
|-----------|------------------|-----|
| First time trying AI Project Guard in a project | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run` | Safest option. Shows what would be generated without writing files. |
| You reviewed the dry-run output and want to generate files | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code` | Runs interactive questions and writes governance files. |
| You want repeatable / CI-friendly initialization | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --answers ./answers.json` | Uses a JSON answers file instead of interactive prompts. |
| You use the tool often across many projects | `npm install -g github:zhangguangzhi001-bot/ai-project-guard` then `ai-project-guard init --profile claude-code` | Installs the CLI once so you can run it anywhere. |
| You are using Claude Code and want workflow guidance | `/plugin install zhangguangzhi001-bot/ai-project-guard` then `/init-guard` | Installs optional Claude Code skills that guide CLI usage. |

#### Recommended first run

```bash
cd your-legacy-project
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run
```

If the preview looks correct, run the real initialization:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code
```

#### Non-interactive initialization

Use this when you want stable, repeatable output:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init \
  --profile claude-code \
  --answers ./answers.json
```

Add `--dry-run` if you only want to preview the result:

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init \
  --profile claude-code \
  --answers ./answers.json \
  --dry-run
```

See `examples/claude-code-basic/answers.example.json` for the supported fields.

#### Global install

```bash
npm install -g github:zhangguangzhi001-bot/ai-project-guard
cd your-legacy-project
ai-project-guard init --profile claude-code --dry-run
ai-project-guard init --profile claude-code
```

### Claude Code plugin

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

### Generated files

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

### Skills

When installed as a Claude Code plugin, these skills are available:

| Skill | Trigger | What it does |
|-------|---------|-------------|
| `init-guard` | `/init-guard` or "initialize governance" | Guides Claude Code to run the CLI safely and initialize governance files |
| `scan-guard` | `/scan-guard` or "scan for risk" | Read-only risk scan guidance for dangerous modules, legacy code, and contracts |
| `validate-guard` | `/validate-guard` or "check governance quality" | Read-only validation guidance for existing governance files |

### Why

AI coding agents are powerful, but legacy projects are full of hidden rules:

- deprecated modules that must not be deleted
- status strings shared by database, backend, frontend, and tests
- placeholder tests that give false confidence
- external API quirks that look like bugs
- old and new business flows living side by side
- security/config assumptions that are not obvious from code

AI Project Guard helps teams encode those rules into AI-readable governance files.

### Safety behavior

- `--dry-run` prints the generated file plan and writes nothing.
- Existing generated files block writes unless `--force` is passed.
- Generated paths are restricted to root `CLAUDE*.md` files and `.claude/agents`, `.claude/commands`, `.claude/workflows` Markdown files.
- The CLI does not modify target business code.
- Prompts ask for names of sensitive fields/systems only, not real secret values.

### Future marketplace installation

After a dedicated marketplace repository exists, installation can follow the Superpowers-style marketplace flow:

```text
/plugin marketplace add zhangguangzhi001-bot/ai-project-guard-marketplace
/plugin install ai-project-guard@ai-project-guard-marketplace
```

Until then, use direct GitHub plugin install or the CLI-first `npx github:...` command above.

### Privacy

All scanning is local by default. No code is uploaded. Secrets are never written into generated files.

### Development

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

---

## 中文说明

AI Project Guard 是一个 **CLI 优先（CLI-first）** 的工具。它的核心能力是在任意历史项目 / 存量项目中运行，并生成 AI 可读取的项目治理文件，例如 `CLAUDE.md`、架构上下文、历史经验、危险模块清单、commands、agents 和 workflows。

Claude Code 插件和 skills 是可选的便捷入口。它们帮助 Claude Code 发现并正确使用 CLI，但可复用的核心逻辑仍然在 CLI 中。

### 推荐用法

以下命令都应该在“你想初始化的目标项目根目录”中执行。

#### 什么情况下用什么命令？

| 使用场景 | 使用命令 | 说明 |
|---------|----------|------|
| 第一次在某个项目里试用 | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run` | 最安全，只预览将生成哪些文件，不会写入。 |
| 看过预览后，确认要生成文件 | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code` | 进入交互式问答，并写入治理文件。 |
| 想在 CI / 脚本 / 多项目中重复初始化 | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --answers ./answers.json` | 使用 JSON 答案文件，不需要人工逐个回答。 |
| 经常在多个项目里使用 | `npm install -g github:zhangguangzhi001-bot/ai-project-guard` 后执行 `ai-project-guard init --profile claude-code` | 全局安装一次，之后任何项目都能直接用。 |
| 正在 Claude Code 中，希望 Claude 帮你按流程操作 | `/plugin install zhangguangzhi001-bot/ai-project-guard` 后执行 `/init-guard` | 安装可选 skills，引导 Claude Code 正确使用 CLI。 |

#### 推荐第一次使用流程

```bash
cd your-legacy-project
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run
```

如果预览结果没问题，再真正生成：

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code
```

#### 非交互初始化

如果你希望输出稳定、可重复，可以准备一个 `answers.json`：

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init \
  --profile claude-code \
  --answers ./answers.json
```

如果只是预览：

```bash
npx github:zhangguangzhi001-bot/ai-project-guard init \
  --profile claude-code \
  --answers ./answers.json \
  --dry-run
```

支持字段可参考：`examples/claude-code-basic/answers.example.json`。

#### 全局安装

```bash
npm install -g github:zhangguangzhi001-bot/ai-project-guard
cd your-legacy-project
ai-project-guard init --profile claude-code --dry-run
ai-project-guard init --profile claude-code
```

### Claude Code 插件

Claude Code 用户也可以安装配套插件：

```text
/plugin install zhangguangzhi001-bot/ai-project-guard
```

然后使用 skills：

```text
/init-guard
/scan-guard
/validate-guard
```

插件不会替代 CLI。它的作用是给 Claude Code 提供工作流指导：什么时候运行 CLI、应该询问哪些问题、如何避免在历史项目中进行不安全的初始化。

### 生成文件

Claude Code profile 会生成：

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

### Skills

安装为 Claude Code 插件后，会提供这些 skills：

| Skill | 触发方式 | 作用 |
|-------|---------|------|
| `init-guard` | `/init-guard` 或 “initialize governance” | 引导 Claude Code 安全运行 CLI，并初始化治理文件 |
| `scan-guard` | `/scan-guard` 或 “scan for risk” | 只读风险扫描指导：危险模块、legacy 代码、契约风险 |
| `validate-guard` | `/validate-guard` 或 “check governance quality” | 只读校验指导：检查已有治理文件的完整性和安全性 |

### 为什么需要它

AI Coding Agent 很强，但历史项目通常有很多隐藏规则：

- deprecated 模块看起来没用，但不能随意删除
- 状态字符串被数据库、后端、前端和测试共同依赖
- 占位测试会制造虚假的安全感
- 外部 API 的兼容逻辑看起来像 bug，但实际不能改
- 新旧业务链路同时存在
- 权限、配置、安全假设不容易从代码里直接看出来

AI Project Guard 帮助团队把这些规则沉淀成 AI 可读取、可遵守的治理文件。

### 安全行为

- `--dry-run` 只打印将要生成的文件计划，不写入文件。
- 如果目标文件已存在，默认拒绝覆盖；只有传入 `--force` 才会覆盖。
- 生成路径限制在根目录的 `CLAUDE*.md` 和 `.claude/agents`、`.claude/commands`、`.claude/workflows` Markdown 文件内。
- CLI 不修改目标项目的业务代码。
- 交互问题只询问敏感字段 / 外部系统名称，不要求填写真实密钥值。

### 未来 marketplace 安装方式

等独立 marketplace 仓库准备好后，可以使用类似 Superpowers 的安装方式：

```text
/plugin marketplace add zhangguangzhi001-bot/ai-project-guard-marketplace
/plugin install ai-project-guard@ai-project-guard-marketplace
```

在此之前，请优先使用 GitHub 直接插件安装，或者使用 CLI-first 的 `npx github:...` 命令。

### 隐私

默认只在本地扫描，不上传代码。生成文件中不会写入真实 secrets。

### 开发命令

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

运行单个测试文件：

```bash
npm test -- tests/generators/claude-generator.test.ts
```
