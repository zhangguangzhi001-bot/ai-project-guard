import path from 'node:path'
import { input } from '@inquirer/prompts'
import type { ArchitectureProfile, ProjectProfile, TestProfile } from '../schemas/project-profile.js'
import { maskListSecretLikeValues, maskSecretLikeValues, parseList, withTodoIfEmpty } from '../utils/list.js'
import { collectContracts, collectRisks } from './risk-prompts.js'
import { collectLocalContext } from './local-prompts.js'

export async function collectProjectProfile(rootDir: string): Promise<ProjectProfile> {
  const projectName = await input({
    message: 'Project name:',
    default: path.basename(path.resolve(rootDir)),
  })
  const projectSummary = await input({
    message: 'One-sentence project summary:',
    default: 'TODO: human review required',
  })
  const architecture = await collectArchitectureProfile()
  const contracts = await collectContracts()
  const risks = await collectRisks()
  const tests = await collectTestProfile()
  const localContext = await collectLocalContext()

  return {
    projectName: maskSecretLikeValues(projectName.trim() || path.basename(path.resolve(rootDir))),
    projectSummary: maskSecretLikeValues(projectSummary.trim() || 'TODO: human review required'),
    rootDir: path.resolve(rootDir),
    profile: 'claude-code',
    stacks: [],
    architecture,
    contracts,
    risks,
    tests,
    localContext,
  }
}

async function collectArchitectureProfile(): Promise<ArchitectureProfile> {
  const coreBusinessFlow = await input({
    message: 'Current core business flow:',
    default: 'TODO: human review required',
  })
  const mainPath = await input({
    message: 'Current main path / primary implementation:',
    default: 'TODO: human review required',
  })
  const legacyPath = await input({
    message: 'Legacy path / compatibility flow that still matters:',
    default: 'TODO: human review required',
  })
  const runtimeEntryPoints = parseList(
    await input({
      message: 'Runtime entry points (CLI/server/frontend/job entry files):',
    }),
  )
  const moduleBoundaries = parseList(
    await input({
      message: 'Module boundaries AI must not cross casually:',
    }),
  )
  const externalSystems = parseList(
    await input({
      message: 'Sensitive external systems (names only, no secrets):',
    }),
  )

  return {
    coreBusinessFlow: maskSecretLikeValues(coreBusinessFlow.trim() || 'TODO: human review required'),
    mainPath: maskSecretLikeValues(mainPath.trim() || 'TODO: human review required'),
    legacyPath: maskSecretLikeValues(legacyPath.trim() || 'TODO: human review required'),
    runtimeEntryPoints: withTodoIfEmpty(maskListSecretLikeValues(runtimeEntryPoints)),
    moduleBoundaries: withTodoIfEmpty(maskListSecretLikeValues(moduleBoundaries)),
    externalSystems: withTodoIfEmpty(maskListSecretLikeValues(externalSystems)),
  }
}

async function collectTestProfile(): Promise<TestProfile> {
  const testCommands = parseList(
    await input({
      message: 'Real test commands to verify changes:',
    }),
  )
  const buildCommands = parseList(
    await input({
      message: 'Build/typecheck/lint commands:',
    }),
  )
  const invalidOrPlaceholderTests = parseList(
    await input({
      message: 'Placeholder or untrusted tests:',
    }),
  )
  const verificationRules = parseList(
    await input({
      message: 'Project-specific verification rules:',
    }),
  )

  return {
    testCommands: withTodoIfEmpty(maskListSecretLikeValues(testCommands)),
    buildCommands: withTodoIfEmpty(maskListSecretLikeValues(buildCommands)),
    invalidOrPlaceholderTests: withTodoIfEmpty(maskListSecretLikeValues(invalidOrPlaceholderTests)),
    verificationRules: withTodoIfEmpty(maskListSecretLikeValues(verificationRules)),
  }
}
