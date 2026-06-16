import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { WritePlan } from '../../src/generators/write-plan.js'
import type { MergeHandler } from '../../src/utils/fs.js'
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

function claudeMergeHandler(): MergeHandler {
  return {
    relativePath: 'CLAUDE.md',
    merge: (existingContent, generatedContent) =>
      `${generatedContent}\n<!-- imported -->\n${existingContent}\n`,
  }
}

describe('writePlan', () => {
  it('writes allowed governance files', async () => {
    const result = await writePlan(tempDir, samplePlan(), { force: false })

    expect(result.written).toEqual(['CLAUDE.md', '.claude/agents/apg-code-reviewer.md'])
    expect(result.conflicts).toEqual([])
    expect(result.blocked).toEqual([])
    expect(result.merged).toEqual([])
    expect(result.backups).toEqual([])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md'), 'utf8')).resolves.toContain('CLAUDE')
  })

  it('refuses to overwrite existing files without force and writes nothing', async () => {
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), 'existing', 'utf8')

    const result = await writePlan(tempDir, samplePlan(), { force: false })

    expect(result.written).toEqual([])
    expect(result.conflicts).toEqual(['CLAUDE.md'])
    expect(result.blocked).toEqual(['CLAUDE.md'])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md'), 'utf8')).resolves.toBe('existing')
  })

  it('reports conflicts for dry-run callers', async () => {
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), 'existing', 'utf8')

    await expect(findConflicts(tempDir, samplePlan())).resolves.toEqual(['CLAUDE.md'])
  })

  it('merges existing CLAUDE.md and creates a backup', async () => {
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), '# Existing\n', 'utf8')

    const result = await writePlan(tempDir, samplePlan(), {
      force: false,
      mergeHandlers: [claudeMergeHandler()],
    })

    expect(result.written).toEqual(['CLAUDE.md', '.claude/agents/apg-code-reviewer.md'])
    expect(result.conflicts).toEqual(['CLAUDE.md'])
    expect(result.blocked).toEqual([])
    expect(result.merged).toEqual(['CLAUDE.md'])
    expect(result.backups).toEqual(['CLAUDE.md.apg-backup'])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md.apg-backup'), 'utf8')).resolves.toBe(
      '# Existing\n',
    )
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md'), 'utf8')).resolves.toBe(
      '# CLAUDE.md\n\n<!-- imported -->\n# Existing\n\n',
    )
  })

  it('does not overwrite existing backups', async () => {
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), '# Existing\n', 'utf8')
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md.apg-backup'), 'older backup', 'utf8')

    const result = await writePlan(tempDir, samplePlan(), {
      force: false,
      mergeHandlers: [claudeMergeHandler()],
    })

    expect(result.backups).toEqual(['CLAUDE.md.apg-backup.1'])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md.apg-backup'), 'utf8')).resolves.toBe(
      'older backup',
    )
    await expect(
      fs.readFile(path.join(tempDir, 'CLAUDE.md.apg-backup.1'), 'utf8'),
    ).resolves.toBe('# Existing\n')
  })

  it('blocks unmergeable conflicts and writes nothing', async () => {
    await fs.mkdir(path.join(tempDir, '.claude/agents'), { recursive: true })
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), '# Existing\n', 'utf8')
    await fs.writeFile(
      path.join(tempDir, '.claude/agents/apg-code-reviewer.md'),
      'existing agent',
      'utf8',
    )

    const result = await writePlan(tempDir, samplePlan(), {
      force: false,
      mergeHandlers: [claudeMergeHandler()],
    })

    expect(result.written).toEqual([])
    expect(result.conflicts).toEqual(['CLAUDE.md', '.claude/agents/apg-code-reviewer.md'])
    expect(result.blocked).toEqual(['.claude/agents/apg-code-reviewer.md'])
    expect(result.backups).toEqual([])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md'), 'utf8')).resolves.toBe('# Existing\n')
    await expect(
      fs.readFile(path.join(tempDir, '.claude/agents/apg-code-reviewer.md'), 'utf8'),
    ).resolves.toBe('existing agent')
    await expect(fs.access(path.join(tempDir, 'CLAUDE.md.apg-backup'))).rejects.toThrow()
  })

  it('merges CLAUDE.md while force overwrites other conflicts', async () => {
    await fs.mkdir(path.join(tempDir, '.claude/agents'), { recursive: true })
    await fs.writeFile(path.join(tempDir, 'CLAUDE.md'), '# Existing\n', 'utf8')
    await fs.writeFile(
      path.join(tempDir, '.claude/agents/apg-code-reviewer.md'),
      'existing agent',
      'utf8',
    )

    const result = await writePlan(tempDir, samplePlan(), {
      force: true,
      mergeHandlers: [claudeMergeHandler()],
    })

    expect(result.blocked).toEqual([])
    expect(result.merged).toEqual(['CLAUDE.md'])
    await expect(fs.readFile(path.join(tempDir, 'CLAUDE.md'), 'utf8')).resolves.toContain(
      '# Existing',
    )
    await expect(
      fs.readFile(path.join(tempDir, '.claude/agents/apg-code-reviewer.md'), 'utf8'),
    ).resolves.toBe('# apg-code-reviewer\n')
  })

  it('rejects path traversal and non-governance files', () => {
    expect(() => resolveInsideOutput(tempDir, '../CLAUDE.md')).toThrow(/escapes/)
    expect(() => resolveInsideOutput(tempDir, 'src/index.ts')).toThrow(/not an allowed/)
  })
})
