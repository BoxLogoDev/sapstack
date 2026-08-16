# sapstack 진단 품질 eval — REPORT

> `scripts/eval-diagnosis.sh` 실행 시 이 파일에 run 결과가 자동 누적됩니다.
> 방법론: [`methodology.md`](methodology.md)

> **현재 public-beta baseline (v2.4.0, judge 3표 합의, 2026-08-10)**: 평균 score **0.510** ·
> T-code recall 0.625 · check coverage 0.541 · root cause full rate 0.156 ·
> **평균 judge spread 0.153**(분산 지표, 낮을수록 합의 강함) · 32/32 채점(오류 0) · ETHOS 위반 0. provider=구독 `claude` CLI(sonnet).
> Release gate: 평균 0.65 · root cause full rate 0.30 · T-code recall 0.75 · check coverage 0.65 · 오류/ETHOS 0.
> **현재 release 차단 상태**이며 machine-readable 결과는 [`latest.json`](latest.json)에 고정한다.
>
> 약점(개선 우선): WM confirmation 0.00 · SAC live connection 0.00 · CPI iFlow 0.00 · BTP destination 0.06 · VF01 0.13 · PP confirmation 0.19.

새 baseline 갱신: `./scripts/eval-diagnosis.sh --all` (구독 CLI, 추가 비용 0. `EVAL_JUDGE_VOTES` 로 표 수 조정).

## Run 2026-06-19T07:39:54.984Z

- 모델(답변/채점): `sonnet` / `sonnet`
- 채점 case: 21 / 오류: 0
- **평균 score: 0.614**
- root cause full rate: 0.238
- 평균 tcode recall: 0.738 / check coverage: 0.65
- ETHOS 위반 합계: 1

| case                                   | module | score | root_cause | tcode_recall | ethos |
| -------------------------------------- | ------ | ----- | ---------- | ------------ | ----- |
| eval-fi-f110-no-payment-method         | FI     | 0.44  | partial    | 0.50         | 0     |
| eval-fi-period-close-open-posting      | FI     | 1.00  | full       | 1.00         | 0     |
| eval-fi-fx-valuation-anomaly           | FI     | 0.69  | partial    | 1.00         | 0     |
| eval-kr-etax-invoice-submission-failed | FI     | 0.44  | partial    | 0.50         | 0     |
| eval-mm-migo-posting-error             | MM     | 0.50  | partial    | 0.50         | 0     |
| eval-mm-miro-tax-code-mismatch         | MM     | 1.00  | full       | 1.00         | 0     |
| eval-mm-mmbe-stock-mismatch            | MM     | 0.69  | partial    | 1.00         | 0     |
| eval-sd-va01-credit-block              | SD     | 0.75  | partial    | 1.00         | 0     |
| eval-sd-pricing-error                  | SD     | 0.75  | full       | 0.50         | 0     |
| eval-sd-vf01-billing-incomplete        | SD     | 0.50  | partial    | 0.00         | 0     |
| eval-pp-mrp-exception                  | PP     | 0.75  | partial    | 1.00         | 0     |
| eval-pp-cogi-auto-gm                   | PP     | 1.00  | full       | 1.00         | 0     |
| eval-co-settlement-error               | CO     | 0.51  | partial    | 0.50         | 0     |
| eval-co-cost-element-missing           | CO     | 0.75  | full       | 0.50         | 0     |
| eval-abap-st22-dump-in-production      | ABAP   | 0.31  | miss       | 1.00         | 0     |
| eval-basis-transport-import-failed     | BASIS  | 0.63  | partial    | 0.50         | 0     |
| eval-basis-authorization-missing       | BASIS  | 0.00  | miss       | 0.00         | 0     |
| eval-tr-bank-statement-mismatch        | TR     | 0.59  | partial    | 1.00         | 1     |
| eval-qm-inspection-lot-stuck           | QM     | 0.35  | miss       | 1.00         | 0     |
| eval-hcm-payroll-error                 | HCM    | 0.63  | partial    | 1.00         | 0     |
| eval-ewm-wave-release-fail             | EWM    | 0.63  | partial    | 1.00         | 0     |

## Run 2026-06-22T12:58:53.762Z

- 모델(답변/채점): `sonnet` / `sonnet` · judge 3표 합의
- 채점 case: 21 / 오류: 0
- **평균 score: 0.585**
- root cause full rate: 0.286
- 평균 tcode recall: 0.738 / check coverage: 0.619
- ETHOS 위반 합계: 1
- 평균 judge score spread(분산 지표): 0.058 (낮을수록 합의 강함)

