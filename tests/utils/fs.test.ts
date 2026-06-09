import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { WritePlan } from '../../src/generators/write-plan.js'
import { findConflicts, writePlan } from '../../src/utils/fs.js'
import { resolveInsideOutput } from '../../src/utils/path.js'

let tempDir: string

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-project-guard-'))
})

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true })
})

function samplePlan(): WritePlan {
  return {
    files: [
      { relativePath: 'CLAUDE.md', content: '# CLAUDE.md\n' },
      { relativePath: '.claude/agents/apg-code-reviewer.md', content: '# apg-code-reviewer\n' },
    ],
  }
}

describe('writePlan', () => {
  it('writes allowed governance files', async () => {
    const result = await writePlan(tempDir, samplePlan(), { force: false })

    expect(result.written).toEqual(['CLAUDE.md', '.claude/agents/apg-code-reviewer.md'])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md'), 'utf8')).resolves.toContain('CLAUDE')
  })

  it('refuses to overwrite existing files without force and writes nothing', async () => {
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), 'existing', 'utf8')

    const result = await writePlan(tempDir, samplePlan(), { force: false })

    expect(result.written).toEqual([])
    expect(result.conflicts).toEqual(['CLAUDE.md'])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md'), 'utf8')).resolves.toBe('existing')
  })

  it('reports conflicts for dry-run callers', async () => {
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), 'existing', 'utf8')

    await expect(findConflicts(tempDir, samplePlan())).resolves.toEqual(['CLAUDE.md'])
  })

  it('rejects path traversal and non-governance files', () => {
    expect(() => resolveInsideOutput(tempDir, '../CLAUDE.md')).toThrow(/escapes/)
    expect(() => resolveInsideOutput(tempDir, 'src/index.ts')).toThrow(/not an allowed/)
  })
})
