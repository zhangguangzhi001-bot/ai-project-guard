import path from 'node:path'
import type { GovernancePackId, ProjectProfile } from '../schemas/project-profile.js'
import type { GeneratedLanguage } from '../schemas/template-context.js'
import { toTemplateContext } from '../schemas/template-context.js'
import { renderTemplate, resolveTemplateRoot } from './template-renderer.js'
import type { WritePlan } from './write-plan.js'

interface TemplateFileMapping {
  template: string
  output: string
}

const BASE_TEMPLATE_FILES: TemplateFileMapping[] = [
  { template: 'CLAUDE.md.hbs', output: 'CLAUDE.md' },
  { template: 'CLAUDE.architecture.md.hbs', output: 'CLAUDE.architecture.md' },
  { template: 'CLAUDE.lessons.md.hbs', output: 'CLAUDE.lessons.md' },
  { template: 'CLAUDE.local.md.hbs', output: 'CLAUDE.local.md' },
  {
    template: 'agents/apg-architecture-reviewer.md.hbs',
    output: '.claude/agents/apg-architecture-reviewer.md',
  },
  {
    template: 'agents/apg-implementation-engineer.md.hbs',
    output: '.claude/agents/apg-implementation-engineer.md',
  },
  { template: 'agents/apg-code-reviewer.md.hbs', output: '.claude/agents/apg-code-reviewer.md' },
  { template: 'agents/apg-fix-bug.md.hbs', output: '.claude/agents/apg-fix-bug.md' },
  {
    template: 'agents/apg-refactor-guardian.md.hbs',
    output: '.claude/agents/apg-refactor-guardian.md',
  },
  {
    template: 'agents/apg-lessons-curator.md.hbs',
    output: '.claude/agents/apg-lessons-curator.md',
  },
  { template: 'commands/apg-daily-start.md.hbs', output: '.claude/commands/apg-daily-start.md' },
  { template: 'commands/apg-daily-review.md.hbs', output: '.claude/commands/apg-daily-review.md' },
  { template: 'commands/apg-diagnose.md.hbs', output: '.claude/commands/apg-diagnose.md' },
  { template: 'commands/apg-quick-bugfix.md.hbs', output: '.claude/commands/apg-quick-bugfix.md' },
  { template: 'commands/apg-risky-plan.md.hbs', output: '.claude/commands/apg-risky-plan.md' },
  { template: 'commands/apg-verify.md.hbs', output: '.claude/commands/apg-verify.md' },
  {
    template: 'commands/apg-requirement-clarify.md.hbs',
    output: '.claude/commands/apg-requirement-clarify.md',
  },
  { template: 'workflows/README.md.hbs', output: '.claude/workflows/apg-workflows.md' },
  {
    template: 'workflows/apg-workflow-diagnosis.md.hbs',
    output: '.claude/workflows/apg-workflow-diagnosis.md',
  },
  {
    template: 'workflows/apg-workflow-bugfix.md.hbs',
    output: '.claude/workflows/apg-workflow-bugfix.md',
  },
  {
    template: 'workflows/apg-workflow-new-feature.md.hbs',
    output: '.claude/workflows/apg-workflow-new-feature.md',
  },
  {
    template: 'workflows/apg-workflow-dangerous-module.md.hbs',
    output: '.claude/workflows/apg-workflow-dangerous-module.md',
  },
  {
    template: 'workflows/apg-workflow-requirement-clarify.md.hbs',
    output: '.claude/workflows/apg-workflow-requirement-clarify.md',
  },
]

const PACK_TEMPLATE_FILES: Record<GovernancePackId, TemplateFileMapping[]> = {
  'java-release-audit': [
    {
      template: 'commands/apg-java-release-audit.md.hbs',
      output: '.claude/commands/apg-java-release-audit.md',
    },
    {
      template: 'agents/apg-java-risk-module-auditor.md.hbs',
      output: '.claude/agents/apg-java-risk-module-auditor.md',
    },
    {
      template: 'agents/apg-financial-release-auditor.md.hbs',
      output: '.claude/agents/apg-financial-release-auditor.md',
    },
    {
      template: 'agents/apg-release-blocker-judge.md.hbs',
      output: '.claude/agents/apg-release-blocker-judge.md',
    },
    {
      template: 'workflows/apg-workflow-java-release-audit.md.hbs',
      output: '.claude/workflows/apg-workflow-java-release-audit.md',
    },
  ],
}

export interface GenerateClaudeCodePlanOptions {
  language?: GeneratedLanguage
}

export async function generateClaudeCodePlan(
  profile: ProjectProfile,
  options: GenerateClaudeCodePlanOptions = {},
): Promise<WritePlan> {
  const language = options.language ?? 'zh'
  const templateRoot = await resolveTemplateRoot(language)
  const context = toTemplateContext(profile, { language })
  const files = []

  for (const mapping of resolveTemplateFiles(profile)) {
    const content = await renderTemplate(path.join(templateRoot, mapping.template), context)
    files.push({ relativePath: mapping.output, content })
  }

  return { files }
}

function resolveTemplateFiles(profile: ProjectProfile): TemplateFileMapping[] {
  const packIds = new Set(profile.suggestedPacks?.map((pack) => pack.id) ?? [])
  return [
    ...BASE_TEMPLATE_FILES,
    ...[...packIds].flatMap((packId) => PACK_TEMPLATE_FILES[packId] ?? []),
  ]
}

export const CLAUDE_CODE_BASE_OUTPUT_FILES = BASE_TEMPLATE_FILES.map((mapping) => mapping.output)

export const CLAUDE_CODE_PACK_OUTPUT_FILES: Record<GovernancePackId, string[]> = {
  'java-release-audit': PACK_TEMPLATE_FILES['java-release-audit'].map((mapping) => mapping.output),
}

export const CLAUDE_CODE_OUTPUT_FILES = [
  ...CLAUDE_CODE_BASE_OUTPUT_FILES,
  ...Object.values(CLAUDE_CODE_PACK_OUTPUT_FILES).flat(),
]
