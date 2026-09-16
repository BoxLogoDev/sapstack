import { describe, test, expect } from 'bun:test'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { resolveCustomEndpointSetup } from '@sapstack-desktop/server-core/domain'
import {
  IMPORTED_PLACEHOLDER,
  PROVISIONED_SLUG,
  buildProvisionedConnection,
  findProvisionFile,
  parseProvisionSpec,
  scrubApiKeyValue,
  shouldApplyProvision,
} from '../provisioning-core'

describe('parseProvisionSpec', () => {
  test('version 은 1 이상의 정수 필수', () => {
    expect(() => parseProvisionSpec('llm:\n  kind: api_key\n')).toThrow('version')
    expect(() => parseProvisionSpec('version: 0\n')).toThrow('version')
    expect(() => parseProvisionSpec('version: 1.5\n')).toThrow('version')
  })

  test('llm.kind enum 검증', () => {
    expect(() => parseProvisionSpec('version: 1\nllm:\n  kind: oauth\n')).toThrow('llm.kind')
  })

  test('게이트웨이(baseUrl)는 models 필수 + defaultModel 은 목록 내여야 함', () => {
    expect(() => parseProvisionSpec('version: 1\nllm:\n  kind: api_key\n  apiKey: k\n  baseUrl: https://gw.corp\n')).toThrow('models')
    expect(() =>
      parseProvisionSpec('version: 1\nllm:\n  kind: api_key\n  apiKey: k\n  baseUrl: https://gw.corp\n  models: [a]\n  defaultModel: b\n'),
    ).toThrow('defaultModel')
    expect(() => parseProvisionSpec('version: 1\nllm:\n  kind: api_key\n  apiKey: k\n  baseUrl: not a url\n  models: [a]\n')).toThrow('baseUrl')
  })

  test('스크럽된 apiKey("<imported>")도 파싱은 통과한다 — version 비교가 매 부팅 필요', () => {
    const spec = parseProvisionSpec(`version: 2\nllm:\n  kind: api_key\n  apiKey: "${IMPORTED_PLACEHOLDER}"\n`)
    expect(spec.version).toBe(2)
    expect(spec.llm?.apiKey).toBe(IMPORTED_PLACEHOLDER)
  })

  test('features.uiMode / cbo.shareRoots 검증', () => {
    expect(() => parseProvisionSpec('version: 1\nfeatures:\n  uiMode: expert\n')).toThrow('uiMode')
    expect(() => parseProvisionSpec('version: 1\ncbo:\n  shareRoots: ["", "x"]\n')).toThrow('shareRoots')
    // YAML 작은따옴표는 백슬래시를 리터럴로 취급 — UNC 경로가 그대로 살아야 한다
    const spec = parseProvisionSpec("version: 1\nfeatures:\n  uiMode: simple\ncbo:\n  shareRoots: ['\\\\srv\\cbo']\n")
    expect(spec.features?.uiMode).toBe('simple')
    expect(spec.cbo?.shareRoots).toEqual(['\\\\srv\\cbo'])
  })

  test('세 kind 모두의 유효 스펙', () => {
    expect(parseProvisionSpec('version: 1\nllm:\n  kind: api_key\n  apiKey: sk-x\n').llm?.kind).toBe('api_key')
    expect(parseProvisionSpec('version: 1\nllm:\n  kind: environment\n').llm?.kind).toBe('environment')
    expect(parseProvisionSpec('version: 1\nllm:\n  kind: local\n  modelFile: models/a.gguf\n').llm?.modelFile).toBe('models/a.gguf')
  })
})

