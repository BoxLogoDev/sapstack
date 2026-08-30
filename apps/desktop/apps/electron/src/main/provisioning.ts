/**
 * 관리자 프로비저닝 적용 — 부수효과 계층.
 *
 * app.whenReady() 초입(윈도우 생성·getSetupNeeds·initLocalLlm 이전)에서 1회 호출.
 * provision.yaml 을 찾아 ① LLM 연결+키(고정 슬러그 'provisioned', 머신 바운드
 * 자격증명 저장소) ② SAP 환경 프로파일 ③ ui_mode ④ cbo.share_roots 를 시딩한다.
 * 성공하면 온보딩/SapEnvironmentStep 게이트가 아예 렌더되지 않는다.
 *
 * import-once: ~/.sapstack/provision-applied.json 마커. 파일 version 증가(키
 * 로테이션) 또는 실패 섹션이 있을 때만 재적용. 어떤 실패도 앱 기동을 막지 않고
 * 기존 온보딩으로 자연 폴백한다.
 */
import { homedir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { dialog } from 'electron'
import {
  addLlmConnection,
  getDefaultLlmConnection,
  getLlmConnection,
  loadStoredConfig,
  saveConfig,
  setDefaultLlmConnection,
  setPersistedUiLanguage,
  updateLlmConnection,
} from '@sapstack-desktop/shared/config'
import { getCredentialManager } from '@sapstack-desktop/shared/credentials'
import { i18n, SUPPORTED_LANGUAGE_CODES, type LanguageCode } from '@sapstack-desktop/shared/i18n'
import { isLocalLlmAvailable } from './local-llm'
import { mainLog } from './logger'
import { mergeEnvironmentConfigKeys, readEnvironmentProfile, saveEnvironmentProfile } from './environment-profile'
import {
  IMPORTED_PLACEHOLDER,
  PROVISIONED_SLUG,
  type ProvisionLlmSpec,
  type ProvisionMarker,
  type ProvisionSpec,
  buildProvisionedConnection,
  findProvisionFile,
  parseProvisionSpec,
  scrubApiKeyValue,
  shouldApplyProvision,
} from './provisioning-core'

function sapstackHome(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack')
}

function markerPath(): string {
  return join(sapstackHome(), 'provision-applied.json')
}

function readMarker(): ProvisionMarker | null {
  try {
    return JSON.parse(readFileSync(markerPath(), 'utf8')) as ProvisionMarker
  } catch {
    return null
  }
}

function writeMarker(marker: ProvisionMarker): void {
  mkdirSync(sapstackHome(), { recursive: true })
  const temporary = `${markerPath()}.${process.pid}.tmp`
  writeFileSync(temporary, `${JSON.stringify(marker, null, 2)}\n`, 'utf8')
  renameSync(temporary, markerPath())
}

/** 최초 실행엔 config.json 이 없어 addLlmConnection 이 조용히 false 를 돌려준다 */
function ensureDesktopConfigExists(): void {
  if (!loadStoredConfig()) {
    saveConfig({ workspaces: [], activeWorkspaceId: null, activeSessionId: null })
  }
}

/** kind: local — 동봉 GGUF 를 ~/.sapstack/models 로 복사 (initLocalLlm 스캔 이전) */
function copyModelPack(llm: ProvisionLlmSpec, provisionDir: string): void {
  if (!llm.modelFile) return // 모델팩이 이미 USB 임포트 등으로 존재할 수 있다
  const src = resolve(provisionDir, llm.modelFile)
  if (!existsSync(src)) throw new Error(`llm.modelFile 을 찾을 수 없습니다: ${src}`)
  const destDir = join(sapstackHome(), 'models')
  mkdirSync(destDir, { recursive: true })
  const dest = join(destDir, basename(src))
  if (existsSync(dest) && statSync(dest).size === statSync(src).size) return
  mainLog.info(`[provision] 모델팩 복사 중 (수 GB 일 수 있음): ${basename(src)}`)
  copyFileSync(src, dest)
}

async function seedLlm(llm: ProvisionLlmSpec, provisionDir: string): Promise<void> {
  if (llm.kind === 'api_key' && (!llm.apiKey?.trim() || llm.apiKey.trim() === IMPORTED_PLACEHOLDER)) {
    throw new Error('llm.apiKey 가 비었거나 이미 임포트되었습니다 — 새 키를 넣고 version 을 올려 재배포하세요')
  }
  if (llm.kind === 'local') copyModelPack(llm, provisionDir)

  const connection = buildProvisionedConnection(llm)
  ensureDesktopConfigExists()
  if (getLlmConnection(PROVISIONED_SLUG)) {
    const { slug: _slug, ...updates } = connection
    if (!updateLlmConnection(PROVISIONED_SLUG, updates)) throw new Error('기존 provisioned 연결 갱신에 실패했습니다')
  } else if (!addLlmConnection(connection)) {
    throw new Error('LLM 연결 추가에 실패했습니다 (config.json 쓰기 확인 필요)')
  }
  if (llm.kind === 'api_key') {
    await getCredentialManager().setLlmApiKey(PROVISIONED_SLUG, llm.apiKey!.trim())
  }
  if (!setDefaultLlmConnection(PROVISIONED_SLUG)) throw new Error('기본 LLM 연결 지정에 실패했습니다')
}

/** SAP 언어 코드 → UI 로케일 (불일치 항목은 스킵) */
const UI_LANGUAGE_MAP: Record<string, string> = { zh: 'zh-Hans' }

async function seedSapEnvironment(env: NonNullable<ProvisionSpec['sapEnvironment']>, force: boolean): Promise<void> {
  if (!force) {
    const existing = (await readEnvironmentProfile().catch(() => null)) as Record<string, unknown> | null
    if (existing?.release) return // 사용자가 이미 만든 프로파일은 존중 (version 증가 시에만 덮어씀)
  }
  await saveEnvironmentProfile({
    release: env.release,
    deployment: env.deployment,
    industry: env.industry,
    language: env.language ?? 'ko',
    ...(env.client ? { client: env.client } : {}),
    ...(env.airGapped === true ? { air_gapped: true } : {}),
  })
  // 메인 프로세스 메뉴·세션 제목 언어가 첫 부팅부터 맞도록 UI 언어도 함께 시딩.
  // 렌더러는 localStorage 로 자체 감지하므로 여기 실패해도 치명적이지 않다.
  const uiLanguage = UI_LANGUAGE_MAP[env.language ?? 'ko'] ?? env.language ?? 'ko'
  if ((SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(uiLanguage)) {
    try {
      setPersistedUiLanguage(uiLanguage as LanguageCode)
    } catch (err) {
      mainLog.warn('[provision] UI 언어 시딩 실패(무시):', err)
    }
  }
}

async function seedCboShareRoots(shareRoots: string[]): Promise<void> {
  const existing = ((await readEnvironmentProfile().catch(() => null)) ?? {}) as Record<string, unknown>
  const cbo = { ...((existing.cbo as Record<string, unknown>) ?? {}), share_roots: shareRoots }
  await mergeEnvironmentConfigKeys({ cbo })
}

function scrubSecret(provisionPath: string): void {
  try {
    const raw = readFileSync(provisionPath, 'utf8')
    const scrubbed = scrubApiKeyValue(raw)
    if (scrubbed !== null) {
      writeFileSync(provisionPath, scrubbed, 'utf8')
      mainLog.info('[provision] provision.yaml 의 apiKey 를 스크럽했습니다')
    }
  } catch (err) {
    // 읽기 전용 매체(EROFS/EACCES) — 마커가 재파싱을 막으므로 경고만 남긴다
    mainLog.warn('[provision] apiKey 스크럽 실패(읽기 전용 매체?):', (err as Error).message)
  }
}

function showProvisionError(reason: string): void {
  try {
    dialog.showErrorBox(i18n.t('provisioning.errorTitle'), i18n.t('provisioning.errorBody', { reason }))
  } catch {
    // 다이얼로그 불가 환경 — 로그로 충분
  }
}

async function applySection(name: string, sections: Record<string, string>, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    sections[name] = 'ok'
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    sections[name] = `error: ${message}`
    mainLog.error(`[provision] ${name} 섹션 적용 실패:`, err)
  }
}

/**
 * 제로 셋팅 폴백 — LLM 연결이 하나도 없는 첫 실행에서 번들 엔진 + GGUF 모델팩이
 * 발견되면 로컬 연결을 자동 시딩해 기본으로 지정한다. provision.yaml 없이도
 * (모델만 동봉/반입돼 있으면) 온보딩의 "어떻게 연결할까요?" 화면이 뜨지 않는다.
 * 이미 연결을 설정한 사용자는 절대 건드리지 않는다. applyProvisioningIfPresent()
 * 뒤에 호출 — 프로비저닝(명시 설정)이 항상 우선한다.
 */
export async function ensureLocalLlmDefaultConnection(): Promise<void> {
  if (process.env.SAPSTACK_DESKTOP_SERVER_URL) return // 씬클라이언트 — 서버가 설정 소유
  if (getDefaultLlmConnection()) return // 이미 설정됨 (프로비저닝 포함) — 존중
  if (!isLocalLlmAvailable()) return // 엔진 또는 모델팩 없음 — 기존 온보딩으로
  try {
    await seedLlm({ kind: 'local' }, '')
    mainLog.info('[provision] 로컬 LLM 자동 기본 연결 시딩 (제로 셋팅 폴백)')
  } catch (err) {
    mainLog.error('[provision] 로컬 LLM 자동 시딩 실패 (온보딩으로 폴백):', err)
  }
}

export async function applyProvisioningIfPresent(): Promise<void> {
  // 씬클라이언트는 서버가 설정을 소유한다
  if (process.env.SAPSTACK_DESKTOP_SERVER_URL) return

  const found = findProvisionFile()
  if (!found) return

  let spec: ProvisionSpec
  try {
    spec = parseProvisionSpec(readFileSync(found, 'utf8'))
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    mainLog.error(`[provision] 파싱 실패 (${found}):`, reason)
    showProvisionError(reason)
    return
  }

  const marker = readMarker()
  if (!shouldApplyProvision(marker, spec.version)) return

  mainLog.info(`[provision] 적용 시작: ${found} (version ${spec.version})`)
  const isVersionBump = marker !== null && spec.version > marker.version
  const sections: Record<string, string> = {}

  // 섹션별 독립 적용 — 하나가 실패해도 나머지는 진행하고, 실패분은 다음 부팅에 재시도
  if (spec.llm) await applySection('llm', sections, () => seedLlm(spec.llm!, dirname(found)))
  if (spec.sapEnvironment) await applySection('sapEnvironment', sections, () => seedSapEnvironment(spec.sapEnvironment!, isVersionBump))
  if (spec.features?.uiMode) {
    await applySection('features', sections, async () => {
      await mergeEnvironmentConfigKeys({ ui_mode: spec.features!.uiMode })
    })
  }
  if (spec.cbo?.shareRoots?.length) await applySection('cbo', sections, () => seedCboShareRoots(spec.cbo!.shareRoots!))

  writeMarker({ version: spec.version, appliedAt: new Date().toISOString(), sourcePath: found, sections })

  if (sections.llm === 'ok' && spec.llm?.kind === 'api_key') scrubSecret(found)

  const failed = Object.entries(sections).filter(([, status]) => status !== 'ok')
  if (failed.length > 0) {
    showProvisionError(failed.map(([name, status]) => `${name}: ${status.replace(/^error: /, '')}`).join('\n'))
  } else {
    mainLog.info(`[provision] 적용 완료: ${Object.keys(sections).join(', ') || '(빈 파일)'}`)
  }
}
