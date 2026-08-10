import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export const DEFAULT_THRESHOLDS = {
  avg_score: 0.65,
  root_cause_full_rate: 0.30,
  avg_tcode_recall: 0.75,
  avg_check_coverage: 0.65,
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
