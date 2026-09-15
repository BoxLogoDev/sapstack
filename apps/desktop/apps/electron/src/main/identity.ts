/**
 * 앱 사용자 로그인(Entra ID) — 상태 판정·로그인·로그아웃·토큰 제공·IPC.
 *
 * 설정 원천: ~/.sapstack/config.yaml 의 `auth` 블록(프로비저닝이 시딩). 블록이 없으면
 * 비활성(기존 동작), 있는데 무효면 fail closed(misconfigured) 로 게이트가 닫힌다.
 * 저장: 자격증명 금고(credentials.enc) 의 `entra_signin::global` 레코드 하나 —
 * AT(value)/RT/id_token/verifiedAt. 신원은 항상 id_token 클레임에서 복원한다.
 * 부팅마다 AT 가 만료돼 있으면 리프레시가 재검증 역할을 하고(그룹 제거·비활성은 여기서 걸린다),
 * 네트워크 문제면 verifiedAt + offline_grace_days 안에서만 오프라인 로그인을 유지한다.
 * 이메일·이름은 로그에 남기지 않는다.
 */
import { ipcMain } from 'electron'
import { getCredentialManager } from '@sapstack-desktop/shared/credentials'
import type { StoredCredential } from '@sapstack-desktop/shared/credentials'
import { MicrosoftTokenError, refreshMicrosoftToken, startMicrosoftOAuth } from '@sapstack-desktop/shared/auth/microsoft-oauth'
import {
  ENTRA_SIGNIN_SCOPES,
  classifyTokenError,
  decideAfterRefreshFailure,
  decodeJwtClaims,
  identityFromClaims,
  isAccessTokenFresh,
  parseEntraAuthConfig,
  type EntraAuthConfig,
  type SignedInIdentity,
} from '@sapstack-desktop/shared/auth/entra-signin'
import { readEnvironmentProfile } from './environment-profile'
import { mainLog } from './logger'
import type { SignInState } from '../shared/types'

export const AUTH_IPC = {
  status: 'sapstack:auth:status',
  signIn: 'sapstack:auth:signIn',
  signOut: 'sapstack:auth:signOut',
} as const

const CRED_ID = { type: 'entra_signin' as const }
const REFRESH_TIMEOUT_MS = 10_000

let cached: SignInState | null = null
/** 리소스별(스코프 문자열) 액세스 토큰 캐시 — DevOps 등. 프로세스 수명 동안만 */
const resourceTokens = new Map<string, { token: string; expiresAt: number }>()

async function loadConfig(): Promise<{ config: EntraAuthConfig | null; error?: string }> {
  const profile = (await readEnvironmentProfile().catch(() => null)) as Record<string, unknown> | null
  try {
    return { config: parseEntraAuthConfig(profile?.auth) }
  } catch (err) {
    return { config: null, error: err instanceof Error ? err.message : String(err) }
  }
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
    p.then((v) => { clearTimeout(t); resolve(v) }, (e) => { clearTimeout(t); reject(e) })
  })
}

function identityOf(cred: StoredCredential, config: EntraAuthConfig): ReturnType<typeof identityFromClaims> | { ok: false; reason: 'wrong_tenant'; detail: string } {
  if (!cred.idToken) return { ok: false, reason: 'wrong_tenant', detail: 'no id_token stored' }
  try {
    return identityFromClaims(decodeJwtClaims(cred.idToken), config)
  } catch (err) {
    return { ok: false, reason: 'wrong_tenant', detail: err instanceof Error ? err.message : String(err) }
  }
}

async function forget(): Promise<void> {
  resourceTokens.clear()
  await getCredentialManager().delete(CRED_ID).catch(() => false)
}

/** 부팅·설정 화면·재시도에서 호출. force 가 아니면 프로세스 내 캐시를 돌려준다 */
export async function resolveSignInStatus(force = false): Promise<SignInState> {
  if (cached && !force) return cached
  cached = await computeSignInStatus()
  return cached
}

async function computeSignInStatus(): Promise<SignInState> {
  const { config, error } = await loadConfig()
  if (error) return { status: { kind: 'signed_out', reason: 'misconfigured', detail: error }, required: true }
  if (!config) return { status: { kind: 'disabled' }, required: false }
  const required = config.required

  const cred = await getCredentialManager().get(CRED_ID).catch(() => null)
  if (!cred) return { status: { kind: 'signed_out', reason: 'never_signed_in' }, required }

  const id = identityOf(cred, config)
  if (!id.ok) {
    await forget()
    return { status: { kind: 'signed_out', reason: 'wrong_tenant', detail: id.detail }, required }
  }

  const now = Date.now()
  const verifiedAt = cred.verifiedAt ?? now
  if (isAccessTokenFresh(cred.expiresAt, now)) {
    return { status: { kind: 'signed_in', identity: id.identity, offline: false, verifiedAt }, required }
  }

  if (!cred.refreshToken) {
    await forget()
    return { status: { kind: 'signed_out', reason: 'refresh_expired' }, required }
  }

  try {
    const fresh = await withTimeout(
      refreshMicrosoftToken(cred.refreshToken, { clientId: config.clientId, tenant: config.tenantId }),
      REFRESH_TIMEOUT_MS,
    )
    const next: StoredCredential = {
      ...cred,
      value: fresh.accessToken,
      refreshToken: fresh.refreshToken ?? cred.refreshToken,
      expiresAt: fresh.expiresAt,
      idToken: fresh.idToken ?? cred.idToken,
      verifiedAt: now,
    }
    const refreshedId = identityOf(next, config)
    if (!refreshedId.ok) {
      await forget()
      return { status: { kind: 'signed_out', reason: 'wrong_tenant', detail: refreshedId.detail }, required }
    }
    await getCredentialManager().set(CRED_ID, next)
    return { status: { kind: 'signed_in', identity: refreshedId.identity, offline: false, verifiedAt: now }, required }
  } catch (err) {
    const classification = err instanceof MicrosoftTokenError
      ? classifyTokenError({ status: err.status, error: err.error, aadCodes: err.aadCodes })
      : 'offline'
    const decision = decideAfterRefreshFailure({ classification, verifiedAt, now, offlineGraceDays: config.offlineGraceDays })
    if (decision.action === 'keep_offline') {
      mainLog.warn(`[auth] refresh failed (${classification}) — keeping offline sign-in within grace window`)
      return { status: { kind: 'signed_in', identity: id.identity, offline: true, verifiedAt }, required }
    }
    mainLog.info(`[auth] refresh failed (${classification}) → signed out (${decision.reason})`)
    await forget()
    return { status: { kind: 'signed_out', reason: decision.reason }, required }
  }
}

