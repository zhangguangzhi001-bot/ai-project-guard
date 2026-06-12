import type { ProjectProfile } from './project-profile.js'

export type GeneratedLanguage = 'zh' | 'en'

export interface TemplateContext extends ProjectProfile {
  generatedBy: string
  language: GeneratedLanguage
  todoText: string
  isChinese: boolean
  isEnglish: boolean
}

export function normalizeGeneratedLanguage(value: string | undefined): GeneratedLanguage {
  if (!value || value === 'zh') {
    return 'zh'
  }

  if (value === 'en') {
    return 'en'
  }

  throw new Error(`Unsupported language "${value}". Use --language zh or --language en.`)
}

export function todoTextForLanguage(language: GeneratedLanguage): string {
  return language === 'zh' ? 'TODO：需要人工确认' : 'TODO: human review required'
}

export function toTemplateContext(
  profile: ProjectProfile,
  options: { language?: GeneratedLanguage } = {},
): TemplateContext {
  const language = options.language ?? 'zh'

  return {
    ...profile,
    generatedBy: 'AI Project Guard',
    language,
    todoText: todoTextForLanguage(language),
    isChinese: language === 'zh',
    isEnglish: language === 'en',
  }
}
