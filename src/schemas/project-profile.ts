export type Confidence = 'high' | 'medium' | 'low'

export interface StackInfo {
  area: 'backend' | 'frontend' | 'database' | 'infra' | 'unknown'
  name: string
  confidence: Confidence
  evidence: string[]
}

export interface ArchitectureProfile {
  coreBusinessFlow: string
  mainPath: string
  legacyPath: string
  runtimeEntryPoints: string[]
  moduleBoundaries: string[]
  externalSystems: string[]
}

export interface ContractProfile {
  apiContracts: string[]
  statusContracts: string[]
  schemaContracts: string[]
  frontendContracts: string[]
  externalContracts: string[]
}

export interface RiskProfile {
  dangerousModules: string[]
  legacyModules: string[]
  forbiddenActions: string[]
  humanReviewRequired: string[]
}

export interface TestProfile {
  testCommands: string[]
  buildCommands: string[]
  invalidOrPlaceholderTests: string[]
  verificationRules: string[]
}

export interface LocalContextProfile {
  currentBranch: string
  currentFocus: string
  temporaryConstraints: string[]
  currentForbiddenAreas: string[]
}

export interface ProjectProfile {
  projectName: string
  projectSummary: string
  rootDir: string
  profile: 'claude-code'
  stacks: StackInfo[]
  architecture: ArchitectureProfile
  contracts: ContractProfile
  risks: RiskProfile
  tests: TestProfile
  localContext: LocalContextProfile
}
