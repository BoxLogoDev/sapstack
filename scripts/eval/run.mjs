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
// 환경변수:
//   ANTHROPIC_API_KEY — 필수 (없으면 --dry-run 만 가능)
//   EVAL_MODEL        — 답변 생성 모델 (기본 claude-sonnet-4-6)
//   EVAL_JUDGE_MODEL  — 채점 모델 (기본 EVAL_MODEL 과 동일)
//
// 사용:
//   node scripts/eval/run.mjs --dry-run
//   node scripts/eval/run.mjs --case eval-fi-f110-no-payment-method
//   node scripts/eval/run.mjs --module FI
//   node scripts/eval/run.mjs --all --limit 5

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
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
};

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = process.env.EVAL_MODEL || 'claude-sonnet-4-6';
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

function dryRun(cases) {
  const byModule = {};
  for (const c of cases) byModule[c.module] = (byModule[c.module] || 0) + 1;
  const byDiff = {};
  for (const c of cases) byDiff[c.difficulty] = (byDiff[c.difficulty] || 0) + 1;
  console.log('── eval dry-run (API 호출 없음) ──');
  console.log(`대상 case: ${cases.length}건`);
  console.log('모듈 분포:', JSON.stringify(byModule));
  console.log('난이도 분포:', JSON.stringify(byDiff));
  console.log(`답변 모델: ${MODEL} / 채점 모델: ${JUDGE_MODEL}`);
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
      const answer = await callAnthropic(system, c.prompt, MODEL);
      const verdictText = await callAnthropic(
        'You output only JSON.', judgePrompt(c, answer), JUDGE_MODEL);
      const v = safeParseJson(verdictText);
      results.push({ id: c.id, module: c.module, difficulty: c.difficulty, ...v });
      process.stderr.write(`score=${(v.score ?? 0).toFixed(2)} (${v.root_cause_match})\n`);
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
  };
}

function writeReport(summary, results) {
  if (!existsSync(dirname(REPORT_PATH))) mkdirSync(dirname(REPORT_PATH), { recursive: true });
  const ts = new Date().toISOString();
  const lines = [];
  lines.push(`\n## Run ${ts}`);
  lines.push('');
  lines.push(`- 모델(답변/채점): \`${MODEL}\` / \`${JUDGE_MODEL}\``);
  lines.push(`- 채점 case: ${summary.cases_scored} / 오류: ${summary.cases_errored}`);
  lines.push(`- **평균 score: ${summary.avg_score}**`);
  lines.push(`- root cause full rate: ${summary.root_cause_full_rate}`);
  lines.push(`- 평균 tcode recall: ${summary.avg_tcode_recall} / check coverage: ${summary.avg_check_coverage}`);
  lines.push(`- ETHOS 위반 합계: ${summary.ethos_violations_total}`);
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

  if (args.dryRun || !process.env.ANTHROPIC_API_KEY) {
    if (!args.dryRun) console.error('ℹ ANTHROPIC_API_KEY 미설정 → dry-run 으로 전환합니다.');
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