| case                                   | module | score | root_cause | tcode_recall | ethos |
| -------------------------------------- | ------ | ----- | ---------- | ------------ | ----- |
| eval-fi-f110-no-payment-method         | FI     | 0.88  | full       | 1.00         | 0     |
| eval-fi-period-close-open-posting      | FI     | 1.00  | full       | 1.00         | 0     |
| eval-fi-fx-valuation-anomaly           | FI     | 0.63  | partial    | 1.00         | 0     |
| eval-kr-etax-invoice-submission-failed | FI     | 0.44  | partial    | 0.50         | 0     |
| eval-mm-migo-posting-error             | MM     | 0.50  | partial    | 0.50         | 0     |
| eval-mm-miro-tax-code-mismatch         | MM     | 1.00  | full       | 1.00         | 0     |
| eval-mm-mmbe-stock-mismatch            | MM     | 0.63  | partial    | 1.00         | 0     |
| eval-sd-va01-credit-block              | SD     | 1.00  | full       | 1.00         | 0     |
| eval-sd-pricing-error                  | SD     | 0.50  | partial    | 0.50         | 0     |
| eval-sd-vf01-billing-incomplete        | SD     | 0.50  | partial    | 0.00         | 0     |
| eval-pp-mrp-exception                  | PP     | 0.75  | partial    | 1.00         | 0     |
| eval-pp-cogi-auto-gm                   | PP     | 0.75  | partial    | 1.00         | 0     |
| eval-co-settlement-error               | CO     | 0.25  | miss       | 0.50         | 0     |
| eval-co-cost-element-missing           | CO     | 0.75  | full       | 0.50         | 0     |
| eval-abap-st22-dump-in-production      | ABAP   | 0.38  | miss       | 1.00         | 0     |
| eval-basis-transport-import-failed     | BASIS  | 1.00  | full       | 1.00         | 0     |
| eval-basis-authorization-missing       | BASIS  | 0.50  | partial    | 0.50         | 0     |
| eval-tr-bank-statement-mismatch        | TR     | 0.21  | miss       | 1.00         | 1     |
| eval-qm-inspection-lot-stuck           | QM     | 0.50  | miss       | 1.00         | 0     |
| eval-hcm-payroll-error                 | HCM    | 0.00  | miss       | 0.00         | 0     |
| eval-ewm-wave-release-fail             | EWM    | 0.13  | miss       | 0.50         | 0     |

## Run 2026-08-10T13:12:33.192Z

- 모델(답변/채점): `sonnet` / `sonnet` · judge 3표 합의
- 채점 case: 32 / 오류: 0
- **평균 score: 0.51**
- root cause full rate: 0.156
- 평균 tcode recall: 0.625 / check coverage: 0.541
- ETHOS 위반 합계: 0
- 평균 judge score spread(분산 지표): 0.153 (낮을수록 합의 강함)

| case                                   | module | score | root_cause | tcode_recall | ethos |
| -------------------------------------- | ------ | ----- | ---------- | ------------ | ----- |
| eval-fi-f110-no-payment-method         | FI     | 0.50  | partial    | 0.50         | 0     |
| eval-fi-period-close-open-posting      | FI     | 0.70  | partial    | 1.00         | 0     |
| eval-fi-fx-valuation-anomaly           | FI     | 0.63  | partial    | 1.00         | 0     |
| eval-kr-etax-invoice-submission-failed | FI     | 0.25  | partial    | 0.00         | 0     |
| eval-mm-migo-posting-error             | MM     | 0.50  | partial    | 0.50         | 0     |
| eval-mm-miro-tax-code-mismatch         | MM     | 1.00  | full       | 1.00         | 0     |
| eval-mm-mmbe-stock-mismatch            | MM     | 0.63  | partial    | 1.00         | 0     |
| eval-sd-va01-credit-block              | SD     | 0.63  | partial    | 1.00         | 0     |
| eval-sd-pricing-error                  | SD     | 1.00  | full       | 1.00         | 0     |
| eval-sd-vf01-billing-incomplete        | SD     | 0.13  | miss       | 0.00         | 0     |
| eval-pp-mrp-exception                  | PP     | 0.75  | partial    | 1.00         | 0     |
| eval-pp-cogi-auto-gm                   | PP     | 0.75  | partial    | 1.00         | 0     |
| eval-co-settlement-error               | CO     | 0.63  | partial    | 0.50         | 0     |
| eval-co-cost-element-missing           | CO     | 0.75  | full       | 0.50         | 0     |
| eval-abap-st22-dump-in-production      | ABAP   | 0.38  | miss       | 1.00         | 0     |
| eval-basis-transport-import-failed     | BASIS  | 0.63  | partial    | 0.50         | 0     |
| eval-basis-authorization-missing       | BASIS  | 0.75  | partial    | 1.00         | 0     |
| eval-tr-bank-statement-mismatch        | TR     | 0.65  | partial    | 1.00         | 0     |
| eval-qm-inspection-lot-stuck           | QM     | 0.63  | partial    | 1.00         | 0     |
| eval-hcm-payroll-error                 | HCM    | 0.29  | miss       | 1.00         | 0     |
| eval-ewm-wave-release-fail             | EWM    | 0.38  | partial    | 0.50         | 0     |
| eval-pm-order-settlement-fail          | PM     | 0.44  | miss       | 1.00         | 0     |
| eval-wm-to-confirmation-error          | WM     | 0.00  | miss       | 0.00         | 0     |
| eval-btp-destination-fail              | BTP    | 0.06  | miss       | 0.00         | 0     |
| eval-sac-live-connection-fail          | SAC    | 0.00  | miss       | 0.00         | 0     |
| eval-ibp-pir-not-in-s4-mrp             | IBP    | 0.56  | partial    | 0.50         | 0     |
| eval-ariba-invoice-mismatch            | Ariba  | 0.50  | partial    | 0.50         | 0     |
| eval-ic-cpi-iflow-message-fail         | IC     | 0.00  | miss       | 0.00         | 0     |
| eval-co-copa-variance                  | CO     | 0.44  | partial    | 0.50         | 0     |
| eval-sd-output-not-issued              | SD     | 0.88  | full       | 0.50         | 0     |
| eval-pp-order-confirmation-error       | PP     | 0.19  | miss       | 0.50         | 0     |
| eval-pp-capacity-overload              | PP     | 0.75  | full       | 0.50         | 0     |

