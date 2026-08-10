import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { FolderSourceConfig, SapConnectorPolicy } from './types.ts'

export interface SapConnectorPolicyDecision {
  allowed: boolean
  reason?: string
}

const SOURCE_TOOL = /^mcp__([a-z0-9-]+)__(.+)$/
const NON_PRODUCTION_ENVIRONMENTS = new Set<SapConnectorPolicy['environment']>(['development', 'quality', 'sandbox'])

/**
 * Enforce an SAP connector's exact tool allowlist before normal permission-mode checks.
 * Sources without sapConnector metadata keep the existing permission behavior.
 */
export function evaluateSapConnectorTool(workspaceRootPath: string, toolName: string): SapConnectorPolicyDecision | null {
  const match = SOURCE_TOOL.exec(toolName)
  if (!match) return null
  const sourceSlug = match[1]!
  const originalToolName = match[2]!

  let config: FolderSourceConfig
  try {
    config = JSON.parse(readFileSync(join(workspaceRootPath, 'sources', sourceSlug, 'config.json'), 'utf8')) as FolderSourceConfig
  } catch {
    return null
  }

  const policy = config.sapConnector
  if (!policy) return null
  if (
    policy.access !== 'read_only' ||
    !NON_PRODUCTION_ENVIRONMENTS.has(policy.environment) ||
    !Array.isArray(policy.allowedTools) ||
    !policy.allowedTools.every(tool => typeof tool === 'string' && tool.length > 0)
  ) {
    return { allowed: false, reason: `SAP connector "${sourceSlug}" has an invalid read-only policy.` }
  }

  if (!policy.allowedTools.includes(originalToolName)) {
    return {
      allowed: false,
      reason: `SAP connector "${sourceSlug}" blocked tool "${originalToolName}". Public beta connectors only allow explicitly reviewed read-only tools.`,
    }
  }

  return { allowed: true }
}
