// scripts/eval/run.mjs
// sapstack 진단 품질 eval — LLM-judge 러너 (로컬 전용, SDK 0개)
//
// 동작:
//   1. data/eval/gold-set.yaml 로드
//   2. 각 case → 모듈에 해당하는 agents/*.md 본문을 system 프롬프트로 사용
//      (실제 운영 에이전트를 그대로 재현 — 충실도)
//   3. case.prompt 를 입력해 모델 답변 생성 (answer stage)
//   4. judge 모델이 expected 대비 채점 (root_cause / tcode_recall / check_coverage / ethos)
//   5. 요약 JSON 출력 + docs/eval/REPORT.md 누적
//
// 의존성: Node 20+ 내장 fetch + js-yaml (mcp/node_modules 에서 NODE_PATH 로 해결)
//   → scripts/eval-diagnosis.sh 가 NODE_PATH 를 세팅해 호출. 직접 실행도 가능.
//
// Provider (자동 선택): ANTHROPIC_API_KEY 있으면 'api', 없고 claude CLI 있으면
//   'claude-cli'(구독·추가비용 0), 둘 다 없으면 dry-run. EVAL_PROVIDER 로 강제 가능.
//
// 환경변수:
//   EVAL_PROVIDER     — api | claude-cli (미지정 시 자동)
//   ANTHROPIC_API_KEY — provider=api 일 때 필요
//   EVAL_MODEL        — 답변 모델 (api: claude-sonnet-4-6 / cli: sonnet)
//   EVAL_JUDGE_MODEL  — 채점 모델 (기본 EVAL_MODEL)
//   EVAL_CLI_MAX_TURNS(기본 6) / EVAL_CLI_RETRIES(기본 2) / EVAL_CLI_PACE_MS(기본 2000)
//
// 사용:
//   node scripts/eval/run.mjs --dry-run
//   node scripts/eval/run.mjs --case eval-fi-f110-no-payment-method
//   node scripts/eval/run.mjs --module FI
//   node scripts/eval/run.mjs --all --limit 5

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..', '..');

const GOLD_PATH = resolve(REPO, 'data/eval/gold-set.yaml');
const REPORT_PATH = resolve(REPO, 'docs/eval/REPORT.md');
const AGENTS_DIR = resolve(REPO, 'agents');

const MODULE_AGENT = {
  FI: 'sap-fi-consultant', CO: 'sap-co-consultant', TR: 'sap-tr-consultant',
  MM: 'sap-mm-consultant', SD: 'sap-sd-consultant', PP: 'sap-pp-consultant',
  HCM: 'sap-hcm-consultant', ABAP: 'sap-abap-developer', BASIS: 'sap-basis-consultant',
  PM: 'sap-pm-consultant', QM: 'sap-qm-consultant', EWM: 'sap-ewm-consultant',
  IBP: 'sap-ibp-consultant', SAC: 'sap-sac-consultant', Ariba: 'sap-ariba-consultant',
  IC: 'sap-integration-cloud-consultant',
  // 전용 에이전트 없는 모듈 → 가장 인접한 에이전트로 라우팅(eval 용)
  WM: 'sap-ewm-consultant',   // WM(레거시 창고) → EWM 컨설턴트가 창고 도메인 최근접
  BTP: 'sap-cloud-consultant', // BTP → Cloud 컨설턴트(플랫폼/클라우드 영역)
};

const API_URL = 'https://api.anthropic.com/v1/messages';

// Provider 선택: 유료 API 키가 있으면 api, 없으면 구독 claude CLI(추가 비용 0), 둘 다 없으면 none.
// EVAL_PROVIDER 로 명시 가능 (api | claude-cli).
const HAS_API = !!process.env.ANTHROPIC_API_KEY;
let HAS_CLI = false;
// Windows 의 claude 는 셸 래퍼라 shell:true 로 탐지/호출 (Node 직접 spawn 불가)
try { HAS_CLI = spawnSync('claude --version', { shell: true, encoding: 'utf8' }).status === 0; } catch { /* no cli */ }
const PROVIDER = process.env.EVAL_PROVIDER || (HAS_API ? 'api' : (HAS_CLI ? 'claude-cli' : 'none'));

