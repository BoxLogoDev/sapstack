/**
 * SAP 환경 프로파일 (~/.sapstack/config.yaml) 읽기·저장.
 *
 * sapstack-runtime.ts 에서 분리 — electron 을 import 하지 않으므로 bun test 로
 * 검증할 수 있고, provisioning.ts 가 온보딩(SapEnvironmentStep)과 같은 검증과
 * 원자적 쓰기 경로를 재사용한다.
 */
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import * as yaml from 'js-yaml'

export function environmentProfilePath(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack', 'config.yaml')
}

export async function readEnvironmentProfile(): Promise<unknown> {
  try {
    return yaml.load(await readFile(environmentProfilePath(), 'utf8'))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw error
  }
}

async function writeProfileAtomic(profile: Record<string, unknown>): Promise<void> {
  const target = environmentProfilePath()
  await mkdir(dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, yaml.dump(profile, { lineWidth: -1, noRefs: true }), 'utf8')
  await rename(temporary, target)
}

export async function saveEnvironmentProfile(input: Record<string, unknown>): Promise<Record<string, unknown>> {
  const releases = new Set(['ECC6_EhP7', 'ECC6_EhP8', 'S4_2020', 'S4_2021', 'S4_2022', 'S4_2023', 'S4_2024', 'RISE', 'PublicCloud', 'Unknown'])
  const deployments = new Set(['on_premise', 'private_cloud', 'public_cloud', 'unknown'])
  const languages = new Set(['ko', 'en', 'de', 'ja', 'zh', 'vi', 'id', 'fr', 'es'])
  if (!releases.has(String(input.release))) throw new Error('A supported SAP release is required')
  if (!deployments.has(String(input.deployment))) throw new Error('A supported deployment model is required')
  if (!String(input.industry || '').trim()) throw new Error('Industry is required')
  if (!languages.has(String(input.language || 'ko'))) throw new Error('A supported language is required')

  // 선택 키는 기존 profile 을 베이스로 보존한다. SapEnvironmentStep 은 4개 필수
  // 필드만 보내므로, profile 을 처음부터 재작성하면 수동으로 켠 air_gapped 나
  // country_iso/client 가 환경 재설정 한 번에 소실된다. input 에 명시된 값이 우선.
  const existing = ((await readEnvironmentProfile().catch(() => null)) ?? {}) as Record<string, unknown>
  const countryIso = input.country_iso ?? existing.country_iso
  const client = input.client ?? existing.client
  const airGapped = input.air_gapped ?? existing.air_gapped
  const uiMode = input.ui_mode ?? existing.ui_mode
  const cbo = input.cbo ?? existing.cbo

  const profile = {
    profile_version: 1,
    release: input.release,
    deployment: input.deployment,
    industry: String(input.industry).trim(),
    language: input.language || 'ko',
    ...(countryIso ? { country_iso: String(countryIso).toLowerCase() } : {}),
    ...(client ? { client: String(client) } : {}),
    // 폐쇄망 모드. main/airgap.ts 가 부팅 시 이 키를 동기로 읽어 크래시 리포팅과
    // 업데이트 폴링을 끈다. 적용하려면 재시작이 필요하다.
    ...(airGapped === true ? { air_gapped: true } : {}),
    // 현업(simple) UI 모드 — provisioning.ts/설정이 기록, 렌더러는 environment.get 으로 수신.
    ...(uiMode === 'simple' || uiMode === 'standard' ? { ui_mode: uiMode } : {}),
    // CBO 스냅샷 설정(공유 스캔 루트 등) — cbo-snapshot.ts 가 소비.
    ...(cbo && typeof cbo === 'object' ? { cbo } : {}),
  }
  await writeProfileAtomic(profile)
  return profile
}

/**
 * config.yaml 의 최상위 키를 얕게 병합해 저장한다 — 프로파일 4필수 검증 없이
 * ui_mode/cbo 같은 부가 키만 시딩할 때 사용 (프로파일이 아직 없어도 동작).
 */
export async function mergeEnvironmentConfigKeys(patch: Record<string, unknown>): Promise<Record<string, unknown>> {
  const existing = ((await readEnvironmentProfile().catch(() => null)) ?? {}) as Record<string, unknown>
  const merged = { ...existing, ...patch }
  await writeProfileAtomic(merged)
  return merged
}
