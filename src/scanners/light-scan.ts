import fs from 'node:fs/promises'
import path from 'node:path'
import { createDefaultProjectProfile } from '../prompts/answers-profile.js'
import type { ProjectProfile, StackInfo } from '../schemas/project-profile.js'

interface PackageJson {
  name?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export async function createScannedProjectProfile(rootDir: string): Promise<ProjectProfile> {
  const profile = createDefaultProjectProfile(rootDir)
  const packageJson = await readPackageJson(rootDir)
  const entries = await readRootEntries(rootDir)

  return {
    ...profile,
    projectName: packageJson?.name ?? profile.projectName,
    projectSummary: inferSummary(packageJson, entries),
    stacks: inferStacks(packageJson, entries),
    architecture: {
      ...profile.architecture,
      runtimeEntryPoints: inferRuntimeEntryPoints(entries),
      moduleBoundaries: inferModuleBoundaries(entries),
      externalSystems: inferExternalSystems(packageJson),
    },
    contracts: {
      ...profile.contracts,
      apiContracts: inferApiContracts(entries),
      schemaContracts: inferSchemaContracts(entries),
      frontendContracts: inferFrontendContracts(entries),
    },
    risks: {
      ...profile.risks,
      dangerousModules: inferDangerousModules(entries),
      legacyModules: inferLegacyModules(entries),
    },
    tests: {
      ...profile.tests,
      testCommands: inferScriptCommands(packageJson, ['test', 'test:unit', 'test:watch']),
      buildCommands: inferScriptCommands(packageJson, ['build', 'typecheck', 'lint']),
    },
  }
}

async function readPackageJson(rootDir: string): Promise<PackageJson | undefined> {
  try {
    const raw = await fs.readFile(path.join(rootDir, 'package.json'), 'utf8')
    return JSON.parse(raw) as PackageJson
  } catch {
    return undefined
  }
}

async function readRootEntries(rootDir: string): Promise<string[]> {
  const entries: string[] = []
  await collectEntries(rootDir, rootDir, entries, 0)
  return entries.map((entry) => entry.replace(/\\/g, '/'))
}

async function collectEntries(
  rootDir: string,
  currentDir: string,
  entries: string[],
  depth: number,
): Promise<void> {
  if (depth > 3 || entries.length > 500) {
    return
  }

  let dirents: Array<{ name: string; isDirectory(): boolean }> = []
  try {
    dirents = await fs.readdir(currentDir, { withFileTypes: true })
  } catch {
    return
  }

  for (const dirent of dirents) {
    if (shouldSkip(dirent.name)) {
      continue
    }

    const absolutePath = path.join(currentDir, dirent.name)
    const relativePath = path.relative(rootDir, absolutePath)
    entries.push(relativePath)

    if (dirent.isDirectory()) {
      await collectEntries(rootDir, absolutePath, entries, depth + 1)
    }
  }
}

function shouldSkip(name: string): boolean {
  return ['node_modules', '.git', 'dist', 'build', 'coverage', '.next', '.nuxt'].includes(name)
}

function inferSummary(packageJson: PackageJson | undefined, entries: string[]): string {
  if (packageJson?.name) {
    return `Auto-detected project ${packageJson.name}; review and replace this summary with the actual business purpose.`
  }

  if (entries.some((entry) => entry.endsWith('pom.xml') || entry.endsWith('build.gradle'))) {
    return 'Auto-detected Java project; review and replace this summary with the actual business purpose.'
  }

  return 'TODO: human review required'
}

function inferStacks(packageJson: PackageJson | undefined, entries: string[]): StackInfo[] {
  const stacks: StackInfo[] = []
  const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies }

  if (packageJson) {
    stacks.push({
      area: 'unknown',
      name: 'Node.js',
      confidence: 'high',
      evidence: ['package.json'],
    })
  }
  if (deps.react) {
    stacks.push({
      area: 'frontend',
      name: 'React',
      confidence: 'high',
      evidence: ['react dependency'],
    })
  }
  if (deps.vue) {
    stacks.push({ area: 'frontend', name: 'Vue', confidence: 'high', evidence: ['vue dependency'] })
  }
  if (deps.vite) {
    stacks.push({
      area: 'frontend',
      name: 'Vite',
      confidence: 'high',
      evidence: ['vite dependency'],
    })
  }
  if (entries.some((entry) => entry.endsWith('pom.xml'))) {
    stacks.push({ area: 'backend', name: 'Maven/Java', confidence: 'high', evidence: ['pom.xml'] })
  }
  if (entries.some((entry) => entry.endsWith('build.gradle'))) {
    stacks.push({
      area: 'backend',
      name: 'Gradle/Java',
      confidence: 'high',
      evidence: ['build.gradle'],
    })
  }

  return stacks.length > 0
    ? stacks
    : [
        {
          area: 'unknown',
          name: 'Unknown stack',
          confidence: 'low',
          evidence: ['no known stack markers'],
        },
      ]
}

function inferRuntimeEntryPoints(entries: string[]): string[] {
  const candidates = [
    'src/index.ts',
    'src/index.js',
    'src/main.ts',
    'src/main.js',
    'src/App.tsx',
    'src/App.jsx',
    'manage.py',
    'pom.xml',
    'package.json',
  ]
  return withTodo(candidates.filter((candidate) => entries.includes(candidate)))
}

function inferModuleBoundaries(entries: string[]): string[] {
  const roots = ['src', 'app', 'server', 'client', 'backend', 'frontend']
  return withTodo(roots.filter((root) => entries.includes(root)).map((root) => `${root}/`))
}

function inferExternalSystems(packageJson: PackageJson | undefined): string[] {
  const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies }
  const systems: string[] = []
  if (deps.stripe) systems.push('Stripe')
  if (deps.openai || deps['@anthropic-ai/sdk']) systems.push('LLM provider API')
  if (deps.redis || deps.ioredis) systems.push('Redis')
  if (deps.kafka || deps.kafkaJS) systems.push('Kafka')
  return withTodo(systems)
}

function inferApiContracts(entries: string[]): string[] {
  const contracts = entries
    .filter((entry) => /api|controller|route|router/i.test(entry))
    .slice(0, 20)
  return withTodo(contracts)
}

function inferSchemaContracts(entries: string[]): string[] {
  const contracts = entries
    .filter((entry) => /migration|schema|prisma|liquibase|flyway|mapper/i.test(entry))
    .slice(0, 20)
  return withTodo(contracts)
}

function inferFrontendContracts(entries: string[]): string[] {
  const contracts = entries.filter((entry) => /types|api|client/i.test(entry)).slice(0, 20)
  return withTodo(contracts)
}

function inferDangerousModules(entries: string[]): string[] {
  const dangerous = entries
    .filter((entry) =>
      /auth|security|permission|payment|order|migration|schema|mapper|external|client/i.test(entry),
    )
    .slice(0, 30)
  return withTodo(dangerous)
}

function inferLegacyModules(entries: string[]): string[] {
  const legacy = entries
    .filter((entry) => /legacy|deprecated|old|compat|adapter|v1/i.test(entry))
    .slice(0, 30)
  return withTodo(legacy)
}

function inferScriptCommands(packageJson: PackageJson | undefined, names: string[]): string[] {
  if (!packageJson?.scripts) {
    return ['TODO: human review required']
  }

  const commands = names
    .filter((name) => packageJson.scripts?.[name])
    .map((name) => (name === 'test' ? 'npm test' : `npm run ${name}`))

  return withTodo(commands)
}

function withTodo(items: string[]): string[] {
  return items.length > 0 ? items : ['TODO: human review required']
}
