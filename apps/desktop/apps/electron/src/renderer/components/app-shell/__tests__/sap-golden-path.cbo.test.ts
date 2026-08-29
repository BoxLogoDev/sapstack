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
