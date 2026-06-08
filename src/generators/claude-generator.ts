import path from 'node:path'
import type { ProjectProfile } from '../schemas/project-profile.js'
import { toTemplateContext } from '../schemas/template-context.js'
import type { WritePlan } from './write-plan.js'
import { renderTemplate, resolveTemplateRoot } from './template-renderer.js'

const TEMPLATE_FILES: Array<{ template: string; output: string }> = [
  { template: 'CLAUDE.md.hbs', output: 'CLAUDE.md' },
  { template: 'CLAUDE.architecture.md.hbs', output: 'CLAUDE.architecture.md' },
  { template: 'CLAUDE.lessons.md.hbs', output: 'CLAUDE.lessons.md' },
  { template: 'CLAUDE.local.md.hbs', output: 'CLAUDE.local.md' },
  { template: 'agents/architecture-reviewer.md.hbs', output: '.claude/agents/architecture-reviewer.md' },
  { template: 'agents/implementation-engineer.md.hbs', output: '.claude/agents/implementation-engineer.md' },
  { template: 'agents/code-reviewer.md.hbs', output: '.claude/agents/code-reviewer.md' },
  { template: 'agents/fix-bug.md.hbs', output: '.claude/agents/fix-bug.md' },
  { template: 'agents/refactor-guardian.md.hbs', output: '.claude/agents/refactor-guardian.md' },
  { template: 'agents/lessons-curator.md.hbs', output: '.claude/agents/lessons-curator.md' },
  { template: 'commands/daily-start.md.hbs', output: '.claude/commands/daily-start.md' },
  { template: 'commands/daily-review.md.hbs', output: '.claude/commands/daily-review.md' },
  { template: 'commands/diagnose.md.hbs', output: '.claude/commands/diagnose.md' },
  { template: 'commands/quick-bugfix.md.hbs', output: '.claude/commands/quick-bugfix.md' },
  { template: 'commands/risky-plan.md.hbs', output: '.claude/commands/risky-plan.md' },
  { template: 'commands/verify.md.hbs', output: '.claude/commands/verify.md' },
  { template: 'commands/requirement-clarify.md.hbs', output: '.claude/commands/requirement-clarify.md' },
  { template: 'workflows/README.md.hbs', output: '.claude/workflows/README.md' },
  { template: 'workflows/workflow-diagnosis.md.hbs', output: '.claude/workflows/workflow-diagnosis.md' },
  { template: 'workflows/workflow-bugfix.md.hbs', output: '.claude/workflows/workflow-bugfix.md' },
  { template: 'workflows/workflow-new-feature.md.hbs', output: '.claude/workflows/workflow-new-feature.md' },
  { template: 'workflows/workflow-dangerous-module.md.hbs', output: '.claude/workflows/workflow-dangerous-module.md' },
  {
    template: 'workflows/workflow-requirement-clarify.md.hbs',
    output: '.claude/workflows/workflow-requirement-clarify.md',
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