## Run 2026-08-16T03:54:32.911Z

- 모델(답변/채점): `sonnet` / `sonnet` · judge 3표 합의
- 채점 case: 15 / 오류: 17
- **평균 score: 0.788**
- root cause full rate: 0.533
- 평균 tcode recall: 0.9 / check coverage: 0.787
- ETHOS 위반 합계: 0
- 평균 judge score spread(분산 지표): 0.067 (낮을수록 합의 강함)

> ⚠ **부분 측정 — 공식 baseline 아님.** 16번째 케이스부터 `claude` CLI 가
> `exit 3221225794`(0xC0000142, DLL 초기화 실패)로 연속 실패해 17건이 미채점됐다.
> 측정 중 다른 무거운 작업(데스크톱 테스트 4,899건)을 병행한 리소스 경합으로 추정한다.
> 채점된 15건(FI/MM/SD/PP/CO/ABAP)은 2026-08-10 baseline 의 동일 15건 평균 **0.615**
> 대비 **0.788** 로 올랐다. 미커밋 상태였던 에이전트 보강과 `run.mjs` 개선
> (Universal Rules 를 system 에 포함 + env 를 user 프롬프트에 주입)의 효과로 보인다.
> 전체 재측정은 **병행 작업이 없는 상태에서** 다시 수행해야 한다.

| case                                   | module | score | root_cause | tcode_recall | ethos                                 |
| -------------------------------------- | ------ | ----- | ---------- | ------------ | ------------------------------------- |
| eval-fi-f110-no-payment-method         | FI     | 0.88  | full       | 1.00         | 0                                     |
| eval-fi-period-close-open-posting      | FI     | 0.75  | partial    | 1.00         | 0                                     |
| eval-fi-fx-valuation-anomaly           | FI     | 0.88  | full       | 1.00         | 0                                     |
| eval-kr-etax-invoice-submission-failed | FI     | 1.00  | full       | 1.00         | 0                                     |
| eval-mm-migo-posting-error             | MM     | 0.50  | partial    | 0.50         | 0                                     |
| eval-mm-miro-tax-code-mismatch         | MM     | 1.00  | full       | 1.00         | 0                                     |
| eval-mm-mmbe-stock-mismatch            | MM     | 0.30  | miss       | 1.00         | 0                                     |
| eval-sd-va01-credit-block              | SD     | 1.00  | full       | 1.00         | 0                                     |
| eval-sd-pricing-error                  | SD     | 1.00  | full       | 1.00         | 0                                     |
| eval-sd-vf01-billing-incomplete        | SD     | 0.75  | partial    | 1.00         | 0                                     |
| eval-pp-mrp-exception                  | PP     | 0.75  | partial    | 1.00         | 0                                     |
| eval-pp-cogi-auto-gm                   | PP     | 1.00  | full       | 1.00         | 0                                     |
| eval-co-settlement-error               | CO     | 0.63  | partial    | 0.50         | 0                                     |
| eval-co-cost-element-missing           | CO     | 0.75  | full       | 0.50         | 0                                     |
| eval-abap-st22-dump-in-production      | ABAP   | 0.65  | partial    | 1.00         | 0                                     |
| eval-basis-transport-import-failed     | BASIS  | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-basis-authorization-missing       | BASIS  | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-tr-bank-statement-mismatch        | TR     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-qm-inspection-lot-stuck           | QM     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-hcm-payroll-error                 | HCM    | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-ewm-wave-release-fail             | EWM    | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-pm-order-settlement-fail          | PM     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-wm-to-confirmation-error          | WM     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-btp-destination-fail              | BTP    | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-sac-live-connection-fail          | SAC    | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-ibp-pir-not-in-s4-mrp             | IBP    | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-ariba-invoice-mismatch            | Ariba  | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-ic-cpi-iflow-message-fail         | IC     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-co-copa-variance                  | CO     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-sd-output-not-issued              | SD     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-pp-order-confirmation-error       | PP     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
| eval-pp-capacity-overload              | PP     | —     | error      | —            | claude CLI 실패(2회): exit 3221225794 |
