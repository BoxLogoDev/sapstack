/**
 * change-requests-core — 변경 요청서(문서) 흐름의 순수 로직. main 과 renderer 가 함께 쓴다.
 *
 * 앱은 코드를 고치지 않는다. 현업이 CBO 설명을 읽은 뒤 "이 프로그램 수정 요청" 을 누르면
 * 대화의 질문·답·오브젝트로 초안을 만들고, LS ITC 의 Azure DevOps Boards 에 작업 항목(문서)을
 * 요청자 본인 토큰으로 생성한다. 네트워크·토큰·큐는 main/change-requests.ts, 여기는 판단만.
 */

import { extractCboObjects } from './cbo-objects'

// ── 설정 ────────────────────────────────────────────────────────────────

export interface ChangeRequestsConfig {
  provider: 'azure_devops'
  /** https://dev.azure.com/<org> — 끝 슬래시 없음 */
  orgUrl: string
  project: string
  /** Basic 프로세스 기본 `Issue`. 상속 프로세스면 관리자가 지정 */
  workItemType: string
  areaPath?: string
  /** 법인 태그(예 LSMtron-USA). Stakeholder 는 새 태그를 만들 수 없어 사전 생성된 것만 쓴다 */
  entityTag?: string
}

/** Azure DevOps 리소스 — 로그인 리프레시 토큰으로 발급받는 스코프 */
export const ADO_SCOPE = '499b84ac-1321-427f-aa17-267ca6975798/.default'

function pick(raw: Record<string, unknown>, camel: string, snake: string): unknown {
  return raw[camel] !== undefined ? raw[camel] : raw[snake]
}

function str(v: unknown, field: string, required: boolean): string | undefined {
  if (v === undefined || v === null || v === '') {
    if (required) throw new Error(`changeRequests.${field} is required`)
    return undefined
  }
  if (typeof v !== 'string') throw new Error(`changeRequests.${field} must be a string`)
  return v.trim()
}

/** provision.yaml(camelCase) 과 config.yaml(snake_case) 둘 다 받는다. 없으면 null, 틀리면 throw */
export function parseChangeRequestsConfig(raw: unknown): ChangeRequestsConfig | null {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== 'object' || Array.isArray(raw)) throw new Error('changeRequests must be a mapping')
  const r = raw as Record<string, unknown>
  const provider = str(pick(r, 'provider', 'provider'), 'provider', false) ?? 'azure_devops'
  if (provider !== 'azure_devops') throw new Error(`changeRequests.provider: unsupported "${provider}" (only azure_devops)`)
  const orgUrl = str(pick(r, 'orgUrl', 'org_url'), 'orgUrl', true)!.replace(/\/+$/, '')
  if (!/^https:\/\/[^/\s]+(?:\/[^/\s]+)?$/.test(orgUrl)) {
    throw new Error(`changeRequests.orgUrl must look like https://dev.azure.com/<org> (got "${orgUrl}")`)
  }
  const project = str(pick(r, 'project', 'project'), 'project', true)!
  const workItemType = str(pick(r, 'workItemType', 'work_item_type'), 'workItemType', false) ?? 'Issue'
  const areaPath = str(pick(r, 'areaPath', 'area_path'), 'areaPath', false)
  const entityTag = str(pick(r, 'entityTag', 'entity_tag'), 'entityTag', false)
  return { provider: 'azure_devops', orgUrl, project, workItemType, ...(areaPath ? { areaPath } : {}), ...(entityTag ? { entityTag } : {}) }
}

// ── 마스킹 ──────────────────────────────────────────────────────────────
// ponytail: packages/runtime/src/security.ts 의 US/KR 패턴 4종을 복제. 런타임 패키지는 데스크톱 의존성이
// 아니라서 import 할 수 없다. 패턴을 바꾸면 두 곳을 같이 고친다.

const MASKS: Array<[RegExp, string]> = [
  [/\b(?!000|666|9\d\d)\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g, '###-##-####'],
  [/\b\d{2}-\d{7}\b/g, '##-#######'],
  [/(?:\+1[- .])?(?:\(\d{3}\)|\b[2-9]\d{2})[- .]\d{3}[- .]\d{4}\b/g, '(***) ***-****'],
  [/\b\d{6}-[1-4]\d{6}\b/g, '######-#######'],
]

export function maskSensitive(text: string): string {
  return MASKS.reduce((acc, [re, rep]) => acc.replace(re, rep), text)
}

// ── 초안 ────────────────────────────────────────────────────────────────

export interface DraftMessage {
  role: string
  content: string
  isIntermediate?: boolean
  isStreaming?: boolean
  hidden?: boolean
}

export interface DraftSnapshot {
  sid: string
  client: string
  sourceSlug: string | null
}

