import fs from 'node:fs/promises'
import path from 'node:path'
import { createDefaultProjectProfile } from '../prompts/answers-profile.js'
import type {
  GovernancePackSuggestion,
  ProjectProfile,
  RiskProfile,
  StackInfo,
} from '../schemas/project-profile.js'
import type { GeneratedLanguage } from '../schemas/template-context.js'
import { todoTextForLanguage } from '../schemas/template-context.js'

interface PackageJson {
  name?: string
  scripts?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export async function createScannedProjectProfile(
  rootDir: string,
  options: { language?: GeneratedLanguage } = {},
): Promise<ProjectProfile> {
  const language = options.language ?? 'zh'
  const todoText = todoTextForLanguage(language)
  const profile = createDefaultProjectProfile(rootDir, { language })
  const packageJson = await readPackageJson(rootDir)
  const entries = await readRootEntries(rootDir)
  const risks: RiskProfile = {
    ...profile.risks,
    dangerousModules: inferDangerousModules(entries, todoText),
    legacyModules: inferLegacyModules(entries, todoText),
  }

  return {
    ...profile,
    projectName: packageJson?.name ?? profile.projectName,
    projectSummary: inferSummary(packageJson, entries, language),
    stacks: inferStacks(packageJson, entries, language),
    architecture: {
      ...profile.architecture,
      runtimeEntryPoints: inferRuntimeEntryPoints(entries, todoText),
      moduleBoundaries: inferModuleBoundaries(entries, todoText),
      externalSystems: inferExternalSystems(packageJson, entries, todoText),
    },
    contracts: {
      ...profile.contracts,
      apiContracts: inferApiContracts(entries, todoText),
      schemaContracts: inferSchemaContracts(entries, todoText),
      frontendContracts: inferFrontendContracts(entries, todoText),
    },
    risks,
    tests: {
      ...profile.tests,
      testCommands: inferTestCommands(packageJson, entries, todoText),
      buildCommands: inferBuildCommands(packageJson, entries, todoText),
    },
    suggestedPacks: inferSuggestedPacks(entries, risks, language),
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
  if (depth > 8 || entries.length > 1000) {
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

function inferSummary(
  packageJson: PackageJson | undefined,
  entries: string[],
  language: GeneratedLanguage,
): string {
  if (packageJson?.name) {
    return language === 'zh'
      ? `已自动识别项目 ${packageJson.name}；请检查并替换为真实业务用途说明。`
      : `Auto-detected project ${packageJson.name}; review and replace this summary with the actual business purpose.`
  }

  if (inferJavaEvidence(entries).length > 0) {
    return language === 'zh'
      ? '已自动识别 Java 项目；请检查并替换为真实业务用途说明。'
      : 'Auto-detected Java project; review and replace this summary with the actual business purpose.'
  }

  return todoTextForLanguage(language)
}

function inferStacks(
  packageJson: PackageJson | undefined,
  entries: string[],
  language: GeneratedLanguage,
): StackInfo[] {
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
  const javaEvidence = inferJavaEvidence(entries)
  if (entries.some((entry) => entry.endsWith('pom.xml'))) {
    stacks.push({ area: 'backend', name: 'Maven/Java', confidence: 'high', evidence: ['pom.xml'] })
  }
  if (entries.some((entry) => /(^|\/)build\.gradle(\.kts)?$/.test(entry))) {
    stacks.push({
      area: 'backend',
      name: 'Gradle/Java',
      confidence: 'high',
      evidence: entries.some((entry) => entry.endsWith('build.gradle.kts'))
        ? ['build.gradle.kts']
        : ['build.gradle'],
    })
  }
  if (
    javaEvidence.length > 0 &&
    !stacks.some((stack) => stack.name === 'Maven/Java' || stack.name === 'Gradle/Java')
  ) {
    stacks.push({
      area: 'backend',
      name: 'Java',
      confidence: 'medium',
      evidence: javaEvidence.slice(0, 5),
    })
  }

  return stacks.length > 0
    ? stacks
    : [
        {
          area: 'unknown',
          name: language === 'zh' ? '未知技术栈' : 'Unknown stack',
          confidence: 'low',
          evidence: [language === 'zh' ? '未发现已知技术栈标记' : 'no known stack markers'],
        },
      ]
}

function inferRuntimeEntryPoints(entries: string[], todoText: string): string[] {
  const candidates = [
    'src/index.ts',
    'src/index.js',
    'src/main.ts',
    'src/main.js',
    'src/App.tsx',
    'src/App.jsx',
    'manage.py',
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'settings.gradle',
    'settings.gradle.kts',
    'src/main/java',
    'src/main/resources/application.yml',
    'src/main/resources/application.properties',
    'package.json',
  ]
  return withTodo(candidates.filter((candidate) => entries.includes(candidate)), todoText)
}

function inferModuleBoundaries(entries: string[], todoText: string): string[] {
  const roots = ['src', 'app', 'server', 'client', 'backend', 'frontend', 'src/main/java']
  return withTodo(roots.filter((root) => entries.includes(root)).map((root) => `${root}/`), todoText)
}

function inferExternalSystems(
  packageJson: PackageJson | undefined,
  entries: string[],
  todoText: string,
): string[] {
  const deps = { ...packageJson?.dependencies, ...packageJson?.devDependencies }
  const systems: string[] = []
  if (deps.stripe) systems.push('Stripe')
  if (deps.openai || deps['@anthropic-ai/sdk']) systems.push('LLM provider API')
  if (deps.redis || deps.ioredis) systems.push('Redis')
  if (deps.kafka || deps.kafkaJS) systems.push('Kafka')
  if (entries.some((entry) => /redis/i.test(entry))) systems.push('Redis')
  if (entries.some((entry) => /kafka|rabbit|rocketmq|mq/i.test(entry))) systems.push('Message queue')
  if (entries.some((entry) => /external|client|feign|resttemplate|webclient/i.test(entry))) {
    systems.push('External HTTP API')
  }
  return withTodo(unique(systems), todoText)
}

function inferApiContracts(entries: string[], todoText: string): string[] {
  const contracts = entries
    .filter((entry) => /api|controller|route|router/i.test(entry))
    .slice(0, 20)
  return withTodo(contracts, todoText)
}

function inferSchemaContracts(entries: string[], todoText: string): string[] {
  const contracts = entries
    .filter((entry) => /migration|schema|prisma|liquibase|flyway|mapper/i.test(entry))
    .slice(0, 20)
  return withTodo(contracts, todoText)
}

function inferFrontendContracts(entries: string[], todoText: string): string[] {
  const contracts = entries.filter((entry) => /types|api|client/i.test(entry)).slice(0, 20)
  return withTodo(contracts, todoText)
}

function inferDangerousModules(entries: string[], todoText: string): string[] {
  const dangerous = entries
    .filter((entry) =>
      /auth|security|permission|payment|pay|order|contract|approval|audit|amount|money|price|fee|settlement|invoice|migration|schema|mapper|repository|external|client|upload|download|schedule|job|task|redis|lock|kafka|rabbit|rocketmq|mq|filter|interceptor/i.test(
        entry,
      ),
    )
    .slice(0, 30)
  return withTodo(dangerous, todoText)
}

function inferLegacyModules(entries: string[], todoText: string): string[] {
  const legacy = entries
    .filter((entry) => /legacy|deprecated|old|compat|adapter|v1/i.test(entry))
    .slice(0, 30)
  return withTodo(legacy, todoText)
}

function inferTestCommands(
  packageJson: PackageJson | undefined,
  entries: string[],
  todoText: string,
): string[] {
  const commands = inferScriptCommands(packageJson, ['test', 'test:unit', 'test:watch'])
  if (entries.some((entry) => entry.endsWith('pom.xml'))) {
    commands.push('mvn test')
  }
  if (entries.some((entry) => /(^|\/)build\.gradle(\.kts)?$/.test(entry))) {
    commands.push('./gradlew test')
  }
  return withTodo(unique(commands), todoText)
}

function inferBuildCommands(
  packageJson: PackageJson | undefined,
  entries: string[],
  todoText: string,
): string[] {
  const commands = inferScriptCommands(packageJson, ['build', 'typecheck', 'lint'])
  if (entries.some((entry) => entry.endsWith('pom.xml'))) {
    commands.push('mvn clean package -DskipTests')
  }
  if (entries.some((entry) => /(^|\/)build\.gradle(\.kts)?$/.test(entry))) {
    commands.push('./gradlew build')
  }
  return withTodo(unique(commands), todoText)
}

function inferScriptCommands(packageJson: PackageJson | undefined, names: string[]): string[] {
  if (!packageJson?.scripts) {
    return []
  }

  return names
    .filter((name) => packageJson.scripts?.[name])
    .map((name) => (name === 'test' ? 'npm test' : `npm run ${name}`))
}

function inferJavaEvidence(entries: string[]): string[] {
  const evidence: string[] = []
  if (entries.some((entry) => entry.endsWith('pom.xml'))) evidence.push('pom.xml')
  if (entries.some((entry) => entry.endsWith('build.gradle'))) evidence.push('build.gradle')
  if (entries.some((entry) => entry.endsWith('build.gradle.kts'))) evidence.push('build.gradle.kts')
  if (entries.some((entry) => /(^|\/)settings\.gradle(\.kts)?$/.test(entry))) {
    evidence.push('settings.gradle')
  }
  if (entries.includes('src/main/java')) evidence.push('src/main/java')
  if (entries.some((entry) => entry.endsWith('.java'))) evidence.push('*.java')
  if (entries.some((entry) => /(^|\/)application\.(ya?ml|properties)$/.test(entry))) {
    evidence.push('application config')
  }
  if (entries.some((entry) => /Application\.java$/.test(entry))) evidence.push('*Application.java')
  if (entries.some((entry) => /Controller\.java$|Service\.java$|Repository\.java$|Mapper\.java$/.test(entry))) {
    evidence.push('Java layered classes')
  }
  if (entries.some((entry) => /Mapper\.xml$/.test(entry))) evidence.push('Mapper XML')
  return unique(evidence)
}

function inferSuggestedPacks(
  entries: string[],
  risks: RiskProfile,
  language: GeneratedLanguage,
): GovernancePackSuggestion[] {
  const javaEvidence = inferJavaEvidence(entries)
  if (javaEvidence.length === 0) {
    return []
  }

  const todoText = todoTextForLanguage(language)
  const riskEvidence = [...risks.dangerousModules, ...risks.legacyModules].filter(
    (item) => item !== todoText,
  )
  const hasBuildTool = javaEvidence.some((item) => /pom|gradle/.test(item))

  return [
    {
      id: 'java-release-audit',
      confidence: hasBuildTool ? 'high' : 'medium',
      reason:
        language === 'zh'
          ? '检测到 Java/Maven/Gradle 项目，建议启用 Java 上线审计治理包。'
          : 'Detected a Java/Maven/Gradle project; recommend enabling the Java release audit governance pack.',
      evidence: unique([...javaEvidence, ...riskEvidence.slice(0, 10)]),
    },
  ]
}

function unique(items: string[]): string[] {
  return [...new Set(items)]
}

function withTodo(items: string[], todoText: string): string[] {
  return items.length > 0 ? items : [todoText]
}