/** 브라우저 PKCE 로그인. 성공 시 금고에 기록하고 새 상태를 돌려준다 */
export async function signIn(): Promise<SignInState> {
  const { config, error } = await loadConfig()
  if (error || !config) {
    cached = { status: { kind: 'signed_out', reason: 'misconfigured', detail: error ?? 'auth block missing' }, required: true }
    return cached
  }
  const result = await startMicrosoftOAuth({
    clientId: config.clientId,
    tenant: config.tenantId,
    scopes: ENTRA_SIGNIN_SCOPES,
    prompt: 'select_account',
    ...(config.domainHint ? { domainHint: config.domainHint } : {}),
  })
  if (!result.success || !result.accessToken || !result.idToken) {
    const detail = result.error ?? 'no tokens returned'
    const reason = /AADSTS50105/.test(detail) ? 'not_assigned' : 'never_signed_in'
    mainLog.info(`[auth] sign-in failed: ${reason}`)
    cached = { status: { kind: 'signed_out', reason, detail }, required: config.required }
    return cached
  }
  const now = Date.now()
  const cred: StoredCredential = {
    value: result.accessToken,
    refreshToken: result.refreshToken,
    expiresAt: result.expiresAt,
    idToken: result.idToken,
    clientId: config.clientId,
    tokenType: 'Bearer',
    source: 'native',
    verifiedAt: now,
  }
  const id = identityOf(cred, config)
  if (!id.ok) {
    cached = { status: { kind: 'signed_out', reason: 'wrong_tenant', detail: id.detail }, required: config.required }
    return cached
  }
  await getCredentialManager().set(CRED_ID, cred)
  resourceTokens.clear()
  mainLog.info('[auth] signed in')
  cached = { status: { kind: 'signed_in', identity: id.identity, offline: false, verifiedAt: now }, required: config.required }
  return cached
}

export async function signOut(): Promise<SignInState> {
  await forget()
  const { config } = await loadConfig()
  cached = { status: { kind: 'signed_out', reason: 'signed_out' }, required: config?.required ?? false }
  mainLog.info('[auth] signed out')
  return cached
}

export async function getSignedInIdentity(): Promise<SignedInIdentity | null> {
  const state = await resolveSignInStatus()
  return state.status.kind === 'signed_in' ? state.status.identity : null
}

/**
 * 액세스 토큰. scopes 없음 → 로그인 토큰(Graph). scopes 있음(예: Azure DevOps
 * `499b84ac-1321-427f-aa17-267ca6975798/.default`) → 같은 리프레시 토큰으로 해당 리소스 토큰 발급.
 * 로그인 상태가 아니면 null.
 */
export async function getAccessToken(scopes?: string[]): Promise<string | null> {
  const state = await resolveSignInStatus()
  if (state.status.kind !== 'signed_in') return null
  const { config } = await loadConfig()
  const cred = await getCredentialManager().get(CRED_ID).catch(() => null)
  if (!config || !cred) return null

  if (!scopes?.length) return isAccessTokenFresh(cred.expiresAt, Date.now()) ? cred.value : null

  const key = [...scopes].sort().join(' ')
  const hit = resourceTokens.get(key)
  if (hit && isAccessTokenFresh(hit.expiresAt, Date.now())) return hit.token
  if (!cred.refreshToken) return null

  const fresh = await withTimeout(
    refreshMicrosoftToken(cred.refreshToken, { clientId: config.clientId, tenant: config.tenantId, scopes }),
    REFRESH_TIMEOUT_MS,
  )
  // 리프레시 토큰이 회전됐으면 반드시 저장 — 로그인 토큰(value)은 그대로 둔다
  if (fresh.refreshToken && fresh.refreshToken !== cred.refreshToken) {
    await getCredentialManager().set(CRED_ID, { ...cred, refreshToken: fresh.refreshToken, verifiedAt: Date.now() })
  }
  resourceTokens.set(key, { token: fresh.accessToken, expiresAt: fresh.expiresAt ?? Date.now() + 50 * 60_000 })
  return fresh.accessToken
}

export function registerIdentityHandlers(): void {
  ipcMain.handle(AUTH_IPC.status, async (_event, force?: boolean) => resolveSignInStatus(force === true))
  ipcMain.handle(AUTH_IPC.signIn, async () => signIn())
  ipcMain.handle(AUTH_IPC.signOut, async () => signOut())
}
