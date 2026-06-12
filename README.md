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
| You reviewed the dry-run output and want to generate files | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code` | Auto-scans the project and writes governance files without asking questions. |
| You want to manually supplement key context | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --interactive` | Asks a short questionnaire before writing files. |
| You want the complete governance questionnaire | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --full` | Asks all detailed architecture, contract, risk, test, and local-context questions. |
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

#### CLI command reference

Current implemented command:

```bash
ai-project-guard init [options]
```

`init` scans the target project locally, builds a project profile, and generates Claude Code governance files. It does not modify business source code.

| Option | When to use it | Example |
|--------|----------------|---------|
| `--profile claude-code` | Required profile for v0.1. Other profiles are planned but not implemented yet. | `init --profile claude-code` |
| `--output <dir>` | Initialize a project directory other than the current working directory. | `init --profile claude-code --output ../legacy-app` |
| `--dry-run` | First run, CI preview, or whenever you want to inspect generated paths before writing. | `init --profile claude-code --dry-run` |
| `--force` | Regenerate APG governance files after reviewing conflicts. Use carefully; it overwrites existing generated governance files. | `init --profile claude-code --force` |
| `--answers <file>` | Repeatable non-interactive setup with a reviewed JSON profile. Best for teams and CI. | `init --profile claude-code --answers ./answers.json` |
| `--language zh` | Generate Chinese Markdown. This is the default. | `init --profile claude-code --language zh` |
| `--language en` | Generate English Markdown. | `init --profile claude-code --language en` |
| `--interactive` | Auto-scan first, then answer a short questionnaire to supplement missing context. | `init --profile claude-code --interactive` |
| `--full` | Use when initializing important legacy systems and you want to capture full architecture, contracts, risks, tests, and local context. | `init --profile claude-code --full` |
| `--no-scan` | Skip lightweight local scanning and generate TODO-based starter governance files. Use for empty projects or when scanning is not desired. | `init --profile claude-code --no-scan` |

Common scenarios:

```bash
# Safest first run: preview only
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run

# Generate governance files in the current project after reviewing dry-run output
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code

# Generate English governance files
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --language en

# Initialize a different target project from outside that project
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --output ../legacy-java-system --dry-run

# Team/CI-friendly initialization from an answers file
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --answers ./answers.json --dry-run

# Regenerate after reviewing existing-file conflicts
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --force
```

#### Generated Claude Code command usage

After initialization, use the generated slash commands inside Claude Code:

| Command | Best scenario |
|---------|---------------|
| `/apg-daily-start` | Start a work session by reading project governance context first. |
| `/apg-daily-review` | End-of-day review: summarize changes, risks, lessons, and follow-ups. |
| `/apg-diagnose` | Unknown bug or unclear failure; diagnose before editing. |
| `/apg-quick-bugfix` | Low-risk, focused bug fix outside dangerous modules and contracts. |
| `/apg-risky-plan` | Any Tier 2/Tier 3 work: API/data contracts, dangerous modules, migrations, auth, external systems, state machines. |
| `/apg-verify` | Run or plan focused verification using the project’s real build/test commands. |
| `/apg-requirement-clarify` | Turn vague product or business requests into explicit requirements before coding. |

For Java/Maven/Gradle projects, APG also generates `/apg-java-release-audit` and related audit agents/workflow.

Common Java audit examples:

```text
/apg-java-release-audit round1
/apg-java-release-audit round2
/apg-java-release-audit round3
/apg-java-release-audit round4
/apg-java-release-audit round5
/apg-java-release-audit archive
/apg-java-release-audit compare 2026-06-01 2026-06-12
/apg-java-release-audit trend 2026-06-01 2026-06-12
```

Use `round1` first for large vendor systems: it builds the risk map before making a release judgment. Use `round4` only after enough evidence exists. Use `archive`, `compare`, and `trend` when you want dated audit reports and quality trend analysis.

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

The Claude Code profile is project-aware. It always generates the base governance files, then adds optional governance packs when local scan evidence matches the current project.

Base files:

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md
.claude/agents/apg-architecture-reviewer.md
.claude/agents/apg-implementation-engineer.md
.claude/agents/apg-code-reviewer.md
.claude/agents/apg-fix-bug.md
.claude/agents/apg-refactor-guardian.md
.claude/agents/apg-lessons-curator.md
.claude/commands/apg-daily-start.md
.claude/commands/apg-daily-review.md
.claude/commands/apg-diagnose.md
.claude/commands/apg-quick-bugfix.md
.claude/commands/apg-risky-plan.md
.claude/commands/apg-verify.md
.claude/commands/apg-requirement-clarify.md
.claude/workflows/apg-workflows.md
.claude/workflows/apg-workflow-diagnosis.md
.claude/workflows/apg-workflow-bugfix.md
.claude/workflows/apg-workflow-new-feature.md
.claude/workflows/apg-workflow-dangerous-module.md
.claude/workflows/apg-workflow-requirement-clarify.md
```

Java release-audit pack, generated only when Java/Maven/Gradle evidence is detected:

