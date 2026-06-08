import type { ProjectProfile } from './project-profile.js'

export interface TemplateContext extends ProjectProfile {
  generatedBy: string
  todoText: string
}

export function toTemplateContext(profile: ProjectProfile): TemplateContext {
  return {
    ...profile,
    generatedBy: 'AI Project Guard',
    todoText: 'TODO: human review required',
  }
}
