/**
 * Entra ID(Microsoft) 앱 사용자 로그인 — 순수 함수 (electron 의존 없음, bun test 대상)
 *
 * 커넥터용 Microsoft OAuth(microsoft-oauth.ts)와 PKCE 흐름은 같지만
 * ① authority 가 테넌트 GUID 로 고정되고(게스트 로그인은 /common 불가) ② id_token 이 신원이며
 * ③ 접근 통제는 Entra(Enterprise App "Assignment required" + 보안 그룹)가 강제한다.
 * 앱은 "로그인 성공 + tid/aud 일치"만 확인하고, 미할당 사용자는 토큰 발급 단계에서
 * AADSTS50105 로 거절되므로 그 오류를 사람이 읽을 사유로 분류하는 것이 이 모듈의 일이다.
 */

export interface EntraAuthConfig {
  /** false 면 설정은 있어도 게이트를 걸지 않는다 (배포 전 리허설용) */
  required: boolean
  tenantId: string
  clientId: string
  /** 리프레시가 네트워크 문제로 실패할 때 마지막 검증 시각부터 이 일수까지 로그인을 유지 */
  offlineGraceDays: number
  /** 로그인 화면 도메인 미리 채움 (예: lsinjectionusa.com) */
  domainHint?: string
}

export interface SignedInIdentity {
  oid: string
  tid: string
  email: string
  name: string
  /** B2B 게스트 여부 */
  guest: boolean
}

export type SignedOutReason =
  | 'never_signed_in'
  | 'not_assigned' // AADSTS50105 — 그룹/앱 할당 없음
  | 'wrong_tenant' // id_token 의 tid/aud 가 설정과 다름
  | 'refresh_expired' // invalid_grant 계열 — 다시 로그인
  | 'grace_expired' // 오프라인 유예 만료
  | 'misconfigured' // auth 블록이 있으나 무효 — fail closed
  | 'signed_out' // 사용자가 로그아웃

export type SignInStatus =
  | { kind: 'disabled' }
  | { kind: 'signed_in'; identity: SignedInIdentity; offline: boolean; verifiedAt: number }
  | { kind: 'signed_out'; reason: SignedOutReason; detail?: string }

export type TokenErrorClass = 'not_assigned' | 'refresh_expired' | 'offline' | 'other'

const GUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** 로그인에 필요한 최소 스코프. 나머지 리소스(DevOps 등)는 같은 리프레시 토큰으로 나중에 발급 */
export const ENTRA_SIGNIN_SCOPES = ['openid', 'profile', 'email', 'offline_access', 'https://graph.microsoft.com/User.Read']

/**
 * config.yaml `auth` 블록 → 설정. 블록이 없으면 null(비활성).
 * 있는데 무효면 throw — 호출 측은 fail closed(misconfigured) 로 처리한다.
 * snake_case(config.yaml)와 camelCase(provision.yaml) 키를 모두 받는다.
 */
export function parseEntraAuthConfig(raw: unknown): EntraAuthConfig | null {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error('auth must be a mapping')
  const a = raw as Record<string, unknown>
  const tenantId = String(a.tenant_id ?? a.tenantId ?? '').trim().toLowerCase()
  const clientId = String(a.client_id ?? a.clientId ?? '').trim().toLowerCase()
  if (!GUID_RE.test(tenantId)) {
    throw new Error('auth.tenant_id must be the tenant GUID (common/organizations cannot sign in B2B guests)')
  }
  if (!GUID_RE.test(clientId)) throw new Error('auth.client_id must be the application (client) GUID')
  const graceRaw = a.offline_grace_days ?? a.offlineGraceDays
  const offlineGraceDays = graceRaw === undefined ? 14 : Number(graceRaw)
  if (!Number.isInteger(offlineGraceDays) || offlineGraceDays < 0 || offlineGraceDays > 90) {
    throw new Error('auth.offline_grace_days must be an integer between 0 and 90')
  }
  const hintRaw = a.domain_hint ?? a.domainHint
  const domainHint = hintRaw ? String(hintRaw).trim() : undefined
  return { required: a.required !== false, tenantId, clientId, offlineGraceDays, ...(domainHint ? { domainHint } : {}) }
}

