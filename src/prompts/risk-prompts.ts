import { input } from '@inquirer/prompts'
import type { ContractProfile, RiskProfile } from '../schemas/project-profile.js'
import { maskListSecretLikeValues, parseList, withTodoIfEmpty } from '../utils/list.js'

export async function collectContracts(): Promise<ContractProfile> {
  const apiContracts = parseList(
    await input({
      message: 'API contracts that must not change (comma-separated, no secrets):',
    }),
  )
  const statusContracts = parseList(
    await input({
      message: 'Status strings / business constants that must not be renamed:',
    }),
  )
  const schemaContracts = parseList(
    await input({
      message: 'Database/schema/migration contracts to preserve:',
    }),
  )
  const frontendContracts = parseList(
    await input({
      message: 'Frontend/API type contracts to preserve:',
    }),
  )
  const externalContracts = parseList(
    await input({
      message: 'External integration contracts or quirks to preserve:',
    }),
  )

  return {
    apiContracts: withTodoIfEmpty(maskListSecretLikeValues(apiContracts)),
    statusContracts: withTodoIfEmpty(maskListSecretLikeValues(statusContracts)),
    schemaContracts: withTodoIfEmpty(maskListSecretLikeValues(schemaContracts)),
    frontendContracts: withTodoIfEmpty(maskListSecretLikeValues(frontendContracts)),
    externalContracts: withTodoIfEmpty(maskListSecretLikeValues(externalContracts)),
  }
}

export async function collectRisks(): Promise<RiskProfile> {
  const dangerousModules = parseList(
    await input({
      message: 'Most dangerous modules/files/patterns for AI to modify:',
    }),
  )
  const legacyModules = parseList(
    await input({
      message: 'Legacy/deprecated modules that must not be deleted without confirmation:',
    }),
  )
  const forbiddenActions = parseList(
    await input({
      message: 'Project-specific forbidden AI actions:',
    }),
  )
  const humanReviewRequired = parseList(
    await input({
      message: 'Changes that require human review:',
    }),
  )

  return {
    dangerousModules: withTodoIfEmpty(maskListSecretLikeValues(dangerousModules)),
    legacyModules: withTodoIfEmpty(maskListSecretLikeValues(legacyModules)),
    forbiddenActions: withTodoIfEmpty(maskListSecretLikeValues(forbiddenActions)),
    humanReviewRequired: withTodoIfEmpty(maskListSecretLikeValues(humanReviewRequired)),
  }
}
