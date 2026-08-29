/**
 * catalog.mjs — 오프라인 카탈로그 생성 (SAP 재접속 없이 src/ 트리에서만 파생)
 *
 * catalog.json: 기계용 — 소비 측(Desktop 에이전트)의 1차 색인.
 * catalog.md  : 사람/에이전트용 한글 요약 — grep 을 시작하기 전 항상 여기부터.
 */

/** 소스 텍스트에서 제목 추출: `*&` 리포트 헤더 → `"!` ABAP Doc → @EndUserText.label */
export function extractTitle(source) {
  const head = source.split('\n', 40)
  for (const line of head) {
    const label = line.match(/@EndUserText\.label\s*:\s*'([^']+)'/)
    if (label) return label[1].trim()
    const doc = line.match(/^\s*"!\s*(?:<p[^>]*>)?\s*([^<].*?)\s*(?:<\/p>)?\s*$/)
    if (doc && doc[1]) return doc[1].trim()
    const header = line.match(/^\*&\s*(?:Report|Include|Module\s*Pool|모듈풀)?\s*[:]?\s*(.+?)\s*\*?&?\s*$/i)
    if (header && header[1] && !/^[-*&\s]+$/.test(header[1])) {
      const t = header[1].replace(/[*&]+$/g, '').trim()
      if (t && !/^Report|^Include/i.test(t) === false) return t
      if (t) return t
    }
  }
  return ''
}

/** 관계 추출: INCLUDE / SUBMIT / CALL FUNCTION 'Z…' / SELECT … FROM */
export function extractRelations(source) {
  const includes = new Set()
  const submits = new Set()
  const callsFunction = new Set()
  const selectFrom = new Set()

  for (const raw of source.split('\n')) {
    const line = raw.replace(/".*$/, '') // 행 내 주석 제거
    if (/^\s*\*/.test(raw)) continue // 전체 주석 행

    let m = line.match(/\bINCLUDE\s+([zy]\w+)/i)
    if (m) includes.add(m[1].toUpperCase())
    m = line.match(/\bSUBMIT\s+([zy]\w+)/i)
    if (m) submits.add(m[1].toUpperCase())
    m = line.match(/\bCALL\s+FUNCTION\s+'([ZY]\w+)'/i)
    if (m) callsFunction.add(m[1].toUpperCase())
    for (const sel of line.matchAll(/\b(?:FROM|JOIN)\s+([zy]\w+)/gi)) {
      selectFrom.add(sel[1].toUpperCase())
    }
  }
  return {
    includes: [...includes].sort(),
    submits: [...submits].sort(),
    calls_function: [...callsFunction].sort(),
    select_from: [...selectFrom].sort(),
  }
}

/** 클래스 메타: 슈퍼클래스/인터페이스 */
export function extractClassMeta(source) {
  const sup = source.match(/\bINHERITING\s+FROM\s+(\w+)/i)
  const interfaces = [...source.matchAll(/^\s*INTERFACES[:\s]+(\w+)/gim)].map((m) => m[1].toUpperCase())
  return { superclass: sup ? sup[1].toUpperCase() : '', interfaces: [...new Set(interfaces)].sort() }
}

/**
 * @param {Array<{name,type,package,file,loc,source}>} objects
 * @returns {{json: object, md: string}}
 */
export function buildCatalog(objects, { sid, exportedAt }) {
  const entries = objects.map((o) => {
    const rel = extractRelations(o.source)
    const cls = o.type.startsWith('CLAS') ? extractClassMeta(o.source) : null
    return {
      name: o.name,
      type: o.type,
      package: o.package,
      file: o.file,
      loc: o.loc,
      title: extractTitle(o.source),
      ...rel,
      ...(cls?.superclass ? { superclass: cls.superclass } : {}),
      ...(cls?.interfaces?.length ? { interfaces: cls.interfaces } : {}),
    }
  }).sort((a, b) => a.package.localeCompare(b.package) || a.name.localeCompare(b.name))

  const byPackage = new Map()
  for (const e of entries) {
    if (!byPackage.has(e.package)) byPackage.set(e.package, [])
    byPackage.get(e.package).push(e)
  }

  let md = `# CBO 카탈로그 — ${sid}\n\n`
  md += `- 스냅샷 기준: ${exportedAt}\n- 오브젝트: ${entries.length}개, 패키지: ${byPackage.size}개\n`
  md += `- 사용법: 질문의 오브젝트명을 아래 표에서 먼저 찾고, \`file\` 경로를 Read 하세요. 없는 이름이면 "스냅샷에 없음"이 정답입니다.\n\n`
  for (const [pkg, list] of [...byPackage.entries()].sort()) {
    md += `## ${pkg} (${list.length})\n\n| 오브젝트 | 유형 | 설명 | 파일 |\n|---|---|---|---|\n`
    for (const e of list) {
      md += `| ${e.name} | ${e.type} | ${(e.title || '').replaceAll('|', '\\|')} | ${e.file} |\n`
    }
    md += '\n'
  }

  return {
    json: { schema: 'sapstack-cbo-catalog/v1', sid, exported_at: exportedAt, count: entries.length, objects: entries },
    md,
  }
}
