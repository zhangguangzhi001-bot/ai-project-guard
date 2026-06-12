import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { loadProjectProfileFromAnswers } from '../../src/prompts/answers-profile.js'

let tempDir: string

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-project-guard-answers-'))
})

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true })
})

describe('loadProjectProfileFromAnswers', () => {
  it('loads a non-interactive profile from JSON answers', async () => {
    const answersPath = path.join(tempDir, 'answers.json')
    await fs.writeFile(
      answersPath,
      JSON.stringify({
        projectName: 'Legacy Shop',
        projectSummary: 'Existing commerce app.',
        coreBusinessFlow: 'Order creation',
        dangerousModules: ['src/auth'],
        apiContracts: ['ApiResponse<T>'],
        testCommands: ['npm test'],
        currentBranch: 'main',
      }),
      'utf8',
    )

    const profile = await loadProjectProfileFromAnswers(tempDir, answersPath, { language: 'en' })

    expect(profile.projectName).toBe('Legacy Shop')
    expect(profile.risks.dangerousModules).toEqual(['src/auth'])
    expect(profile.contracts.apiContracts).toEqual(['ApiResponse<T>'])
    expect(profile.tests.testCommands).toEqual(['npm test'])
    expect(profile.architecture.legacyPath).toBe('TODO: human review required')
  })

  it('masks secret-like values from answers', async () => {
    const answersPath = path.join(tempDir, 'answers.json')
    await fs.writeFile(
      answersPath,
      JSON.stringify({
        projectName: 'password=abc123',
        dangerousModules: ['token=sk-1234567890abcdef'],
      }),
      'utf8',
    )

    const profile = await loadProjectProfileFromAnswers(tempDir, answersPath)

    expect(profile.projectName).toBe('password=[REDACTED]')
    expect(profile.risks.dangerousModules).toEqual(['token=[REDACTED]'])
  })
})
