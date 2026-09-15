import { afterEach, describe, expect, test } from 'bun:test'
import { MicrosoftTokenError, microsoftTokenUrlFor, refreshMicrosoftToken } from '../microsoft-oauth'

// 전역 fetch 스텁 — bun test 는 단일 프로세스라 반드시 복원한다 (STATE.md 테스트 격리 규율)
const originalFetch = globalThis.fetch
afterEach(() => {
  globalThis.fetch = originalFetch
})

function stubFetch(status: number, body: unknown, capture?: { url?: string; body?: string }) {
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    if (capture) {
      capture.url = String(input)
      capture.body = String(init?.body ?? '')
    }
    return new Response(typeof body === 'string' ? body : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch
}

describe('refreshMicrosoftToken (app sign-in extensions)', () => {
  test('tenant/clientId/scopes 가 요청에 반영되고 id_token 을 돌려준다', async () => {
    const capture: { url?: string; body?: string } = {}
    stubFetch(200, { access_token: 'AT2', refresh_token: 'RT2', expires_in: 3600, id_token: 'h.p.s' }, capture)
    const tenant = '11111111-2222-3333-4444-555555555555'
    const r = await refreshMicrosoftToken('RT1', { clientId: 'client-x', tenant, scopes: ['499b84ac-1321-427f-aa17-267ca6975798/.default'] })
    expect(r.accessToken).toBe('AT2')
    expect(r.refreshToken).toBe('RT2')
    expect(r.idToken).toBe('h.p.s')
    expect(capture.url).toBe(microsoftTokenUrlFor(tenant))
    const params = new URLSearchParams(capture.body)
    expect(params.get('client_id')).toBe('client-x')
    expect(params.get('scope')).toBe('499b84ac-1321-427f-aa17-267ca6975798/.default')
    expect(params.get('grant_type')).toBe('refresh_token')
  })

  test('옵션 없이 부르면 /common 과 빌드타임 client id (커넥터 무변경)', async () => {
    const capture: { url?: string; body?: string } = {}
    stubFetch(200, { access_token: 'AT' }, capture)
    await refreshMicrosoftToken('RT')
    expect(capture.url).toBe('https://login.microsoftonline.com/common/oauth2/v2.0/token')
    expect(new URLSearchParams(capture.body).has('scope')).toBe(false)
  })

  test('400 invalid_grant + AADSTS50105 → MicrosoftTokenError 에 코드가 파싱된다', async () => {
    stubFetch(400, {
      error: 'invalid_grant',
      error_description: "AADSTS50105: Your administrator has configured the application 'sapstack' to block users unless they are specifically granted access. Trace ID: x",
      error_codes: [50105],
    })
    let caught: unknown
    try {
      await refreshMicrosoftToken('RT')
    } catch (err) {
      caught = err
    }
    expect(caught).toBeInstanceOf(MicrosoftTokenError)
    const e = caught as MicrosoftTokenError
    expect(e.status).toBe(400)
    expect(e.error).toBe('invalid_grant')
    expect(e.aadCodes).toEqual(['50105'])
    expect(e.message).toContain('Failed to refresh Microsoft token')
  })

  test('JSON 이 아닌 본문도 안전하게 담는다', () => {
    const e = new MicrosoftTokenError('x', 502, '<html>Bad gateway</html>')
    expect(e.error).toBe('')
    expect(e.description).toContain('Bad gateway')
    expect(e.aadCodes).toEqual([])
  })
})
