import { describe, expect, it } from 'vitest'
import {
  CLAUDE_CODE_BASE_OUTPUT_FILES,
  CLAUDE_CODE_PACK_OUTPUT_FILES,
  generateClaudeCodePlan,
} from '../../src/generators/claude-generator.js'
import type { ProjectProfile } from '../../src/schemas/project-profile.js'

function sampleProfile(): ProjectProfile {
  return {
    projectName: 'Sample Legacy App',
    projectSummary: 'A sample app used to test generated governance files.',
    rootDir: '/tmp/sample-legacy-app',
    profile: 'claude-code',
    stacks: [],
    architecture: {
      coreBusinessFlow: 'Order creation and fulfillment',
      mainPath: 'src/orders/current',
      legacyPath: 'src/orders/legacy compatibility flow',
      runtimeEntryPoints: ['src/main.ts'],
      moduleBoundaries: ['orders must not import billing internals'],
      externalSystems: ['Stripe', 'Warehouse API'],
    },
    contracts: {
      apiContracts: ['ApiResponse<T>', '/api prefix'],
      statusContracts: ['PENDING', 'FULFILLED'],
      schemaContracts: ['db/migration/*.sql'],
      frontendContracts: ['src/api/types.ts'],
      externalContracts: ['Stripe webhook signature validation'],
    },
    risks: {
      dangerousModules: ['src/auth', 'db/migration'],
      legacyModules: ['src/orders/legacy'],
      forbiddenActions: ['Do not delete deprecated services without approval'],
      humanReviewRequired: ['Auth changes', 'Migration changes'],
    },
    tests: {
      testCommands: ['npm test'],
      buildCommands: ['npm run typecheck'],
      invalidOrPlaceholderTests: ['tests/placeholder.test.ts'],
      verificationRules: ['Run order flow smoke test'],
    },
    localContext: {
      currentBranch: 'feature/order-guardrails',
      currentFocus: 'Initialize guard rails',
      temporaryConstraints: ['Do not touch billing'],
      currentForbiddenAreas: ['src/billing'],
    },
    suggestedPacks: [],
  }
}

function javaProfile(): ProjectProfile {
  return {
    ...sampleProfile(),
    stacks: [{ area: 'backend', name: 'Maven/Java', confidence: 'high', evidence: ['pom.xml'] }],
    tests: {
      ...sampleProfile().tests,
      testCommands: ['mvn test'],
      buildCommands: ['mvn clean package -DskipTests'],
    },
    suggestedPacks: [
      {
        id: 'java-release-audit',
        confidence: 'high',
        reason: 'Detected Java project',
        evidence: ['pom.xml', 'src/main/java'],
      },
    ],
  }
}

describe('generateClaudeCodePlan', () => {
  it('generates the base Claude Code governance file set by default', async () => {
    const plan = await generateClaudeCodePlan(sampleProfile())
    const paths = plan.files.map((file) => file.relativePath)

    expect(paths).toEqual(CLAUDE_CODE_BASE_OUTPUT_FILES)
    expect(paths).toContain('.claude/commands/apg-daily-review.md')
    expect(paths).toContain('.claude/commands/apg-requirement-clarify.md')
    expect(paths).not.toContain('.claude/commands/apg-java-release-audit.md')
    expect(paths).toContain('.claude/workflows/apg-workflow-requirement-clarify.md')
  })

  it('generates the Java release audit pack when suggested', async () => {
    const plan = await generateClaudeCodePlan(javaProfile())
    const paths = plan.files.map((file) => file.relativePath)

    expect(paths).toEqual([
      ...CLAUDE_CODE_BASE_OUTPUT_FILES,
      ...CLAUDE_CODE_PACK_OUTPUT_FILES['java-release-audit'],
    ])
    expect(paths).toContain('.claude/commands/apg-java-release-audit.md')
    expect(paths).toContain('.claude/agents/apg-java-risk-module-auditor.md')
    expect(paths).toContain('.claude/agents/apg-financial-release-auditor.md')
    expect(paths).toContain('.claude/agents/apg-release-blocker-judge.md')
    expect(paths).toContain('.claude/workflows/apg-workflow-java-release-audit.md')
  })

  it('renders project-specific governance content', async () => {
    const plan = await generateClaudeCodePlan(sampleProfile())
    const claude = plan.files.find((file) => file.relativePath === 'CLAUDE.md')

    expect(claude?.content).toContain('Sample Legacy App')
    expect(claude?.content).toContain('Order creation and fulfillment')
    expect(claude?.content).toContain('ApiResponse&lt;T&gt;')
    expect(claude?.content).toContain('src/auth')
  })
})
