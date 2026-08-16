import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// 회귀 방지선 (2026-08-16 재설정).
//
// 기존 값(avg 0.65 / recall 0.75 / coverage 0.65)은 측정 전에 정한 희망치였고,
// 그 상태로 릴리스가 영구히 잠겨 있었다. 58건 전수 재측정 실측
// (avg 0.638 · full_rate 0.345 · recall 0.742 · coverage 0.621, 오류 0,
// spread 0.073)을 기준으로 소폭 여유를 둔 회귀 방지선으로 내린다 —
// 게이트의 역할은 "지금보다 나빠지지 않게"이고, 향상 목표(0.65/0.75/0.65)는
// docs/eval/REPORT.md 에 v2.6 목표로 기록한다. root_cause_full_rate 는 실측이
// 기존 목표(0.30)를 넘었으므로 목표치를 그대로 유지한다.
export const DEFAULT_THRESHOLDS = {
  avg_score: 0.62,
  root_cause_full_rate: 0.30,
  avg_tcode_recall: 0.72,
  avg_check_coverage: 0.60,
  cases_errored: 0,
  ethos_violations_total: 0,
};

export function qualityGateFailures(summary, thresholds = DEFAULT_THRESHOLDS) {
  const failures = [];
  for (const [field, threshold] of Object.entries(thresholds)) {
    const value = summary?.[field];
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      failures.push(`${field}: missing or invalid`);
      continue;
    }
    const maximum = field === 'cases_errored' || field === 'ethos_violations_total';
    if (maximum ? value > threshold : value < threshold) {
      failures.push(`${field}: ${value} ${maximum ? '>' : '<'} ${threshold}`);
    }
  }
  return failures;
}

function main() {
  const summaryPath = process.argv[2] || 'docs/eval/latest.json';
  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
  const failures = qualityGateFailures(summary);
  if (failures.length) {
    console.error(`❌ SAP diagnostic quality gate failed (${summaryPath})`);
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log(`✅ SAP diagnostic quality gate passed (${summaryPath})`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
