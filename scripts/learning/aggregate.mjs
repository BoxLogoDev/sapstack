// scripts/learning/aggregate.mjs
// Learning Loop — 세션 집계 → 메트릭 + gold-set 환류 후보 (Pillar A ↔ C 플라이휠)
//
// 입력: 세션 base 디렉토리 (기본 .sapstack/sessions, 테스트는 fixtures)
// 출력: JSON 메트릭 (stdout)
//   - 세션 수 / 상태 분포 / 해결률
//   - 가설 정확도 (confirmed / (confirmed+refuted))
//   - 모듈 분포 (확정 가설 기준)
//   - gold_set_candidates: resolved & matched symptom 인데 gold-set 에 없는 것 → eval 확장 후보
//   - codify_candidates: resolved & 인덱스 미매칭(novel) → codify 대상
//
// opt-in·로컬·읽기전용. 자유 텍스트 미출력(메트릭만) → PII 노출 없음.
//
// 사용:
//   node scripts/learning/aggregate.mjs --dir scripts/learning/fixtures
//   node scripts/learning/aggregate.mjs                       # .sapstack/sessions

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..');
const GOLD_PATH = resolve(REPO, 'data/eval/gold-set.yaml');

function parseArgs(argv) {
  const a = { dir: '.sapstack/sessions' };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--dir') a.dir = argv[++i];
  }
  return a;
}

function loadGoldRefs() {
  if (!existsSync(GOLD_PATH)) return new Set();
  const doc = yaml.load(readFileSync(GOLD_PATH, 'utf8'));
  return new Set((doc.cases || []).map((c) => c.symptom_ref));
}

function loadSessions(baseDir) {
  const base = resolve(REPO, baseDir);
  if (!existsSync(base)) return [];
  const out = [];
  for (const name of readdirSync(base)) {
    const dir = join(base, name);
    if (!statSync(dir).isDirectory()) continue;
    const sp = join(dir, 'state.yaml');
    if (!existsSync(sp)) continue;
    try {
      out.push(yaml.load(readFileSync(sp, 'utf8')));
    } catch {
      // malformed 세션 skip
    }
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const goldRefs = loadGoldRefs();
  const sessions = loadSessions(args.dir);

  const byStatus = {};
  const byModule = {};
  let confirmed = 0;
  let refuted = 0;
  const goldCandidates = [];
  const codifyCandidates = [];

  for (const s of sessions) {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;

    const confirmedHyp = new Set();
    for (const v of s.verdicts || []) {
      for (const r of v.resolutions || []) {
        if (r.status === 'confirmed') { confirmed++; confirmedHyp.add(r.hypothesis_id); }
        else if (r.status === 'refuted') refuted++;
      }
    }
    for (const h of s.hypotheses || []) {
      if (confirmedHyp.has(h.hypothesis_id))
        for (const m of h.likely_modules || []) byModule[m] = (byModule[m] || 0) + 1;
    }

    if (s.status === 'resolved') {
      const matched = s.initial_symptom?.matched_symptom_index_entry;
      if (matched && !goldRefs.has(matched)) {
        goldCandidates.push({ session_id: s.session_id, symptom_ref: matched });
      } else if (!matched) {
        codifyCandidates.push({ session_id: s.session_id });
      }
    }
  }

  const total = sessions.length;
  const resolved = byStatus.resolved || 0;
  const metrics = {
    sessions_dir: args.dir,
    total_sessions: total,
    by_status: byStatus,
    resolution_rate: total ? +(resolved / total).toFixed(3) : 0,
    hypothesis_accuracy: confirmed + refuted ? +(confirmed / (confirmed + refuted)).toFixed(3) : null,
    module_distribution: byModule,
    gold_set_candidates: goldCandidates,   // → Pillar A eval 확장 후보 (플라이휠)
    codify_candidates: codifyCandidates,   // → codify.mjs 대상 (신규 symptom)
  };

  console.log(JSON.stringify(metrics, null, 2));
}

main();