describe('buildProvisionedConnection', () => {
  test('api_key 직결 → anthropic/api_key + 기본 모델 목록', () => {
    const conn = buildProvisionedConnection({ kind: 'api_key', apiKey: 'sk-x' })
    expect(conn.slug).toBe(PROVISIONED_SLUG)
    expect(conn.providerType).toBe('anthropic')
    expect(conn.authType).toBe('api_key')
    expect(conn.baseUrl).toBeUndefined()
    expect((conn.models ?? []).length).toBeGreaterThan(0)
    expect(conn.defaultModel).toBeTruthy()
  })

  test('api_key + baseUrl(게이트웨이) → pi_compat/api_key_with_endpoint + piAuthProvider', () => {
    const conn = buildProvisionedConnection({ kind: 'api_key', apiKey: 'sk-x', baseUrl: 'https://gw.corp', models: ['m1', 'm2'] })
    expect(conn.providerType).toBe('pi_compat')
    expect(conn.authType).toBe('api_key_with_endpoint')
    expect(conn.customEndpoint?.api).toBe('anthropic-messages')
    expect(conn.piAuthProvider).toBe('anthropic')
    expect(conn.defaultModel).toBe('m1')
    const openai = buildProvisionedConnection({ kind: 'api_key', apiKey: 'k', baseUrl: 'https://gw.corp', api: 'openai-completions', models: ['m'] })
    expect(openai.piAuthProvider).toBe('openai')
  })

  test('environment → anthropic/environment (키 미주입, GPO env 사용)', () => {
    const conn = buildProvisionedConnection({ kind: 'environment', baseUrl: 'https://gw.corp' })
    expect(conn.providerType).toBe('anthropic')
    expect(conn.authType).toBe('environment')
    expect(conn.baseUrl).toBe('https://gw.corp')
  })

  test('local — 온보딩 resolveCustomEndpointSetup(keyless loopback) 산출물과 형태 일치', () => {
    const conn = buildProvisionedConnection({ kind: 'local' }, { localPort: 11435 })
    const onboarding = resolveCustomEndpointSetup({
      baseUrl: 'http://127.0.0.1:11435',
      credential: undefined,
      customEndpointApi: 'openai-completions',
    })
    expect(conn.authType).toBe(onboarding.authType) // 'none'
    expect(conn.name).toBe(onboarding.name!) // 'Local Model'
    expect(conn.providerType).toBe('pi_compat')
    expect(conn.baseUrl).toBe('http://127.0.0.1:11435')
    expect(conn.customEndpoint?.api).toBe('openai-completions')
    expect(conn.models).toEqual(['sapstack-local'])
    expect(conn.defaultModel).toBe('sapstack-local')
  })
})

describe('scrubApiKeyValue', () => {
  test('값만 치환하고 주석·다른 키는 보존, 멱등', () => {
    const raw = 'version: 1\nllm:\n  kind: api_key\n  apiKey: sk-ant-secret # 예산 캡 키\n  baseUrl: https://gw\n'
    const scrubbed = scrubApiKeyValue(raw)!
    expect(scrubbed).toContain(`apiKey: "${IMPORTED_PLACEHOLDER}"`)
    expect(scrubbed).toContain('# 예산 캡 키')
    expect(scrubbed).toContain('version: 1')
    expect(scrubbed).not.toContain('sk-ant-secret')
    expect(scrubApiKeyValue(scrubbed)).toBeNull() // 이미 스크럽됨
  })

  test('apiKey 가 없으면 null', () => {
    expect(scrubApiKeyValue('version: 1\nllm:\n  kind: local\n')).toBeNull()
  })
})

describe('shouldApplyProvision', () => {
  const okMarker = { version: 2, appliedAt: '', sourcePath: '', sections: { llm: 'ok' } }
  test('마커 없음 → 적용', () => expect(shouldApplyProvision(null, 1)).toBe(true))
  test('동일 version + 전부 ok → 스킵', () => expect(shouldApplyProvision(okMarker, 2)).toBe(false))
  test('version 증가 → 재적용 (키 로테이션)', () => expect(shouldApplyProvision(okMarker, 3)).toBe(true))
  test('실패 섹션 잔존 → 재시도', () =>
    expect(shouldApplyProvision({ ...okMarker, sections: { llm: 'error: x' } }, 2)).toBe(true))
  test('version 감소 → 스킵', () => expect(shouldApplyProvision(okMarker, 1)).toBe(false))
})

