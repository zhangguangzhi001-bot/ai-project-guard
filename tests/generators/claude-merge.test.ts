import { describe, expect, it } from 'vitest'
import { mergeExistingClaudeMd } from '../../src/generators/claude-merge.js'

describe('mergeExistingClaudeMd', () => {
  it('adds Chinese import section and preserves existing content exactly', () => {
    const merged = mergeExistingClaudeMd('# Generated\n', '# Existing\n- Rule\n', {
      language: 'zh',
    })

    expect(merged).toContain('## 从原 CLAUDE.md 导入的项目说明')
    expect(merged).toContain('<!-- BEGIN APG IMPORTED EXISTING CLAUDE.md -->')
    expect(merged).toContain('# Existing\n- Rule')
    expect(merged).toContain('<!-- END APG IMPORTED EXISTING CLAUDE.md -->')
  })

  it('adds English import section', () => {
    const merged = mergeExistingClaudeMd('# Generated\n', '# Existing\n', {
      language: 'en',
    })

    expect(merged).toContain('## Existing project instructions imported from previous CLAUDE.md')
    expect(merged).toContain('# Existing')
  })

  it('places generated content first and ends with a newline', () => {
    const merged = mergeExistingClaudeMd('# Generated\n\n', '# Existing\n\n', {
      language: 'en',
    })

    expect(merged.startsWith('# Generated\n\n## Existing')).toBe(true)
    expect(merged.endsWith('\n')).toBe(true)
    expect(merged.endsWith('\n\n')).toBe(false)
  })
})
