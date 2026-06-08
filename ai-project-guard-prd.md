# AI Project Guard 开源项目需求文档 PRD

> 版本：v1.0 草案  
> 日期：2026-06-08  
> 项目暂定名：`AI Project Guard`  
> 备选名称：`Legacy AI Guard` / `AI Codebase Governance Kit` / `Claude Project Guard` / `AI Dev Guardrails`  
> 项目定位：面向历史传统项目的 AI 编码治理初始化工具  
> 目标用户：使用 Claude Code / Cursor / Copilot / Gemini CLI / 其他 AI Coding Agent 的开发团队、架构师、Tech Lead、独立开发者

---

## 1. 背景与目标

### 1.1 背景

大量企业和个人项目并不是从零开始的新项目，而是已经运行多年、不断迭代、存在历史包袱的传统项目。

这类项目通常具备以下特点：

1. **主链路和旧链路并存**
   - 当前业务已经迁移到新服务，但旧表、旧接口、旧 service 仍然不能删除。
   - AI 容易把 deprecated、legacy、old 等文件误认为“可以清理”。

2. **架构事实散落在代码、人脑、会议记录和历史事故里**
   - 哪些模块危险？
   - 哪些字段不能改？
   - 哪些状态字符串是数据库和前端共用契约？
   - 哪些测试只是占位？
   - 哪些外部接口路径看起来拼错但不能修正？
   - 这些知识往往不在 README 里。

3. **AI 编码工具进入项目后缺少边界感**
   - AI 会根据一般工程最佳实践做“看似合理”的重构。
   - 但在存量项目里，“合理重构”可能破坏兼容层、历史数据、外部接口、前端契约。

4. **传统 README 不适合约束 AI**
   - README 通常服务于人类使用者，讲怎么启动、怎么部署。
   - AI 需要的是：架构边界、危险模块、禁止事项、当前主链路、legacy 链路、测试命令、工作流、任务分级、审查规则。

5. **不同 AI 工具都需要类似上下文**
   - Claude Code 使用 `CLAUDE.md`、`.claude/agents`、`.claude/commands`、`.claude/workflows`。
   - Cursor 有 `.cursor/rules`。
   - GitHub Copilot 有 `.github/copilot-instructions.md`。
   - Gemini CLI 有 `GEMINI.md`。
   - 通用 AI Agent 也可以读取 `AGENTS.md`。

因此，需要一个开源工具，帮助开发者把传统项目的“隐性工程知识”初始化为 AI 可读、可执行、可约束的治理文件。

### 1.2 项目目标

`AI Project Guard` 的目标是：

> 通过本地扫描、交互式提问和模板生成，为传统项目自动初始化 AI 编码治理文件，让 AI 编码 Agent 能够理解项目架构、识别危险模块、遵守历史兼容契约、按风险分级工作，并在修改前完成诊断、计划、验证和人工确认。

### 1.3 非目标

| 非目标 | 说明 |
|---|---|
| 不直接修改业务代码 | 只生成 AI 治理文件，不自动重构项目。 |
| 不替代架构师判断 | 工具可以辅助发现风险，但高风险模块仍需人工确认。 |
| 不保证 AI 一定不会犯错 | 生成的是 Guard Rail，不是绝对安全机制。 |
| 不把代码上传云端分析 | 默认本地扫描，保护项目隐私。 |
| 不内置具体公司的业务规则 | 所有业务规则来自扫描结果和用户交互填写。 |
| 不初期支持所有 AI 工具 | MVP 优先支持 Claude Code，后续扩展 Cursor/Copilot/Gemini。 |

---

## 2. 产品定位

### 2.1 一句话定位

> `AI Project Guard` 是一个面向传统项目的 AI 编码治理初始化器，帮助项目生成 `CLAUDE.md`、架构上下文、历史教训、危险模块清单、Agent、Command 和 Workflow，让 AI 在老项目里先理解边界，再安全编码。

### 2.2 核心价值

| 价值 | 描述 |
|---|---|
| 让 AI 更懂项目 | 把项目架构、主链路、旧链路、危险模块写成 AI 可读文件。 |
| 降低误改风险 | 通过 Contract Guard、Dangerous Modules、Forbidden Actions 限制 AI。 |
| 固化历史教训 | 把线上事故、隐性规则、易误改点沉淀到 `CLAUDE.lessons.md`。 |
| 规范 AI 工作流 | 给不同任务建立诊断、计划、修复、审查、复盘流程。 |
| 提升团队协作 | 人类和 AI 使用同一套项目治理知识。 |
| 支持传统项目改造 | 不要求重构项目，只需要初始化治理文件。 |

---

## 3. 用户画像

### 3.1 Tech Lead / 架构负责人

**痛点：**

- 不敢让 AI 大范围改老项目。
- 项目里有很多“不能删但看起来没用”的代码。
- 团队新人和 AI 都不知道历史坑。
- 每次 AI 修改高风险模块都需要重复提醒。

**期望：**

- 一次性把项目红线写清楚。
- AI 每次进入项目自动读取。
- 高风险任务自动升级到计划和人工确认。
- 减少重复解释成本。

### 3.2 存量项目维护者

**痛点：**

- 项目运行多年，文档过期。
- 旧模块和新模块混在一起。
- 测试不完整，AI 容易误判测试通过代表安全。
- 不确定哪些地方可以改、哪些不能改。

**期望：**

- 工具能扫描项目，提示危险区域。
- 通过问答把人脑知识沉淀成文件。
- AI 修 bug 前先诊断，不要一上来改代码。

