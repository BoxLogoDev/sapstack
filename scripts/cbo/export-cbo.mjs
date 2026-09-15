#!/usr/bin/env node
/**
 * export-cbo.mjs — CBO 스냅샷 오케스트레이터
 *
 * 흐름: config/.env 로드 → src/ 클리어 → vsp lua 워커 스폰(JSONL 수신) →
 *       대조(objects_found = files_written + failures) → PII 스크럽 →
 *       catalog/guide/manifest 생성 → git commit(변경 시만).
 *
 * 종료코드: 0 완전 성공 / 1 치명 실패(직전 스냅샷 복원) / 2 부분 실패(status: partial)
 *
 * 사용:
 *   node scripts/cbo/export-cbo.mjs --system DS4 [--packages "ZFI1,ZBC"]
 *        [--dry-run] [--catalog-only] [--scrub mask|report|off]
 *        [--limit N] [--allow-prd]
 *
 * 문서: docs/cbo-snapshot.md · 폴더 계약: bridge/abapgit-pattern.md
 */

import { spawn, execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync, statSync, renameSync } from 'node:fs'
import { homedir, userInfo } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

import { CLAS_INCLUDES, isCustomPackage } from './lib/naming.mjs'
import { scrubSource } from './lib/scrub.mjs'
import { buildCatalog } from './lib/catalog.mjs'
import { renderManifest, reconcile } from './lib/manifest.mjs'
import { renderGuide } from './lib/guide.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const log = (m) => console.error(`[cbo] ${m}`)

// ── 인자 파싱 ────────────────────────────────────────────────
function parseArgs(argv) {
  const a = { system: 'DS4', packages: null, dryRun: false, catalogOnly: false, scrub: null, limit: 0, allowPrd: false }
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i]
    if (k === '--system') a.system = argv[++i]
    else if (k === '--packages') a.packages = argv[++i].split(',').map((s) => s.trim()).filter(Boolean)
    else if (k === '--dry-run') a.dryRun = true
    else if (k === '--catalog-only') a.catalogOnly = true
    else if (k === '--scrub') a.scrub = argv[++i]
    else if (k === '--limit') a.limit = parseInt(argv[++i], 10) || 0
    else if (k === '--allow-prd') a.allowPrd = true
    else { console.error(`알 수 없는 인자: ${k}`); process.exit(1) }
  }
  return a
}

// ── 설정 로드 ────────────────────────────────────────────────
function parseEnvFile(path) {
  const out = {}
  if (!existsSync(path)) return out
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq > 0) out[t.slice(0, eq)] = t.slice(eq + 1)
  }
  return out
}

async function loadCboConfig() {
  const cfgPath = join(homedir(), '.sapstack', 'config.yaml')
  if (!existsSync(cfgPath)) return {}
  try {
    const { load } = await import('js-yaml') // repo 루트 node_modules (npm install 필요)
    const doc = load(readFileSync(cfgPath, 'utf8'))
    return doc?.cbo || {}
  } catch {
    log('경고: js-yaml 미설치 또는 config.yaml 파싱 실패 — CLI 인자/기본값으로 진행')
    return {}
  }
}

function resolveVspBin(cbo) {
  const candidates = [
    process.env.VSP_BIN,
    cbo.vsp_bin,
    join(homedir(), 'vibing-steampunk', 'build', 'vsp.exe'),
    'vsp',
  ].filter(Boolean)
  for (const c of candidates) {
    if (c === 'vsp') return c
    if (existsSync(c)) return c
  }
  return 'vsp'
}

// ── git 헬퍼 (스냅샷 로컬 이력 — remote 없음) ───────────────
// maxBuffer 기본 1MB 는 전 모듈 수집(3만+ 파일)의 status/add 출력에 ENOBUFS 로 터진다
// (2026-08-31 실사고: 124k 오브젝트 수집 성공 후 커밋 단계에서 사망). 256MB 로 상향.
function git(root, args, opts = {}) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts }).trim()
}

