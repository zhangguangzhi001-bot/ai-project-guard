import fs from 'node:fs/promises'
import path from 'node:path'
import type { ProjectProfile } from '../schemas/project-profile.js'
import {
  maskListSecretLikeValues,
  maskSecretLikeValues,
  parseList,
  withTodoIfEmpty,
} from '../utils/list.js'

type AnswerValue = string | string[] | undefined

interface AnswersFile {
  projectName?: string
  projectSummary?: string
  coreBusinessFlow?: string
  mainPath?: string
  legacyPath?: string
  runtimeEntryPoints?: AnswerValue
  moduleBoundaries?: AnswerValue
  externalSystems?: AnswerValue
  apiContracts?: AnswerValue
  statusContracts?: AnswerValue
  schemaContracts?: AnswerValue
  frontendContracts?: AnswerValue
  externalContracts?: AnswerValue
  dangerousModules?: AnswerValue
  legacyModules?: AnswerValue
  forbiddenActions?: AnswerValue
  humanReviewRequired?: AnswerValue
  testCommands?: AnswerValue
  buildCommands?: AnswerValue
  invalidOrPlaceholderTests?: AnswerValue
  verificationRules?: AnswerValue
  currentBranch?: string
  currentFocus?: string
  temporaryConstraints?: AnswerValue
  currentForbiddenAreas?: AnswerValue
}

const TODO = 'TODO: human review required'

export function createDefaultProjectProfile(rootDir: string): ProjectProfile {
  const resolvedRootDir = path.resolve(rootDir)
  return toProjectProfile(resolvedRootDir, {})
}

export async function loadProjectProfileFromAnswers(
  rootDir: string,
  answersPath: string,
): Promise<ProjectProfile> {
  const resolvedAnswersPath = path.resolve(answersPath)
  const raw = await fs.readFile(resolvedAnswersPath, 'utf8')
  const answers = JSON.parse(raw) as AnswersFile
  const resolvedRootDir = path.resolve(rootDir)

  return toProjectProfile(resolvedRootDir, answers)
}

function toProjectProfile(resolvedRootDir: string, answers: AnswersFile): ProjectProfile {
  return {
    projectName: text(answers.projectName, path.basename(resolvedRootDir)),
    projectSummary: text(answers.projectSummary, TODO),
    rootDir: resolvedRootDir,
    profile: 'claude-code',
    stacks: [],
    architecture: {
      coreBusinessFlow: text(answers.coreBusinessFlow, TODO),
      mainPath: text(answers.mainPath, TODO),
      legacyPath: text(answers.legacyPath, TODO),
      runtimeEntryPoints: list(answers.runtimeEntryPoints),
      moduleBoundaries: list(answers.moduleBoundaries),
      externalSystems: list(answers.externalSystems),
    },
    contracts: {
      apiContracts: list(answers.apiContracts),
      statusContracts: list(answers.statusContracts),
      schemaContracts: list(answers.schemaContracts),
      frontendContracts: list(answers.frontendContracts),
      externalContracts: list(answers.externalContracts),
    },
    risks: {
      dangerousModules: list(answers.dangerousModules),
      legacyModules: list(answers.legacyModules),
      forbiddenActions: list(answers.forbiddenActions),
      humanReviewRequired: list(answers.humanReviewRequired),
    },
    tests: {
      testCommands: list(answers.testCommands),
      buildCommands: list(answers.buildCommands),
      invalidOrPlaceholderTests: list(answers.invalidOrPlaceholderTests),
      verificationRules: list(answers.verificationRules),
    },
    localContext: {
      currentBranch: text(answers.currentBranch, TODO),
      currentFocus: text(answers.currentFocus, TODO),
      temporaryConstraints: list(answers.temporaryConstraints),
      currentForbiddenAreas: list(answers.currentForbiddenAreas),
    },
  }
}

function text(value: string | undefined, fallback: string): string {
  return maskSecretLikeValues(value?.trim() || fallback)
}

function list(value: AnswerValue): string[] {
  return withTodoIfEmpty(maskListSecretLikeValues(parseList(value)))
}