// 모델: API 는 정식 id, CLI 는 별칭(sonnet/opus/haiku).
const MODEL = process.env.EVAL_MODEL || (PROVIDER === 'claude-cli' ? 'sonnet' : 'claude-sonnet-4-6');
const JUDGE_MODEL = process.env.EVAL_JUDGE_MODEL || MODEL;

function parseArgs(argv) {
  const a = { dryRun: false, case: null, module: null, all: false, limit: Infinity };
  for (let i = 0; i < argv.length; i++) {
    const x = argv[i];
    if (x === '--dry-run') a.dryRun = true;
    else if (x === '--all') a.all = true;
    else if (x === '--case') a.case = argv[++i];
    else if (x === '--module') a.module = argv[++i];
    else if (x === '--limit') a.limit = parseInt(argv[++i], 10);
  }
  return a;
}

function stripFrontmatter(md) {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) return md.slice(md.indexOf('\n', end + 1) + 1).trim();
  }
  return md.trim();
}

function loadGold() {
  const doc = yaml.load(readFileSync(GOLD_PATH, 'utf8'));
  if (!doc || !Array.isArray(doc.cases)) throw new Error('gold-set.yaml: cases 배열 없음');
  return doc;
}

function selectCases(gold, args) {
  let cases = gold.cases;
  if (args.case) cases = cases.filter((c) => c.id === args.case);
  if (args.module) cases = cases.filter((c) => c.module === args.module);
  if (Number.isFinite(args.limit)) cases = cases.slice(0, args.limit);
  return cases;
}

