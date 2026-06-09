import path from 'node:path'
import { generateClaudeCodePlan as defaultGenerateClaudeCodePlan } from '../generators/index.js'
import type { WritePlan } from '../generators/write-plan.js'
import { loadProjectProfileFromAnswers } from '../prompts/answers-profile.js'
import { collectProjectProfile as defaultCollectProjectProfile } from '../prompts/init-prompts.js'
import type { ProjectProfile } from '../schemas/project-profile.js'
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
}

export interface InitDependencies {
  collectProjectProfile?: (rootDir: string) => Promise<ProjectProfile>
  generateClaudeCodePlan?: (profile: ProjectProfile) => Promise<WritePlan>
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

  const outputDir = path.resolve(options.output)
  const profile = options.answers
    ? await loadProjectProfileFromAnswers(outputDir, options.answers)
    : await collectProjectProfile(outputDir)
  const plan = await generateClaudeCodePlan(profile)

  if (options.dryRun) {
    const conflicts = await findConflicts(outputDir, plan)
    printDryRun(
      outputDir,
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

function printDryRun(outputDir: string, files: string[], conflicts: string[]): void {
  logger.info('AI Project Guard dry run')
  logger.info('')
  logger.info('Profile: claude-code')
  logger.info(`Output: ${outputDir}`)
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
