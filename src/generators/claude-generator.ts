import path from 'node:path'
import type { ProjectProfile } from '../schemas/project-profile.js'
import { toTemplateContext } from '../schemas/template-context.js'
import { renderTemplate, resolveTemplateRoot } from './template-renderer.js'
import type { WritePlan } from './write-plan.js'

const TEMPLATE_FILES: Array<{ template: string; output: string }> = [
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

export async function generateClaudeCodePlan(profile: ProjectProfile): Promise<WritePlan> {
  const templateRoot = await resolveTemplateRoot()
  const context = toTemplateContext(profile)
  const files = []

  for (const mapping of TEMPLATE_FILES) {
    const content = await renderTemplate(path.join(templateRoot, mapping.template), context)
    files.push({ relativePath: mapping.output, content })
  }

  return { files }
}

export const CLAUDE_CODE_OUTPUT_FILES = TEMPLATE_FILES.map((mapping) => mapping.output)
