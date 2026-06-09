import path from 'node:path'

const ROOT_FILES = new Set([
  'CLAUDE.md',
  'CLAUDE.architecture.md',
  'CLAUDE.lessons.md',
  'CLAUDE.local.md',
])

const ALLOWED_PREFIXES = ['.claude/agents/', '.claude/commands/', '.claude/workflows/']

export function normalizeRelativePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/')
}

export function assertAllowedGeneratedPath(relativePath: string): void {
  const normalized = normalizeRelativePath(relativePath)

  if (
    path.isAbsolute(relativePath) ||
    normalized.startsWith('../') ||
    normalized.includes('/../')
  ) {
    throw new Error(`Generated path escapes output directory: ${relativePath}`)
  }

  if (ROOT_FILES.has(normalized)) {
    return
  }

  if (
    ALLOWED_PREFIXES.some((prefix) => normalized.startsWith(prefix)) &&
    normalized.endsWith('.md')
  ) {
    return
  }

  throw new Error(`Generated path is not an allowed governance file: ${relativePath}`)
}

export function resolveInsideOutput(outputDir: string, relativePath: string): string {
  assertAllowedGeneratedPath(relativePath)
  const outputRoot = path.resolve(outputDir)
  const targetPath = path.resolve(outputRoot, relativePath)
  const relative = path.relative(outputRoot, targetPath)

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Generated path escapes output directory: ${relativePath}`)
  }

  return targetPath
}
