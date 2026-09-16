import { describe, test, expect, beforeEach, afterEach } from 'bun:test'
import { mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { discardRecord, listMyWorkItems, newRecord, queueDir, readQueue, submitRecord, type SubmitDeps } from '../change-requests-client'
import type { ChangeRequestsConfig, ChangeRequestDraft } from '../../shared/change-requests-core'

let priorWorkspace: string | undefined
beforeEach(() => {
  priorWorkspace = process.env.SAPSTACK_WORKSPACE
  process.env.SAPSTACK_WORKSPACE = mkdtempSync(join(tmpdir(), 'cr-'))
})
afterEach(() => {
  if (priorWorkspace === undefined) delete process.env.SAPSTACK_WORKSPACE
  else process.env.SAPSTACK_WORKSPACE = priorWorkspace
})

const CONFIG: ChangeRequestsConfig = { provider: 'azure_devops', orgUrl: 'https://dev.azure.com/lsitc', project: 'SAP CR', workItemType: 'Issue', entityTag: 'LSMtron-USA' }
const DRAFT: ChangeRequestDraft = { title: 'ZFI0171: skip blocked vendors', question: 'q', answer: 'a', objects: ['ZFI0171'], sid: 'DS4', client: '600', expected: 'e', priority: 2, requester: { email: 'mikyung.song@lsinjectionusa.com', name: 'Mikyung Song' } }

type Call = { url: string; init: RequestInit }
function stubFetch(handler: (call: Call, n: number) => { status: number; body: unknown } | Error) {
  const calls: Call[] = []
  const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
    const call = { url: String(url), init: init ?? {} }
    calls.push(call)
    const r = handler(call, calls.length)
    if (r instanceof Error) throw r
    return new Response(typeof r.body === 'string' ? r.body : JSON.stringify(r.body), { status: r.status })
  }) as unknown as typeof fetch
  return { calls, fetchImpl }
}

function deps(fetchImpl: typeof fetch, over: Partial<SubmitDeps> = {}): SubmitDeps {
  return { fetch: fetchImpl, getToken: async () => 'tok', config: CONFIG, ...over }
}

