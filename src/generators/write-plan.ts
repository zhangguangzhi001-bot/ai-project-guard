export interface GeneratedFile {
  relativePath: string
  content: string
}

export interface WritePlan {
  files: GeneratedFile[]
}
