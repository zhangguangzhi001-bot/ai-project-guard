import { describe, expect, it } from 'vitest'
import { runInitCommand } from '../../src/commands/init.js'
import type { WritePlan } from '../../src/generators/write-plan.js'
import type { ProjectProfile } from '../../src/schemas/project-profile.js'

function profile(rootDir: string): ProjectProfile {
  return {
    projectName: 'Dry Run App',
    projectSummary: 'Test profile',
    rootDir,
    profile: 'claude-code',
    stacks: [],
    architecture: {
      coreBusinessFlow: 'Flow',
      mainPath: 'main',
      legacyPath: 'legacy',
      runtimeEntryPoints: ['src/index.ts'],
      moduleBoundaries: ['boundary'],
      externalSystems: ['external'],
    },
    contracts: {
      apiContracts: ['ApiResponse<T>'],
      statusContracts: ['PENDING'],
      schemaContracts: ['migration'],
      frontendContracts: ['types'],
      externalContracts: ['webhook'],
    },
    risks: {
      dangerousModules: ['auth'],
      legacyModules: ['legacy'],
      forbiddenActions: ['delete legacy'],
      humanReviewRequired: ['auth'],
    },
    tests: {
      testCommands: ['npm test'],
      buildCommands: ['npm run typecheck'],
      invalidOrPlaceholderTests: ['placeholder'],
      verificationRules: ['verify'],
    },
    localContext: {
      currentBranch: 'main',
      currentFocus: 'test',
      temporaryConstraints: ['constraint'],
      currentForbiddenAreas: ['forbidden'],
    },
  }
}

const plan: WritePlan = {
  files: [{ relativePath: 'CLAUDE.md', content: '# CLAUDE.md\n' }],
}

describe('runInitCommand', () => {
  it('rejects profiles that are planned but not implemented', async () => {
    await expect(
      runInitCommand({
        profile: 'generic',
        output: '.',
        dryRun: true,
        force: false,
        scan: true,
      }),
    ).rejects.toThrow('planned but not implemented')
  })

  it('does not write during dry-run', async () => {
    let writeCalled = false

    await runInitCommand(
      {
        profile: 'claude-code',
        output: '.',
        dryRun: true,
        force: false,
        scan: true,
      },
      {
        collectProjectProfile: async (rootDir) => profile(rootDir),
        generateClaudeCodePlan: async () => plan,
        findConflicts: async () => [],
        writePlan: async () => {
          writeCalled = true
          return { written: [], conflicts: [] }
        },
      },
    )

    expect(writeCalled).toBe(false)
  })
})
