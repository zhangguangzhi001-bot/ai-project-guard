import { describe, expect, it } from 'vitest'
import { maskSecretLikeValues, parseList, withTodoIfEmpty } from '../../src/utils/list.js'

describe('list utilities', () => {
  it('parses comma and newline separated lists', () => {
    expect(parseList('a, b\nc')).toEqual(['a', 'b', 'c'])
  })

  it('adds a TODO marker for empty critical lists', () => {
    expect(withTodoIfEmpty([])).toEqual(['TODO: human review required'])
  })

  it('masks obvious secret-like prompt values', () => {
    expect(maskSecretLikeValues('password=abc123')).toBe('password=[REDACTED]')
    expect(maskSecretLikeValues('token: sk-1234567890abcdef')).toBe('token: [REDACTED]')
  })
})
