/**
 * 관리자 프로비저닝 — 파일 탐색·파싱·연결 형태 빌드 (순수 로직).
 *
 * provision.yaml 하나로 현업 PC 의 첫 실행을 무설정으로 만든다: LLM 연결(+키),
 * SAP 환경 프로파일, ui_mode(현업 모드), CBO 공유 스캔 루트를 시딩한다.
 * 이 모듈은 electron 을 import 하지 않는다(bun test 대상) — 저장·다이얼로그 등
 * 부수효과는 provisioning.ts 가 담당한다.
 */
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { existsSync } from 'node:fs'
import * as yaml from 'js-yaml'
import {
  type CustomEndpointApi,
  type LlmConnection,
  defaultMidStreamBehavior,
  getDefaultModelForConnection,
  getDefaultModelsForConnection,
} from '@sapstack-desktop/shared/config'

/** 시딩되는 연결의 고정 슬러그 — version 재적용이 항상 같은 연결을 업서트한다 */
export const PROVISIONED_SLUG = 'provisioned'

/** 스크럽된 apiKey 자리표시자 — 파서는 통과시키고 적용 단계에서 무효 처리 */
export const IMPORTED_PLACEHOLDER = '<imported>'

export interface ProvisionLlmSpec {
  kind: 'api_key' | 'local' | 'environment'
  apiKey?: string
  baseUrl?: string
  api?: CustomEndpointApi
  models?: string[]
  defaultModel?: string
  name?: string
  /** kind: local — provision.yaml 기준 상대경로의 GGUF. ~/.sapstack/models 로 복사됨 */
  modelFile?: string
}

export interface ProvisionSpec {
  version: number
  llm?: ProvisionLlmSpec
  sapEnvironment?: {
    release: string
    deployment: string
    industry: string
    language?: string
    client?: string
    airGapped?: boolean
  }
  features?: { uiMode?: 'simple' | 'standard' }
  cbo?: { shareRoots?: string[] }
}

/** ~/.sapstack/provision-applied.json — import-once 마커. 섹션별 상태로 부분 재시도 */
export interface ProvisionMarker {
  version: number
  appliedAt: string
  sourcePath: string
  sections: Record<string, string>
}

export class ProvisionError extends Error {}

/**
 * provision.yaml 탐색 — ① SAPSTACK_PROVISION_FILE(명시 지정은 폴백 없음)
 * ② exe 인접(포터블 %TEMP% 자가추출 대응: PORTABLE_EXECUTABLE_DIR 우선)
 * ③ ~/.sapstack/provision.yaml
 */
export function findProvisionFile(overrides?: { envPath?: string; execDir?: string; homeDir?: string }): string | null {
  const envPath = overrides?.envPath ?? process.env.SAPSTACK_PROVISION_FILE
  if (envPath) return existsSync(envPath) ? envPath : null
  const execDir = overrides?.execDir ?? (process.env.PORTABLE_EXECUTABLE_DIR || dirname(process.execPath))
  const adjacent = join(execDir, 'provision.yaml')
  if (existsSync(adjacent)) return adjacent
  const home = overrides?.homeDir ?? (process.env.SAPSTACK_WORKSPACE || homedir())
  const inHome = join(home, '.sapstack', 'provision.yaml')
  return existsSync(inHome) ? inHome : null
}

const LLM_KINDS = new Set(['api_key', 'local', 'environment'])
const ENDPOINT_APIS = new Set<CustomEndpointApi>(['anthropic-messages', 'openai-completions'])
const UI_MODES = new Set(['simple', 'standard'])

function asMapping(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ProvisionError(`${field} 는 매핑(객체)이어야 합니다`)
  }
  return value as Record<string, unknown>
}

/**
 * provision.yaml 파싱 + 구조 검증. apiKey 는 여기서 요구하지 않는다 — 스크럽된
 * 파일("<imported>")도 매 부팅 version 비교를 위해 파싱은 통과해야 하기 때문.
 * sapEnvironment 값 검증은 saveEnvironmentProfile(단일 원천)에 위임한다.
 */
