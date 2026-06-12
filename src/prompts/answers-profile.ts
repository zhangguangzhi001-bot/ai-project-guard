import fs from 'node:fs/promises'
import path from 'node:path'
import type { ProjectProfile } from '../schemas/project-profile.js'
import type { GeneratedLanguage } from '../schemas/template-context.js'
import { todoTextForLanguage } from '../schemas/template-context.js'
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

export interface ProfileLanguageOptions {
  language?: GeneratedLanguage
}

export function createDefaultProjectProfile(
  rootDir: string,
  options: ProfileLanguageOptions = {},
): ProjectProfile {
  const resolvedRootDir = path.resolve(rootDir)
  return toProjectProfile(resolvedRootDir, {}, options.language ?? 'zh')
}

export async function loadProjectProfileFromAnswers(
  rootDir: string,
  answersPath: string,
  options: ProfileLanguageOptions = {},
): Promise<ProjectProfile> {
  const resolvedAnswersPath = path.resolve(answersPath)
  const raw = await fs.readFile(resolvedAnswersPath, 'utf8')
  const answers = JSON.parse(raw) as AnswersFile
  const resolvedRootDir = path.resolve(rootDir)

  return toProjectProfile(resolvedRootDir, answers, options.language ?? 'zh')
}

function toProjectProfile(
  resolvedRootDir: string,
  answers: AnswersFile,
  language: GeneratedLanguage,
): ProjectProfile {
  const todoText = todoTextForLanguage(language)
  return {
    projectName: text(answers.projectName, path.basename(resolvedRootDir)),
    projectSummary: text(answers.projectSummary, todoText),
    rootDir: resolvedRootDir,
    profile: 'claude-code',
    stacks: [],
    architecture: {
      coreBusinessFlow: text(answers.coreBusinessFlow, todoText),
      mainPath: text(answers.mainPath, todoText),
      legacyPath: text(answers.legacyPath, todoText),
      runtimeEntryPoints: list(answers.runtimeEntryPoints, todoText),
      moduleBoundaries: list(answers.moduleBoundaries, todoText),
      externalSystems: list(answers.externalSystems, todoText),
    },
    contracts: {
      apiContracts: list(answers.apiContracts, todoText),
      statusContracts: list(answers.statusContracts, todoText),
      schemaContracts: list(answers.schemaContracts, todoText),
      frontendContracts: list(answers.frontendContracts, todoText),
      externalContracts: list(answers.externalContracts, todoText),
    },
    risks: {
      dangerousModules: list(answers.dangerousModules, todoText),
      legacyModules: list(answers.legacyModules, todoText),
      forbiddenActions: list(answers.forbiddenActions, todoText),
      humanReviewRequired: list(answers.humanReviewRequired, todoText),
    },
    tests: {
      testCommands: list(answers.testCommands, todoText),
      buildCommands: list(answers.buildCommands, todoText),
      invalidOrPlaceholderTests: list(answers.invalidOrPlaceholderTests, todoText),
      verificationRules: list(answers.verificationRules, todoText),
    },
    localContext: {
      currentBranch: text(answers.currentBranch, todoText),
      currentFocus: text(answers.currentFocus, todoText),
      temporaryConstraints: list(answers.temporaryConstraints, todoText),
      currentForbiddenAreas: list(answers.currentForbiddenAreas, todoText),
    },
    suggestedPacks: [],
  }
}

function text(value: string | undefined, fallback: string): string {
  return maskSecretLikeValues(value?.trim() || fallback)
}

function list(value: AnswerValue, todoText: string): string[] {
  return withTodoIfEmpty(maskListSecretLikeValues(parseList(value)), todoText)
}