### 3.3 AI Coding 重度用户

**痛点：**

- Claude Code / Cursor 很强，但在复杂项目里容易过度发挥。
- 不同会话上下文会丢失。
- 需要一套可复用的项目初始化方法。
- 想把自己的 AI 协作方式产品化。

**期望：**

- 快速生成 `.claude/agents`、`.claude/commands`、`.claude/workflows`。
- 可以自定义模板。
- 可以针对不同技术栈生成不同 Guard Rail。

### 3.4 开源项目维护者

**痛点：**

- 外部贡献者不了解项目历史。
- AI 生成的 PR 容易破坏兼容性。
- 维护者 Review 成本高。

**期望：**

- 在仓库内加入 AI contributor guide。
- 约束 AI PR 的修改范围。
- 明确哪些改动必须先提 issue / design doc。

---

## 4. 使用场景

### 4.1 初始化传统项目 AI 治理文件

用户进入一个历史项目：

```bash
cd legacy-project
npx ai-project-guard init
```

工具执行：

1. 扫描项目技术栈。
2. 识别关键目录和高风险模块候选。
3. 询问业务主链路、legacy 模块、状态契约、测试命令。
4. 生成：
   - `CLAUDE.md`
   - `CLAUDE.architecture.md`
   - `CLAUDE.lessons.md`
   - `CLAUDE.local.md`
   - `.claude/agents/*`
   - `.claude/commands/*`
   - `.claude/workflows/*`

### 4.2 初始化 Claude Code 专用工作流

```bash
npx ai-project-guard init --profile claude-code
```

生成 Claude Code 专用结构：

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md

.claude/
  agents/
  commands/
  workflows/
```

### 4.3 扫描项目风险

```bash
npx ai-project-guard scan
```

输出示例：

```text
Detected stack:
- Backend: Java / Spring Boot
- Frontend: Vue / Vite / TypeScript
- Database migration: Flyway
- Data access: MyBatis XML

