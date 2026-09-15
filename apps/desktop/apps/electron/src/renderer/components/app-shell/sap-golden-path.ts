import type { NewChatActionParams, SapEnvironmentProfile } from '../../../shared/types'
import { hasCboObject } from '../../../shared/cbo-objects'

export interface SymptomMatch {
  id: string
  symptom?: string
  confidence: number
  likely_modules: string[]
  first_check_tcodes: string[]
}

export type AdvisoryMode = 'quick' | 'evidence'

const FACT_QUESTION = /(?:\bwhat\s+is\b|\bdifference\b|\bmeaning\b|뭐(?:야|예요|에요)|무엇|차이|뜻)/i
const INCIDENT = /(?:\berror\b|\bfail(?:ed|ure)?\b|\bincident\b|\bdump\b|안\s*돼|오류|실패|튕겨|덤프|마감|결산|영향)/i

export function selectAdvisoryMode(query: string, matches: SymptomMatch[]): AdvisoryMode {
  if (INCIDENT.test(query)) return 'evidence'
  if (FACT_QUESTION.test(query)) return 'quick'

  const strongMatches = matches.filter(match => match.confidence >= 0.6)
  const modules = new Set(strongMatches.flatMap(match => match.likely_modules))
  if (strongMatches.length > 1 || modules.size > 1) return 'evidence'

  // Ambiguous requests stay in the falsifiable Evidence Loop instead of receiving overconfident advice.
  return 'evidence'
}

/**
 * CBO(커스텀 코드) 질문 감지 — Z/Y 오브젝트명(조사 붙은 "ZFI0171이"도 매칭)
 * 또는 커스텀/자체개발 계열 키워드(한국어·영어).
 */
export function detectCboQuery(query: string): boolean {
  // Z/Y 직접 명명 + 모듈풀/함수그룹 메인(SAPMZ*/SAPLZ*) — 현업이 오류 팝업에서 보는 형태 (shared/cbo-objects)
  if (hasCboObject(query)) return true
  if (/커스텀|CBO|자체\s*개발|우리\s*(회사)?\s*프로그램/i.test(query)) return true
  // 영어: 단어 경계로 customer/customizing 오탐을 막는다
  return /\bcustom\b|\bin-house\b|\bour\s+(?:own\s+|company\s+)?(?:program|report|screen|transaction)\b|\bz[- ]?(?:program|report|table)\b/i.test(query)
}