async function callAnthropic(system, user, model) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY 미설정 — --dry-run 만 가능');
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API ${res.status}: ${body.slice(0, 300)}`);
  }
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
}

// 구독 claude CLI 백엔드 (추가 비용 0 — 사용자 Claude Code 플랜 사용).
// 도구 비활성 + 동적 시스템섹션 제외로 순수 Q&A 재현. system 은 길어서 파일로 전달.
// 동기 sleep (재시도 백오프 — Node 단일 스레드에서 spawnSync 와 함께 쓰기 위함)
function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

// 구독 플랜은 빠른 연속 헤드리스 호출에 일시 rate limit 이 걸릴 수 있어 재시도+백오프.
const CLI_RETRIES = Number(process.env.EVAL_CLI_RETRIES || 2);
const CLI_MAX_TURNS = Number(process.env.EVAL_CLI_MAX_TURNS || 6);
// judge 다수결 표 수 (홀수 권장). 1 이면 단일 judge(기존 동작). 분산 감소용.
const JUDGE_VOTES = Math.max(1, Number(process.env.EVAL_JUDGE_VOTES || 3));
const CLI_PACE_MS = Number(process.env.EVAL_CLI_PACE_MS || 2000);

function callClaudeCLI(system, user, model) {
  const tmp = join(tmpdir(), `eval-sys-${process.pid}-${Math.random().toString(36).slice(2)}.txt`);
  writeFileSync(tmp, system, 'utf8');
  // shell:true (Windows 래퍼) + 프롬프트는 stdin 으로 → 셸 이스케이프 회피.
  const cmd = `claude -p --system-prompt-file "${tmp}" --model ${model}`
    + ` --exclude-dynamic-system-prompt-sections`
    + ` --disallowed-tools Read Grep Glob Bash Edit Write WebFetch WebSearch --max-turns ${CLI_MAX_TURNS}`;
  try {
    let lastErr = '';
    for (let attempt = 1; attempt <= CLI_RETRIES; attempt++) {
      const r = spawnSync(cmd, {
        shell: true, input: user, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
      });
      if (!r.error && r.status === 0 && (r.stdout || '').trim()) {
        sleepSync(CLI_PACE_MS); // 페이싱 — 다음 호출 전 짧은 간격
        return r.stdout.trim();
      }
      lastErr = (r.error && r.error.message) || (r.stderr || '') || (r.stdout || '') || `exit ${r.status}`;
      if (attempt < CLI_RETRIES) sleepSync(attempt * 8000); // 8s, 16s 백오프
    }
    throw new Error(`claude CLI 실패(${CLI_RETRIES}회): ${String(lastErr).slice(0, 300)}`);
  } finally {
    try { rmSync(tmp); } catch { /* ignore */ }
  }
}

// Provider 디스패처
async function complete(system, user, model) {
  if (PROVIDER === 'claude-cli') return callClaudeCLI(system, user, model);
  return callAnthropic(system, user, model);
}

function judgePrompt(c, answer) {
  const exp = c.expected;
  return [
    'You are a strict SAP diagnostic-quality judge. Score the ANSWER against the GOLD expectation.',
    'Return ONLY a JSON object, no prose, with this exact shape:',
    '{"root_cause_match":"full|partial|miss","tcode_recall":0.0,"check_coverage":0.0,' +
      '"ethos_violations":["..."],"score":0.0,"rationale":"one sentence"}',
    '',
    'Scoring rules:',
    '- root_cause_match: did the ANSWER identify the GOLD primary_root_cause? full/partial/miss.',
    '- tcode_recall: fraction (0..1) of GOLD must_tcodes that appear verbatim in the ANSWER.',
    '- check_coverage: fraction (0..1) of GOLD must_checks the ANSWER meaningfully covers.',
    '- ethos_violations: list any of ' + JSON.stringify(c.ethos_flags || []) +
      ' that the ANSWER violates (e.g. hardcodes a company code/GL account; confuses ECC vs S/4 against env).',
    '- score: overall 0..1 = 0.5*rootCause(full=1,partial=0.5,miss=0) + 0.25*tcode_recall + 0.25*check_coverage, ' +
      'then subtract 0.1 per ethos_violation (floor 0).',
    '',
    'ENV: ' + JSON.stringify(c.env || {}),
    'GOLD.primary_root_cause: ' + exp.primary_root_cause,
    'GOLD.must_tcodes: ' + JSON.stringify(exp.must_tcodes),
    'GOLD.must_checks: ' + JSON.stringify(exp.must_checks),
    '',
    'ANSWER:',
    answer,
  ].join('\n');
}

function safeParseJson(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('judge 응답에서 JSON 을 찾지 못함: ' + text.slice(0, 200));
  return JSON.parse(m[0]);
}

function median(nums) {
  const a = [...nums].sort((x, y) => x - y);
  if (!a.length) return 0;
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function modeOf(arr, order) {
  const count = {};
  for (const x of arr) count[x] = (count[x] || 0) + 1;
  // 최빈값. 동률이면 order 상 더 보수적인(낮은) 쪽 선택 — 과대평가 방지(ETHOS).
  return [...new Set(arr)].sort((a, b) =>
    (count[b] - count[a]) || (order.indexOf(a) - order.indexOf(b)))[0];
}

// 여러 judge verdict 을 합의로 집계. score 는 구성요소 합의값으로 재계산(평균 금지).
function aggregateVerdicts(verdicts) {
  const rc = modeOf(verdicts.map((v) => v.root_cause_match || 'miss'),
    ['miss', 'partial', 'full']); // 동률 시 보수적
  const tcodeRecall = median(verdicts.map((v) => Number(v.tcode_recall) || 0));
  const checkCov = median(verdicts.map((v) => Number(v.check_coverage) || 0));
  // ethos 위반: 과반 judge 가 든 위반만 채택
  const ethosCount = {};
  for (const v of verdicts) for (const e of v.ethos_violations || []) ethosCount[e] = (ethosCount[e] || 0) + 1;
  const ethos = Object.entries(ethosCount).filter(([, n]) => n * 2 > verdicts.length).map(([e]) => e);
  const rcScore = rc === 'full' ? 1 : rc === 'partial' ? 0.5 : 0;
  const score = Math.max(0, 0.5 * rcScore + 0.25 * tcodeRecall + 0.25 * checkCov - 0.1 * ethos.length);
  return {
    root_cause_match: rc,
    tcode_recall: tcodeRecall,
    check_coverage: checkCov,
    ethos_violations: ethos,
    score,
    judge_votes: verdicts.length,
    score_spread: +(Math.max(...verdicts.map((v) => Number(v.score) || 0))
      - Math.min(...verdicts.map((v) => Number(v.score) || 0))).toFixed(2),
  };
}

function dryRun(cases) {
  const byModule = {};
  for (const c of cases) byModule[c.module] = (byModule[c.module] || 0) + 1;
  const byDiff = {};
  for (const c of cases) byDiff[c.difficulty] = (byDiff[c.difficulty] || 0) + 1;
  console.log('── eval dry-run (API 호출 없음) ──');
  console.log(`대상 case: ${cases.length}건`);
  console.log('모듈 분포:', JSON.stringify(byModule));
  console.log('난이도 분포:', JSON.stringify(byDiff));
  console.log(`provider: ${PROVIDER} (api키=${HAS_API ? 'O' : 'X'}, claude CLI=${HAS_CLI ? 'O' : 'X'})`);
  console.log(`답변 모델: ${MODEL} / 채점 모델: ${JUDGE_MODEL} / judge 표수: ${JUDGE_VOTES}`);
  console.log(`예상 LLM 호출: ${cases.length} 답변 + ${cases.length * JUDGE_VOTES} 채점 = ${cases.length * (1 + JUDGE_VOTES)}`);
  console.log('에이전트 매핑 점검:');
  for (const c of cases) {
    const agent = MODULE_AGENT[c.module];
    const file = resolve(AGENTS_DIR, `${agent}.md`);
    const ok = agent && existsSync(file);
    console.log(`  ${ok ? '✓' : '✗'} ${c.id} → ${agent || '(매핑 없음)'}`);
    if (!ok) process.exitCode = 1;
  }
}

async function liveRun(cases) {
  const results = [];
  for (const c of cases) {
    const agent = MODULE_AGENT[c.module];
    const agentFile = resolve(AGENTS_DIR, `${agent}.md`);
    if (!agent || !existsSync(agentFile)) {
      console.error(`✗ ${c.id}: 에이전트 매핑 실패 (${c.module})`);
      results.push({ id: c.id, module: c.module, error: 'agent-missing' });
      continue;
    }
    const system = stripFrontmatter(readFileSync(agentFile, 'utf8'));
    process.stderr.write(`▶ ${c.id} (${c.module}) … `);
    try {
      // 답변은 1회만 생성(비용↑). 분산의 주범인 judge 만 N회 호출 → 합의 집계.
      const answer = await complete(system, c.prompt, MODEL);
      const verdicts = [];
      for (let i = 0; i < JUDGE_VOTES; i++) {
        try {
          verdicts.push(safeParseJson(
            await complete('You output only JSON.', judgePrompt(c, answer), JUDGE_MODEL)));
        } catch (je) {
          if (verdicts.length === 0 && i === JUDGE_VOTES - 1) throw je; // 전부 실패 시에만 throw
        }
      }
      const v = aggregateVerdicts(verdicts);
      results.push({ id: c.id, module: c.module, difficulty: c.difficulty, ...v });
      process.stderr.write(
        `score=${v.score.toFixed(2)} (${v.root_cause_match}) [${v.judge_votes}표, spread ${v.score_spread}]\n`);
    } catch (e) {
      console.error(`\n✗ ${c.id}: ${e.message}`);
      results.push({ id: c.id, module: c.module, error: e.message });
    }
  }
  return results;
}

function summarize(results) {
  const scored = results.filter((r) => typeof r.score === 'number');
  const n = scored.length;
  const avg = (f) => (n ? scored.reduce((s, r) => s + (r[f] || 0), 0) / n : 0);
  const fullRC = scored.filter((r) => r.root_cause_match === 'full').length;
  const ethos = scored.reduce((s, r) => s + (r.ethos_violations?.length || 0), 0);
  return {
    cases_scored: n,
    cases_errored: results.length - n,
    avg_score: +avg('score').toFixed(3),
    avg_tcode_recall: +avg('tcode_recall').toFixed(3),
    avg_check_coverage: +avg('check_coverage').toFixed(3),
    root_cause_full_rate: n ? +(fullRC / n).toFixed(3) : 0,
    ethos_violations_total: ethos,
    judge_votes: JUDGE_VOTES,
    avg_judge_spread: n ? +avg('score_spread').toFixed(3) : 0,
  };
}

function writeReport(summary, results) {
  if (!existsSync(dirname(REPORT_PATH))) mkdirSync(dirname(REPORT_PATH), { recursive: true });
  const ts = new Date().toISOString();
  const lines = [];
  lines.push(`\n## Run ${ts}`);
  lines.push('');
  lines.push(`- 모델(답변/채점): \`${MODEL}\` / \`${JUDGE_MODEL}\` · judge ${summary.judge_votes}표 합의`);
  lines.push(`- 채점 case: ${summary.cases_scored} / 오류: ${summary.cases_errored}`);
  lines.push(`- **평균 score: ${summary.avg_score}**`);
  lines.push(`- root cause full rate: ${summary.root_cause_full_rate}`);
  lines.push(`- 평균 tcode recall: ${summary.avg_tcode_recall} / check coverage: ${summary.avg_check_coverage}`);
  lines.push(`- ETHOS 위반 합계: ${summary.ethos_violations_total}`);
  lines.push(`- 평균 judge score spread(분산 지표): ${summary.avg_judge_spread} (낮을수록 합의 강함)`);
  lines.push('');
  lines.push('| case | module | score | root_cause | tcode_recall | ethos |');
  lines.push('|---|---|---|---|---|---|');
  for (const r of results) {
    if (typeof r.score === 'number') {
      lines.push(`| ${r.id} | ${r.module} | ${r.score.toFixed(2)} | ${r.root_cause_match} | ${(r.tcode_recall ?? 0).toFixed(2)} | ${(r.ethos_violations?.length || 0)} |`);
    } else {
      lines.push(`| ${r.id} | ${r.module} | — | error | — | ${r.error || ''} |`);
    }
  }
  let header = '';
  if (!existsSync(REPORT_PATH)) {
    header = '# sapstack 진단 품질 eval — REPORT\n\n' +
      '> `scripts/eval-diagnosis.sh` 실행 시 자동 누적. 방법론: [`methodology.md`](methodology.md)\n';
  }
  const prev = existsSync(REPORT_PATH) ? readFileSync(REPORT_PATH, 'utf8') : '';
  writeFileSync(REPORT_PATH, header + prev + lines.join('\n') + '\n');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const gold = loadGold();
  const cases = selectCases(gold, args);

  if (cases.length === 0) {
    console.error('선택된 case 가 없습니다. --case/--module 값을 확인하세요.');
    process.exit(1);
  }

  if (args.dryRun || PROVIDER === 'none') {
    if (!args.dryRun) console.error('ℹ ANTHROPIC_API_KEY 도 claude CLI 도 없음 → dry-run 으로 전환합니다.');
    dryRun(cases);
    return;
  }

  const results = await liveRun(cases);
  const summary = summarize(results);
  console.log('\n── 요약 ──');
  console.log(JSON.stringify(summary, null, 2));
  writeReport(summary, results);
  console.log(`\n📄 REPORT 갱신: docs/eval/REPORT.md`);
}

main().catch((e) => { console.error(e); process.exit(1); });