export interface Requester {
  email: string
  name: string
}

export type ChangeRequestPriority = 1 | 2 | 3 | 4

export interface ChangeRequestDraft {
  title: string
  /** 안내 프롬프트 접두를 벗긴 사용자 원문 */
  question: string
  /** 마지막 최종(assistant, 비중간) 답 */
  answer: string
  objects: string[]
  sid?: string
  client?: string
  /** 사용자가 대화상자에서 적는 기대 동작 */
  expected: string
  priority: ChangeRequestPriority
  requester: Requester | null
}

/** 안내 프롬프트(sap-golden-path)가 붙인 라벨 뒤의 원문. 라벨이 없으면 [source:] 줄만 걷어낸 본문 */
const QUESTION_LABEL_RE = /^(?:사용자 요청|사용자 증상|Request|Symptom):[ \t]*(.+)$/m

export function extractQuestion(content: string): string {
  const m = QUESTION_LABEL_RE.exec(content)
  if (m) return m[1]!.trim()
  return content
    .split('\n')
    .filter((line) => !line.startsWith('[source:'))
    .join('\n')
    .trim()
}

function firstLine(text: string): string {
  return text.split('\n').find((l) => l.trim().length > 0)?.trim() ?? ''
}

export function buildDraft(input: {
  messages: DraftMessage[]
  snapshots: DraftSnapshot[]
  enabledSourceSlugs?: string[]
  requester: Requester | null
}): ChangeRequestDraft {
  const { messages, snapshots, enabledSourceSlugs = [], requester } = input
  const lastUser = [...messages].reverse().find((m) => m.role === 'user' && !m.hidden)
  const lastAnswer = [...messages].reverse().find((m) => m.role === 'assistant' && !m.isIntermediate && !m.isStreaming && !m.hidden)

  const question = maskSensitive(lastUser ? extractQuestion(lastUser.content) : '')
  const answer = maskSensitive(lastAnswer?.content ?? '')

  const fromQuestion = extractCboObjects(question)
  const objects = (fromQuestion.length ? fromQuestion : extractCboObjects(answer)).slice(0, 10)

  const active = snapshots.find((s) => s.sourceSlug && enabledSourceSlugs.includes(s.sourceSlug))
  const snap = active ?? (snapshots.length === 1 ? snapshots[0] : undefined)

  const head = firstLine(question)
  const title = (objects[0] ? `${objects[0]}: ${head}` : head).slice(0, 120)

  return {
    title,
    question,
    answer,
    objects,
    ...(snap ? { sid: snap.sid, client: snap.client } : {}),
    expected: '',
    priority: 3,
    requester,
  }
}

// ── 설명(Markdown) ───────────────────────────────────────────────────────

/** Azure DevOps 긴 텍스트 필드 실측 한도 근사 — 넘치면 답을 잘라 첨부를 권한다 */
export const DESCRIPTION_MAX = 20_000

export function renderDescription(
  draft: ChangeRequestDraft,
  meta: { appVersion?: string; snapshotAsOf?: string; now?: Date } = {},
): string {
  const now = (meta.now ?? new Date()).toISOString().slice(0, 10)
  const system = draft.sid ? `${draft.sid}${draft.client ? ` / client ${draft.client}` : ''}` : '(not resolved — see conversation)'
  const head = [
    '## Change request (document only)',
    '',
    `- **Requester:** ${draft.requester ? `${draft.requester.name} <${draft.requester.email}>` : '(not signed in)'}`,
    `- **System:** ${system}${meta.snapshotAsOf ? ` · snapshot as of ${meta.snapshotAsOf}` : ''}`,
    `- **Affected objects:** ${draft.objects.length ? draft.objects.map((o) => `\`${o}\``).join(', ') : '(none identified)'}`,
    `- **Priority:** ${draft.priority}`,
    `- **Submitted:** ${now}${meta.appVersion ? ` · sapstack Desktop ${meta.appVersion}` : ''}`,
    '',
    '### Request (as asked by the user)',
    '',
    draft.question || '(empty)',
    '',
    '### Expected behavior',
    '',
    draft.expected.trim() || '(not specified)',
    '',
    '### What the assistant explained',
    '',
  ].join('\n')
  const tail = [
    '',
    '---',
    '*No code was changed. LS ITC to assess: transport_required · reviewer_required · rollback_plan.*',
    '',
  ].join('\n')

  const room = DESCRIPTION_MAX - head.length - tail.length
  let answer = draft.answer || '(no answer captured)'
  if (answer.length > room) {
    const note = '\n\n*(truncated — full conversation is attached when the transcript option was selected)*'
    answer = answer.slice(0, Math.max(0, room - note.length)) + note
  }
  return head + answer + tail
}

/** 대화 전문 첨부(옵트인) — 사용자·최종 답만. 도구 호출·중간 텍스트는 제외 */
export function renderTranscriptMarkdown(messages: DraftMessage[]): string {
  const parts: string[] = []
  for (const m of messages) {
    if (m.hidden) continue
    if (m.role === 'user') parts.push(`## User\n\n${maskSensitive(extractQuestion(m.content))}`)
    else if (m.role === 'assistant' && !m.isIntermediate && !m.isStreaming) parts.push(`## Assistant\n\n${maskSensitive(m.content)}`)
  }
  return parts.join('\n\n') + '\n'
}

