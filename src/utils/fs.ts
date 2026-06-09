import fs from 'node:fs/promises'
import path from 'node:path'
import type { WritePlan } from '../generators/write-plan.js'
import { normalizeRelativePath, resolveInsideOutput } from './path.js'

export interface WriteResult {
  written: string[]
  conflicts: string[]
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

export async function writePlan(
  outputDir: string,
  plan: WritePlan,
  options: { force: boolean },
): Promise<WriteResult> {
  for (const file of plan.files) {
    resolveInsideOutput(outputDir, file.relativePath)
  }

  const conflicts = await findConflicts(outputDir, plan)
  if (conflicts.length > 0 && !options.force) {
    return { written: [], conflicts }
  }

  const written: string[] = []
  for (const file of plan.files) {
    const targetPath = resolveInsideOutput(outputDir, file.relativePath)
    await fs.mkdir(path.dirname(targetPath), { recursive: true })
    await fs.writeFile(targetPath, file.content, 'utf8')
    written.push(normalizeRelativePath(file.relativePath))
  }

  return { written, conflicts }
}
