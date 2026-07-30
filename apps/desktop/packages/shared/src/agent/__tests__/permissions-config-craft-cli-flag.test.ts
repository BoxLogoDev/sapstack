import { describe, it, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { permissionsConfigCache } from '../permissions-config.ts'

const originalConfigDir = process.env.SAPSTACK_DESKTOP_CONFIG_DIR
const originalCliFlag = process.env.SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI

function writeDefaultPermissions(configDir: string) {
  const permissionsDir = join(configDir, 'permissions')
  mkdirSync(permissionsDir, { recursive: true })
  writeFileSync(
    join(permissionsDir, 'default.json'),
    JSON.stringify(
      {
        version: '2026-03-07',
        allowedBashPatterns: [
          { pattern: '^sapstack-desktop\\s+label\\s+list\\b', comment: 'sapstack-desktop label read-only operations' },
          { pattern: '^rg\\b', comment: 'Ripgrep search' },
        ],
        allowedMcpPatterns: [],
        allowedApiEndpoints: [],
        allowedWritePaths: [],
        blockedCommandHints: [],
      },
      null,
      2,
    ),
  )
}

beforeEach(() => {
  permissionsConfigCache.clear()
})

afterEach(() => {
  permissionsConfigCache.clear()

  if (originalConfigDir === undefined) delete process.env.SAPSTACK_DESKTOP_CONFIG_DIR
  else process.env.SAPSTACK_DESKTOP_CONFIG_DIR = originalConfigDir

  if (originalCliFlag === undefined) delete process.env.SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI
  else process.env.SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI = originalCliFlag
})

describe('permissions config sapstack-desktops-cli feature flag', () => {
  it('skips compiling sapstack-desktop bash allowlist patterns when feature is disabled', () => {
    const tempConfigDir = mkdtempSync(join(tmpdir(), 'craft-permissions-'))
    try {
      process.env.SAPSTACK_DESKTOP_CONFIG_DIR = tempConfigDir
      process.env.SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI = '0'
      writeDefaultPermissions(tempConfigDir)

      const merged = permissionsConfigCache.getMergedConfig({
        workspaceRootPath: '/tmp/workspace',
        activeSourceSlugs: [],
      })

      const sources = merged.readOnlyBashPatterns.map(p => p.source)
      expect(sources.some(source => source.startsWith('^sapstack-desktop\\s'))).toBe(false)
      expect(sources).toContain('^rg\\b')
    } finally {
      rmSync(tempConfigDir, { recursive: true, force: true })
    }
  })

  it('compiles sapstack-desktop bash allowlist patterns when feature is enabled', () => {
    const tempConfigDir = mkdtempSync(join(tmpdir(), 'craft-permissions-'))
    try {
      process.env.SAPSTACK_DESKTOP_CONFIG_DIR = tempConfigDir
      process.env.SAPSTACK_DESKTOP_FEATURE_SAPSTACK_DESKTOP_AGENTS_CLI = '1'
      writeDefaultPermissions(tempConfigDir)

      const merged = permissionsConfigCache.getMergedConfig({
        workspaceRootPath: '/tmp/workspace',
        activeSourceSlugs: [],
      })

      const sources = merged.readOnlyBashPatterns.map(p => p.source)
      expect(sources).toContain('^sapstack-desktop\\s+label\\s+list\\b')
      expect(sources).toContain('^rg\\b')
    } finally {
      rmSync(tempConfigDir, { recursive: true, force: true })
    }
  })
})
