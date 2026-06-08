import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Handlebars from 'handlebars'
import type { TemplateContext } from '../schemas/template-context.js'

Handlebars.registerHelper('list', (items: string[] | undefined) => {
  const values = items && items.length > 0 ? items : ['TODO: human review required']
  return new Handlebars.SafeString(values.map((item) => `- ${Handlebars.escapeExpression(item)}`).join('\n'))
})

Handlebars.registerHelper('inlineList', (items: string[] | undefined) => {
  const values = items && items.length > 0 ? items : ['TODO: human review required']
  return new Handlebars.SafeString(values.map((item) => Handlebars.escapeExpression(item)).join(', '))
})

export async function renderTemplate(templatePath: string, context: TemplateContext): Promise<string> {
  const source = await fs.readFile(templatePath, 'utf8')
  const template = Handlebars.compile(source, { noEscape: false })
  return template(context)
}

export async function resolveTemplateRoot(): Promise<string> {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.resolve(moduleDir, '../../templates/claude-code'),
    path.resolve(moduleDir, '../../../templates/claude-code'),
    path.resolve(process.cwd(), 'templates/claude-code'),
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // try the next candidate
    }
  }

  throw new Error('Could not locate templates/claude-code directory')
}
