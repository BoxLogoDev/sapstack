import type { NewChatActionParams, SapEnvironmentProfile } from '../../../shared/types'

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
 * 또는 커스텀/자체개발 계열 키워드.
 */
export function detectCboQuery(query: string): boolean {
  // Z/Y 직접 명명 + 모듈풀/함수그룹 메인(SAPMZ*/SAPLZ*) — 현업이 오류 팝업에서 보는 형태
  if (/(?:^|[^A-Za-z0-9_])(?:SAP[ML])?[ZY][A-Za-z0-9_]{3,}/i.test(query)) return true
  return /커스텀|CBO|자체\s*개발|우리\s*(회사)?\s*프로그램/i.test(query)
}

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
  const cboPrefix = cboSourceSlug && detectCboQuery(query)
    ? [
        `[source:${cboSourceSlug}]`,
        '커스텀 프로그램(Z/Y) 관련이면 CBO 스냅샷 소스의 guide.md를 먼저 읽고 catalog에서 근거 파일을 찾은 뒤 답하세요. 답변 끝에 스냅샷 기준일을 명시하세요.',
      ]
    : []
  const matchSummary = matches.length
    ? matches.slice(0, 3).map(match => {
        const modules = match.likely_modules.join('/') || '미분류'
        const tcodes = match.first_check_tcodes.join(', ') || '없음'
        return `- ${match.id}: ${match.symptom || '증상'} · 모듈 ${modules} · 첫 확인 ${tcodes}`
      }).join('\n')
    : '- 매칭 없음: 과신하지 말고 추가 증거를 요청하세요.'
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
        '다음 요청을 sapstack Quick Advisory 형식으로 처리해 주세요.',
        `사용자 요청: ${query}`,
        `환경: ${environmentLine}`,
        '증상 인덱스 매칭:',
        matchSummary,
        '등록된 T-code와 SAP Note만 인용하고, 해당하는 모든 작업에 T-code와 메뉴 경로를 함께 제시하세요.',
      ].join('\n'),
    }
  }

  return {
    name: 'SAP Evidence Loop',
    input: [
      ...cboPrefix,
      `sapstack Evidence Loop 세션 ${sessionId || '(생성 실패)'}의 Turn 1 INTAKE를 이어서 진행해 주세요.`,
      `사용자 증상: ${query}`,
      `환경: ${environmentLine}`,
      '증상 인덱스 매칭:',
      matchSummary,
      '2-4개 가설과 각 가설의 반증 조건 2개 이상을 제시하고, Follow-up Request는 read-only로 제한하세요.',
      'Fix를 확정할 때는 반드시 Rollback Plan을 페어로 제시하세요.',
    ].join('\n'),
  }
}
