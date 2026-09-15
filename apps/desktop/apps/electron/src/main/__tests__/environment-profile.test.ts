import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as yaml from 'js-yaml'
import {
  environmentProfilePath,
  mergeEnvironmentConfigKeys,
  readEnvironmentProfile,
  saveEnvironmentProfile,
} from '../environment-profile'

let priorWorkspace: string | undefined

beforeEach(() => {
  priorWorkspace = process.env.SAPSTACK_WORKSPACE
  process.env.SAPSTACK_WORKSPACE = mkdtempSync(join(tmpdir(), 'envprof-'))
})

afterEach(() => {
  if (priorWorkspace === undefined) delete process.env.SAPSTACK_WORKSPACE
  else process.env.SAPSTACK_WORKSPACE = priorWorkspace
})

const BASE = { release: 'S4_2023', deployment: 'private_cloud', industry: '제조', language: 'ko' }

describe('saveEnvironmentProfile', () => {
  test('4필수 검증', async () => {
    const failure = (input: Record<string, unknown>) =>
      saveEnvironmentProfile(input).then(() => '(성공하면 안 됨)', (err: Error) => err.message)
    expect(await failure({ ...BASE, release: 'S4_9999' })).toContain('release')
    expect(await failure({ ...BASE, industry: ' ' })).toContain('Industry')
  })

  test('환경 재저장이 ui_mode/cbo/air_gapped 를 보존한다', async () => {
    await saveEnvironmentProfile(BASE)
    await mergeEnvironmentConfigKeys({ ui_mode: 'simple', cbo: { share_roots: ['\\\\srv\\cbo'] }, air_gapped: true })
    // SapEnvironmentStep 재저장 시뮬레이션 — 4필수만 보낸다
    const profile = await saveEnvironmentProfile({ ...BASE, industry: '유통' })
    expect(profile.ui_mode).toBe('simple')
    expect((profile.cbo as { share_roots?: string[] }).share_roots).toEqual(['\\\\srv\\cbo'])
    expect(profile.air_gapped).toBe(true)
    expect(profile.industry).toBe('유통')
  })
})

describe('mergeEnvironmentConfigKeys', () => {
  test('프로파일이 없어도 부가 키만으로 생성 — release 없는 부분 config', async () => {
    const merged = await mergeEnvironmentConfigKeys({ ui_mode: 'simple' })
    expect(merged.ui_mode).toBe('simple')
    expect(merged.release).toBeUndefined()
    const onDisk = yaml.load(readFileSync(environmentProfilePath(), 'utf8')) as Record<string, unknown>
    expect(onDisk.ui_mode).toBe('simple')
  })

  test('최상위 얕은 병합 — 기존 키 유지', async () => {
    await saveEnvironmentProfile(BASE)
    const merged = await mergeEnvironmentConfigKeys({ cbo: { share_roots: ['\\\\srv\\cbo'] } })
    expect(merged.release).toBe('S4_2023')
    expect((merged.cbo as { share_roots?: string[] }).share_roots).toEqual(['\\\\srv\\cbo'])
  })
})

describe('readEnvironmentProfile', () => {
  test('파일 없음 → null', async () => {
    expect(await readEnvironmentProfile()).toBeNull()
  })
})

describe('auth / change_requests 보존', () => {
  test('프로비저닝이 시딩한 auth·change_requests 는 환경 재설정(4필수만 저장)에도 남는다', async () => {
    await mergeEnvironmentConfigKeys({
      auth: { required: true, tenant_id: '11111111-2222-3333-4444-555555555555', client_id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', offline_grace_days: 14 },
      change_requests: { provider: 'azure_devops', org_url: 'https://dev.azure.com/example', project: 'SAP-Change-Requests' },
    })
    await saveEnvironmentProfile({ ...BASE, release: 'S4_2024' })
    const saved = yaml.load(readFileSync(environmentProfilePath(), 'utf8')) as Record<string, unknown>
    expect(saved.release).toBe('S4_2024')
    expect((saved.auth as Record<string, unknown>).tenant_id).toBe('11111111-2222-3333-4444-555555555555')
    expect((saved.change_requests as Record<string, unknown>).project).toBe('SAP-Change-Requests')
  })
})
