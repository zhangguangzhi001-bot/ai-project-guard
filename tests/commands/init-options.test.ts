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

  it('does not prompt or write during dry-run', async () => {
    let promptCalled = false
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
        collectProjectProfile: async (rootDir) => {
          promptCalled = true
          return profile(rootDir)
        },
        generateClaudeCodePlan: async () => plan,
        analyzeWritePlan: async () => ({
          conflicts: [],
          mergeable: [],
          blocked: [],
          backups: [],
        }),
        writePlan: async () => {
          writeCalled = true
          return { written: [], conflicts: [], blocked: [], merged: [], backups: [] }
        },
      },
    )

    expect(promptCalled).toBe(false)
    expect(writeCalled).toBe(false)
  })

  it('passes a CLAUDE.md merge handler when writing', async () => {
    let mergeOutput = ''

    await runInitCommand(
      {
        profile: 'claude-code',
        output: '.',
        dryRun: false,
        force: false,
        scan: true,
      },
      {
        generateClaudeCodePlan: async () => plan,
        writePlan: async (_outputDir, _plan, options) => {
          expect(options.mergeHandlers?.map((handler) => handler.relativePath)).toEqual([
            'CLAUDE.md',
          ])
          mergeOutput = options.mergeHandlers?.[0]?.merge('# Existing\n', '# Generated\n') ?? ''
          return {
            written: ['CLAUDE.md'],
            conflicts: ['CLAUDE.md'],
            blocked: [],
            merged: ['CLAUDE.md'],
            backups: ['CLAUDE.md.apg-backup'],
          }
        },
      },
    )

    expect(mergeOutput).toContain('# Existing')
    expect(mergeOutput).toContain('从原 CLAUDE.md 导入')
  })

  it('keeps dry-run read-only and reports merge analysis without existing content', async () => {
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
        generateClaudeCodePlan: async () => plan,
        analyzeWritePlan: async (_outputDir, _plan, options) => {
          expect(options.mergeHandlers?.map((handler) => handler.relativePath)).toEqual([
            'CLAUDE.md',
          ])
          return {
            conflicts: ['CLAUDE.md'],
            mergeable: ['CLAUDE.md'],
            blocked: [],
            backups: ['CLAUDE.md.apg-backup'],
          }
        },
        writePlan: async () => {
          writeCalled = true
          return { written: [], conflicts: [], blocked: [], merged: [], backups: [] }
        },
      },
    )

    expect(writeCalled).toBe(false)
  })

  it('sets exit code for blocked non-CLAUDE.md conflicts', async () => {
    const previousExitCode = process.exitCode
    process.exitCode = undefined

    await runInitCommand(
      {
        profile: 'claude-code',
        output: '.',
        dryRun: false,
        force: false,
        scan: true,
      },
      {
        generateClaudeCodePlan: async () => plan,
        writePlan: async () => ({
          written: [],
          conflicts: ['.claude/agents/apg-code-reviewer.md'],
          blocked: ['.claude/agents/apg-code-reviewer.md'],
          merged: [],
          backups: [],
        }),
      },
    )

    expect(process.exitCode).toBe(1)
    process.exitCode = previousExitCode
  })
})
