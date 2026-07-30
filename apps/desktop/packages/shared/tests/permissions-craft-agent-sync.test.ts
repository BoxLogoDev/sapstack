import { describe, it, expect } from 'bun:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getCraftAgentReadOnlyBashPatterns } from '../src/config/cli-domains.ts'

type AllowedBashEntry = { pattern: string; comment?: string }

describe('permissions sapstack-desktop allowlist sync', () => {
  it('keeps default.json sapstack-desktop read-only rules aligned with shared CLI domain policy', () => {
    const permissionsPath = resolve(import.meta.dir, '../../../apps/electron/resources/permissions/default.json')
    const permissions = JSON.parse(readFileSync(permissionsPath, 'utf-8')) as {
      allowedBashPatterns?: AllowedBashEntry[]
    }

    const actual = (permissions.allowedBashPatterns ?? [])
      .filter(entry => typeof entry.pattern === 'string' && entry.pattern.startsWith('^sapstack-desktop\\s'))
      .map(entry => ({ pattern: entry.pattern, comment: entry.comment ?? '' }))
      .sort((a, b) => a.pattern.localeCompare(b.pattern))

    const expected = getCraftAgentReadOnlyBashPatterns()
      .map(entry => ({ pattern: entry.pattern, comment: entry.comment }))
      .sort((a, b) => a.pattern.localeCompare(b.pattern))

    expect(actual).toEqual(expected)
  })
})
