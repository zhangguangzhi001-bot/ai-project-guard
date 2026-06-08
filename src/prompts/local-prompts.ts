import { input } from '@inquirer/prompts'
import type { LocalContextProfile } from '../schemas/project-profile.js'
import { maskListSecretLikeValues, parseList, withTodoIfEmpty } from '../utils/list.js'

export async function collectLocalContext(): Promise<LocalContextProfile> {
  const currentBranch = await input({
    message: 'Current branch or iteration name:',
    default: 'TODO: human review required',
  })
  const currentFocus = await input({
    message: 'Current focus / iteration goal:',
    default: 'TODO: human review required',
  })
  const temporaryConstraints = parseList(
    await input({
      message: 'Temporary constraints for this branch/iteration:',
    }),
  )
  const currentForbiddenAreas = parseList(
    await input({
      message: 'Areas currently forbidden to modify:',
    }),
  )

  return {
    currentBranch: currentBranch.trim() || 'TODO: human review required',
    currentFocus: currentFocus.trim() || 'TODO: human review required',
    temporaryConstraints: withTodoIfEmpty(maskListSecretLikeValues(temporaryConstraints)),
    currentForbiddenAreas: withTodoIfEmpty(maskListSecretLikeValues(currentForbiddenAreas)),
  }
}