describe('findProvisionFile', () => {
  test('우선순위: env 지정(폴백 없음) > exe 인접 > 홈', () => {
    const base = mkdtempSync(join(tmpdir(), 'prov-'))
    const execDir = join(base, 'exe')
    const homeDir = join(base, 'home')
    mkdirSync(execDir, { recursive: true })
    mkdirSync(join(homeDir, '.sapstack'), { recursive: true })

    // 아무 데도 없음
    expect(findProvisionFile({ envPath: undefined, execDir, homeDir })).toBeNull()

    // 홈만 있음
    const inHome = join(homeDir, '.sapstack', 'provision.yaml')
    writeFileSync(inHome, 'version: 1\n')
    expect(findProvisionFile({ envPath: undefined, execDir, homeDir })).toBe(inHome)

    // exe 인접이 홈보다 우선
    const adjacent = join(execDir, 'provision.yaml')
    writeFileSync(adjacent, 'version: 1\n')
    expect(findProvisionFile({ envPath: undefined, execDir, homeDir })).toBe(adjacent)

    // env 지정이 최우선 — 없는 경로를 지정하면 폴백 없이 null
    const envFile = join(base, 'explicit.yaml')
    writeFileSync(envFile, 'version: 1\n')
    expect(findProvisionFile({ envPath: envFile, execDir, homeDir })).toBe(envFile)
    expect(findProvisionFile({ envPath: join(base, 'missing.yaml'), execDir, homeDir })).toBeNull()
  })
})

describe('parseProvisionSpec sapEnvironment.country (해외 법인)', () => {
  test('country 는 문자열로 통과, 없으면 키 자체가 없음', () => {
    const withCountry = parseProvisionSpec('version: 1\nsapEnvironment:\n  release: S4_2023\n  deployment: private_cloud\n  industry: machinery\n  language: en\n  country: US\n')
    expect(withCountry.sapEnvironment?.country).toBe('US')
    expect(withCountry.sapEnvironment?.language).toBe('en')
    const without = parseProvisionSpec('version: 1\nsapEnvironment:\n  release: S4_2023\n  deployment: private_cloud\n  industry: machinery\n')
    expect('country' in (without.sapEnvironment ?? {})).toBe(false)
  })
})

describe('parseProvisionSpec auth (Entra 로그인)', () => {
  const TENANT = '11111111-2222-3333-4444-555555555555'
  const CLIENT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'

  test('정상 블록은 EntraAuthConfig 로 정규화(기본 required:true, grace 14)', () => {
    const spec = parseProvisionSpec(`version: 1\nauth:\n  tenantId: ${TENANT}\n  clientId: ${CLIENT}\n  domainHint: lsinjectionusa.com\n`)
    expect(spec.auth).toEqual({ required: true, tenantId: TENANT, clientId: CLIENT, offlineGraceDays: 14, domainHint: 'lsinjectionusa.com' })
  })

  test('common 테넌트·GUID 아님은 ProvisionError 로 거부', () => {
    expect(() => parseProvisionSpec(`version: 1\nauth:\n  tenantId: common\n  clientId: ${CLIENT}\n`)).toThrow('tenant GUID')
    expect(() => parseProvisionSpec(`version: 1\nauth:\n  tenantId: ${TENANT}\n  clientId: nope\n`)).toThrow('client')
  })
})

describe('parseProvisionSpec changeRequests (Azure DevOps Boards)', () => {
  test('정상 블록은 ChangeRequestsConfig 로 정규화(workItemType 기본 Issue)', () => {
    const spec = parseProvisionSpec(`version: 1\nchangeRequests:\n  provider: azure_devops\n  orgUrl: https://dev.azure.com/lsitc/\n  project: SAP-Change-Requests\n  areaPath: SAP-Change-Requests\LSMtron-USA\n  entityTag: LSMtron-USA\n`)
    expect(spec.changeRequests).toEqual({ provider: 'azure_devops', orgUrl: 'https://dev.azure.com/lsitc', project: 'SAP-Change-Requests', workItemType: 'Issue', areaPath: 'SAP-Change-Requests\LSMtron-USA', entityTag: 'LSMtron-USA' })
  })

  test('다른 provider·project 누락은 ProvisionError', () => {
    expect(() => parseProvisionSpec(`version: 1\nchangeRequests:\n  provider: jira\n  orgUrl: https://x.atlassian.net\n  project: P\n`)).toThrow('only azure_devops')
    expect(() => parseProvisionSpec(`version: 1\nchangeRequests:\n  orgUrl: https://dev.azure.com/lsitc\n`)).toThrow('project')
  })
})
