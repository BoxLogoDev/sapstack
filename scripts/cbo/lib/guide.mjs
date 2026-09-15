/**
 * guide.mjs — 스냅샷 동봉 guide 렌더링 (소비 측 Desktop 에이전트의 사용 규칙)
 *
 * export 는 guide.md(한국어)와 guide.en.md(영어)를 둘 다 쓴다. Desktop 앱은 UI 언어가
 * 한국어가 아니면 guide.en.md 를 소스 guide 로 고른다(없으면 guide.md) — 미국 법인 등 영어 배포용.
 */

/**
 * @param {{sid:string, client:string, exportedAt:string, count:number, packages:string[], stalenessWarnDays:number}} p
 * @param {'ko'|'en'} lang
 */
export function renderGuide(p, lang = 'ko') {
  return lang === 'en' ? renderGuideEn(p) : renderGuideKo(p)
}

function renderGuideKo(p) {
  const date = p.exportedAt.slice(0, 10)
  return `# CBO 스냅샷 (${p.sid})

${p.sid} 클라이언트 ${p.client}에서 ${date}에 내보낸 커스텀 ABAP 소스의 오프라인 사본입니다. 오브젝트 ${p.count}개.

## Scope

- \`manifest.yaml\` — 출처·기준일·수집 상태. **답변 전 1회 확인.**
- \`catalog.md\` / \`catalog.json\` — 오브젝트 색인(이름→파일·설명·참조 관계). **grep 전에 항상 여기서 먼저 찾기.**
- \`src/{패키지}/\` — abapGit 명명 규칙의 소스 파일.
- 이 폴더는 **읽기 전용 사본**입니다. 수정 금지. SAP 실시간 상태가 아닙니다.

## Guidelines

파일명 규칙 (abapGit): \`zfi0171.prog.abap\`(리포트/인클루드) · \`sapmz*.prog.abap\`(모듈풀 — 화면 로직은 PBO/PAI MODULE) · \`saplz*.prog.abap\`+\`lz*.prog.abap\`(함수그룹 본체 — \`CALL FUNCTION 'Z…'\`의 구현) · \`*.clas.abap\`(클래스, locals/testclasses 별도 파일) · \`*.fugr.json\`(함수그룹 메타).

추적 레시피 (Grep 은 항상 -i):
- \`PERFORM xxx\` → 같은 파일 또는 include 의 \`FORM xxx\`
- \`INCLUDE zxxx\` → catalog 에서 zxxx 파일 찾기
- \`CALL FUNCTION 'Z_XXX'\` → \`lz*\` include 에서 \`FUNCTION z_xxx\`
- "저장할 때 오류" 류 → \`MESSAGE\` 리터럴/메시지번호 검색 후 PAI(\`MODULE … INPUT\`) 우선 확인
- 화면 흐름 → \`sapmz*\` 의 PBO/PAI 모듈과 \`CHAIN…ENDCHAIN\`

답변 규칙 (현업 대상):
- T-code·화면 이름으로 설명하고 기술 용어는 현장어 병기 (예: "코스트 센터 (KOSTL)")
- ATC/코드리뷰 포맷 금지. 형식: 한 줄 요약 → 어디서 쓰나 → 처리 흐름 → 주의할 점 → 기준 시점
- **catalog 에 없는 오브젝트는 "스냅샷에 없습니다"라고 답한다. 추측 금지.**
- 표준 SAP 프로그램(SAPMF05A 등)은 이 스냅샷 대상이 아님을 명시
- 수정 제안 시 "실제 반영은 담당 개발자 확인 필요" 문구 포함
- **모든 답변 끝에 "스냅샷 기준일: ${date}" 고지** — ${p.stalenessWarnDays}일 초과 시 관리자에게 갱신 요청 안내

## Context

- 기준일: ${date} · 시스템: ${p.sid}/${p.client} · 패키지 ${p.packages.length}개
- 현재 운영 시스템과 다를 수 있음 — 최신 여부는 관리자에게 확인
`
}

function renderGuideEn(p) {
  const date = p.exportedAt.slice(0, 10)
  return `# CBO snapshot (${p.sid})

Offline copy of the custom ABAP sources exported from ${p.sid} client ${p.client} on ${date}. ${p.count} objects.
Here "CBO" means custom development objects (Z*/Y*), not Clean Core Custom Business Objects.

## Scope

- \`manifest.yaml\` — origin, as-of date, collection status. **Check once before answering.**
- \`catalog.md\` / \`catalog.json\` — object index (name → file, title, references). **Always look here before grepping.**
- \`src/{package}/\` — source files in abapGit naming.
- This folder is a **read-only copy**. Never modify it. It is not the live SAP state.

## Guidelines

File naming (abapGit): \`zfi0171.prog.abap\` (report/include) · \`sapmz*.prog.abap\` (module pool — screen logic lives in PBO/PAI MODULEs) · \`saplz*.prog.abap\` + \`lz*.prog.abap\` (function group body — the implementation behind \`CALL FUNCTION 'Z…'\`) · \`*.clas.abap\` (class; locals/testclasses are separate files) · \`*.fugr.json\` (function group metadata).

Tracing recipes (always grep with -i):
- \`PERFORM xxx\` → \`FORM xxx\` in the same file or an include
- \`INCLUDE zxxx\` → find the zxxx file in the catalog
- \`CALL FUNCTION 'Z_XXX'\` → \`FUNCTION z_xxx\` in an \`lz*\` include
- "error when saving" type questions → search the \`MESSAGE\` literal/number, then check PAI (\`MODULE … INPUT\`) first
- Screen flow → PBO/PAI modules and \`CHAIN…ENDCHAIN\` in \`sapmz*\`

Answering rules (audience: business users, not developers):
- Explain by T-code and screen name; pair technical terms with business wording (e.g. "cost center (KOSTL)")
- No ATC/code-review format. Structure: one-line summary → where it is used → processing flow → watch out → as-of date
- **If an object is not in the catalog, answer "not in the snapshot". Never guess.**
- State explicitly that standard SAP programs (SAPMF05A etc.) are outside this snapshot
- When suggesting a change, add "actual implementation must be confirmed by the responsible developer"
- **End every answer with "Snapshot as of: ${date}"** — if older than ${p.stalenessWarnDays} days, advise the user to ask the administrator for a refresh

## Context

- As of: ${date} · System: ${p.sid}/${p.client} · ${p.packages.length} packages
- May differ from the current production system — confirm freshness with the administrator
`
}
