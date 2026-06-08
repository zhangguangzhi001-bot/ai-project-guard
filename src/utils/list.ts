const SECRET_VALUE_PATTERN = /((?:password|passwd|secret|token|accessKeySecret|access_key_secret|privateKey|private_key|apiKey|api_key)\s*[:=]\s*)[^\s,;]+|(sk-[a-z0-9_-]{12,}|[A-Za-z0-9+/]{64,}={0,2})/gi

export function parseList(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => parseList(item))
  }

  if (!value) {
    return []
  }

  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function withTodoIfEmpty(items: string[], todoText = 'TODO: human review required'): string[] {
  return items.length > 0 ? items : [todoText]
}

export function maskSecretLikeValues(value: string): string {
  return value.replace(SECRET_VALUE_PATTERN, (_match, keyPrefix: string | undefined) => {
    if (keyPrefix) {
      return `${keyPrefix}[REDACTED]`
    }
    return '[REDACTED]'
  })
}

export function maskListSecretLikeValues(items: string[]): string[] {
  return items.map(maskSecretLikeValues)
}
