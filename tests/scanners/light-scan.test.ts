import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createScannedProjectProfile } from '../../src/scanners/light-scan.js'

let tempDir: string

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-project-guard-scan-'))
})

afterEach(async () => {
  await fs.rm(tempDir, { recursive: true, force: true })
})

describe('createScannedProjectProfile', () => {
  it('infers project basics from local files without prompting', async () => {
    await fs.mkdir(path.join(tempDir, 'src', 'auth'), { recursive: true })
    await fs.mkdir(path.join(tempDir, 'db', 'migration'), { recursive: true })
    await fs.writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({
        name: 'legacy-shop',
        scripts: {
          test: 'vitest run',
          build: 'tsc',
          typecheck: 'tsc --noEmit',
        },
        dependencies: {
          react: '^18.0.0',
          stripe: '^14.0.0',
        },
      }),
      'utf8',
    )

    const profile = await createScannedProjectProfile(tempDir)

    expect(profile.projectName).toBe('legacy-shop')
    expect(profile.projectSummary).toContain('legacy-shop')
    expect(profile.stacks.map((stack) => stack.name)).toContain('Node.js')
    expect(profile.stacks.map((stack) => stack.name)).toContain('React')
    expect(profile.risks.dangerousModules).toEqual(
      expect.arrayContaining(['src/auth', 'db/migration']),
    )
    expect(profile.tests.testCommands).toContain('npm test')
    expect(profile.tests.buildCommands).toEqual(
      expect.arrayContaining(['npm run build', 'npm run typecheck']),
    )
    expect(profile.architecture.externalSystems).toContain('Stripe')
  })
})