/** JWT payload 디코드 — 서명은 검증하지 않는다(TLS 로 토큰 엔드포인트에서 직접 받은 토큰만 넣는다) */
export function decodeJwtClaims(token: string): Record<string, unknown> {
  const parts = token.split('.')
  if (parts.length < 2 || !parts[1]) throw new Error('not a JWT')
  const json = Buffer.from(parts[1], 'base64url').toString('utf8')
  const claims = JSON.parse(json) as unknown
  if (!claims || typeof claims !== 'object') throw new Error('JWT payload is not an object')
  return claims as Record<string, unknown>
}

const EXT_UPN_RE = /^(.+)_([^_#@]+\.[^_#@]+)#EXT#@/i

/**
 * id_token 클레임 → 신원. 이메일 우선순위: email → preferred_username(#EXT# 아님) → upn →
 * #EXT# UPN 역변환(mikyung.song_lsinjectionusa.com#EXT#@… → mikyung.song@lsinjectionusa.com).
 */
export function identityFromClaims(
  claims: Record<string, unknown>,
  config: Pick<EntraAuthConfig, 'tenantId' | 'clientId'>,
): { ok: true; identity: SignedInIdentity } | { ok: false; reason: 'wrong_tenant'; detail: string } {
  const tid = String(claims.tid ?? '').toLowerCase()
  const aud = String(claims.aud ?? '').toLowerCase()
  if (tid !== config.tenantId) return { ok: false, reason: 'wrong_tenant', detail: `tid ${tid || '(none)'} != ${config.tenantId}` }
  if (aud !== config.clientId) return { ok: false, reason: 'wrong_tenant', detail: `aud ${aud || '(none)'} != ${config.clientId}` }

  const preferred = String(claims.preferred_username ?? '')
  const candidates = [String(claims.email ?? ''), preferred.includes('#EXT#') ? '' : preferred, String(claims.upn ?? '')]
  let email = candidates.find((c) => c.includes('@')) ?? ''
  if (!email) {
    const m = EXT_UPN_RE.exec(preferred)
    if (m) email = `${m[1]}@${m[2]}`
  }
  email = email.toLowerCase()

  const idp = typeof claims.idp === 'string' ? claims.idp : undefined
  const guest = preferred.includes('#EXT#') || (!!idp && !idp.includes(tid))
  const name = String(claims.name ?? '').trim() || (email.split('@')[0] ?? '')
  return { ok: true, identity: { oid: String(claims.oid ?? ''), tid, email, name, guest } }
}

/** 토큰 엔드포인트 오류 → 사유 분류. status 없음(네트워크)·5xx 는 일시 장애로 본다 */
export function classifyTokenError(err: { status?: number; error?: string; aadCodes?: string[]; description?: string } | null | undefined): TokenErrorClass {
  if (!err || err.status === undefined || err.status >= 500) return 'offline'
  const codes = err.aadCodes ?? []
  if (codes.includes('50105')) return 'not_assigned'
  if (err.error === 'invalid_grant' || err.error === 'interaction_required') return 'refresh_expired'
  if (codes.some((c) => ['700082', '50173', '70008', '50076', '50079', '53003'].includes(c))) return 'refresh_expired'
  if (err.status === 400 || err.status === 401) return 'refresh_expired'
  return 'other'
}

/** 리프레시 실패 뒤 결정 — 오프라인이면 유예 안에서만 유지, 나머지는 로그아웃 */
export function decideAfterRefreshFailure(input: {
  classification: TokenErrorClass
  verifiedAt: number
  now: number
  offlineGraceDays: number
}): { action: 'keep_offline' } | { action: 'sign_out'; reason: SignedOutReason } {
  const { classification, verifiedAt, now, offlineGraceDays } = input
  if (classification === 'not_assigned') return { action: 'sign_out', reason: 'not_assigned' }
  if (classification === 'refresh_expired') return { action: 'sign_out', reason: 'refresh_expired' }
  const graceMs = offlineGraceDays * 24 * 60 * 60 * 1000
  if (verifiedAt > 0 && now - verifiedAt <= graceMs) return { action: 'keep_offline' }
  return { action: 'sign_out', reason: 'grace_expired' }
}

/** 만료 60초 전부터는 만료로 본다 */
export function isAccessTokenFresh(expiresAt: number | undefined, now: number, skewMs = 60_000): boolean {
  return typeof expiresAt === 'number' && expiresAt - skewMs > now
}

/** authority 조립 — 커넥터의 /common 과 달리 테넌트 고정 */
export function entraAuthority(tenantId: string): string {
  return `https://login.microsoftonline.com/${tenantId}`
}
