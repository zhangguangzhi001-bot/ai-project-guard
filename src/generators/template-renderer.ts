import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Handlebars from 'handlebars'
import type { GeneratedLanguage, TemplateContext } from '../schemas/template-context.js'

Handlebars.registerHelper('list', function (this: TemplateContext, items: string[] | undefined) {
  const values = items && items.length > 0 ? items : [this.todoText]
  return new Handlebars.SafeString(
    values.map((item) => `- ${Handlebars.escapeExpression(item)}`).join('\n'),
  )
})

Handlebars.registerHelper('inlineList', function (this: TemplateContext, items: string[] | undefined) {
  const values = items && items.length > 0 ? items : [this.todoText]
  return new Handlebars.SafeString(
    values.map((item) => Handlebars.escapeExpression(item)).join(', '),
  )
})

export async function renderTemplate(
  templatePath: string,
  context: TemplateContext,
): Promise<string> {
  const source = await fs.readFile(templatePath, 'utf8')
  const template = Handlebars.compile(source, { noEscape: false })
  return template(context)
}

export async function resolveTemplateRoot(language: GeneratedLanguage): Promise<string> {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url))
  const candidates = [
    path.resolve(moduleDir, `../../templates/claude-code/${language}`),
    path.resolve(moduleDir, `../../../templates/claude-code/${language}`),
    path.resolve(process.cwd(), `templates/claude-code/${language}`),
  ]

  for (const candidate of candidates) {
    try {
      await fs.access(candidate)
      return candidate
    } catch {
      // try the next candidate
    }
  }

  throw new Error(`Could not locate templates/claude-code/${language} directory`)
}
