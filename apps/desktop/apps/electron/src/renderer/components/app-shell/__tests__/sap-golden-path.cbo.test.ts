import { describe, test, expect } from 'bun:test'
import { detectCboQuery, buildGuidedChat } from '../sap-golden-path'
import type { SapEnvironmentProfile } from '../../../../shared/types'

const ENV: SapEnvironmentProfile = {
  profile_version: 1,
  release: 'S4_2023',
  deployment: 'on_premise',
  industry: 'manufacturing',
  language: 'ko',
}

describe('detectCboQuery', () => {
  test('Z/Y 오브젝트명 — 조사가 붙어도 매칭', () => {
    expect(detectCboQuery('ZFI0171이 뭐 하는 프로그램이에요?')).toBe(true)
    expect(detectCboQuery('SAPMZFI0010 화면 저장 오류')).toBe(true) // 모듈풀 명명(SAPMZ*)
    expect(detectCboQuery('YHR_REPORT 실행이 안 돼요')).toBe(true)
  })

  test('커스텀 키워드', () => {
    expect(detectCboQuery('우리 회사 프로그램인데 값이 이상해요')).toBe(true)
    expect(detectCboQuery('자체 개발 화면 문의')).toBe(true)
    expect(detectCboQuery('커스텀 리포트 어디서 봐요')).toBe(true)
  })

  test('표준 질문은 비매칭', () => {
    expect(detectCboQuery('F110 돌렸는데 오류가 나요')).toBe(false)
    expect(detectCboQuery('BSEG와 ACDOCA 차이는?')).toBe(false)
    expect(detectCboQuery('월마감 순서 알려줘')).toBe(false)
  })

  test('영어 커스텀 키워드 — customer/customizing 오탐 없음', () => {
    expect(detectCboQuery('What does our custom report do?')).toBe(true)
    expect(detectCboQuery('the in-house screen fails on save')).toBe(true)
    expect(detectCboQuery('our own program shows a wrong value')).toBe(true)
    expect(detectCboQuery('where is the z-program for invoices')).toBe(true)
    expect(detectCboQuery('customer master data is missing')).toBe(false)
    expect(detectCboQuery('customizing for payment terms')).toBe(false)
    expect(detectCboQuery('Your F110 payment run failed yesterday')).toBe(false)
  })
})

describe('영어 프로파일 (LS Mtron USA 등 language=en)', () => {
  const ENV_EN: SapEnvironmentProfile = { ...ENV, language: 'en' }

  test('안내 프롬프트가 영어 — 한글 없음, 핵심 라벨 유지', () => {
    const quick = buildGuidedChat({
      query: 'What does program ZFI0171 do?',
      mode: 'quick',
      environment: ENV_EN,
      matches: [],
      cboSourceSlug: 'cbo-snapshot-ds4',
    })
    expect((quick.input ?? '').startsWith('[source:cbo-snapshot-ds4]')).toBe(true)
    expect(quick.input).toContain('Request: What does program ZFI0171 do?')
    expect(quick.input).toContain('snapshot as-of date')
    expect(quick.input).not.toMatch(/[가-힣]/)

    const evidence = buildGuidedChat({
      query: 'ZFI0171 dumps on save',
      mode: 'evidence',
      environment: ENV_EN,
      matches: [],
      sessionId: 's1',
    })
    expect(evidence.input).toContain('Turn 1 INTAKE')
    expect(evidence.input).toContain('Rollback Plan')
    expect(evidence.input).not.toMatch(/[가-힣]/)
  })

  test('ko 이외 언어(vi 등)도 영어 프롬프트', () => {
    const chat = buildGuidedChat({ query: 'ZFI0171', mode: 'quick', environment: { ...ENV, language: 'vi' }, matches: [] })
    expect(chat.input).not.toMatch(/[가-힣]/)
  })

  test('ko 프로파일은 기존 한국어 프롬프트 유지', () => {
    const chat = buildGuidedChat({ query: 'ZFI0171이 뭐예요?', mode: 'quick', environment: ENV, matches: [] })
    expect(chat.input).toContain('사용자 요청: ZFI0171이 뭐예요?')
  })
})

describe('buildGuidedChat + CBO 소스 멘션', () => {
  test('CBO 질문 + 슬러그 있으면 멘션이 시드 입력 선두에', () => {
    const chat = buildGuidedChat({
      query: 'ZFI0171이 뭐 하는 프로그램이에요?',
      mode: 'quick',
      environment: ENV,
      matches: [],
      cboSourceSlug: 'cbo-snapshot-ds4',
    })
    expect((chat.input ?? '').startsWith('[source:cbo-snapshot-ds4]')).toBe(true)
    expect(chat.input).toContain('스냅샷 기준일')
  })

  test('CBO 질문이어도 슬러그 없으면 멘션 없음', () => {
    const chat = buildGuidedChat({
      query: 'ZFI0171이 뭐예요?',
      mode: 'quick',
      environment: ENV,
      matches: [],
    })
    expect(chat.input).not.toContain('[source:')
  })

  test('표준 질문은 슬러그가 있어도 멘션 없음', () => {
    const chat = buildGuidedChat({
      query: 'F110 오류 문의',
      mode: 'evidence',
      environment: ENV,
      matches: [],
      sessionId: 's1',
      cboSourceSlug: 'cbo-snapshot-ds4',
    })
    expect(chat.input).not.toContain('[source:')
  })

  test('evidence 모드에서도 CBO 멘션 동작', () => {
    const chat = buildGuidedChat({
      query: 'ZFI0171 화면 저장할 때 오류 나요',
      mode: 'evidence',
      environment: ENV,
      matches: [],
      sessionId: 's1',
      cboSourceSlug: 'cbo-snapshot-ds4',
    })
    expect((chat.input ?? '').startsWith('[source:cbo-snapshot-ds4]')).toBe(true)
    expect(chat.input).toContain('Turn 1 INTAKE')
  })
})