// ── IPC 왕복 형태 (renderer ↔ main) ──────────────────────────────────────

export type ChangeRequestsDisabledReason = 'not_configured' | 'misconfigured' | 'air_gapped' | 'not_signed_in'

export interface ChangeRequestsStatus {
  /** 버튼·설정 페이지 노출 여부 */
  enabled: boolean
  reason?: ChangeRequestsDisabledReason
  detail?: string
  orgUrl?: string
  project?: string
  boardUrl?: string
}

export interface ChangeRequestSubmitInput {
  draft: ChangeRequestDraft
  description: string
  transcript?: string
}

export interface QueuedChangeRequest {
  id: string
  createdAt: string
  status: 'queued' | 'submitted' | 'failed'
  draft: ChangeRequestDraft
  description: string
  transcript?: string
  error?: string
  result?: { id: number; url: string }
}

// ── Azure DevOps 요청 형태 ────────────────────────────────────────────────

export interface JsonPatchOp {
  op: 'add'
  path: string
  value: unknown
}

export const TITLE_MAX = 255

export function toJsonPatch(
  draft: ChangeRequestDraft,
  config: ChangeRequestsConfig,
  opts: { description: string; attachmentUrl?: string },
): JsonPatchOp[] {
  const title = `[SAP CR][${draft.sid ?? '?'}] ${draft.title}`.slice(0, TITLE_MAX)
  const tags = ['sapstack', config.entityTag, draft.sid ? `SID-${draft.sid}` : undefined].filter(Boolean).join('; ')
  const ops: JsonPatchOp[] = [
    { op: 'add', path: '/fields/System.Title', value: title },
    { op: 'add', path: '/fields/System.Description', value: opts.description },
    { op: 'add', path: '/multilineFieldsFormat/System.Description', value: 'Markdown' },
    { op: 'add', path: '/fields/System.Tags', value: tags },
    { op: 'add', path: '/fields/Microsoft.VSTS.Common.Priority', value: draft.priority },
  ]
  if (config.areaPath) ops.push({ op: 'add', path: '/fields/System.AreaPath', value: config.areaPath })
  if (opts.attachmentUrl) {
    ops.push({
      op: 'add',
      path: '/relations/-',
      value: { rel: 'AttachedFile', url: opts.attachmentUrl, attributes: { comment: 'Conversation transcript (sapstack Desktop)' } },
    })
  }
  return ops
}

/** 내 요청 — 사용자 입력을 넣지 않는 고정 WIQL(@Me·@project 매크로) */
export function buildMyRequestsWiql(): string {
  return "SELECT [System.Id] FROM WorkItems WHERE [System.TeamProject] = @project AND [System.CreatedBy] = @Me AND [System.Tags] CONTAINS 'sapstack' ORDER BY [System.ChangedDate] DESC"
}

export interface ChangeRequestItem {
  id: number
  title: string
  state: string
  changedAt: string
  assignedTo?: string
  url: string
}

export function workItemWebUrl(config: ChangeRequestsConfig, id: number): string {
  return `${config.orgUrl}/${encodeURIComponent(config.project)}/_workitems/edit/${id}`
}

export function boardUrl(config: ChangeRequestsConfig): string {
  return `${config.orgUrl}/${encodeURIComponent(config.project)}/_workitems/`
}

/** GET _apis/wit/workitems?ids=… 응답 → 목록 */
export function parseWorkItems(json: unknown, config: ChangeRequestsConfig): ChangeRequestItem[] {
  const value = (json as { value?: unknown[] } | null)?.value
  if (!Array.isArray(value)) return []
  return value.flatMap((raw) => {
    const item = raw as { id?: number; fields?: Record<string, unknown> }
    if (typeof item.id !== 'number') return []
    const f = item.fields ?? {}
    const assigned = f['System.AssignedTo'] as { displayName?: string } | undefined
    return [{
      id: item.id,
      title: String(f['System.Title'] ?? ''),
      state: String(f['System.State'] ?? ''),
      changedAt: String(f['System.ChangedDate'] ?? ''),
      ...(assigned?.displayName ? { assignedTo: assigned.displayName } : {}),
      url: workItemWebUrl(config, item.id),
    }]
  })
}