Potential dangerous modules:
- SecurityConfig.java
- *Scheduler.java
- db/migration/*.sql
- mapper/*.xml
- deprecated services
- external API clients

Potential contracts:
- ApiResponse<T>
- /api prefix
- status strings
- TypeScript API types
```

### 4.4 校验治理文件是否完整

```bash
npx ai-project-guard validate
```

检查：

- 必需文件是否存在。
- workflows 是否引用不存在的 agents。
- commands 是否引用不存在的 workflows。
- 测试命令是否看起来真实存在。
- dangerous modules 是否为空。
- lessons 是否为空。
- 是否包含疑似 token / secret / password。

### 4.5 更新当前分支上下文

```bash
npx ai-project-guard local
```

重新生成或更新：

```text
CLAUDE.local.md
```

用途：

- 当前分支重点。
- 当前活跃模块。
- 当前禁止修改区域。
- 当前未提交变更。
- 当前需要人工 Review 的模块。

### 4.6 生成多 AI 工具配置

后续版本支持：

```bash
npx ai-project-guard init --targets claude,cursor,copilot,gemini
```

生成：

```text
CLAUDE.md
AGENTS.md
.cursor/rules/project-rules.md
.github/copilot-instructions.md
GEMINI.md
```

---

## 5. 功能需求

## 5.1 CLI 初始化功能

### 5.1.1 命令

```bash
npx ai-project-guard init
```

### 5.1.2 参数

| 参数 | 示例 | 说明 |
|---|---|---|
| `--profile` | `--profile claude-code` | 指定生成模板类型。 |
| `--stack` | `--stack spring-vue` | 指定技术栈规则。 |
| `--output` | `--output .` | 指定输出目录，默认当前项目根目录。 |
| `--force` | `--force` | 覆盖已有文件。默认不覆盖。 |
| `--dry-run` | `--dry-run` | 只预览，不写文件。 |
| `--no-scan` | `--no-scan` | 跳过自动扫描，仅交互式生成。 |
| `--targets` | `--targets claude,cursor` | 指定生成目标 AI 工具配置。 |

### 5.1.3 初始化流程

初始化应包含以下步骤：

```text
Step 1: 检测项目根目录
Step 2: 扫描技术栈和项目结构
Step 3: 输出扫描摘要
Step 4: 交互式收集项目关键知识
Step 5: 根据 profile 生成模板变量
Step 6: 写入治理文件
Step 7: 输出人工 Review 清单
Step 8: 提示运行 validate
```

---

## 5.2 项目扫描功能

### 5.2.1 命令

```bash
npx ai-project-guard scan
```

### 5.2.2 扫描范围

| 扫描项 | 说明 |
|---|---|
| 技术栈 | Java/Spring、Node、Vue、React、Python、Go 等。 |
| 构建工具 | Maven、Gradle、npm、pnpm、yarn、poetry、pipenv 等。 |
| 测试框架 | JUnit、Vitest、Jest、Pytest 等。 |
| 数据库迁移 | Flyway、Liquibase、Prisma、Alembic、Rails migration 等。 |
| API 入口 | Controller、routes、router、handler。 |
| 数据访问层 | Mapper、Repository、DAO、Prisma schema。 |
| 配置文件 | application.yml、.env、config、settings。 |
| 外部集成 | OSS/S3、Stripe、OpenAI、Kafka、Redis、第三方 API client。 |
| 危险模块候选 | Auth、Security、Scheduler、Payment、Migration、External Client。 |
| legacy 候选 | deprecated、legacy、old、v1、compat、adapter。 |
| 敏感信息风险 | secret、token、password、accessKey、privateKey。 |

### 5.2.3 技术栈识别规则

#### Java / Spring Boot

识别依据：

```text
pom.xml
build.gradle
src/main/java
@SpringBootApplication
@Controller
@RestController
@Service
@Mapper
application.yml
```

应识别：

- Controller 层。
- Service 层。
- Mapper/Repository 层。
- Flyway/Liquibase migration。
- SecurityConfig。
- Scheduler。
- External API client。

#### Vue / React / TypeScript

识别依据：

```text
package.json
vite.config.ts
src/main.tsx
src/main.ts
src/router
src/api
src/stores
src/components
```

应识别：

- API facade。
- TypeScript 类型。
- Router。
- Store。
- 高耦合组件。
- 测试命令。
- build 命令。

#### Python / Django

识别依据：

```text
manage.py
settings.py
urls.py
views.py
models.py
serializers.py
migrations/
```

应识别：

- views。
- serializers。
- models。
- migrations。
- Celery tasks。
- settings。
- auth middleware。

#### Node / Express / Nest

识别依据：

```text
package.json
src/routes
src/controllers
src/services
src/modules
prisma/schema.prisma
```

应识别：

- routes。
- controllers。
- services。
- middleware。
- auth。
- Prisma migrations。
- external clients。

### 5.2.4 扫描输出格式

```markdown
# AI Project Guard Scan Report

## Detected Stack

| Area | Detected |
|---|---|
| Backend | Spring Boot |
| Frontend | Vue + Vite |
| Database | MySQL |
| Migration | Flyway |
| Tests | Maven + Vitest |

## Potential Dangerous Modules

| File/Pattern | Reason | Confidence |
|---|---|---|
| `SecurityConfig.java` | Security/auth boundary | High |
| `db/migration/*.sql` | Schema source of truth | High |
| `mapper/*.xml` | Manual SQL contract | High |

## Potential Legacy Modules

| File/Pattern | Reason | Confidence |
|---|---|---|
| `*Deprecated*` | Deprecated naming | Medium |
| `legacy/*` | Legacy directory | High |

## Suggested Questions

- 当前主业务链路是什么？
- 哪些 deprecated 文件不能删除？
- 哪些状态字符串不能改？
```

---

## 5.3 交互式项目知识收集

### 5.3.1 基础问题

工具必须询问：

| 问题 | 用途 |
|---|---|
| 项目名称是什么？ | 生成文档标题。 |
| 项目一句话简介是什么？ | 填入 `CLAUDE.md` 项目简介。 |
| 当前核心业务链路是什么？ | 生成 architecture call chain。 |
| 当前主链路和 legacy 链路分别是什么？ | 防止 AI 误改旧链路。 |
| 哪些模块最危险？ | 生成 dangerous modules。 |
| 哪些状态字符串不能改？ | 生成 Contract Guard。 |
| 哪些 API 契约不能改？ | 生成 API compatibility rules。 |
| 哪些外部系统最敏感？ | 生成 external integration rules。 |
| 哪些测试命令是真实有效的？ | 生成 verification rules。 |
| 哪些测试是占位或不可信？ | 生成 lessons。 |
| 当前分支正在做什么？ | 生成 `CLAUDE.local.md`。 |

### 5.3.2 高级问题

可选高级问题：

| 问题 | 用途 |
|---|---|
| 项目是否有权限体系？ | 生成权限边界。 |
| 是否存在真实密钥配置？ | 生成敏感信息规则。 |
| 是否有 MQ / Redis / Cache？ | 防止 AI 假设不存在的架构。 |
| 是否有异步任务 / 定时任务？ | 生成异步和调度风险。 |
| 是否存在数据库 migration？ | 生成 schema 规则。 |
| 是否有外部 API 特殊兼容规则？ | 生成 lessons。 |
| 是否有文件上传 / 对象存储？ | 生成文件契约。 |
| 是否接入 LLM / AI 模型？ | 生成 prompt / JSON 解析 / 日志脱敏规则。 |

---

## 5.4 生成 `CLAUDE.md`

### 5.4.1 文件作用

`CLAUDE.md` 是项目级总规约。

它应该包括：

```text
Read Order
Purpose
Critical Rules
Project Overview
Tech Stack
Common Commands
Directory Structure
Core Architecture
API Contracts
Data / Migration Rules
Auth / Config Rules
External Integration Rules
Logging Rules
Coding Standards
Dangerous Modules
Forbidden Actions
Testing Requirements
AI Development Workflow
Human Decisions Required
```

### 5.4.2 生成内容要求

生成的 `CLAUDE.md` 必须：

1. 明确告诉 AI 每次对话要读取哪些文件。
2. 说明项目技术栈。
3. 说明常用命令。
4. 说明核心架构。
5. 列出不能破坏的契约。
6. 列出危险模块。
7. 列出禁止事项。
8. 列出测试命令。
9. 说明 AI 修改代码前的工作流。
10. 说明哪些问题必须人工决策。

### 5.4.3 示例结构

```markdown
# CLAUDE.md

## Read Order

1. CLAUDE.architecture.md
2. CLAUDE.lessons.md
3. CLAUDE.local.md

## Project Overview

{{projectSummary}}

## Tech Stack

{{techStack}}

## Critical Rules

{{criticalRules}}

## Dangerous Modules

{{dangerousModules}}

## Testing Requirements

{{testCommands}}
```

---

## 5.5 生成 `CLAUDE.architecture.md`

### 5.5.1 文件作用

`CLAUDE.architecture.md` 用于记录稳定的架构事实。

它不是技术栈介绍，而是告诉 AI：

- 系统真实架构是什么。
- 哪些模块边界不能越过。
- 当前主链路是什么。
- legacy 链路是什么。
- 哪些模块高度耦合。
- 哪些兼容层不能删。
- 哪些设计是历史包袱但仍要保留。

### 5.5.2 必须包含章节

```markdown
# CLAUDE.architecture.md

## System Architecture

## Runtime Entry Points

## Module Boundaries

## Layered Design

## Service Call Chains

## Transaction Boundaries

## Permission System

## Configuration System

## Cache System

## MQ / Event Design

## Data Flow

## Compatibility Design

## High Coupling Areas

## Architecture Constraints

## Dangerous Modules

## Historical Compatibility Layers

## Non-crossable Boundaries

## Historical Baggage

## Areas AI Most Likely Mis-edits

## Must-have Human Review
```

### 5.5.3 重点规则

工具生成该文件时，应特别标注：

| 类型 | 说明 |
|---|---|
| 主链路 | 当前真正使用的业务链路。 |
| 旧链路 | deprecated 但不能删除的模块。 |
| 外部集成 | 认证、签名 URL、第三方 API 特殊规则。 |
| 数据契约 | DB migration、Mapper、Entity、VO、TS 类型。 |
| 状态契约 | 状态字符串、枚举值、source、step。 |
| 权限现状 | 是否真实实现 auth。 |
| 缓存现状 | Redis 是否真用于业务缓存。 |
| MQ 现状 | 是否真的存在 MQ。 |
| 事务边界 | 哪些外部调用不能包进事务。 |

---

## 5.6 生成 `CLAUDE.lessons.md`

### 5.6.1 文件作用

`CLAUDE.lessons.md` 是历史教训和 AI 易误改点。

每条 lesson 应包含：

```markdown
## Lesson N：标题

- 问题：
- 原因：
- 实际背景：
- 风险：
- 规则：
- 正确做法：
```

### 5.6.2 初始 lessons 来源

工具可以从以下信息生成初始 lessons：

| 来源 | 示例 |
|---|---|
| 用户填写 | “这个 deprecated service 不能删”。 |
| 扫描发现 | `assertTrue(true)` 占位测试。 |
| 常见技术栈规则 | Flyway migration 不能改已存在文件。 |
| 外部系统配置 | 签名 URL 不能打印到日志。 |
| AI 通用风险 | 不要把状态字符串改 enum。 |

### 5.6.3 通用 Lesson 模板

初始模板应提供以下可选 lessons：

1. 不要删除 legacy / deprecated 模块。
2. 不要把状态字符串随意改名。
3. 不要把 API 响应包络改成裸对象。
4. 不要只改后端 VO，不改前端类型。
5. 不要只改 entity，不改 mapper/migration。
6. 不要用占位测试证明功能正确。
7. 不要在日志中输出 token、签名 URL、完整模型响应。
8. 不要给包含外部调用的长流程简单加事务。
9. 不要假设 Redis/MQ 已经承载业务状态。
10. 不要局部实现不完整权限体系。

---

## 5.7 生成 `CLAUDE.local.md`

### 5.7.1 文件作用

`CLAUDE.local.md` 记录当前分支/当前迭代的临时上下文。

它不是永久架构事实。

### 5.7.2 必须包含章节

```markdown
# CLAUDE.local.md

## Current Branch

## Current Focus

## Current Refactoring

## Temporary Constraints

## Current Development Rules

## Active Technical Debt

## Most Conflict-prone Modules

## Current Version Risk Points

## Release-sensitive Areas

## Current Forbidden Areas

## Human Review Required Now

## Final Notes
```

### 5.7.3 生成方式

工具应询问：

- 当前分支名。
- 当前迭代目标。
- 当前活跃模块。
- 当前禁止修改区域。
- 当前测试要求。
- 当前最需要人工 Review 的模块。
- 当前未完成风险。

也可以从 git 自动补充：

```bash
git branch --show-current
git status
git log -5 --oneline
```

---

## 5.8 生成 `.claude/agents`

### 5.8.1 默认 Agent

工具应默认生成以下 Agent：

| Agent | 作用 |
|---|---|
| `architecture-reviewer` | 编码前架构审查，只读。 |
| `implementation-engineer` | 根据确认方案最小实现。 |
| `code-reviewer` | 代码审查和风险识别，只读。 |
| `fix-bug` | 根因定位和最小修复。 |
| `refactor-guardian` | 防止过度重构和误删兼容逻辑，只读。 |
| `lessons-curator` | 开发后提炼经验和更新建议。 |

### 5.8.2 Agent 文件要求

每个 Agent 文件必须包含：

```yaml
---
name: <agent-name>
description: <agent description>
tools: <allowed tools>
---
```

正文必须包含：

- 职责。
- 必须读取的上下文文件。
- 禁止事项。
- 输出格式。
- 是否允许修改代码。

### 5.8.3 Agent 权限原则

| Agent | 是否允许写代码 | 原则 |
|---|---|---|
| architecture-reviewer | 否 | 只分析。 |
| code-reviewer | 否 | 只审查。 |
| refactor-guardian | 否 | 只防守。 |
| lessons-curator | 否或仅建议 | 只输出建议，不直接改业务代码。 |
| fix-bug | 是 | 仅最小修复。 |
| implementation-engineer | 是 | 仅按批准方案实现。 |

---

## 5.9 生成 `.claude/commands`

### 5.9.1 默认 Commands

| Command | 作用 |
|---|---|
| `/daily-start` | 开始工作前加载上下文、检查风险、判断 Tier。 |
| `/daily-review` | 结束工作前提取知识增量和经验。 |
| `/diagnose` | 原因不明问题先诊断。 |
| `/quick-bugfix` | 低风险小 bug 最小修复。 |
| `/risky-plan` | 高风险任务先计划，禁止直接改。 |
| `/verify` | 根据项目测试命令进行聚焦验证。 |
| `/requirement-clarify` | 新需求先澄清并生成 PRD。 |

### 5.9.2 Command 内容要求

每个 command 应包含：

- 适用场景。
- 输入格式。
- 执行步骤。
- 停止条件。
- 禁止事项。
- 必须输出格式。
- 与 workflows 的路由关系。

---

## 5.10 生成 `.claude/workflows`

### 5.10.1 默认 Workflows

| Workflow | 作用 |
|---|---|
| `README.md` | Tier 路由、Contract Guard、危险文件、验证规则。 |
| `workflow-diagnosis.md` | 原因不明问题的诊断流程。 |
| `workflow-bugfix.md` | Bug 修复流程。 |
| `workflow-new-feature.md` | 新功能开发流程。 |
| `workflow-dangerous-module.md` | 危险模块修改流程。 |
| `workflow-requirement-clarify.md` | 需求澄清和 PRD 流程。 |

### 5.10.2 Tier 分级

#### Tier 0：文案 / 样式 / 文档小改

适用：

- README 小改。
- 注释修正。
- UI 文案。
- 不影响逻辑的样式调整。

处理：

- 可直接最小修改。
- 按需验证。

#### Tier 1：低风险小 Bug

适用：

- 单文件小 bug。
- 不涉及 API、DB、外部系统、权限、核心状态机。
- 不触碰危险模块。

处理：

- 简短根因分析。
- 最小修复。
- 聚焦测试。

#### Tier 2：API / 数据契约 / 前后端联动

适用：

- Controller。
- DTO / VO。
- TypeScript 类型。
- API facade。
- Mapper / Repository。
- 数据写入。
- 查询字段。
- 响应结构。

处理：

- 必须分析影响面。
- 明确调用链。
- 必要时人工确认。
- 后端和前端同步验证。

#### Tier 3：危险模块 / 外部系统 / 状态机 / migration / legacy

适用：

- Auth / Security。
- Payment / Order / Matching 等核心业务链路。
- 外部 API 认证。
- LLM JSON 解析。
- 数据库 migration。
- 旧链路和兼容层。
- 高耦合前端组件。

处理：

- 先分析，不直接改。
- 必须输出计划。
- 必须人工确认。
- 实现后 code review。
- 必须聚焦验证。

---

## 5.11 Contract Guard 功能

工具生成的 workflows 必须包含 Contract Guard。

通用 Contract Guard 包括：

| Contract | 风险 |
|---|---|
| API 响应包络 | 改动会破坏前端统一解包。 |
| API 前缀 | 改动会破坏网关/proxy/前端调用。 |
| 状态字符串 | 改动会破坏 DB、前端、测试、历史数据。 |
| DTO / VO / TS 类型 | 改动需要前后端同步。 |
| 数据库 migration | 改错会影响生产 schema。 |
| Mapper / SQL | 手写 SQL 漏字段会运行期失败。 |
| 外部认证 | 统一认证策略可能破坏特殊签名 URL。 |
| LLM 输出解析 | 删除容错会导致偶发失败。 |
| legacy 模块 | 删除可能破坏隐藏调用方。 |
| 权限体系 | 局部鉴权可能导致全 API 不可用。 |

---

## 5.12 验证功能

### 5.12.1 命令

```bash
npx ai-project-guard validate
```

### 5.12.2 验证内容

| 检查项 | 说明 |
|---|---|
| 文件完整性 | `CLAUDE.md`、architecture、lessons、local 是否存在。 |
| `.claude` 完整性 | agents、commands、workflows 是否存在。 |
| 引用完整性 | workflows 引用的 agents 是否存在。 |
| 命令真实性 | 文档中的测试命令是否能从 package/pom 推断。 |
| 敏感信息 | 是否包含 token、secret、password、access key。 |
| dangerous modules | 是否为空。 |
| lessons | 是否为空。 |
| local 上下文 | 是否包含当前分支和当前重点。 |
| Contract Guard | 是否包含关键契约。 |

### 5.12.3 验证输出

```text
AI Project Guard Validation

PASS required files exist
PASS agents referenced by workflows exist
WARN dangerous modules list is empty
WARN no legacy modules declared
FAIL possible secret found in CLAUDE.local.md: line 42
```

---

## 5.13 Doctor 功能

### 5.13.1 命令

```bash
npx ai-project-guard doctor
```

### 5.13.2 作用

`doctor` 不只是检查文件是否存在，而是检查治理质量。

| 问题 | Doctor 建议 |
|---|---|
| dangerous modules 为空 | 建议至少确认 auth、migration、external client。 |
| lessons 全是空模板 | 建议补充真实历史事故或隐性规则。 |
| 没有测试命令 | 建议补充 focused test / build。 |
| 没有 legacy 描述 | 建议确认 deprecated 文件是否可删。 |
| local 长期未更新 | 建议重新运行 local update。 |
| workflows 没有 Tier 规则 | 建议补充 Tier 0-3。 |

---

## 6. 模板系统

## 6.1 Profile 类型

### 6.1.1 `generic`

适合所有项目。

生成：

- 通用架构模板。
- 通用 lessons。
- 通用 agents。
- 通用 workflows。

### 6.1.2 `claude-code`

适合 Claude Code 用户。

生成：

```text
CLAUDE.md
CLAUDE.architecture.md
CLAUDE.lessons.md
CLAUDE.local.md
.claude/agents
.claude/commands
.claude/workflows
```

### 6.1.3 `spring-vue`

适合 Java/Spring + Vue 项目。

内置关注：

- Controller。
- ServiceImpl。
- Mapper XML。
- Flyway。
- DTO / VO / Entity。
- Vue API facade。
- Pinia / Store。
- TypeScript types。
- Vite / Vitest。

### 6.1.4 `node-react`

适合 Node + React 项目。

内置关注：

- routes。
- controllers。
- services。
- middleware。
- Prisma。
- React components。
- API client。
- Jest / Vitest。

### 6.1.5 `python-django`

适合 Django 项目。

内置关注：

- settings。
- urls。
- views。
- serializers。
- models。
- migrations。
- Celery。
- pytest。

---

## 6.2 模板变量

模板应使用变量：

```json
{
  "projectName": "string",
  "projectSummary": "string",
  "techStack": [],
  "backendStack": [],
  "frontendStack": [],
  "database": "string",
  "migrationTool": "string",
  "apiContracts": [],
  "statusContracts": [],
  "dangerousModules": [],
  "legacyModules": [],
  "externalIntegrations": [],
  "testCommands": [],
  "buildCommands": [],
  "forbiddenActions": [],
  "currentFocus": "string",
  "currentBranch": "string"
}
```

---

## 7. 数据模型

虽然这是 CLI 工具，不需要数据库，但需要内部数据结构。

### 7.1 ProjectProfile

```typescript
interface ProjectProfile {
  projectName: string
  projectSummary: string
  rootDir: string
  packageManager?: 'npm' | 'pnpm' | 'yarn' | 'maven' | 'gradle' | 'poetry' | 'unknown'
  stacks: StackInfo[]
  architecture: ArchitectureProfile
  contracts: ContractProfile
  risks: RiskProfile
  tests: TestProfile
  localContext: LocalContextProfile
}
```

### 7.2 StackInfo

```typescript
interface StackInfo {
  area: 'backend' | 'frontend' | 'database' | 'infra' | 'unknown'
  name: string
  confidence: 'high' | 'medium' | 'low'
  evidence: string[]
}
```

### 7.3 ArchitectureProfile

```typescript
interface ArchitectureProfile {
  runtimeEntryPoints: string[]
  moduleBoundaries: ModuleBoundary[]
  mainFlows: CallChain[]
  legacyFlows: CallChain[]
  externalSystems: ExternalSystem[]
}
```

### 7.4 ContractProfile

```typescript
interface ContractProfile {
  apiContracts: string[]
  statusContracts: string[]
  schemaContracts: string[]
  frontendContracts: string[]
  externalContracts: string[]
}
```

### 7.5 RiskProfile

```typescript
interface RiskProfile {
  dangerousModules: DangerousModule[]
  legacyModules: LegacyModule[]
  forbiddenActions: string[]
  humanReviewRequired: string[]
}
```

### 7.6 TestProfile

```typescript
interface TestProfile {
  backendCommands: string[]
  frontendCommands: string[]
  buildCommands: string[]
  invalidOrPlaceholderTests: string[]
  verificationRules: string[]
}
```

---

## 8. 生成文件规范

### 8.1 文件覆盖规则

默认不覆盖已有文件。

如果存在：

```text
CLAUDE.md already exists
```

CLI 应询问：

```text
文件已存在，如何处理？
1. 跳过
2. 备份后覆盖
3. 合并
4. 退出
```

备份格式：

```text
CLAUDE.md.bak.20260608-153000
```

### 8.2 合并策略

MVP 可不做智能合并。

v1.0 后支持：

- 保留用户手写内容。
- 更新模板段落。
- 标记冲突：

```markdown
<!-- AI_PROJECT_GUARD_CONFLICT_START -->
...
<!-- AI_PROJECT_GUARD_CONFLICT_END -->
```

### 8.3 敏感信息规则

工具绝不应把扫描到的敏感值写进生成文件。

例如：

```text
Detected possible secret in application-local.yml.
Generated note:
- 本地配置包含疑似敏感字段，请勿复制、打印或提交真实值。
```

而不是写入真实值。

---

## 9. 非功能需求

### 9.1 安全

| 要求 | 描述 |
|---|---|
| 默认本地运行 | 不上传代码。 |
| 不打印 secret | 扫描到敏感值只报告字段名和文件，不输出值。 |
| 不自动删除文件 | 所有写入都限制在治理文件范围。 |
| 覆盖前确认 | 避免破坏已有项目文档。 |
| 支持 dry-run | 用户可预览生成内容。 |

### 9.2 可扩展性

| 要求 | 描述 |
|---|---|
| Profile 可扩展 | 用户可新增技术栈 profile。 |
| Template 可扩展 | 用户可自定义模板。 |
| Scanner 可扩展 | 支持新增语言和框架扫描器。 |
| Target 可扩展 | 后续支持 Claude、Cursor、Copilot、Gemini。 |

### 9.3 跨平台

必须支持：

- macOS。
- Linux。
- Windows。
- Git Bash / PowerShell 基本兼容。

### 9.4 可维护性

代码结构应清晰分层：

```text
commands/
scanners/
generators/
templates/
validators/
schemas/
```

### 9.5 可测试性

必须提供测试：

| 测试类型 | 说明 |
|---|---|
| Scanner 单测 | 给 fixture 项目，验证技术栈识别。 |
| Template 渲染测试 | 验证变量生成正确。 |
| Validate 测试 | 验证缺失文件、断链引用、敏感信息检测。 |
| CLI 快照测试 | 验证 init 输出结构。 |

---

## 10. CLI 命令设计

### 10.1 `init`

```bash
ai-project-guard init
```

作用：

- 扫描项目。
- 交互式提问。
- 生成治理文件。

### 10.2 `scan`

```bash
ai-project-guard scan
```

作用：

- 只扫描，不生成文件。
- 输出项目画像和风险候选。

### 10.3 `validate`

```bash
ai-project-guard validate
```

作用：

- 校验治理文件完整性。
- 检查引用是否断裂。
- 检查敏感信息。

### 10.4 `doctor`

```bash
ai-project-guard doctor
```

作用：

- 检查治理体系质量。
- 提出改进建议。

### 10.5 `local`

```bash
ai-project-guard local
```

作用：

- 更新当前分支上下文。
- 生成或更新 `CLAUDE.local.md`。

### 10.6 `template list`

```bash
ai-project-guard template list
```

作用：

- 查看可用模板。

### 10.7 `template eject`

```bash
ai-project-guard template eject
```

作用：

- 把内置模板导出到项目中，方便团队自定义。

---

## 11. 需求优先级

### 11.1 MVP / v0.1

目标：模板仓库 + 最小 CLI 初始化。

必须实现：

- `init`
- Claude Code profile
- 交互式提问
- 生成四个 `CLAUDE*.md`
- 生成 `.claude/agents`
- 生成 `.claude/commands`
- 生成 `.claude/workflows`
- 不覆盖已有文件
- dry-run

不要求：

- 深度代码扫描。
- 多 AI 工具支持。
- 智能合并。

### 11.2 v0.2

目标：加入基础扫描。

实现：

- `scan`
- 技术栈识别
- package manager 识别
- test command 识别
- dangerous module 候选
- legacy module 候选

### 11.3 v0.3

目标：加入校验能力。

实现：

- `validate`
- 文件完整性检查
- 引用完整性检查
- secret 检查
- dangerous modules 为空检查
- lessons 为空检查

### 11.4 v0.4

目标：加入 doctor。

实现：

- 治理质量检查。
- local 是否过期。
- workflows 是否缺少 Tier。
- commands 是否缺少停止条件。
- agents 是否权限过宽。

### 11.5 v1.0

目标：正式稳定版。

实现：

- 多 profile。
- 多 AI target。
- 自定义模板。
- 初始化报告。
- 完整测试。
- 文档完善。

---

## 12. 验收标准

### 12.1 初始化验收

给定一个空白测试项目，执行：

```bash
ai-project-guard init --profile claude-code
```

应生成：

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
.claude/commands/diagnose.md
.claude/commands/quick-bugfix.md
.claude/commands/risky-plan.md
.claude/commands/verify.md
.claude/workflows/README.md
.claude/workflows/workflow-diagnosis.md
.claude/workflows/workflow-bugfix.md
.claude/workflows/workflow-new-feature.md
.claude/workflows/workflow-dangerous-module.md
```

### 12.2 扫描验收

给定 Spring + Vue 示例项目，执行：

```bash
ai-project-guard scan
```

应识别：

- Spring Boot。
- Vue / Vite。
- Maven。
- npm。
- Controller。
- Service。
- migration。
- frontend API。
- test command 候选。
- dangerous module 候选。

### 12.3 安全验收

给定包含以下内容的配置文件：

```text
password=abc123
accessKeySecret=xxxx
```

生成文件中不得包含真实值，只允许出现：

```markdown
- 检测到疑似敏感配置字段，请勿复制真实值到 AI 上下文。
```

### 12.4 覆盖验收

如果目标项目已有：

```text
CLAUDE.md
```

执行 init 时必须提示，不得静默覆盖。

### 12.5 Validate 验收

如果 workflow 引用了不存在的 agent：

```markdown
@.claude/agents/missing-agent.md
```

执行：

```bash
ai-project-guard validate
```

必须报错。

---

## 13. 风险与应对

| 风险 | 等级 | 应对 |
|---|---|---|
| 生成内容过于通用，没有实际价值 | High | 强制交互式提问，要求填写主链路、危险模块、legacy 模块。 |
| 用户误以为生成文件后 AI 就绝对安全 | High | README 和 CLI 输出明确说明：这是 Guard Rail，不替代人工 Review。 |
| 扫描误判架构 | Medium | 所有扫描结论标记 confidence，并要求人工确认。 |
| 输出敏感信息 | High | 默认 secret masking，禁止写入值。 |
| 模板过度绑定某个项目 | Medium | 拆成 generic profile 和 stack-specific profile。 |
| CLI 覆盖用户已有文档 | Medium | 默认不覆盖，覆盖前备份。 |
| 生态适配过早膨胀 | Medium | MVP 专注 Claude Code，后续再扩展。 |
| 用户不愿回答太多问题 | Medium | 支持 quick init 和 full init 两种模式。 |

---

## 14. 开源项目目录建议

```text
ai-project-guard/
  README.md
  LICENSE
  package.json
  tsconfig.json

  src/
    index.ts

    commands/
      init.ts
      scan.ts
      validate.ts
      doctor.ts
      local.ts

    scanners/
      index.ts
      stack-scanner.ts
      git-scanner.ts
      test-scanner.ts
      java-scanner.ts
      node-scanner.ts
      frontend-scanner.ts
      risk-scanner.ts
      secret-scanner.ts

    generators/
      index.ts
      claude-generator.ts
      agents-generator.ts
      commands-generator.ts
      workflows-generator.ts
      generic-generator.ts

    prompts/
      init-prompts.ts
      architecture-prompts.ts
      risk-prompts.ts
      local-prompts.ts

    validators/
      file-validator.ts
      reference-validator.ts
      secret-validator.ts
      quality-validator.ts

    schemas/
      project-profile.ts
      scanner-result.ts
      template-context.ts

    utils/
      fs.ts
      path.ts
      logger.ts

  templates/
    claude-code/
      CLAUDE.md.hbs
      CLAUDE.architecture.md.hbs
      CLAUDE.lessons.md.hbs
      CLAUDE.local.md.hbs
      agents/
      commands/
      workflows/

    generic/
      AGENTS.md.hbs

  profiles/
    generic.json
    claude-code.json
    spring-vue.json
    node-react.json
    python-django.json

  examples/
    spring-vue-legacy/
    node-react-app/
    django-app/

  tests/
    fixtures/
    scanners/
    generators/
    validators/

  docs/
    concepts.md
    generated-files.md
    claude-code.md
    customization.md
    security.md
    roadmap.md
```

---

## 15. README 核心内容建议

```markdown
# AI Project Guard

Make legacy codebases governable by AI coding agents.

AI Project Guard generates project-specific context, architecture boundaries,
lessons learned, dangerous-module guards, workflows, and Claude Code agents
so AI assistants can work safely inside existing codebases.

## Why

AI coding agents are powerful, but legacy projects are full of hidden rules:

- deprecated modules that must not be deleted
- status strings shared by database, backend, frontend, and tests
- placeholder tests that give false confidence
- external API quirks that look like bugs
- old and new business flows living side by side
- security/config assumptions that are not obvious from code

This tool helps teams encode those rules into AI-readable governance files.

## Quick Start

npx ai-project-guard init --profile claude-code

## Generated Files

- CLAUDE.md
- CLAUDE.architecture.md
- CLAUDE.lessons.md
- CLAUDE.local.md
- .claude/agents/*
- .claude/commands/*
- .claude/workflows/*

## Privacy

All scanning is local by default.
No code is uploaded.
Secrets are never written into generated files.
```

---

## 16. 成功指标

| 指标 | 目标 |
|---|---|
| 初始化耗时 | 小于 10 分钟完成基础初始化。 |
| 文件完整性 | 生成文件通过 validate。 |
| 人工确认率 | dangerous modules 和 legacy modules 都经过用户确认。 |
| AI 误改减少 | 用户反馈 AI 更少误删兼容层、少低估风险。 |
| 复用率 | 同一团队可在多个项目重复使用。 |
| 开源采用 | 有不同技术栈项目贡献 profile。 |

---

## 17. 第一版最小可交付范围

建议第一版只做这些：

```text
1. CLI init
2. Claude Code profile
3. 交互式问题
4. 生成 CLAUDE*.md
5. 生成 agents
6. 生成 commands
7. 生成 workflows
8. dry-run
9. 不覆盖已有文件
10. README + example
```

暂时不做：

```text
1. 深度 AST 分析
2. 多 AI 工具生成
3. 智能合并
4. 云端扫描
5. 自动修改业务代码
```

---

## 18. 关键产品原则

1. **AI 先被约束，再被授权。**
2. **传统项目优先保守，不鼓励大重构。**
3. **所有扫描推断都必须人工确认。**
4. **不能把隐性规则藏在 prompt 里，要写进项目文件。**
5. **不能只告诉 AI 怎么做，也要告诉 AI 什么不能做。**
6. **不能只生成 README，要生成 workflow、agent、command 和 guard rail。**
7. **不能让 AI 依赖占位测试产生假安全感。**
8. **不能让 AI 自己决定是否删除 legacy 模块。**
9. **不能默认项目有权限、缓存、MQ、事务保障。**
10. **不能输出真实密钥、token、签名 URL 或敏感业务数据。**

---

## 19. 推荐下一步

如果要真正启动这个开源项目，建议按这个顺序：

### 第一步：确定项目名

推荐名称：

```text
ai-project-guard
```

理由：

- 中性，不绑定 Claude。
- 表达“项目 Guard Rail”。
- 后续可支持多 AI 工具。

### 第二步：先创建模板仓库

先把当前项目这套文件抽象成：

```text
templates/claude-code/
```

### 第三步：做 v0.1 CLI

只实现：

```bash
npx ai-project-guard init
```

交互式问答 + 生成文件。

### 第四步：用当前项目反向测试

在一个干净副本里运行：

```bash
npx ai-project-guard init --profile claude-code
```

对比生成文件和现有文件差距。

### 第五步：找第二个不同技术栈项目测试

例如：

- Node + React。
- Python + Django。
- Go backend。

验证模板是否足够通用。

---

## 20. 总结

`AI Project Guard` 要做的不是“帮 AI 写代码”，而是“帮项目建立 AI 可遵守的工程边界”。

它的核心产物不是代码，而是：

```text
项目上下文
架构事实
历史教训
危险模块
禁止事项
任务分级
验证命令
Agent 职责
Workflow 路由
人工确认点
```

最终目标是让传统项目从：

```text
AI 进入项目后靠猜
```

变成：

```text
AI 进入项目后先读规则、识别风险、按流程行动
```
