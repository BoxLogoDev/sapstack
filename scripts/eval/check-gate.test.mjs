import assert from 'node:assert/strict';
import test from 'node:test';
import { qualityGateFailures } from './check-gate.mjs';

test('quality gate passes only complete public-beta evidence', () => {
  // 2026-08-16 재설정된 회귀 방지선(58건 실측 기반) 기준.
  // 현재 baseline(avg 0.638 · full_rate 0.345 · recall 0.742 · coverage 0.621)은 통과한다.
  assert.deepEqual(qualityGateFailures({
    avg_score: 0.638,
    root_cause_full_rate: 0.345,
    avg_tcode_recall: 0.742,
    avg_check_coverage: 0.621,
    cases_errored: 0,
    ethos_violations_total: 0,
  }), []);

  // 직전 32건 baseline(2026-08-10)은 재설정된 방지선으로도 여전히 미달 —
  // 방지선이 회귀를 실제로 잡는다는 증거로 남긴다.
  assert.deepEqual(qualityGateFailures({
    avg_score: 0.51,
    root_cause_full_rate: 0.156,
    avg_tcode_recall: 0.625,
    avg_check_coverage: 0.541,
    cases_errored: 0,
    ethos_violations_total: 0,
  }), [
    'avg_score: 0.51 < 0.62',
    'root_cause_full_rate: 0.156 < 0.3',
    'avg_tcode_recall: 0.625 < 0.72',
    'avg_check_coverage: 0.541 < 0.6',
  ]);

  // 채점 오류나 ETHOS 위반은 수치가 좋아도 차단한다.
  assert.deepEqual(qualityGateFailures({
    avg_score: 0.9,
    root_cause_full_rate: 0.9,
    avg_tcode_recall: 0.9,
    avg_check_coverage: 0.9,
    cases_errored: 1,
    ethos_violations_total: 0,
  }), ['cases_errored: 1 > 0']);
});
