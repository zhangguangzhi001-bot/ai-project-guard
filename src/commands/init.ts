import path from 'node:path'
import { generateClaudeCodePlan as defaultGenerateClaudeCodePlan } from '../generators/index.js'
import type { WritePlan } from '../generators/write-plan.js'
import {
  createDefaultProjectProfile,
  loadProjectProfileFromAnswers,
} from '../prompts/answers-profile.js'
import { collectProjectProfile as defaultCollectProjectProfile } from '../prompts/init-prompts.js'
import { createScannedProjectProfile } from '../scanners/light-scan.js'
import type { ProjectProfile } from '../schemas/project-profile.js'
import { normalizeGeneratedLanguage, type GeneratedLanguage } from '../schemas/template-context.js'
import {
  findConflicts as defaultFindConflicts,
  writePlan as defaultWritePlan,
} from '../utils/fs.js'
import { logger } from '../utils/logger.js'

export interface InitOptions {
  profile: string
  output: string
  dryRun: boolean
  force: boolean
  scan: boolean
  answers?: string
  full?: boolean
  interactive?: boolean
  language?: string
}

export interface InitDependencies {
  collectProjectProfile?: (rootDir: string, options?: { full?: boolean }) => Promise<ProjectProfile>
  generateClaudeCodePlan?: (
    profile: ProjectProfile,
    options?: { language?: GeneratedLanguage },
  ) => Promise<WritePlan>
  findConflicts?: (outputDir: string, plan: WritePlan) => Promise<string[]>
  writePlan?: (
    outputDir: string,
    plan: WritePlan,
    options: { force: boolean },
  ) => Promise<{ written: string[]; conflicts: string[] }>
}

export async function runInitCommand(
  options: InitOptions,
  dependencies: InitDependencies = {},
): Promise<void> {
  if (options.profile !== 'claude-code') {
    throw new Error(
      `Profile "${options.profile}" is planned but not implemented in v0.1. Use --profile claude-code.`,
    )
  }

  const collectProjectProfile = dependencies.collectProjectProfile ?? defaultCollectProjectProfile
  const generateClaudeCodePlan =
    dependencies.generateClaudeCodePlan ?? defaultGenerateClaudeCodePlan
  const findConflicts = dependencies.findConflicts ?? defaultFindConflicts
  const persistWritePlan = dependencies.writePlan ?? defaultWritePlan

  const language = normalizeGeneratedLanguage(options.language)
  const outputDir = path.resolve(options.output)
  const profile = await resolveProfile(outputDir, options, language, collectProjectProfile)
  const plan = await generateClaudeCodePlan(profile, { language })

  if (options.dryRun) {
    const conflicts = await findConflicts(outputDir, plan)
    printDryRun(
      outputDir,
      language,
      profile.suggestedPacks?.map((pack) => `${pack.id} (${pack.confidence})`) ?? [],
      plan.files.map((file) => file.relativePath),
      conflicts,
    )
    return
  }

  const result = await persistWritePlan(outputDir, plan, { force: options.force })

  if (result.conflicts.length > 0 && !options.force) {
    logger.error('Refusing to overwrite existing governance files.')
    logger.info('Existing files:')
    logger.list(result.conflicts)
    logger.info('Re-run with --force to overwrite these generated governance files.')
    process.exitCode = 1
    return
  }

  logger.success(`Generated ${result.written.length} governance files in ${outputDir}`)
  logger.list(result.written)
}

async function resolveProfile(
  outputDir: string,
  options: InitOptions,
  language: GeneratedLanguage,
  collectProjectProfile: (rootDir: string, options?: { full?: boolean }) => Promise<ProjectProfile>,
): Promise<ProjectProfile> {
  if (options.answers) {
    return loadProjectProfileFromAnswers(outputDir, options.answers, { language })
  }

  if (options.interactive || options.full) {
    return collectProjectProfile(outputDir, { full: options.full })
  }

  if (options.scan === false) {
    return createDefaultProjectProfile(outputDir, { language })
  }

  return createScannedProjectProfile(outputDir, { language })
}

function printDryRun(
  outputDir: string,
  language: GeneratedLanguage,
  suggestedPacks: string[],
  files: string[],
  conflicts: string[],
): void {
  logger.info('AI Project Guard dry run')
  logger.info('')
  logger.info('Profile: claude-code')
  logger.info(`Markdown language: ${language}`)
  logger.info(`Output: ${outputDir}`)
  logger.info('')
  logger.info('Suggested packs:')
  if (suggestedPacks.length > 0) {
    logger.list(suggestedPacks)
  } else {
    logger.info('- none')
  }
  logger.info('')
  logger.info('Would create:')
  logger.list(files)
  logger.info('')
  logger.info('Conflicts:')
  if (conflicts.length > 0) {
    logger.list(conflicts)
  } else {
    logger.info('- none')
  }
  logger.info('')
  logger.info('No files were written.')
}