export function parseProvisionSpec(raw: string): ProvisionSpec {
  let doc: unknown
  try {
    doc = yaml.load(raw)
  } catch (err) {
    throw new ProvisionError(`YAML 파싱 실패: ${(err as Error).message}`)
  }
  const d = asMapping(doc, 'provision.yaml 루트')
  const version = Number(d.version)
  if (!Number.isInteger(version) || version < 1) throw new ProvisionError('version 은 1 이상의 정수여야 합니다')
  const spec: ProvisionSpec = { version }

  if (d.llm !== undefined) {
    const llm = asMapping(d.llm, 'llm')
    const kind = String(llm.kind ?? '')
    if (!LLM_KINDS.has(kind)) {
      throw new ProvisionError(`llm.kind 는 api_key | local | environment 중 하나여야 합니다 (현재: ${kind || '없음'})`)
    }
    const api = llm.api === undefined ? undefined : (String(llm.api) as CustomEndpointApi)
    if (api !== undefined && !ENDPOINT_APIS.has(api)) {
      throw new ProvisionError('llm.api 는 anthropic-messages | openai-completions 중 하나여야 합니다')
    }
    let models: string[] | undefined
    if (llm.models !== undefined) {
      if (!Array.isArray(llm.models) || llm.models.length === 0) throw new ProvisionError('llm.models 는 비어있지 않은 문자열 배열이어야 합니다')
      models = llm.models.map(String)
    }
    const baseUrl = llm.baseUrl === undefined ? undefined : String(llm.baseUrl).trim()
    if (baseUrl) {
      try {
        void new URL(baseUrl)
      } catch {
        throw new ProvisionError(`llm.baseUrl 이 올바른 URL 이 아닙니다: ${baseUrl}`)
      }
    }
    if (kind === 'api_key' && baseUrl && !models) {
      throw new ProvisionError('llm.baseUrl(게이트웨이)이 있으면 llm.models 에 모델 id 목록이 필요합니다')
    }
    const defaultModel = llm.defaultModel === undefined ? undefined : String(llm.defaultModel)
    if (defaultModel && models && !models.includes(defaultModel)) {
      throw new ProvisionError(`llm.defaultModel(${defaultModel})이 llm.models 목록에 없습니다`)
    }
    spec.llm = {
      kind: kind as ProvisionLlmSpec['kind'],
      ...(llm.apiKey !== undefined ? { apiKey: String(llm.apiKey) } : {}),
      ...(baseUrl ? { baseUrl } : {}),
      ...(api !== undefined ? { api } : {}),
      ...(models ? { models } : {}),
      ...(defaultModel ? { defaultModel } : {}),
      ...(llm.name !== undefined ? { name: String(llm.name) } : {}),
      ...(llm.modelFile !== undefined ? { modelFile: String(llm.modelFile) } : {}),
    }
  }

  if (d.sapEnvironment !== undefined) {
    const env = asMapping(d.sapEnvironment, 'sapEnvironment')
    spec.sapEnvironment = {
      release: String(env.release ?? ''),
      deployment: String(env.deployment ?? ''),
      industry: String(env.industry ?? ''),
      ...(env.language !== undefined ? { language: String(env.language) } : {}),
      ...(env.client !== undefined ? { client: String(env.client) } : {}),
      ...(env.airGapped === true ? { airGapped: true } : {}),
    }
  }

  if (d.features !== undefined) {
    const features = asMapping(d.features, 'features')
    if (features.uiMode !== undefined) {
      const uiMode = String(features.uiMode)
      if (!UI_MODES.has(uiMode)) throw new ProvisionError('features.uiMode 는 simple | standard 중 하나여야 합니다')
      spec.features = { uiMode: uiMode as 'simple' | 'standard' }
    }
  }

  if (d.cbo !== undefined) {
    const cbo = asMapping(d.cbo, 'cbo')
    if (cbo.shareRoots !== undefined) {
      if (!Array.isArray(cbo.shareRoots) || cbo.shareRoots.some((r) => !String(r).trim())) {
        throw new ProvisionError('cbo.shareRoots 는 비어있지 않은 경로 문자열 배열이어야 합니다')
      }
      spec.cbo = { shareRoots: cbo.shareRoots.map(String) }
    }
  }

  return spec
}

