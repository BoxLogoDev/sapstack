// scripts/learning/codify.mjs
// Learning Loop — 해결된 Evidence Loop 세션을 재사용 가능한 지식 후보로 변환 (skillify 의 SAP판)
//
// 입력: 세션 디렉토리(state.yaml 포함) 또는 --session-id + --dir
// 출력: data/symptom-index.yaml 에 붙일 수 있는 symptom 후보 YAML (사람 검수용, stdout)
//
// 원칙:
//   - status==resolved 세션만 (확정 진단이 있어야 지식이 됨)
//   - typical_causes 는 confirmed hypothesis/verdict 에서 파생 (추측 금지, ETHOS ①)
//   - 자유 텍스트는 PII 스크럽 (mcp/dist/pii-scrubber.js 재사용)
//   - matched_symptom_index_entry 가 있으면 "기존 항목 보강 후보"로 표시
//
// 사용:
//   node scripts/learning/codify.mjs scripts/learning/fixtures/sess-20260601-a1b2c3
//   node scripts/learning/codify.mjs --session-id sess-... --dir .sapstack/sessions

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { scrubPII, KOREAN_PII_PATTERNS, INTERNATIONAL_PII_PATTERNS } from '../../mcp/dist/pii-scrubber.js';

// 구조적 PII(주민/사업자/카드/계좌/전화/이메일/SSN/IP)만 스크럽.
// 휴리스틱 "성명" 패턴(/[가-힣]{2,4}/)은 일반 도메인 한글까지 파괴하므로 제외.
const SAFE_PII_PATTERNS = [...KOREAN_PII_PATTERNS, ...INTERNATIONAL_PII_PATTERNS]
  .filter((p) => p.name !== '성명');

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..');

function parseArgs(argv) {
  const a = { dir: '.sapstack/sessions', sessionId: null, path: null };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--dir') a.dir = argv[++i];
    else if (x === '--session-id') a.sessionId = argv[++i];
    else if (!x.startsWith('--')) a.path = x;
  }
  return a;
}

function scrub(s) {
  return s ? scrubPII(String(s), { patterns: SAFE_PII_PATTERNS }).scrubbedText : s;
}

function slugify(state) {
  const tags = (state.tags || []).filter((t) => /^[a-z0-9-]+$/.test(t));
  if (tags.length) return tags.slice(0, 3).join('-');
  const d = (state.initial_symptom?.description || 'session').toLowerCase();
  return d.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 32) || 'session';
}

function collectTcodes(verdicts) {
  const out = new Set();
  for (const v of verdicts || []) {
    for (const r of v.resolutions || []) {
      if (r.status !== 'confirmed') continue;
      for (const grp of [r.fix_plan?.steps, r.rollback_plan?.steps]) {
        for (const s of grp || []) if (s.tcode) out.add(s.tcode);
      }
    }
  }
  return [...out];
}

function collectCauses(state) {
  const causes = [];
  const confirmedIds = new Set();
  for (const v of state.verdicts || []) {
    for (const r of v.resolutions || []) {
      if (r.status === 'confirmed') confirmedIds.add(r.hypothesis_id);
    }
  }
  // 확정 가설의 statement 를 1차 원인으로
  for (const h of state.hypotheses || []) {
    if (confirmedIds.has(h.hypothesis_id)) causes.push(scrub(h.statement));
  }
  // verdict summary 보강
  for (const v of state.verdicts || []) {
    if (v.summary && causes.length === 0) causes.push(scrub(v.summary));
  }
  return causes;
}

function collectModules(state) {
  const mods = new Set();
  const confirmed = new Set();
  for (const v of state.verdicts || [])
    for (const r of v.resolutions || [])
      if (r.status === 'confirmed') confirmed.add(r.hypothesis_id);
  for (const h of state.hypotheses || [])
    if (confirmed.has(h.hypothesis_id))
      for (const m of h.likely_modules || []) mods.add(m);
  return [...mods];
}

function collectEvidence(state) {
  const ev = [];
  for (const v of state.verdicts || [])
    for (const r of v.resolutions || [])
      for (const e of r.evidence_refs || [])
        if (e.finding) ev.push(scrub(e.finding));
  return ev;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  let sessionDir = args.path;
  if (!sessionDir && args.sessionId) sessionDir = join(args.dir, args.sessionId);
  if (!sessionDir) {
    console.error('사용: codify.mjs <session-dir> | --session-id <id> [--dir <base>]');
    process.exit(1);
  }
  sessionDir = resolve(REPO, sessionDir);
  const statePath = join(sessionDir, 'state.yaml');
  if (!existsSync(statePath)) {
    console.error(`state.yaml 없음: ${statePath}`);
    process.exit(1);
  }

  const state = yaml.load(readFileSync(statePath, 'utf8'));
  if (state.status !== 'resolved') {
    console.error(`⚠ 세션 status=${state.status} — resolved 세션만 codify 가치 있음. 중단.`);
    process.exit(2);
  }

  const sym = state.initial_symptom || {};
  const matched = sym.matched_symptom_index_entry;
  const slug = slugify(state);
  const id = matched || `sym-${slug}`;
  const tcodes = collectTcodes(state.verdicts);
  const causes = collectCauses(state);
  const modules = collectModules(state);
  const evidence = collectEvidence(state);

  // 후보 symptom 엔트리 (data/symptom-index.yaml 의 symptoms[] 에 붙이는 형식)
  const candidate = {
    id,
    symptom_ko: scrub(sym.description),
    likely_modules: modules,
    first_check_tcodes: tcodes,
    typical_causes: causes,
    evidence_needed: evidence.map((f) => ({ type: 'finding', target: f, priority: 'high' })),
    severity: 'medium',
    recurrence: 'unknown',
    source_session: state.session_id,
  };

  const header = matched
    ? `# ⟳ 기존 항목 보강 후보 — '${matched}' 와 병합 검토 (덮어쓰기 금지, diff 로 보강)`
    : `# ✚ 신규 symptom 후보 — data/symptom-index.yaml symptoms[] 에 추가 검토`;

  console.log(header);
  console.log(`# 출처 세션: ${state.session_id} (status=resolved, env=${JSON.stringify(state.sap_context || {})})`);
  console.log('# ⚠ 사람 검수 필수: typical_causes 일반화·중복 확인, PII 잔존 점검 후 PR.');
  console.log('');
  console.log(yaml.dump({ symptoms: [candidate] }, { lineWidth: 100, noRefs: true }));
}

main();
