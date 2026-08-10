import assert from 'node:assert/strict';
import test from 'node:test';
import { qualityGateFailures } from './check-gate.mjs';

test('quality gate passes only complete public-beta evidence', () => {
  assert.deepEqual(qualityGateFailures({
    avg_score: 0.65,
    root_cause_full_rate: 0.30,
    avg_tcode_recall: 0.75,
    avg_check_coverage: 0.65,
    cases_errored: 0,
    ethos_violations_total: 0,
  }), []);

  assert.deepEqual(qualityGateFailures({
    avg_score: 0.51,
    root_cause_full_rate: 0.156,
    avg_tcode_recall: 0.625,
    avg_check_coverage: 0.541,
    cases_errored: 0,
    ethos_violations_total: 0,
  }), [
    'avg_score: 0.51 < 0.65',
    'root_cause_full_rate: 0.156 < 0.3',
    'avg_tcode_recall: 0.625 < 0.75',
    'avg_check_coverage: 0.541 < 0.65',
  ]);
});
