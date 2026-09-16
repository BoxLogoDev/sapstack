/**
 * change-requests-client — 변경 요청서 로컬 큐 + Azure DevOps REST. electron 을 import 하지 않아
 * bun test 로 검증한다. 토큰·설정·fetch 는 호출자가 주입한다(main/change-requests.ts).
 *
 * 큐: ~/.sapstack/change-requests/{id}.json — 네트워크 전에 먼저 쓰고, 결과를 같은 파일에 덧쓴다.
 * 이미 submitted 인 레코드는 재시도해도 다시 만들지 않는다(멱등).
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { randomUUID } from 'node:crypto'
import {
  buildMyRequestsWiql,
  parseWorkItems,
  toJsonPatch,
  workItemWebUrl,
  type ChangeRequestItem,
  type ChangeRequestsConfig,
  type ChangeRequestSubmitInput,
  type QueuedChangeRequest,
} from '../shared/change-requests-core'

const REQUEST_TIMEOUT_MS = 15_000
const API = 'api-version=7.1'

export type FetchLike = typeof fetch

export interface SubmitDeps {
  fetch: FetchLike
  /** Azure DevOps 스코프 토큰. null 이면 미로그인 */
  getToken: () => Promise<string | null>
  config: ChangeRequestsConfig | null
  configError?: string
}

// ── 큐 ───────────────────────────────────────────────────────────────────

export function queueDir(): string {
  return join(process.env.SAPSTACK_WORKSPACE || homedir(), '.sapstack', 'change-requests')
}

function recordPath(id: string): string {
  return join(queueDir(), `${id}.json`)
}

export function writeRecord(rec: QueuedChangeRequest): QueuedChangeRequest {
  mkdirSync(queueDir(), { recursive: true })
  writeFileSync(recordPath(rec.id), JSON.stringify(rec, null, 2))
  return rec
}

export function readQueue(): QueuedChangeRequest[] {
  const dir = queueDir()
  if (!existsSync(dir)) return []
  const out: QueuedChangeRequest[] = []
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.json')) continue
    try {
      out.push(JSON.parse(readFileSync(join(dir, f), 'utf8')) as QueuedChangeRequest)
    } catch {
      /* 손상 파일은 건너뛴다 */
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function discardRecord(id: string): QueuedChangeRequest[] {
  const p = recordPath(id)
  if (existsSync(p)) unlinkSync(p)
  return readQueue()
}

export function newRecord(input: ChangeRequestSubmitInput): QueuedChangeRequest {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'queued',
    draft: input.draft,
    description: input.description,
    ...(input.transcript ? { transcript: input.transcript } : {}),
  }
}

// ── Azure DevOps REST ─────────────────────────────────────────────────────

export class AdoError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

async function adoFetch(fetchImpl: FetchLike, url: string, init: RequestInit & { token: string }): Promise<unknown> {
  const { token, ...rest } = init
  const res = await fetchImpl(url, {
    ...rest,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', ...(rest.headers ?? {}) },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })
  const text = await res.text()
  if (!res.ok) {
    let msg = text
    try {
      msg = (JSON.parse(text) as { message?: string }).message ?? text
    } catch {
      /* 본문이 JSON 이 아니면 그대로 */
    }
    if (res.status === 401 || res.status === 403) {
      msg = `Not a member of the LS ITC DevOps project (HTTP ${res.status}) — ask the administrator. ${msg}`
    }
    throw new AdoError(msg.slice(0, 500), res.status)
  }
  return text ? JSON.parse(text) : null
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export async function createWorkItem(
  deps: { fetch: FetchLike; token: string; config: ChangeRequestsConfig },
  rec: Pick<QueuedChangeRequest, 'draft' | 'description' | 'transcript'>,
): Promise<{ id: number; url: string }> {
  const { fetch: f, token, config } = deps
  const project = encodeURIComponent(config.project)

  let attachmentUrl: string | undefined
  if (rec.transcript) {
    const up = (await adoFetch(f, `${config.orgUrl}/${project}/_apis/wit/attachments?fileName=conversation.md&${API}`, {
      method: 'POST',
      token,
      headers: { 'Content-Type': 'application/octet-stream' },
      body: rec.transcript,
    })) as { url?: string } | null
    attachmentUrl = up?.url
  }

  const create = (patch: unknown) =>
    adoFetch(f, `${config.orgUrl}/${project}/_apis/wit/workitems/$${encodeURIComponent(config.workItemType)}?${API}`, {
      method: 'POST',
      token,
      headers: { 'Content-Type': 'application/json-patch+json' },
      body: JSON.stringify(patch),
    }) as Promise<{ id: number }>

  const ops = toJsonPatch(rec.draft, config, { description: rec.description, attachmentUrl })
  let created: { id: number }
  try {
    created = await create(ops)
  } catch (err) {
    // 조직이 Markdown 설명을 아직 안 받으면 HTML <pre> 로 1회 재시도
    if (!(err instanceof AdoError && err.status === 400)) throw err
    const html = ops
      .filter((o) => o.path !== '/multilineFieldsFormat/System.Description')
      .map((o) => (o.path === '/fields/System.Description' ? { ...o, value: `<pre>${escapeHtml(rec.description)}</pre>` } : o))
    created = await create(html)
  }
  return { id: created.id, url: workItemWebUrl(config, created.id) }
}

export async function listMyWorkItems(deps: { fetch: FetchLike; token: string; config: ChangeRequestsConfig }): Promise<ChangeRequestItem[]> {
  const { fetch: f, token, config } = deps
  const project = encodeURIComponent(config.project)
  const wiql = (await adoFetch(f, `${config.orgUrl}/${project}/_apis/wit/wiql?${API}&$top=50`, {
    method: 'POST',
    token,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: buildMyRequestsWiql() }),
  })) as { workItems?: Array<{ id: number }> } | null
  const ids = (wiql?.workItems ?? []).map((w) => w.id)
  if (ids.length === 0) return []
  const fields = ['System.Id', 'System.Title', 'System.State', 'System.ChangedDate', 'System.AssignedTo'].join(',')
  const items = await adoFetch(f, `${config.orgUrl}/${project}/_apis/wit/workitems?ids=${ids.join(',')}&fields=${fields}&${API}`, { token })
  return parseWorkItems(items, config)
}

// ── 제출(큐 → 네트워크 → 큐) ──────────────────────────────────────────────

function fail(rec: QueuedChangeRequest, error: string): QueuedChangeRequest {
  return writeRecord({ ...rec, status: 'failed', error })
}

export async function submitRecord(rec: QueuedChangeRequest, deps: SubmitDeps): Promise<QueuedChangeRequest> {
  if (rec.status === 'submitted') return rec
  if (rec.status === 'queued') writeRecord(rec)
  if (!deps.config) return fail(rec, deps.configError ?? 'Change requests are not configured on this PC')
  let token: string | null
  try {
    token = await deps.getToken()
  } catch (err) {
    return fail(rec, `Could not get an Azure DevOps token: ${err instanceof Error ? err.message : String(err)}`)
  }
  if (!token) return fail(rec, 'Sign in with your Microsoft account first')
  try {
    const result = await createWorkItem({ fetch: deps.fetch, token, config: deps.config }, rec)
    const { error: _dropped, ...rest } = rec
    return writeRecord({ ...rest, status: 'submitted', result })
  } catch (err) {
    return fail(rec, err instanceof Error ? err.message : String(err))
  }
}