function ensureGit(root) {
  if (!existsSync(join(root, '.git'))) {
    git(root, ['init', '-q'])
    git(root, ['config', 'core.autocrlf', 'false'])
    git(root, ['config', 'user.name', 'sapstack-cbo-export'])
    git(root, ['config', 'user.email', 'cbo-export@localhost'])
    writeFileSync(join(root, '.gitattributes'), '* -text\n')
  }
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv)
  const cbo = await loadCboConfig()
  const sysCfg = cbo.systems?.[args.system] || {}

  const landscapeRole = sysCfg.landscape_role || 'dev'
  if (landscapeRole === 'prd' && !args.allowPrd) {
    log(`거부: ${args.system} 은 landscape_role: prd — 운영 export 는 --allow-prd 필요`)
    process.exit(1)
  }

  const patterns = args.packages || sysCfg.packages || ['Z*', 'Y*']
  for (const p of patterns) {
    if (!isCustomPackage(p)) {
      log(`거부: 패키지 패턴 "${p}" — 커스텀(Z/Y/$)만 허용 (표준 SAP 소스 export 금지)`)
      process.exit(1)
    }
  }
  const excludePackages = sysCfg.exclude_packages || []
  const scrubMode = args.scrub || cbo.scrub || 'mask'
  const stalenessWarnDays = cbo.staleness_warn_days || 30
  const snapshotRoot = resolve((cbo.snapshot_root || join(homedir(), '.sapstack', 'cbo')).replace(/^~[\\/]/, homedir() + '/'), args.system)
  const srcRoot = join(snapshotRoot, 'src')
  const metaRoot = join(snapshotRoot, 'meta')

  // 시스템별 재정의: ~/.sapstack/.env.<SID> 가 있으면 그 키만 덮어쓴다 (SAP_URL/SAP_CLIENT 만 적고 계정은 .env 상속)
  const envDir = join(homedir(), '.sapstack')
  const sapEnv = { ...parseEnvFile(join(envDir, '.env')), ...parseEnvFile(join(envDir, `.env.${args.system}`)) }
  if (!args.catalogOnly && (!sapEnv.SAP_URL || !sapEnv.SAP_USER)) {
    log('거부: ~/.sapstack/.env 에 SAP_URL/SAP_USER 필요 (setup.sh [3/5] 또는 Desktop 설정 > SAP 접속)')
    process.exit(1)
  }

  mkdirSync(srcRoot, { recursive: true })
  mkdirSync(metaRoot, { recursive: true })
  ensureGit(snapshotRoot)

  const vspBin = resolveVspBin(cbo)
  log(`시스템=${args.system}(${landscapeRole}) 패턴=${patterns.join(',')} scrub=${scrubMode} vsp=${vspBin}`)

  // ── export 단계 ────────────────────────────────────────────
  const records = []
  if (!args.catalogOnly) {
    if (!args.dryRun) {
      rmSync(srcRoot, { recursive: true, force: true }) // 전체 재수집 (델타는 git 이 담당)
      mkdirSync(srcRoot, { recursive: true })
    }

    const typeMapCsv = ['PROG/P=.prog.abap', 'PROG/I=.prog.abap', 'CLAS/OC=.clas.abap', 'INTF/OI=.intf.abap',
      'DDLS/DF=.ddls.asddls', 'BDEF/BDO=.bdef.asbdef', 'SRVD/SRV=.srvd.srvdsrv', 'FUGR/F=.fugr.json'].join(',')
    const clasIncCsv = CLAS_INCLUDES.map((c) => `${c.include}=${c.suffix}`).join(',')

    const child = spawn(vspBin, ['lua', join(__dirname, 'export-cbo.lua')], {
      cwd: snapshotRoot, // .env 없는 위치 — 자격증명은 아래 env 로만
      env: {
        ...process.env,
        SAP_URL: sapEnv.SAP_URL, SAP_USER: sapEnv.SAP_USER, SAP_PASSWORD: sapEnv.SAP_PASSWORD,
        SAP_CLIENT: sapEnv.SAP_CLIENT || '100', SAP_LANGUAGE: sapEnv.SAP_LANGUAGE || 'KO',
        SAP_INSECURE: sapEnv.SAP_INSECURE || 'true',
        VSP_CBO_PATTERNS: patterns.join(','),
        VSP_CBO_EXCLUDE: excludePackages.join(','),
        VSP_CBO_OUT: srcRoot.replaceAll('\\', '/'),
        VSP_CBO_TYPEMAP: typeMapCsv,
        VSP_CBO_CLASINC: clasIncCsv,
        VSP_CBO_DRY: args.dryRun ? '1' : '0',
        VSP_CBO_LIMIT: String(args.limit || 0),
      },
      stdio: ['ignore', 'pipe', 'inherit'],
    })

    const rl = createInterface({ input: child.stdout })
    for await (const line of rl) {
      const t = line.trim()
      if (!t.startsWith('{')) continue
      try { records.push(JSON.parse(t)) } catch { log(`JSONL 파싱 실패: ${t.slice(0, 120)}`) }
    }
    const exitCode = await new Promise((res) => child.on('close', res))
    if (exitCode !== 0 && records.length === 0) {
      log(`치명: vsp 종료코드 ${exitCode}, 수집 0건 — 직전 스냅샷 복원`)
      try { git(snapshotRoot, ['reset', '--hard', '-q']); git(snapshotRoot, ['clean', '-fdq']) } catch {}
      process.exit(1)
    }
    if (exitCode !== 0) log(`경고: vsp 종료코드 ${exitCode} (부분 수집 ${records.length}건으로 계속)`)

    // 수집 0건은 vsp 가 정상 종료해도 치명으로 취급한다 — 전 패턴 열거 실패(사내망/VPN
    // 단절 등)를 "빈 스냅샷 성공"으로 커밋하면 좋은 스냅샷을 덮어쓰고, 스케줄러가
    // 그걸 공유폴더에 게시해버린다 (2026-08-30 실사고: 오프넷 상태 수집이 1,950파일
    // 스냅샷을 0건으로 교체·커밋 — git revert 로 복구).
    if (!args.dryRun && records.length === 0) {
      log('치명: 수집 0건 (열거 전패 — SAP 접속/사내망 확인) — 직전 스냅샷 복원')
      try { git(snapshotRoot, ['reset', '--hard', '-q']); git(snapshotRoot, ['clean', '-fdq']) } catch {}
      process.exit(1)
    }

    // 평면 → 패키지 디렉터리 배치 (Lua 는 셸 의존 mkdir 를 피해 flat 으로만 쓴다)
    if (!args.dryRun) {
      for (const rec of records) {
        if (rec.status !== 'ok' || !rec.file) continue
        const pkg = String(rec.package || '_').toLowerCase()
        const from = join(srcRoot, rec.file)
        if (!existsSync(from)) {
          rec.status = 'fail'
          rec.reason = 'layout: flat file missing'
          delete rec.file
          continue
        }
        mkdirSync(join(srcRoot, pkg), { recursive: true })
        const relTo = `src/${pkg}/${rec.file}`
        renameSync(from, join(snapshotRoot, relTo))
        rec.file = relTo
      }
    }
  }

  // ── 집계 ───────────────────────────────────────────────────
  const perPkg = new Map()
  const bump = (pkg, field) => {
    if (!perPkg.has(pkg)) perPkg.set(pkg, { name: pkg, objects_found: 0, files_written: 0, failures: 0 })
    const row = perPkg.get(pkg)
    if (field !== 'skip') row.objects_found++
    if (field === 'ok') row.files_written++
    if (field === 'fail') row.failures++
  }
  const failures = []
  for (const r of records) {
    bump(r.package || '?', r.status)
    if (r.status === 'fail') failures.push(r)
  }
  const packages = [...perPkg.values()].sort((a, b) => a.name.localeCompare(b.name))
  const mismatches = reconcile(packages)
  if (mismatches.length) log(`경고: 대조식 불일치 ${mismatches.length}개 패키지 — ${mismatches.map((m) => m.name).join(',')}`)
  writeFileSync(join(metaRoot, 'failures.json'), JSON.stringify(failures, null, 2))

  if (args.dryRun) {
    const totals = packages.reduce((s, p) => ({ o: s.o + p.objects_found, f: s.f + p.files_written, x: s.x + p.failures }), { o: 0, f: 0, x: 0 })
    log(`[dry-run] 객체 ${totals.o} / 패키지 ${packages.length} — 파일 기록 없음`)
    for (const p of packages.slice(0, 20)) log(`  ${p.name}: ${p.objects_found}`)
    if (packages.length > 20) log(`  ... 외 ${packages.length - 20}개 패키지`)
    process.exit(0)
  }

  // ── 스크럽 ─────────────────────────────────────────────────
  let maskedTotal = 0, reportedTotal = 0
  const piiReport = []
  if (scrubMode !== 'off') {
    for (const rec of records) {
      if (rec.status !== 'ok' || !rec.file || rec.file.endsWith('.fugr.json')) continue
      const abs = join(snapshotRoot, rec.file)
      if (!existsSync(abs)) continue
      const original = readFileSync(abs, 'utf8')
      const { text, findings } = scrubSource(original, scrubMode)
      if (findings.length) {
        piiReport.push({ file: rec.file, findings })
        maskedTotal += findings.filter((f) => f.masked).length
        reportedTotal += findings.filter((f) => !f.masked).length
        if (text !== original) writeFileSync(abs, text)
      }
    }
    log(`스크럽: 마스킹 ${maskedTotal} / 리포트 ${reportedTotal} (meta/pii-report.json)`)
  }
  writeFileSync(join(metaRoot, 'pii-report.json'), JSON.stringify({ mode: scrubMode, masked: maskedTotal, reported: reportedTotal, files: piiReport }, null, 2))

  // ── 카탈로그 ───────────────────────────────────────────────
  const exportedAt = new Date().toISOString()
  const catalogObjects = []
  const sourceRecords = args.catalogOnly ? scanTree(srcRoot) : records.filter((r) => r.status === 'ok' && r.file && !r.file.endsWith('.fugr.json'))
  for (const rec of sourceRecords) {
    const abs = join(snapshotRoot, rec.file)
    if (!existsSync(abs)) continue
    const source = readFileSync(abs, 'utf8')
    catalogObjects.push({ name: rec.name, type: rec.type, package: rec.package, file: rec.file.replaceAll('\\', '/'), loc: rec.loc || source.split('\n').length, source })
  }
  const { json: catalogJson, md: catalogMd } = buildCatalog(catalogObjects, { sid: args.system, exportedAt })
  writeFileSync(join(snapshotRoot, 'catalog.json'), JSON.stringify(catalogJson, null, 1))
  writeFileSync(join(snapshotRoot, 'catalog.md'), catalogMd)
  log(`카탈로그: ${catalogJson.count}개 오브젝트`)

  // ── manifest + guide ───────────────────────────────────────
  let vspVersion = 'unknown', vspSha = ''
  try { vspVersion = execFileSync(vspBin, ['--version'], { encoding: 'utf8' }).trim().split('\n')[0] } catch {}
  try { if (vspBin !== 'vsp') vspSha = createHash('sha256').update(readFileSync(vspBin)).digest('hex') } catch {}

  const totalFailures = packages.reduce((s, p) => s + p.failures, 0)
  const status = args.catalogOnly ? 'complete' : totalFailures === 0 && mismatches.length === 0 ? 'complete' : 'partial'
  const manifest = renderManifest({
    sid: args.system, client: sapEnv.SAP_CLIENT || '?', landscapeRole,
    exportedAt, sapUser: sapEnv.SAP_USER || '?', osUser: userInfo().username,
    method: 'adt-source',
    tool: { name: 'vsp', version: vspVersion, binary_sha256: vspSha },
    packages: packages.length ? packages : [{ name: '(catalog-only)', objects_found: catalogJson.count, files_written: catalogJson.count, failures: 0 }],
    status,
    scrub: { mode: scrubMode, engine: 'vendored(scrub.mjs)', masked: maskedTotal, reported: reportedTotal },
    limitations: ['TABL(DDIC 테이블 정의)·화면(DYNP)·메시지클래스 미포함 — abapGit 경로(Phase 3)에서 제공', 'FUGR 본체는 sapl*/l* include 로 수집'],
    stalenessWarnDays,
  })
  writeFileSync(join(snapshotRoot, 'manifest.yaml'), manifest)
  // guide.md(ko) + guide.en.md(en) — Desktop 앱이 UI 언어로 고른다 (영어 배포용)
  const guideParams = { sid: args.system, client: sapEnv.SAP_CLIENT || '?', exportedAt, count: catalogJson.count, packages: packages.map((p) => p.name), stalenessWarnDays }
  writeFileSync(join(snapshotRoot, 'guide.md'), renderGuide(guideParams, 'ko'))
  writeFileSync(join(snapshotRoot, 'guide.en.md'), renderGuide(guideParams, 'en'))

  // ── git commit ─────────────────────────────────────────────
  git(snapshotRoot, ['add', '-A'])
  const dirty = git(snapshotRoot, ['status', '--porcelain'])
  if (dirty) {
    git(snapshotRoot, ['commit', '-q', '-m', `cbo-export ${args.system} ${exportedAt} (${catalogJson.count} objects, status=${status})`])
    log(`git commit 완료 (${dirty.split('\n').length}개 변경)`)
  } else {
    log('변경 없음 — commit 생략 (멱등)')
  }

  log(`완료: status=${status} → ${snapshotRoot}`)
  process.exit(status === 'complete' ? 0 : 2)
}

