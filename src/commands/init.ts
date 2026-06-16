import path from 'node:path'
import { mergeExistingClaudeMd } from '../generators/claude-merge.js'
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
  analyzeWritePlan as defaultAnalyzeWritePlan,
  writePlan as defaultWritePlan,
  type MergeHandler,
  type WritePlanAnalysis,
  type WriteResult,
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
  analyzeWritePlan?: (
    outputDir: string,
    plan: WritePlan,
    options: { force: boolean; mergeHandlers?: MergeHandler[] },
  ) => Promise<WritePlanAnalysis>
  writePlan?: (
    outputDir: string,
    plan: WritePlan,
    options: { force: boolean; mergeHandlers?: MergeHandler[] },
  ) => Promise<WriteResult>
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
  const analyzeWritePlan = dependencies.analyzeWritePlan ?? defaultAnalyzeWritePlan
  const persistWritePlan = dependencies.writePlan ?? defaultWritePlan

  const language = normalizeGeneratedLanguage(options.language)
  const outputDir = path.resolve(options.output)
  const profile = await resolveProfile(outputDir, options, language, collectProjectProfile)
  const plan = await generateClaudeCodePlan(profile, { language })
  const mergeHandlers = createMergeHandlers(language)

  if (options.dryRun) {
    const analysis = await analyzeWritePlan(outputDir, plan, {
      force: options.force,
      mergeHandlers,
    })
    printDryRun(
      outputDir,
      language,
      profile.suggestedPacks?.map((pack) => `${pack.id} (${pack.confidence})`) ?? [],
      plan.files.map((file) => file.relativePath),
      analysis,
    )
    return
  }

  const result = await persistWritePlan(outputDir, plan, {
    force: options.force,
    mergeHandlers,
  })

  if (result.blocked.length > 0) {
    logger.error('Refusing to overwrite existing governance files.')
    logger.info('Existing files:')
    logger.list(result.blocked)
    logger.info('Existing CLAUDE.md can be merged automatically. Other existing governance files require --force or manual resolution.')
    process.exitCode = 1
    return
  }

  logger.success(`Generated ${result.written.length} governance files in ${outputDir}`)
  logger.list(result.written)
  if (result.merged.length > 0) {
    logger.info('Merged existing files:')
    logger.list(result.merged)
  }
  if (result.backups.length > 0) {
    logger.info('Backups created:')
    logger.list(result.backups)
  }
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

function createMergeHandlers(language: GeneratedLanguage): MergeHandler[] {
  return [
    {
      relativePath: 'CLAUDE.md',
      merge: (existingContent, generatedContent) =>
        mergeExistingClaudeMd(generatedContent, existingContent, { language }),
    },
  ]
}

function printDryRun(
  outputDir: string,
  language: GeneratedLanguage,
  suggestedPacks: string[],
  files: string[],
  analysis: WritePlanAnalysis,
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
  if (analysis.conflicts.length > 0) {
    logger.list(analysis.conflicts)
  } else {
    logger.info('- none')
  }
  logger.info('')
  logger.info('Would merge:')
  if (analysis.mergeable.length > 0) {
    logger.list(analysis.mergeable)
  } else {
    logger.info('- none')
  }
  logger.info('')
  logger.info('Would create backups:')
  if (analysis.backups.length > 0) {
    logger.list(analysis.backups)
  } else {
    logger.info('- none')
  }
  logger.info('')
  logger.info('Blocking conflicts:')
  if (analysis.blocked.length > 0) {
    logger.list(analysis.blocked)
  } else {
    logger.info('- none')
  }
  logger.info('')
  logger.info('No files were written.')
}
