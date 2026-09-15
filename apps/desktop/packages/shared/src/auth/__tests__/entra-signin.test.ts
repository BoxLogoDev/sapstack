import { describe, expect, test } from 'bun:test'
import {
  classifyTokenError,
  decideAfterRefreshFailure,
  decodeJwtClaims,
  identityFromClaims,
  isAccessTokenFresh,
  parseEntraAuthConfig,
} from '../entra-signin'

const TENANT = '11111111-2222-3333-4444-555555555555'
const CLIENT = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
const CONFIG = { tenantId: TENANT, clientId: CLIENT }

function jwt(payload: Record<string, unknown>): string {
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url')
  return `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64(payload)}.sig`
}

describe('parseEntraAuthConfig', () => {
  test('블록 없음 → null(비활성), 정상 블록 → 기본값 채움', () => {
    expect(parseEntraAuthConfig(undefined)).toBeNull()
    const cfg = parseEntraAuthConfig({ tenant_id: TENANT.toUpperCase(), client_id: CLIENT, domain_hint: 'lsinjectionusa.com' })
    expect(cfg).toEqual({ required: true, tenantId: TENANT, clientId: CLIENT, offlineGraceDays: 14, domainHint: 'lsinjectionusa.com' })
  })

  test('camelCase(provision.yaml)도 허용, required:false 유지', () => {
    const cfg = parseEntraAuthConfig({ tenantId: TENANT, clientId: CLIENT, required: false, offlineGraceDays: 0 })
    expect(cfg?.required).toBe(false)
    expect(cfg?.offlineGraceDays).toBe(0)
  })

  test('common/organizations·GUID 아님·유예 범위 밖은 거부 (fail closed)', () => {
    expect(() => parseEntraAuthConfig({ tenant_id: 'common', client_id: CLIENT })).toThrow('tenant GUID')
    expect(() => parseEntraAuthConfig({ tenant_id: TENANT, client_id: 'not-a-guid' })).toThrow('client')
    expect(() => parseEntraAuthConfig({ tenant_id: TENANT, client_id: CLIENT, offline_grace_days: 365 })).toThrow('offline_grace_days')
    expect(() => parseEntraAuthConfig('yes')).toThrow('mapping')
  })
})

describe('decodeJwtClaims / identityFromClaims', () => {
  test('디코드 + 정상 신원 (email 클레임 우선)', () => {
    const claims = decodeJwtClaims(jwt({ tid: TENANT, aud: CLIENT, oid: 'o1', name: 'Mikyung Song', email: 'Mikyung.Song@lsinjectionusa.com', preferred_username: 'x' }))
    const r = identityFromClaims(claims, CONFIG)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.identity).toEqual({ oid: 'o1', tid: TENANT, email: 'mikyung.song@lsinjectionusa.com', name: 'Mikyung Song', guest: false })
  })

  test('게스트: #EXT# UPN 은 이메일로 쓰지 않고 역변환, guest=true', () => {
    const r = identityFromClaims({
      tid: TENANT, aud: CLIENT, oid: 'o2',
      preferred_username: 'mikyung.song_lsinjectionusa.com#EXT#@lsitc.onmicrosoft.com',
      idp: 'https://sts.windows.net/99999999-0000-0000-0000-000000000000/',
    }, CONFIG)
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.identity.email).toBe('mikyung.song@lsinjectionusa.com')
      expect(r.identity.guest).toBe(true)
      expect(r.identity.name).toBe('mikyung.song')
    }
  })

  test('tid 또는 aud 불일치 → wrong_tenant', () => {
    expect(identityFromClaims({ tid: 'other', aud: CLIENT }, CONFIG)).toMatchObject({ ok: false, reason: 'wrong_tenant' })
    expect(identityFromClaims({ tid: TENANT, aud: 'other' }, CONFIG)).toMatchObject({ ok: false, reason: 'wrong_tenant' })
  })

  test('JWT 아님 → throw', () => {
    expect(() => decodeJwtClaims('nope')).toThrow('JWT')
  })
})

describe('classifyTokenError / decideAfterRefreshFailure', () => {
  const DAY = 24 * 60 * 60 * 1000

  test('AADSTS50105 → not_assigned, invalid_grant → refresh_expired, 네트워크/5xx → offline', () => {
    expect(classifyTokenError({ status: 400, error: 'invalid_grant', aadCodes: ['50105'] })).toBe('not_assigned')
    expect(classifyTokenError({ status: 400, error: 'invalid_grant', aadCodes: ['700082'] })).toBe('refresh_expired')
    expect(classifyTokenError({ status: 401, error: 'invalid_client' })).toBe('refresh_expired')
    expect(classifyTokenError(undefined)).toBe('offline')
    expect(classifyTokenError({ status: 503 })).toBe('offline')
    expect(classifyTokenError({ status: 429 })).toBe('other')
  })

  test('오프라인은 유예 안이면 유지, 넘으면 grace_expired; 권한류는 즉시 로그아웃', () => {
    const now = 1_000 * DAY
    expect(decideAfterRefreshFailure({ classification: 'offline', verifiedAt: now - 3 * DAY, now, offlineGraceDays: 14 })).toEqual({ action: 'keep_offline' })
    expect(decideAfterRefreshFailure({ classification: 'offline', verifiedAt: now - 15 * DAY, now, offlineGraceDays: 14 })).toEqual({ action: 'sign_out', reason: 'grace_expired' })
    // 유예 0일 = 오프라인 사용 불가 (런북 스모크 "grace 0")
    expect(decideAfterRefreshFailure({ classification: 'offline', verifiedAt: now - 1, now, offlineGraceDays: 0 })).toEqual({ action: 'sign_out', reason: 'grace_expired' })
    expect(decideAfterRefreshFailure({ classification: 'not_assigned', verifiedAt: now, now, offlineGraceDays: 14 })).toEqual({ action: 'sign_out', reason: 'not_assigned' })
    expect(decideAfterRefreshFailure({ classification: 'refresh_expired', verifiedAt: now, now, offlineGraceDays: 14 })).toEqual({ action: 'sign_out', reason: 'refresh_expired' })
  })

  test('isAccessTokenFresh 는 60초 스큐', () => {
    expect(isAccessTokenFresh(100_000 + 61_000, 100_000)).toBe(true)
    expect(isAccessTokenFresh(100_000 + 59_000, 100_000)).toBe(false)
    expect(isAccessTokenFresh(undefined, 100_000)).toBe(false)
  })
})