/** --catalog-only: 기존 src/ 트리에서 레코드 역산 */
function scanTree(srcRoot) {
  const out = []
  const extType = [
    ['.clas.testclasses.abap', 'CLAS/I'], ['.clas.locals_def.abap', 'CLAS/I'], ['.clas.locals_imp.abap', 'CLAS/I'], ['.clas.macros.abap', 'CLAS/I'],
    ['.clas.abap', 'CLAS/OC'], ['.intf.abap', 'INTF/OI'], ['.prog.abap', 'PROG/P'],
    ['.ddls.asddls', 'DDLS/DF'], ['.bdef.asbdef', 'BDEF/BDO'], ['.srvd.srvdsrv', 'SRVD/SRV'],
  ]
  if (!existsSync(srcRoot)) return out
  for (const pkg of readdirSync(srcRoot)) {
    const pkgDir = join(srcRoot, pkg)
    if (!statSync(pkgDir).isDirectory()) continue
    for (const f of readdirSync(pkgDir)) {
      const hit = extType.find(([ext]) => f.endsWith(ext))
      if (!hit) continue
      out.push({ name: f.slice(0, -hit[0].length).toUpperCase().replaceAll('#', '/'), type: hit[1], package: pkg.toUpperCase(), file: `src/${pkg}/${f}`, loc: 0, status: 'ok' })
    }
  }
  return out
}

main().catch((e) => { log(`치명 오류: ${e.stack || e}`); process.exit(1) })
