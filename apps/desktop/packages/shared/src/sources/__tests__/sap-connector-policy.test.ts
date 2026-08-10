import { afterEach, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { evaluateSapConnectorTool } from '../sap-connector-policy.ts'

let workspace: string | undefined

afterEach(() => {
  if (workspace) rmSync(workspace, { recursive: true, force: true })
  workspace = undefined
})

describe('SAP connector policy', () => {
  test('allows only exact reviewed tools and fails closed for invalid policies', () => {
    workspace = mkdtempSync(join(process.cwd(), '.tmp-sap-connector-policy-'))
    const sourceDir = join(workspace, 'sources', 'sap-adt')
    mkdirSync(sourceDir, { recursive: true })
    const configPath = join(sourceDir, 'config.json')
    writeFileSync(configPath, JSON.stringify({
      id: 'sap-adt_test',
      name: 'SAP ADT MCP',
      slug: 'sap-adt',
      enabled: true,
      provider: 'sap-adt-mcp',
      type: 'mcp',
      mcp: { transport: 'http', url: 'http://127.0.0.1:9000/mcp', authType: 'bearer' },
      sapConnector: {
        access: 'read_only',
        environment: 'quality',
        allowedTools: ['searchObjects', 'readObject'],
        outboundDisclosure: 'Object metadata is sent to the configured local ADT MCP endpoint.',
        license: 'SAP terms apply',
      },
    }))

    expect(evaluateSapConnectorTool(workspace, 'mcp__sap-adt__readObject')).toEqual({ allowed: true })
    expect(evaluateSapConnectorTool(workspace, 'mcp__sap-adt__writeObject')).toEqual({
      allowed: false,
      reason: 'SAP connector "sap-adt" blocked tool "writeObject". Public beta connectors only allow explicitly reviewed read-only tools.',
    })

    writeFileSync(configPath, JSON.stringify({
      sapConnector: { access: 'write', environment: 'quality', allowedTools: ['writeObject'] },
    }))
    expect(evaluateSapConnectorTool(workspace, 'mcp__sap-adt__writeObject')?.allowed).toBe(false)
  })
})
