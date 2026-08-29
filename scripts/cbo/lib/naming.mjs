/**
 * naming.mjs — abapGit 파일 명명 규칙 단일 원천
 *
 * Phase 1(순수 ADT 소스 덤프)과 Phase 3(abapGit ZIP)이 같은 파일명을 쓰도록
 * 확장자 매핑을 이 파일 하나에 격리한다. 매핑 근거: vsp pkg/adt/workflows.go
 * SaveToFile / SaveClassIncludeToFile (abapGit 규칙 준수).
 */

/** 오브젝트 타입(ADT 표기, 예: "PROG/P") → abapGit 확장자 */
const TYPE_EXT = {
  'PROG/P': '.prog.abap', // 실행 프로그램/모듈풀
  'PROG/I': '.prog.abap', // 인클루드 — abapGit 도 .prog.abap (TADIR 상 PROG)
  'CLAS/OC': '.clas.abap',
  'INTF/OI': '.intf.abap',
  'DDLS/DF': '.ddls.asddls',
  'BDEF/BDO': '.bdef.asbdef',
  'SRVD/SRV': '.srvd.srvdsrv',
  'FUGR/F': '.fugr.json', // Phase 1: 함수그룹 본체는 include 로 수집, 메타만 JSON
}

/** CLAS 부속 include → abapGit 접미사 (getSource 의 include 인자와 짝) */
export const CLAS_INCLUDES = [
  { include: 'testclasses', suffix: '.clas.testclasses.abap' },
  { include: 'definitions', suffix: '.clas.locals_def.abap' },
  { include: 'implementations', suffix: '.clas.locals_imp.abap' },
  { include: 'macros', suffix: '.clas.macros.abap' },
]

/** ADT 타입 문자열의 대분류 (예: "PROG/I" → "PROG") */
export function typeGroup(adtType) {
  return String(adtType || '').split('/')[0].toUpperCase()
}

/** getSource 에 넘길 타입 인자 (vsp 는 대분류를 받는다) */
export function sourceFetchType(adtType) {
  const group = typeGroup(adtType)
  if (group === 'PROG' && String(adtType).toUpperCase() === 'PROG/I') return 'INCL'
  return group
}

/**
 * abapGit 파일명 생성. 네임스페이스 '/' 는 abapGit 규칙대로 '#'.
 * @returns {string|null} 지원하지 않는 타입이면 null (호출부가 스킵 기록)
 */
export function abapgitFilename(name, adtType) {
  const ext = TYPE_EXT[String(adtType).toUpperCase()]
  if (!ext) return null
  const base = String(name).toLowerCase().replaceAll('/', '#')
  return base + ext
}

/** 이 타입을 소스 텍스트로 수집할 수 있는가 (Phase 1 기준) */
export function isFetchableType(adtType) {
  const t = String(adtType).toUpperCase()
  if (t === 'FUGR/F') return false // include 단위로 별도 수집
  return Boolean(TYPE_EXT[t])
}

/** 수집 대상 패키지인지 — 표준 SAP 소스 export 금지 가드 */
export function isCustomPackage(pkg) {
  return /^[$ZY]/.test(String(pkg || '').toUpperCase())
}

/**
 * 패키지 패턴 매칭. 뒤가 '*' 면 프리픽스, 아니면 정확 일치.
 * 패턴 자체도 ^[$ZY] 가드를 통과해야 한다.
 */
export function matchesPackagePatterns(pkg, patterns) {
  const upper = String(pkg || '').toUpperCase()
  if (!isCustomPackage(upper)) return false
  return patterns.some((raw) => {
    const p = String(raw).toUpperCase()
    if (!isCustomPackage(p)) return false
    return p.endsWith('*') ? upper.startsWith(p.slice(0, -1)) : upper === p
  })
}
