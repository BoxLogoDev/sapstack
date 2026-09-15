import { test } from 'node:test'
import assert from 'node:assert/strict'
import { abapgitFilename, matchesPackagePatterns, isCustomPackage, sourceFetchType } from '../lib/naming.mjs'
import { scrubSource } from '../lib/scrub.mjs'
import { extractTitle, extractRelations, extractClassMeta, buildCatalog } from '../lib/catalog.mjs'
import { renderManifest, reconcile } from '../lib/manifest.mjs'
import { renderGuide } from '../lib/guide.mjs'

// ── naming ──────────────────────────────────────────────────
test('abapGit 파일명: 타입별 확장자 + 소문자 + 네임스페이스 #', () => {
  assert.equal(abapgitFilename('ZFI0171TOP', 'PROG/I'), 'zfi0171top.prog.abap')
  assert.equal(abapgitFilename('ZCL_FI_UTIL', 'CLAS/OC'), 'zcl_fi_util.clas.abap')
  assert.equal(abapgitFilename('/LSITC/ZX', 'INTF/OI'), '#lsitc#zx.intf.abap')
  assert.equal(abapgitFilename('ZX', 'TABL/DT'), null) // Phase 1 미지원 타입
})

test('getSource 타입 인자: PROG/I 는 INCL 로', () => {
  assert.equal(sourceFetchType('PROG/I'), 'INCL')
  assert.equal(sourceFetchType('PROG/P'), 'PROG')
  assert.equal(sourceFetchType('CLAS/OC'), 'CLAS')
})

test('패키지 가드: 표준 SAP 패키지는 어떤 패턴으로도 매칭 불가', () => {
  assert.equal(isCustomPackage('ZFI1'), true)
  assert.equal(isCustomPackage('SABP'), false)
  assert.equal(matchesPackagePatterns('ZFI1', ['Z*']), true)
  assert.equal(matchesPackagePatterns('YHR', ['Z*', 'Y*']), true)
  assert.equal(matchesPackagePatterns('SABP', ['Z*']), false)
  assert.equal(matchesPackagePatterns('SABP', ['S*']), false) // 패턴 자체가 가드 위반
  assert.equal(matchesPackagePatterns('ZFI1', ['ZFI1']), true)
  assert.equal(matchesPackagePatterns('ZFI10', ['ZFI1']), false) // 정확 일치
})

// ── scrub ───────────────────────────────────────────────────
test('스크럽: RESTRICTED 마스킹 + 리포트 전용 분리', () => {
  const src = [
    "* 담당: 홍길동 hong@example.com 010-1234-5678", // 리포트만, 변형 금지
    "  lv_rrn = '900101-1234567'.", // 주민번호 → 마스킹
    "  lv_pwd = 'SECRET1'. \" PASSWORD = 'x'",
  ].join('\n')
  const { text, findings } = scrubSource(src, 'mask')
  assert.ok(!text.includes('900101-1234567'), '주민번호 마스킹돼야 함')
  assert.ok(text.includes('hong@example.com'), '이메일은 원문 보존')
  assert.ok(text.includes('010-1234-5678'), '휴대폰은 원문 보존')
  const kinds = findings.map((f) => f.kind)
  assert.ok(kinds.includes('resident_id') && kinds.includes('email') && kinds.includes('mobile_phone'))
  const masked = findings.filter((f) => f.masked).map((f) => f.kind)
  assert.ok(masked.includes('resident_id') && !masked.includes('email'))
})

test('스크럽: 미국 SSN(3-2-4)은 마스킹, SAP 전표번호·사업자번호와 충돌 없음', () => {
  const src = [
    "  lv_ssn = '123-45-6789'.",
    "  lv_belnr = '5100000123'. lv_brn = '123-45-67890'.",
  ].join('\n')
  const { text, findings } = scrubSource(src, 'mask')
  assert.ok(!text.includes('123-45-6789\''), 'SSN 마스킹돼야 함')
  assert.ok(text.includes('5100000123'), '전표번호 보존')
  const masked = findings.filter((f) => f.masked).map((f) => f.kind).sort()
  assert.deepEqual(masked, ['business_id', 'us_ssn']) // bank_account 리포트(형식 겹침)는 별도
  assert.ok(!scrubSource("  lv_x = '000-12-3456'.", 'mask').findings.some((f) => f.kind === 'us_ssn'), '무효 구간 000 은 SSN 아님')
})

test('guide: ko/en 렌더 — 기준일·오브젝트 수·언어별 고지 문구', () => {
  const p = { sid: 'DS4', client: '100', exportedAt: '2026-09-15T04:14:16.033Z', count: 42, packages: ['ZFI1', 'ZMM1'], stalenessWarnDays: 30 }
  const ko = renderGuide(p, 'ko')
  const en = renderGuide(p, 'en')
  assert.ok(ko.startsWith('# CBO 스냅샷 (DS4)') && ko.includes('스냅샷 기준일: 2026-09-15') && ko.includes('오브젝트 42개'))
  assert.ok(en.startsWith('# CBO snapshot (DS4)') && en.includes('Snapshot as of: 2026-09-15') && en.includes('42 objects'))
  assert.ok(!/[가-힣]/.test(en), '영어 guide 에 한글 없음')
  assert.equal(renderGuide(p), ko, '기본은 한국어')
})

