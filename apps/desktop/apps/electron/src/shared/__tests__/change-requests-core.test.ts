import { describe, test, expect } from 'bun:test'
import {
  buildDraft,
  buildMyRequestsWiql,
  extractQuestion,
  maskSensitive,
  parseChangeRequestsConfig,
  parseWorkItems,
  renderDescription,
  renderTranscriptMarkdown,
  toJsonPatch,
  workItemWebUrl,
  DESCRIPTION_MAX,
  TITLE_MAX,
  type ChangeRequestsConfig,
} from '../change-requests-core'

const CONFIG: ChangeRequestsConfig = {
  provider: 'azure_devops',
  orgUrl: 'https://dev.azure.com/lsitc',
  project: 'SAP-Change-Requests',
  workItemType: 'Issue',
  areaPath: 'SAP-Change-Requests\\LSMtron-USA',
  entityTag: 'LSMtron-USA',
}
const REQUESTER = { email: 'mikyung.song@lsinjectionusa.com', name: 'Mikyung Song' }
const SNAPSHOTS = [
  { sid: 'DS4', client: '600', sourceSlug: 'cbo-ds4' },
  { sid: 'QS4', client: '600', sourceSlug: 'cbo-qs4' },
]

describe('parseChangeRequestsConfig', () => {
  test('camelCase(provision) 과 snake_case(config.yaml) 를 같은 결과로 정규화, 끝 슬래시 제거', () => {
    const camel = parseChangeRequestsConfig({ provider: 'azure_devops', orgUrl: 'https://dev.azure.com/lsitc/', project: 'P', areaPath: 'P\\US', entityTag: 'US' })
    const snake = parseChangeRequestsConfig({ org_url: 'https://dev.azure.com/lsitc', project: 'P', area_path: 'P\\US', entity_tag: 'US' })
    expect(camel).toEqual({ provider: 'azure_devops', orgUrl: 'https://dev.azure.com/lsitc', project: 'P', workItemType: 'Issue', areaPath: 'P\\US', entityTag: 'US' })
    expect(snake).toEqual(camel)
  })

  test('없으면 null, 다른 provider·http·project 누락은 거부', () => {
    expect(parseChangeRequestsConfig(undefined)).toBeNull()
    expect(() => parseChangeRequestsConfig({ provider: 'jira', orgUrl: 'https://x', project: 'P' })).toThrow('only azure_devops')
    expect(() => parseChangeRequestsConfig({ orgUrl: 'http://dev.azure.com/lsitc', project: 'P' })).toThrow('orgUrl')
    expect(() => parseChangeRequestsConfig({ orgUrl: 'https://dev.azure.com/lsitc' })).toThrow('project')
  })
})

describe('extractQuestion / buildDraft', () => {
  test('안내 프롬프트 접두(ko/en)를 벗기고 원문만 남긴다', () => {
    expect(extractQuestion('[source:cbo-ds4]\n힌트 줄\n다음 요청을 처리해 주세요.\n사용자 요청: ZFI0171 전표가 안 넘어가요\n환경: x')).toBe('ZFI0171 전표가 안 넘어가요')
    expect(extractQuestion('Handle the following request.\nRequest: What does program ZFI0171 do?\nEnvironment: y')).toBe('What does program ZFI0171 do?')
    expect(extractQuestion('Symptom: posting fails in ZMM_GR')).toBe('posting fails in ZMM_GR')
    expect(extractQuestion('[source:cbo-ds4]\nplain question without label')).toBe('plain question without label')
  })

  test('마지막 사용자 질문·최종 답·오브젝트·활성 소스의 SID 를 초안으로 묶는다', () => {
    const draft = buildDraft({
      messages: [
        { role: 'user', content: 'Request: what is ZFI0171?' },
        { role: 'assistant', content: 'old answer', isIntermediate: false },
        { role: 'user', content: '[source:cbo-ds4]\nRequest: Please explain ZFI0171 and table ZFIT_HDR' },
        { role: 'assistant', content: 'thinking…', isIntermediate: true },
        { role: 'assistant', content: 'ZFI0171 posts documents via ZFI_POST_DOC. Watch out: ZFIT_HDR lock.' },
      ],
      snapshots: SNAPSHOTS,
      enabledSourceSlugs: ['cbo-qs4'],
      requester: REQUESTER,
    })
    expect(draft.question).toBe('Please explain ZFI0171 and table ZFIT_HDR')
    expect(draft.answer).toStartWith('ZFI0171 posts')
    expect(draft.objects).toEqual(['ZFI0171', 'ZFIT_HDR'])
    expect(draft.sid).toBe('QS4')
    expect(draft.client).toBe('600')
    expect(draft.title).toBe('ZFI0171: Please explain ZFI0171 and table ZFIT_HDR')
    expect(draft.priority).toBe(3)
    expect(draft.requester).toEqual(REQUESTER)
  })

  test('질문에 오브젝트가 없으면 답에서 찾고, 스냅샷이 하나면 그 SID, 여럿이고 활성 소스 없으면 미정', () => {
    const one = buildDraft({ messages: [{ role: 'user', content: 'why does the GR report fail?' }, { role: 'assistant', content: 'ZMM_GR_REPORT reads ZMMT_GR.' }], snapshots: [SNAPSHOTS[0]!], requester: null })
    expect(one.objects).toEqual(['ZMM_GR_REPORT', 'ZMMT_GR'])
    expect(one.sid).toBe('DS4')
    const many = buildDraft({ messages: [{ role: 'user', content: 'hello' }], snapshots: SNAPSHOTS, requester: null })
    expect(many.sid).toBeUndefined()
    expect(many.title).toBe('hello')
  })

  test('SSN·전화·주민번호는 초안·전문에서 마스킹된다', () => {
    expect(maskSensitive('SSN 123-45-6789, call (555) 123-4567, RRN 900101-1234567')).toBe('SSN ###-##-####, call (***) ***-****, RRN ######-#######')
    const draft = buildDraft({ messages: [{ role: 'user', content: 'Request: employee 123-45-6789 in ZHR0001' }], snapshots: [], requester: null })
    expect(draft.question).toBe('employee ###-##-#### in ZHR0001')
    expect(renderTranscriptMarkdown([{ role: 'user', content: 'Request: 123-45-6789' }, { role: 'assistant', content: 'tool noise', isIntermediate: true }, { role: 'assistant', content: 'final' }]))
      .toBe('## User\n\n###-##-####\n\n## Assistant\n\nfinal\n')
  })
})