describe('submitRecord', () => {
  test('큐 파일을 먼저 쓰고, 첨부 → 생성 순으로 호출하며, 성공하면 submitted + URL', async () => {
    const { calls, fetchImpl } = stubFetch((c, n) => {
      if (n === 1) return { status: 201, body: { id: 'att', url: 'https://dev.azure.com/lsitc/_apis/wit/attachments/att' } }
      expect(c.url).toContain('/SAP%20CR/_apis/wit/workitems/$Issue?api-version=7.1')
      const ops = JSON.parse(String(c.init.body)) as Array<{ path: string; value: unknown }>
      expect(ops.find((o) => o.path === '/fields/System.Title')?.value).toBe('[SAP CR][DS4] ZFI0171: skip blocked vendors')
      expect((ops.find((o) => o.path === '/relations/-')?.value as { url: string }).url).toContain('/attachments/att')
      expect((c.init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
      return { status: 200, body: { id: 4711 } }
    })
    const rec = await submitRecord(newRecord({ draft: DRAFT, description: '# d', transcript: '## User\n\nq' }), deps(fetchImpl))
    expect(calls[0]!.url).toContain('/_apis/wit/attachments?fileName=conversation.md')
    expect(rec.status).toBe('submitted')
    expect(rec.result).toEqual({ id: 4711, url: 'https://dev.azure.com/lsitc/SAP%20CR/_workitems/edit/4711' })
    expect(readdirSync(queueDir())).toEqual([`${rec.id}.json`])
    expect(readQueue()[0]!.status).toBe('submitted')
  })

  test('401 은 관리자 문의 문구로 failed, 초안은 큐에 남고 재시도로 성공한다', async () => {
    let attempt = 0
    const { fetchImpl } = stubFetch(() => (++attempt === 1 ? { status: 401, body: { message: 'TF400813: not authorized' } } : { status: 200, body: { id: 1 } }))
    const failed = await submitRecord(newRecord({ draft: DRAFT, description: 'd' }), deps(fetchImpl))
    expect(failed.status).toBe('failed')
    expect(failed.error).toContain('Not a member of the LS ITC DevOps project (HTTP 401)')
    expect(failed.error).toContain('TF400813')
    const retried = await submitRecord(readQueue()[0]!, deps(fetchImpl))
    expect(retried.status).toBe('submitted')
    expect(retried.error).toBeUndefined()
  })

  test('네트워크 예외·미로그인·설정 없음은 각자 사유로 failed, submitted 재시도는 fetch 를 부르지 않는다', async () => {
    const net = stubFetch(() => new TypeError('fetch failed'))
    expect((await submitRecord(newRecord({ draft: DRAFT, description: 'd' }), deps(net.fetchImpl))).error).toBe('fetch failed')
    const none = stubFetch(() => ({ status: 200, body: {} }))
    expect((await submitRecord(newRecord({ draft: DRAFT, description: 'd' }), deps(none.fetchImpl, { getToken: async () => null }))).error).toContain('Sign in')
    expect((await submitRecord(newRecord({ draft: DRAFT, description: 'd' }), deps(none.fetchImpl, { config: null, configError: 'bad org' }))).error).toBe('bad org')
    expect(none.calls.length).toBe(0)
    const done = { ...newRecord({ draft: DRAFT, description: 'd' }), status: 'submitted' as const, result: { id: 9, url: 'u' } }
    expect(await submitRecord(done, deps(none.fetchImpl))).toBe(done)
    expect(none.calls.length).toBe(0)
  })

  test('Markdown 설명이 400 이면 HTML <pre> 로 1회 재시도', async () => {
    const bodies: string[] = []
    const { fetchImpl } = stubFetch((c, n) => {
      bodies.push(String(c.init.body))
      return n === 1 ? { status: 400, body: { message: 'multilineFieldsFormat not supported' } } : { status: 200, body: { id: 2 } }
    })
    const rec = await submitRecord(newRecord({ draft: DRAFT, description: 'a <b> & c' }), deps(fetchImpl))
    expect(rec.status).toBe('submitted')
    expect(bodies[0]).toContain('multilineFieldsFormat')
    expect(bodies[1]).not.toContain('multilineFieldsFormat')
    expect(bodies[1]).toContain('<pre>a &lt;b&gt; &amp; c</pre>')
  })

  test('discardRecord 는 파일을 지우고 남은 큐를 돌려준다', async () => {
    const a = await submitRecord(newRecord({ draft: DRAFT, description: 'd' }), deps(stubFetch(() => new Error('x')).fetchImpl))
    expect(readQueue().length).toBe(1)
    expect(discardRecord(a.id)).toEqual([])
    expect(discardRecord('missing')).toEqual([])
  })
})

describe('listMyWorkItems', () => {
  test('WIQL(@Me) → ids → 필드 조회 → 목록. 결과 없으면 두 번째 호출 없음', async () => {
    const { calls, fetchImpl } = stubFetch((c, n) => {
      if (n === 1) {
        expect(JSON.parse(String(c.init.body)).query).toContain('[System.CreatedBy] = @Me')
        return { status: 200, body: { workItems: [{ id: 5 }, { id: 6 }] } }
      }
      expect(c.url).toContain('ids=5,6')
      return { status: 200, body: { value: [{ id: 5, fields: { 'System.Title': 't5', 'System.State': 'To Do', 'System.ChangedDate': '2026-09-16T00:00:00Z' } }] } }
    })
    const items = await listMyWorkItems({ fetch: fetchImpl, token: 'tok', config: CONFIG })
    expect(items.map((i) => i.id)).toEqual([5])
    expect(calls.length).toBe(2)
    const empty = stubFetch(() => ({ status: 200, body: { workItems: [] } }))
    expect(await listMyWorkItems({ fetch: empty.fetchImpl, token: 'tok', config: CONFIG })).toEqual([])
    expect(empty.calls.length).toBe(1)
  })
})