/**
 * LLM 스펙 → LlmConnection. 온보딩(SETUP_LLM_CONNECTION / resolveCustomEndpointSetup)이
 * 만드는 형태와 동일하게 유지한다 — 드리프트는 provisioning-core.test.ts 가 잡는다.
 */
export function buildProvisionedConnection(llm: ProvisionLlmSpec, opts: { localPort?: number } = {}): LlmConnection {
  const createdAt = Date.now()

  if (llm.kind === 'local') {
    const port = opts.localPort ?? (Number(process.env.SAPSTACK_LOCAL_LLM_PORT) || 11435)
    return {
      slug: PROVISIONED_SLUG,
      // 'Local Model' — resolveCustomEndpointSetup(keyless loopback)이 붙이는 이름과 동일
      name: llm.name ?? 'Local Model',
      providerType: 'pi_compat',
      authType: 'none',
      baseUrl: `http://127.0.0.1:${port}`,
      customEndpoint: { api: 'openai-completions' },
      // local-llm.ts 가 GGUF 파일명과 무관하게 등록하는 안정 별칭
      models: ['sapstack-local'],
      defaultModel: 'sapstack-local',
      midStreamBehavior: defaultMidStreamBehavior('pi_compat'),
      createdAt,
    }
  }

  if (llm.kind === 'api_key' && llm.baseUrl) {
    const api = llm.api ?? 'anthropic-messages'
    const models = llm.models ?? []
    return {
      slug: PROVISIONED_SLUG,
      name: llm.name ?? '사내 AI 게이트웨이',
      providerType: 'pi_compat',
      authType: 'api_key_with_endpoint',
      baseUrl: llm.baseUrl,
      customEndpoint: { api },
      // 키 있는 커스텀 엔드포인트는 piAuthProvider 가 없으면 런타임 401 (#636)
      piAuthProvider: api === 'anthropic-messages' ? 'anthropic' : 'openai',
      models,
      defaultModel: llm.defaultModel ?? models[0],
      midStreamBehavior: defaultMidStreamBehavior('pi_compat'),
      createdAt,
    }
  }

  // api_key(직결) 또는 environment(GPO 환경변수) — 둘 다 Claude SDK 경로
  return {
    slug: PROVISIONED_SLUG,
    name: llm.name ?? (llm.kind === 'environment' ? 'Anthropic (환경변수)' : 'Anthropic (관리자 설정)'),
    providerType: 'anthropic',
    authType: llm.kind === 'environment' ? 'environment' : 'api_key',
    ...(llm.baseUrl ? { baseUrl: llm.baseUrl } : {}),
    models: llm.models ?? getDefaultModelsForConnection('anthropic'),
    defaultModel: llm.defaultModel ?? getDefaultModelForConnection('anthropic'),
    midStreamBehavior: defaultMidStreamBehavior('anthropic'),
    createdAt,
  }
}

/**
 * 적용 후 provision.yaml 의 apiKey 값만 "<imported>" 로 치환한 내용을 돌려준다.
 * version·주석은 보존(재적용 비교가 계속 동작해야 함). 변경 없으면 null.
 */
export function scrubApiKeyValue(raw: string): string | null {
  // lookahead 가 콜론 뒤 공백을 함께 소비해야 프리픽스 [ \t]* 백트래킹으로
  // 이미 스크럽된 값이 재매칭되지 않는다 (멱등성)
  const scrubbed = raw.replace(
    /^([ \t]*apiKey[ \t]*:[ \t]*)(?![ \t]*["']?<imported>)[^\r\n#]+/m,
    `$1"${IMPORTED_PLACEHOLDER}"`,
  )
  return scrubbed === raw ? null : scrubbed
}

/** 적용 여부 판정 — 마커 없음 / version 증가 / 실패 섹션 잔존 시에만 true */
export function shouldApplyProvision(marker: ProvisionMarker | null, version: number): boolean {
  if (!marker) return true
  if (version > marker.version) return true
  return Object.values(marker.sections ?? {}).some((s) => s !== 'ok')
}
