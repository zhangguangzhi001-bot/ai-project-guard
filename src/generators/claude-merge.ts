import type { GeneratedLanguage } from '../schemas/template-context.js'

const IMPORT_BEGIN_MARKER = '<!-- BEGIN APG IMPORTED EXISTING CLAUDE.md -->'
const IMPORT_END_MARKER = '<!-- END APG IMPORTED EXISTING CLAUDE.md -->'

export function mergeExistingClaudeMd(
  generatedContent: string,
  existingContent: string,
  options: { language: GeneratedLanguage },
): string {
  const heading =
    options.language === 'en'
      ? '## Existing project instructions imported from previous CLAUDE.md'
      : '## 从原 CLAUDE.md 导入的项目说明'

  return `${trimTrailingWhitespace(generatedContent)}

${heading}

${importNotice(options.language)}

${IMPORT_BEGIN_MARKER}

${trimTrailingWhitespace(existingContent)}

${IMPORT_END_MARKER}
`
}

function importNotice(language: GeneratedLanguage): string {
  if (language === 'en') {
    return 'The following content was preserved from the project’s pre-existing CLAUDE.md during AI Project Guard initialization. Treat it as project-specific guidance. If it conflicts with generated governance sections above, ask the user before choosing one.'
  }

  return '以下内容是在 AI Project Guard 初始化期间从项目原有 CLAUDE.md 中保留下来的。请将其视为项目特定指导；如果它与上方生成的治理规则冲突，请先询问用户再决定采用哪一项。'
}

function trimTrailingWhitespace(content: string): string {
  return content.replace(/\s+$/u, '')
}
