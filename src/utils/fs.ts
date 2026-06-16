import fs from 'node:fs/promises'
import path from 'node:path'
import type { WritePlan } from '../generators/write-plan.js'
import { normalizeRelativePath, resolveInsideOutput } from './path.js'

export interface MergeHandler {
  relativePath: string
  merge: (existingContent: string, generatedContent: string) => string
}

export interface WritePlanAnalysis {
  conflicts: string[]
  mergeable: string[]
  blocked: string[]
  backups: string[]
}

export interface WriteResult {
  written: string[]
  conflicts: string[]
  blocked: string[]
  merged: string[]
  backups: string[]
}

export interface WritePlanOptions {
  force: boolean
  mergeHandlers?: MergeHandler[]
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

export async function findConflicts(outputDir: string, plan: WritePlan): Promise<string[]> {
  const conflicts: string[] = []

  for (const file of plan.files) {
    const targetPath = resolveInsideOutput(outputDir, file.relativePath)
    if (await exists(targetPath)) {
      conflicts.push(normalizeRelativePath(file.relativePath))
    }
  }

  return conflicts
}

export async function analyzeWritePlan(
  outputDir: string,
  plan: WritePlan,
  options: WritePlanOptions,
): Promise<WritePlanAnalysis> {
  const mergeHandlers = createMergeHandlerMap(options.mergeHandlers)

  for (const file of plan.files) {
    resolveInsideOutput(outputDir, file.relativePath)
  }

  const conflicts = await findConflicts(outputDir, plan)
  const mergeable = conflicts.filter((conflict) => mergeHandlers.has(conflict))
  const blocked = options.force
    ? []
    : conflicts.filter((conflict) => !mergeHandlers.has(conflict))
  const backups = await Promise.all(
    mergeable.map(async (relativePath) => {
      const targetPath = resolveInsideOutput(outputDir, relativePath)
      return normalizeOutputRelativePath(outputDir, await findAvailableBackupPath(targetPath))
    }),
  )

  return { conflicts, mergeable, blocked, backups }
}

export async function writePlan(
  outputDir: string,
  plan: WritePlan,
  options: WritePlanOptions,
): Promise<WriteResult> {
  const mergeHandlers = createMergeHandlerMap(options.mergeHandlers)
  const analysis = await analyzeWritePlan(outputDir, plan, options)

  if (analysis.blocked.length > 0) {
    return {
      written: [],
      conflicts: analysis.conflicts,
      blocked: analysis.blocked,
      merged: [],
      backups: [],
    }
  }

  const conflictSet = new Set(analysis.conflicts)
  const written: string[] = []
  const merged: string[] = []
  const backups: string[] = []

  for (const file of plan.files) {
    const relativePath = normalizeRelativePath(file.relativePath)
    const targetPath = resolveInsideOutput(outputDir, relativePath)
    const mergeHandler = mergeHandlers.get(relativePath)

    await fs.mkdir(path.dirname(targetPath), { recursive: true })

    if (mergeHandler && conflictSet.has(relativePath)) {
      const existingContent = await fs.readFile(targetPath, 'utf8')
      const backupPath = await writeBackup(targetPath, existingContent)
      const mergedContent = mergeHandler.merge(existingContent, file.content)

      await fs.writeFile(targetPath, mergedContent, 'utf8')
      written.push(relativePath)
      merged.push(relativePath)
      backups.push(normalizeOutputRelativePath(outputDir, backupPath))
      continue
    }

    await fs.writeFile(targetPath, file.content, 'utf8')
    written.push(relativePath)
  }

  return { written, conflicts: analysis.conflicts, blocked: [], merged, backups }
}

function createMergeHandlerMap(mergeHandlers: MergeHandler[] = []): Map<string, MergeHandler> {
  return new Map(
    mergeHandlers.map((handler) => [normalizeRelativePath(handler.relativePath), handler]),
  )
}

async function findAvailableBackupPath(targetPath: string): Promise<string> {
  let suffix = 0
  while (true) {
    const backupPath = backupPathForSuffix(targetPath, suffix)
    if (!(await exists(backupPath))) {
      return backupPath
    }
    suffix += 1
  }
}

async function writeBackup(targetPath: string, content: string): Promise<string> {
  let suffix = 0
  while (true) {
    const backupPath = backupPathForSuffix(targetPath, suffix)
    try {
      await fs.writeFile(backupPath, content, { encoding: 'utf8', flag: 'wx' })
      return backupPath
    } catch (error) {
      if (isFileAlreadyExistsError(error)) {
        suffix += 1
        continue
      }
      throw error
    }
  }
}

function backupPathForSuffix(targetPath: string, suffix: number): string {
  return suffix === 0 ? `${targetPath}.apg-backup` : `${targetPath}.apg-backup.${suffix}`
}

function normalizeOutputRelativePath(outputDir: string, filePath: string): string {
  return normalizeRelativePath(path.relative(path.resolve(outputDir), filePath))
}

function isFileAlreadyExistsError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'EEXIST'
  )
}