/** 모델에 보내는 안내 문장 — i18n 키가 아니라 프롬프트이므로 여기서 언어별로 관리한다 */
const PROMPT_TEXT = {
  ko: {
    cboHint: '커스텀 프로그램(Z/Y) 관련이면 CBO 스냅샷 소스의 guide.md를 먼저 읽고 catalog에서 근거 파일을 찾은 뒤 답하세요. 답변 끝에 스냅샷 기준일을 명시하세요.',
    unclassified: '미분류',
    none: '없음',
    symptom: '증상',
    matchLine: (id: string, symptom: string, modules: string, tcodes: string) => `- ${id}: ${symptom} · 모듈 ${modules} · 첫 확인 ${tcodes}`,
    noMatch: '- 매칭 없음: 과신하지 말고 추가 증거를 요청하세요.',
    quickIntro: '다음 요청을 sapstack Quick Advisory 형식으로 처리해 주세요.',
    request: (q: string) => `사용자 요청: ${q}`,
    environment: (line: string) => `환경: ${line}`,
    matchesHeader: '증상 인덱스 매칭:',
    quickRules: '등록된 T-code와 SAP Note만 인용하고, 해당하는 모든 작업에 T-code와 메뉴 경로를 함께 제시하세요.',
    evidenceIntro: (sessionId: string) => `sapstack Evidence Loop 세션 ${sessionId}의 Turn 1 INTAKE를 이어서 진행해 주세요.`,
    sessionMissing: '(생성 실패)',
    symptomLine: (q: string) => `사용자 증상: ${q}`,
    evidenceRules: '2-4개 가설과 각 가설의 반증 조건 2개 이상을 제시하고, Follow-up Request는 read-only로 제한하세요.',
    rollback: 'Fix를 확정할 때는 반드시 Rollback Plan을 페어로 제시하세요.',
  },
  en: {
    cboHint: 'If this concerns a custom (Z/Y) program, read guide.md from the CBO snapshot source first, locate the evidence file via the catalog, then answer. State the snapshot as-of date at the end of the answer.',
    unclassified: 'unclassified',
    none: 'none',
    symptom: 'symptom',
    matchLine: (id: string, symptom: string, modules: string, tcodes: string) => `- ${id}: ${symptom} · modules ${modules} · first check ${tcodes}`,
    noMatch: '- No match: do not overreach; ask for additional evidence.',
    quickIntro: 'Handle the following request in the sapstack Quick Advisory format.',
    request: (q: string) => `Request: ${q}`,
    environment: (line: string) => `Environment: ${line}`,
    matchesHeader: 'Symptom index matches:',
    quickRules: 'Cite only registered T-codes and SAP Notes, and give the T-code together with the menu path for every applicable action.',
    evidenceIntro: (sessionId: string) => `Continue Turn 1 INTAKE of sapstack Evidence Loop session ${sessionId}.`,
    sessionMissing: '(not created)',
    symptomLine: (q: string) => `Symptom: ${q}`,
    evidenceRules: 'Propose 2-4 hypotheses with at least 2 falsification conditions each, and keep every Follow-up Request read-only.',
    rollback: 'Whenever you confirm a Fix, always pair it with a Rollback Plan.',
  },
} as const

export function buildGuidedChat(args: {
  query: string
  mode: AdvisoryMode
  environment: SapEnvironmentProfile
  matches: SymptomMatch[]
  sessionId?: string
  /** CBO 스냅샷 로컬 소스 슬러그 — 있으면 [source:] 멘션으로 자동 활성화 */
  cboSourceSlug?: string
}): NewChatActionParams {
  const { query, mode, environment, matches, sessionId, cboSourceSlug } = args
  // 한국어 프로파일만 한국어 프롬프트 — 나머지 언어는 영어 프롬프트에 사용자 언어로 답하게 맡긴다
  const T = PROMPT_TEXT[environment.language === 'ko' ? 'ko' : 'en']
  const cboPrefix = cboSourceSlug && detectCboQuery(query)
    ? [`[source:${cboSourceSlug}]`, T.cboHint]
    : []
  const matchSummary = matches.length
    ? matches.slice(0, 3).map(match => {
        const modules = match.likely_modules.join('/') || T.unclassified
        const tcodes = match.first_check_tcodes.join(', ') || T.none
        return T.matchLine(match.id, match.symptom || T.symptom, modules, tcodes)
      }).join('\n')
    : T.noMatch
  const environmentLine = [
    `Release=${environment.release}`,
    `Deployment=${environment.deployment}`,
    `Industry=${environment.industry}`,
    `Language=${environment.language}`,
    environment.country_iso ? `Country=${environment.country_iso}` : undefined,
    environment.client ? `Client=${environment.client}` : undefined,
  ].filter(Boolean).join(' · ')

  if (mode === 'quick') {
    return {
      name: 'SAP Quick Advisory',
      input: [
        ...cboPrefix,
        T.quickIntro,
        T.request(query),
        T.environment(environmentLine),
        T.matchesHeader,
        matchSummary,
        T.quickRules,
      ].join('\n'),
    }
  }

  return {
    name: 'SAP Evidence Loop',
    input: [
      ...cboPrefix,
      T.evidenceIntro(sessionId || T.sessionMissing),
      T.symptomLine(query),
      T.environment(environmentLine),
      T.matchesHeader,
      matchSummary,
      T.evidenceRules,
      T.rollback,
    ].join('\n'),
  }
}