describe('renderDescription / toJsonPatch', () => {
  const draft = buildDraft({
    messages: [{ role: 'user', content: 'Request: ZFI0171 should skip blocked vendors' }, { role: 'assistant', content: 'It currently posts all vendors.' }],
    snapshots: [SNAPSHOTS[0]!],
    requester: REQUESTER,
  })

  test('설명은 영어 템플릿 + 원문 그대로 + verdict 어휘, 길면 답을 잘라 한도 안에 든다', () => {
    const md = renderDescription({ ...draft, expected: 'Skip vendors with posting block' }, { appVersion: '2.6.0', snapshotAsOf: '2026-09-15', now: new Date('2026-09-16T00:00:00Z') })
    expect(md).toContain('Mikyung Song <mikyung.song@lsinjectionusa.com>')
    expect(md).toContain('**System:** DS4 / client 600 · snapshot as of 2026-09-15')
    expect(md).toContain('`ZFI0171`')
    expect(md).toContain('ZFI0171 should skip blocked vendors')
    expect(md).toContain('Skip vendors with posting block')
    expect(md).toContain('transport_required · reviewer_required · rollback_plan')
    const long = renderDescription({ ...draft, answer: 'x'.repeat(DESCRIPTION_MAX * 2) })
    expect(long.length).toBeLessThanOrEqual(DESCRIPTION_MAX)
    expect(long).toContain('(truncated')
  })

  test('json-patch: 제목 접두·길이, Markdown 포맷 op, 고정 태그 집합, area, 첨부 relation 은 있을 때만', () => {
    const ops = toJsonPatch({ ...draft, title: 'T'.repeat(300) }, CONFIG, { description: 'desc' })
    const byPath = Object.fromEntries(ops.map((o) => [o.path, o.value]))
    expect(String(byPath['/fields/System.Title'])).toStartWith('[SAP CR][DS4] TTT')
    expect(String(byPath['/fields/System.Title']).length).toBe(TITLE_MAX)
    expect(byPath['/multilineFieldsFormat/System.Description']).toBe('Markdown')
    expect(byPath['/fields/System.Tags']).toBe('sapstack; LSMtron-USA; SID-DS4')
    expect(byPath['/fields/System.AreaPath']).toBe('SAP-Change-Requests\\LSMtron-USA')
    expect(byPath['/fields/Microsoft.VSTS.Common.Priority']).toBe(3)
    expect(ops.some((o) => o.path === '/relations/-')).toBe(false)
    const withFile = toJsonPatch(draft, CONFIG, { description: 'd', attachmentUrl: 'https://dev.azure.com/lsitc/_apis/wit/attachments/abc' })
    expect((withFile.find((o) => o.path === '/relations/-')!.value as { rel: string }).rel).toBe('AttachedFile')
  })

  test('WIQL 은 사용자 입력 없이 @Me/@project 고정, 목록 파서·URL', () => {
    expect(buildMyRequestsWiql()).toContain('[System.CreatedBy] = @Me')
    expect(buildMyRequestsWiql()).toContain("[System.Tags] CONTAINS 'sapstack'")
    const items = parseWorkItems({ value: [
      { id: 42, fields: { 'System.Title': '[SAP CR][DS4] ZFI0171', 'System.State': 'Doing', 'System.ChangedDate': '2026-09-16T01:00:00Z', 'System.AssignedTo': { displayName: 'Dev One' } } },
      { fields: {} },
    ] }, CONFIG)
    expect(items).toEqual([{ id: 42, title: '[SAP CR][DS4] ZFI0171', state: 'Doing', changedAt: '2026-09-16T01:00:00Z', assignedTo: 'Dev One', url: 'https://dev.azure.com/lsitc/SAP-Change-Requests/_workitems/edit/42' }])
    expect(workItemWebUrl(CONFIG, 7)).toBe('https://dev.azure.com/lsitc/SAP-Change-Requests/_workitems/edit/7')
    expect(parseWorkItems(null, CONFIG)).toEqual([])
  })
})