```text
.claude/commands/apg-java-release-audit.md
.claude/agents/apg-java-risk-module-auditor.md
.claude/agents/apg-financial-release-auditor.md
.claude/agents/apg-release-blocker-judge.md
.claude/workflows/apg-workflow-java-release-audit.md
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
| 看过预览后，确认要生成文件 | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code` | 自动扫描项目并写入治理文件，不再强制提问。 |
| 想手动补充关键上下文 | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --interactive` | 写入前只问少量关键问题。 |
| 想完整确认所有治理细节 | `npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --full` | 询问完整的架构、契约、风险、测试和本地上下文问题。 |
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

#### CLI 命令使用手册

当前已实现命令：

```bash
ai-project-guard init [options]
```

`init` 会在本地扫描目标项目，生成项目画像，并输出 Claude Code 治理文件。它不会修改业务源码。

| 参数 | 适用场景 | 示例 |
|------|----------|------|
| `--profile claude-code` | v0.1 必传/默认使用的生成 profile。其他 profile 仍是规划能力。 | `init --profile claude-code` |
| `--output <dir>` | 初始化当前目录之外的目标项目。 | `init --profile claude-code --output ../legacy-app` |
| `--dry-run` | 第一次使用、CI 预览、写入前确认文件清单。不会写文件。 | `init --profile claude-code --dry-run` |
| `--force` | 已确认冲突文件可以覆盖后再使用。会覆盖已有生成治理文件，需谨慎。 | `init --profile claude-code --force` |
| `--answers <file>` | 团队/CI/批量项目使用，基于已审核的 JSON 答案文件稳定生成。 | `init --profile claude-code --answers ./answers.json` |
| `--language zh` | 生成中文 Markdown。默认值。 | `init --profile claude-code --language zh` |
| `--language en` | 生成英文 Markdown。 | `init --profile claude-code --language en` |
| `--interactive` | 先自动扫描，再用短问卷补充关键上下文。 | `init --profile claude-code --interactive` |
| `--full` | 初始化重要存量系统时使用，完整确认架构、契约、风险、测试、本地上下文。 | `init --profile claude-code --full` |
| `--no-scan` | 不做轻量扫描，只生成带 TODO 的起始治理文件。适合空项目或不希望扫描的场景。 | `init --profile claude-code --no-scan` |

常见场景：

```bash
# 第一次使用：只预览，不写入
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --dry-run

# 确认 dry-run 结果后，在当前项目生成治理文件
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code

# 生成英文治理文件
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --language en

# 从外部目录初始化某个目标项目
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --output ../legacy-java-system --dry-run

# 团队/CI 使用答案文件稳定生成
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --answers ./answers.json --dry-run

# 已确认冲突文件可以覆盖后重新生成
npx github:zhangguangzhi001-bot/ai-project-guard init --profile claude-code --force
```

#### 生成后的 Claude Code 命令怎么用

初始化后，在 Claude Code 中可以使用生成的 slash commands：

| 命令 | 适用场景 |
|------|----------|
| `/apg-daily-start` | 每天开始工作前，先读取项目治理上下文。 |
| `/apg-daily-review` | 每天结束时，总结变更、风险、经验和后续事项。 |
| `/apg-diagnose` | 问题原因不明时，先诊断再决定是否修改。 |
| `/apg-quick-bugfix` | 低风险、聚焦 bugfix，不涉及危险模块和契约。 |
| `/apg-risky-plan` | Tier 2/Tier 3 工作：API/数据契约、危险模块、migration、认证、外部系统、状态机等。 |
| `/apg-verify` | 使用项目真实构建/测试命令做聚焦验证。 |
| `/apg-requirement-clarify` | 需求不清晰时，先澄清业务规则和验收标准。 |

如果检测到 Java / Maven / Gradle 项目，还会生成 `/apg-java-release-audit` 以及配套审计 agents/workflow。

Java 上线审计常见用法：

```text
/apg-java-release-audit round1
/apg-java-release-audit round2
/apg-java-release-audit round3
/apg-java-release-audit round4
/apg-java-release-audit round5
/apg-java-release-audit archive
/apg-java-release-audit compare 2026-06-01 2026-06-12
/apg-java-release-audit trend 2026-06-01 2026-06-12
```

大型供应商系统建议先用 `round1` 画风险地图，不要急着下上线结论；证据充分后再用 `round4` 做上线门禁判断。需要按年月日沉淀报告并做质量趋势时，使用 `archive`、`compare`、`trend`。

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

Claude Code profile 会根据当前项目自动生成治理文件。所有项目都会生成基础治理文件；如果本地扫描发现 Java / Maven / Gradle 证据，则额外生成 Java 上线审计治理包。

基础文件：

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md
.claude/agents/apg-architecture-reviewer.md
.claude/agents/apg-implementation-engineer.md
.claude/agents/apg-code-reviewer.md
.claude/agents/apg-fix-bug.md
.claude/agents/apg-refactor-guardian.md
.claude/agents/apg-lessons-curator.md
.claude/commands/apg-daily-start.md
.claude/commands/apg-daily-review.md
.claude/commands/apg-diagnose.md
.claude/commands/apg-quick-bugfix.md
.claude/commands/apg-risky-plan.md
.claude/commands/apg-verify.md
.claude/commands/apg-requirement-clarify.md
.claude/workflows/apg-workflows.md
.claude/workflows/apg-workflow-diagnosis.md
.claude/workflows/apg-workflow-bugfix.md
.claude/workflows/apg-workflow-new-feature.md
.claude/workflows/apg-workflow-dangerous-module.md
.claude/workflows/apg-workflow-requirement-clarify.md
```

Java 上线审计治理包，仅在检测到 Java / Maven / Gradle 证据时生成：

```text
.claude/commands/apg-java-release-audit.md
.claude/agents/apg-java-risk-module-auditor.md
.claude/agents/apg-financial-release-auditor.md
.claude/agents/apg-release-blocker-judge.md
.claude/workflows/apg-workflow-java-release-audit.md
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
