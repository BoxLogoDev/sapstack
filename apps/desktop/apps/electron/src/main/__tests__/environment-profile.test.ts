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
