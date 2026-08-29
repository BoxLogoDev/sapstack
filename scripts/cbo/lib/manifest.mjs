/**
 * manifest.mjs — 스냅샷 출처·신선도·대조 기록 (폴더 계약 v1)
 * YAML 라이브러리 없이 템플릿으로 방출 — 값은 전부 스칼라/단순 배열이라 안전.
 */

function yamlStr(v) {
  const s = String(v ?? '')
  return /[:#'"{}\[\],&*?|>%@`]/.test(s) || s !== s.trim() ? JSON.stringify(s) : s
}

/**
 * @param {object} p
 * @param {string} p.sid @param {string} p.client @param {string} p.landscapeRole
 * @param {string} p.exportedAt ISO @param {string} p.sapUser @param {string} p.osUser
 * @param {string} p.method adt-source|abapgit-zip|git-remote
 * @param {{name:string,version:string,binary_sha256:string}} p.tool
 * @param {Array<{name,objects_found,files_written,failures}>} p.packages
 * @param {'complete'|'partial'|'failed'} p.status
 * @param {{mode:string,engine:string,masked:number,reported:number}} p.scrub
 * @param {string[]} p.limitations
 * @param {number} p.stalenessWarnDays
 */
export function renderManifest(p) {
  const totals = p.packages.reduce(
    (acc, x) => ({
      objects_found: acc.objects_found + x.objects_found,
      files_written: acc.files_written + x.files_written,
      failures: acc.failures + x.failures,
    }),
    { objects_found: 0, files_written: 0, failures: 0 },
  )

  const lines = [
    '# sapstack CBO 스냅샷 manifest — scripts/cbo/export-cbo.mjs 가 생성. 수동 편집 금지.',
    'schema: sapstack-cbo-manifest/v1',
    `sid: ${yamlStr(p.sid)}`,
    `client: ${yamlStr(p.client)}`,
    `landscape_role: ${yamlStr(p.landscapeRole)}`,
    `exported_at: ${yamlStr(p.exportedAt)}`,
    'exported_by:',
    `  sap_user: ${yamlStr(p.sapUser)}`,
    `  os_user: ${yamlStr(p.osUser)}`,
    `method: ${yamlStr(p.method)}`,
    'tool:',
    `  name: ${yamlStr(p.tool.name)}`,
    `  version: ${yamlStr(p.tool.version)}`,
    `  binary_sha256: ${yamlStr(p.tool.binary_sha256)}`,
    'packages:',
    ...p.packages.map(
      (x) =>
        `  - { name: ${yamlStr(x.name)}, objects_found: ${x.objects_found}, files_written: ${x.files_written}, failures: ${x.failures} }`,
    ),
    `totals: { objects_found: ${totals.objects_found}, files_written: ${totals.files_written}, failures: ${totals.failures} }`,
    `status: ${p.status}`,
    `freshness: { staleness_warn_days: ${p.stalenessWarnDays} }`,
    `scrub: { mode: ${yamlStr(p.scrub.mode)}, engine: ${yamlStr(p.scrub.engine)}, masked: ${p.scrub.masked}, reported: ${p.scrub.reported} }`,
    'limitations:',
    ...(p.limitations.length ? p.limitations.map((l) => `  - ${yamlStr(l)}`) : ['  []'].slice(0, 0)),
    ...(p.limitations.length ? [] : ['  []']),
    '',
  ]
  // limitations 빈 배열 처리 정리
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'limitations:' && lines[i + 1] === '  []') {
      out.push('limitations: []')
      i++
    } else out.push(lines[i])
  }
  return out.join('\n')
}

/** 대조식: objects_found = files_written + failures 가 모든 패키지에서 성립해야 함 */
export function reconcile(packages) {
  return packages.filter((x) => x.objects_found !== x.files_written + x.failures)
}