test("스크럽: 공백 리터럴 PASSWORD = ' ' 는 시크릿 아님", () => {
  const blank = scrubSource("*     PASSWORD                        = ' '", 'report')
  assert.equal(blank.findings.length, 0)
  const real = scrubSource("  IF password = 'abcd'.", 'report')
  assert.deepEqual(real.findings.map((f) => f.kind), ['hardcoded_secret'])
  assert.ok(real.text.includes("'abcd'"), 'report 모드는 원문 보존')
})

test('스크럽 mask 모드: 하드코딩 비밀번호 리터럴은 통째로 ***', () => {
  const { text, findings } = scrubSource("  IF password = 'abcd'.\n  CALL FUNCTION 'X' EXPORTING pwd = 'p@ss 1'.", 'mask')
  assert.equal(text, "  IF password = '***'.\n  CALL FUNCTION 'X' EXPORTING pwd = '***'.")
  assert.deepEqual(findings.map((f) => [f.kind, f.line, f.masked]), [['hardcoded_secret', 1, true], ['hardcoded_secret', 2, true]])
})

test('스크럽 report 모드: 아무것도 변형하지 않음', () => {
  const src = "  lv_rrn = '900101-1234567'."
  const { text, findings } = scrubSource(src, 'report')
  assert.equal(text, src)
  assert.ok(findings.length >= 1)
})

// ── catalog ─────────────────────────────────────────────────
const SYN_PROG = [
  '*&---------------------------------------------------------------------*',
  '*& Report ZFI_TEST_SYN',
  '*& 테스트용 합성 리포트 — 전표 검증',
  '*&---------------------------------------------------------------------*',
  'REPORT zfi_test_syn.',
  'INCLUDE zfi_test_syn_top.',
  "CALL FUNCTION 'ZFI_CHECK_DOC'.",
  'SELECT * FROM zfit0001 INTO TABLE lt_data.',
  'SUBMIT zfi_batch_syn AND RETURN.',
].join('\n')

test('카탈로그: 제목·관계 추출', () => {
  const rel = extractRelations(SYN_PROG)
  assert.deepEqual(rel.includes, ['ZFI_TEST_SYN_TOP'])
  assert.deepEqual(rel.calls_function, ['ZFI_CHECK_DOC'])
  assert.deepEqual(rel.select_from, ['ZFIT0001'])
  assert.deepEqual(rel.submits, ['ZFI_BATCH_SYN'])
  const title = extractTitle(SYN_PROG)
  assert.ok(title.length > 0)
})

test('카탈로그: 주석 행의 관계는 무시', () => {
  const rel = extractRelations("* INCLUDE ztest_fake.\n\" CALL FUNCTION 'ZFAKE'\nINCLUDE zreal.")
  assert.deepEqual(rel.includes, ['ZREAL'])
  assert.deepEqual(rel.calls_function, [])
})

test('카탈로그: 클래스 메타', () => {
  const cls = extractClassMeta('CLASS zcl_x DEFINITION INHERITING FROM zcl_base.\n  INTERFACES zif_a.\n')
  assert.equal(cls.superclass, 'ZCL_BASE')
  assert.deepEqual(cls.interfaces, ['ZIF_A'])
})

test('카탈로그 빌드: json/md 산출', () => {
  const { json, md } = buildCatalog(
    [{ name: 'ZFI_TEST_SYN', type: 'PROG/P', package: 'ZFI1', file: 'src/zfi1/zfi_test_syn.prog.abap', loc: 9, source: SYN_PROG }],
    { sid: 'DS4', exportedAt: '2026-08-28T00:00:00+09:00' },
  )
  assert.equal(json.count, 1)
  assert.equal(json.objects[0].calls_function[0], 'ZFI_CHECK_DOC')
  assert.ok(md.includes('## ZFI1 (1)'))
  assert.ok(md.includes('zfi_test_syn.prog.abap'))
})

// ── manifest ────────────────────────────────────────────────
test('manifest: 대조식 검증 + YAML 방출', () => {
  const pkgs = [{ name: 'ZFI1', objects_found: 10, files_written: 9, failures: 1 }]
  assert.equal(reconcile(pkgs).length, 0)
  assert.equal(reconcile([{ name: 'Z', objects_found: 10, files_written: 8, failures: 1 }]).length, 1)

  const yaml = renderManifest({
    sid: 'DS4', client: '600', landscapeRole: 'dev',
    exportedAt: '2026-08-28T06:30:00+09:00', sapUser: 'TESTUSER', osUser: 'tester',
    method: 'adt-source',
    tool: { name: 'vsp', version: 'dev', binary_sha256: 'abc' },
    packages: pkgs, status: 'partial',
    scrub: { mode: 'mask', engine: 'vendored', masked: 1, reported: 2 },
    limitations: ['TABL(DDIC) 미포함 — Phase 3에서 제공'],
    stalenessWarnDays: 30,
  })
  assert.ok(yaml.includes('schema: sapstack-cbo-manifest/v1'))
  assert.ok(yaml.includes('totals: { objects_found: 10, files_written: 9, failures: 1 }'))
  assert.ok(yaml.includes('status: partial'))
  assert.ok(yaml.includes('TABL(DDIC)'))
})
