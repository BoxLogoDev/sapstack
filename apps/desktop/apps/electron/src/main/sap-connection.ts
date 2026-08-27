/**
 * SAP ADT 접속 프로필 — 저장 / 조회 / 접속 테스트
 *
 * 저장 위치는 ~/.sapstack/.env (vsp ADT-MCP 브리지와 같은 파일 포맷).
 * 여기 저장하면 데스크톱 앱 밖의 브리지(vsp)도 같은 프로필을 읽으므로
 * "로그인 한 번 → AI 브리지까지 반영" 이 성립한다. 비밀번호가 평문으로
 * 저장되므로 get() 은 절대 비밀번호를 렌더러로 돌려주지 않는다 (hasPassword 만).
 *
 * 접속 테스트는 ADT discovery (GET /sap/bc/adt/discovery) 를 사용한다.
 * 사내 SAP 는 내부 호스트명용 사설 인증서가 일반적이라 fetch 대신
 * node:https 로 rejectUnauthorized 를 프로필의 insecure 값에 따라 낮춘다.
 * 폐쇄망(air-gap) 모드의 차단 대상은 외부 인터넷 트래픽이다 — SAP 는
 * 사내망 자원이므로 local-llm 의 loopback 과 같은 이유로 허용한다.
 */

import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { mkdir, readFile, rename, writeFile, chmod } from 'node:fs/promises'
import { request as httpsRequest } from 'node:https'
import { request as httpRequest } from 'node:http'

export interface SapConnectionProfile {
  url: string
  client: string
  user: string
  language: string
  insecure: boolean
  hasPassword: boolean
}

export interface SapConnectionInput {
  url: string
  client: string
  user: string
  /** 빈 문자열이면 기존 저장된 비밀번호 유지 */
  password: string
  language: string
  insecure: boolean
}

export interface SapConnectionProbeResult {
  ok: boolean
  status: number
  message:
    | 'connected'          // 200 — 인증 포함 성공
    | 'unauthorized'       // 401 — 계정/비밀번호/클라이언트 오류
    | 'forbidden'          // 403 — S_DEVELOP 조회 권한 부족
    | 'not_found'          // 404 — SICF 에서 /sap/bc/adt 비활성
    | 'unreachable'        // 연결 자체가 불가 (URL/포트/방화벽/DNS)
    | 'invalid_url'
    | 'unexpected'
}

function envFilePath(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack', '.env')
}

/** vsp 호환 .env 파싱 — KEY=VALUE 행만, 주석/공백 무시 */
async function readEnvFile(): Promise<Record<string, string>> {
  let raw: string
  try {
    raw = await readFile(envFilePath(), 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return {}
    throw error
  }
  const out: Record<string, string> = {}
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return out
}

export async function getSapConnection(): Promise<SapConnectionProfile | null> {
  const env = await readEnvFile()
  if (!env.SAP_URL) return null
  return {
    url: env.SAP_URL,
    client: env.SAP_CLIENT || '100',
    user: env.SAP_USER || '',
    language: env.SAP_LANGUAGE || 'KO',
    insecure: env.SAP_INSECURE === 'true',
    hasPassword: !!env.SAP_PASSWORD,
  }
}

export async function saveSapConnection(input: SapConnectionInput): Promise<SapConnectionProfile> {
  const url = String(input.url || '').trim()
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('A valid ADT URL is required (e.g. https://host:44300)')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('ADT URL must use http or https')
  }
  const client = String(input.client || '').trim()
  if (!/^\d{3}$/.test(client)) throw new Error('SAP client must be a 3-digit number')
  const user = String(input.user || '').trim()
  if (!user) throw new Error('SAP user is required')

  // 빈 비밀번호는 "기존 값 유지" — 저장된 값도 없으면 오류
  let password = String(input.password ?? '')
  if (!password) {
    const existing = await readEnvFile()
    password = existing.SAP_PASSWORD || ''
    if (!password) throw new Error('SAP password is required')
  }
  const language = /^[A-Za-z]{2}$/.test(String(input.language || '')) ? input.language.toUpperCase() : 'KO'

  const body = [
    '# sapstack SAP 접속 프로필 — Desktop 앱 설정 > SAP 접속 에서 생성',
    '# vsp ADT-MCP 브리지가 이 파일을 그대로 읽는다. 비밀번호 평문 — 공유 금지.',
    `SAP_URL=${url}`,
    `SAP_USER=${user}`,
    `SAP_PASSWORD=${password}`,
    `SAP_CLIENT=${client}`,
    `SAP_LANGUAGE=${language}`,
    `SAP_INSECURE=${input.insecure ? 'true' : 'false'}`,
    'SAP_READ_ONLY=true',
    '',
  ].join('\n')

  const target = envFilePath()
  await mkdir(dirname(target), { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, body, 'utf8')
  await rename(temporary, target)
  await chmod(target, 0o600).catch(() => {}) // Windows 에선 no-op 에 가깝다
  return { url, client, user, language, insecure: input.insecure, hasPassword: true }
}

/** ADT discovery 를 Basic 인증으로 조회해 상태코드를 사람이 읽을 결과로 매핑 */
export async function probeSapConnection(input: {
  url: string
  client: string
  user: string
  password: string
  insecure: boolean
}): Promise<SapConnectionProbeResult> {
  let base: URL
  try {
    base = new URL(String(input.url || ''))
  } catch {
    return { ok: false, status: 0, message: 'invalid_url' }
  }

  // 비밀번호 미입력 시 저장본으로 테스트 (편집 없이 재검증하는 경우)
  let password = String(input.password ?? '')
  if (!password) password = (await readEnvFile()).SAP_PASSWORD || ''

  const target = new URL('/sap/bc/adt/discovery', base)
  target.searchParams.set('sap-client', String(input.client || '100'))

  const status = await new Promise<number>((resolve) => {
    // http.request 에는 rejectUnauthorized 가 없으므로 https 시그니처로 통일해 호출
    const requester: typeof httpsRequest =
      target.protocol === 'https:' ? httpsRequest : (httpRequest as unknown as typeof httpsRequest)
    const req = requester(
      target,
      {
        method: 'GET',
        timeout: 8000,
        rejectUnauthorized: !input.insecure,
        headers: {
          Authorization: `Basic ${Buffer.from(`${input.user}:${password}`).toString('base64')}`,
          Accept: 'application/atomsvc+xml, application/xml',
        },
      },
      (res) => {
        res.resume() // 본문은 불필요 — 소켓만 비운다
        resolve(res.statusCode ?? 0)
      },
    )
    req.on('timeout', () => req.destroy(new Error('timeout')))
    req.on('error', () => resolve(0))
    req.end()
  })

  switch (status) {
    case 200: return { ok: true, status, message: 'connected' }
    case 401: return { ok: false, status, message: 'unauthorized' }
    case 403: return { ok: false, status, message: 'forbidden' }
    case 404: return { ok: false, status, message: 'not_found' }
    case 0:   return { ok: false, status, message: 'unreachable' }
    default:  return { ok: false, status, message: 'unexpected' }
  }
}
