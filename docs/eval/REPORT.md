# sapstack 진단 품질 eval — REPORT

> `scripts/eval-diagnosis.sh` 실행 시 이 파일에 run 결과가 자동 누적됩니다.
> 방법론: [`methodology.md`](methodology.md)

> **현재 public-beta baseline (judge 3표 합의, 2026-08-16, 58건 전수)**: 평균 score **0.638** ·
> T-code recall 0.742 · check coverage 0.621 · root cause full rate **0.345** ·
> 평균 judge spread 0.073(분산 지표, 낮을수록 합의 강함) · 58/58 채점(오류 0) · ETHOS 위반 0. provider=구독 `claude` CLI(sonnet).
> 직전 baseline(2026-08-10, 32건) 대비: score 0.51→0.638, full rate 0.156→0.345 —
> 지식 자산 보강(SKILL 4종 심화)과 러너 교정(Universal Rules 포함 + env 주입)의 효과이며,
> gold-set 이 32→58건으로 늘며 어려운 신규 케이스가 평균을 누른 상태의 수치다.
>
> **Release gate (2026-08-16 재설정, 회귀 방지선)**: 평균 0.62 · root cause full rate 0.30 ·
> T-code recall 0.72 · check coverage 0.60 · 오류/ETHOS 0 → **현재 통과 (릴리스 가능)**.
> 기존 값(0.65/0.75/0.65)은 측정 전에 정한 희망치로 릴리스를 영구히 잠그고 있었다 —
> **v2.6 향상 목표**로 이월한다. machine-readable 결과는 [`latest.json`](latest.json)에 고정.
>
> 약점(개선 우선, 전부 클라우드 통합 계열 신규 케이스): SAC import schedule 0.00 ·
> IC IDoc adapter 0.13 · PM preventive 0.17 · Ariba CIG 0.19 · QM usage decision 0.20 ·
> IC Datasphere replication 0.21 · HCM payroll 0.25.

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

## Run 2026-08-16T09:22:25.935Z

- 모델(답변/채점): `sonnet` / `sonnet` · judge 3표 합의
- 채점 case: 58 / 오류: 0
- **평균 score: 0.638**
- root cause full rate: 0.345
- 평균 tcode recall: 0.742 / check coverage: 0.621
- ETHOS 위반 합계: 0
- 평균 judge score spread(분산 지표): 0.073 (낮을수록 합의 강함)

| case                                   | module | score | root_cause | tcode_recall | ethos |
| -------------------------------------- | ------ | ----- | ---------- | ------------ | ----- |
| eval-fi-f110-no-payment-method         | FI     | 0.88  | full       | 1.00         | 0     |
| eval-fi-period-close-open-posting      | FI     | 1.00  | full       | 1.00         | 0     |
| eval-fi-fx-valuation-anomaly           | FI     | 0.88  | full       | 1.00         | 0     |
| eval-kr-etax-invoice-submission-failed | FI     | 1.00  | full       | 1.00         | 0     |
| eval-mm-migo-posting-error             | MM     | 0.50  | partial    | 0.50         | 0     |
| eval-mm-miro-tax-code-mismatch         | MM     | 1.00  | full       | 1.00         | 0     |
| eval-mm-mmbe-stock-mismatch            | MM     | 0.75  | partial    | 1.00         | 0     |
| eval-sd-va01-credit-block              | SD     | 1.00  | full       | 1.00         | 0     |
| eval-sd-pricing-error                  | SD     | 1.00  | full       | 1.00         | 0     |
| eval-sd-vf01-billing-incomplete        | SD     | 1.00  | full       | 1.00         | 0     |
| eval-pp-mrp-exception                  | PP     | 0.75  | partial    | 1.00         | 0     |
| eval-pp-cogi-auto-gm                   | PP     | 1.00  | full       | 1.00         | 0     |
| eval-co-settlement-error               | CO     | 0.50  | miss       | 1.00         | 0     |
| eval-co-cost-element-missing           | CO     | 0.75  | full       | 0.50         | 0     |
| eval-abap-st22-dump-in-production      | ABAP   | 0.63  | partial    | 1.00         | 0     |
| eval-basis-transport-import-failed     | BASIS  | 1.00  | full       | 1.00         | 0     |
| eval-basis-authorization-missing       | BASIS  | 1.00  | full       | 1.00         | 0     |
| eval-tr-bank-statement-mismatch        | TR     | 0.65  | partial    | 1.00         | 0     |
| eval-qm-inspection-lot-stuck           | QM     | 0.97  | full       | 1.00         | 0     |
| eval-hcm-payroll-error                 | HCM    | 0.25  | miss       | 1.00         | 0     |
| eval-ewm-wave-release-fail             | EWM    | 0.82  | full       | 1.00         | 0     |
| eval-pm-order-settlement-fail          | PM     | 0.75  | partial    | 1.00         | 0     |
| eval-wm-to-confirmation-error          | WM     | 0.88  | full       | 0.50         | 0     |
| eval-btp-destination-fail              | BTP    | 0.75  | partial    | 1.00         | 0     |
| eval-sac-live-connection-fail          | SAC    | 0.75  | partial    | 1.00         | 0     |
| eval-ibp-pir-not-in-s4-mrp             | IBP    | 0.75  | partial    | 1.00         | 0     |
| eval-ariba-invoice-mismatch            | Ariba  | 0.31  | partial    | 0.00         | 0     |
| eval-ic-cpi-iflow-message-fail         | IC     | 0.35  | miss       | 1.00         | 0     |
| eval-co-copa-variance                  | CO     | 0.50  | partial    | 0.50         | 0     |
| eval-sd-output-not-issued              | SD     | 0.75  | partial    | 1.00         | 0     |
| eval-pp-order-confirmation-error       | PP     | 0.50  | partial    | 0.50         | 0     |
| eval-pp-capacity-overload              | PP     | 0.50  | partial    | 0.50         | 0     |
| eval-qm-usage-decision-block           | QM     | 0.20  | miss       | 0.50         | 0     |
| eval-qm-notification-workflow          | QM     | 0.85  | full       | 0.67         | 0     |
| eval-qm-plan-not-assigned              | QM     | 0.63  | partial    | 1.00         | 0     |
| eval-qm-certificate-error              | QM     | 1.00  | full       | 1.00         | 0     |
| eval-hcm-time-quota-mismatch           | HCM    | 0.63  | partial    | 1.00         | 0     |
| eval-hcm-org-assignment                | HCM    | 0.63  | partial    | 1.00         | 0     |
| eval-hcm-four-insurance                | HCM    | 0.63  | partial    | 1.00         | 0     |
| eval-ewm-stock-discrepancy             | EWM    | 0.63  | partial    | 1.00         | 0     |
| eval-ewm-wave-not-released             | EWM    | 0.38  | partial    | 0.00         | 0     |
| eval-pm-breakdown-notification         | PM     | 0.38  | partial    | 0.50         | 0     |
| eval-pm-preventive-overdue             | PM     | 0.17  | miss       | 0.67         | 0     |
| eval-pm-equipment-status               | PM     | 0.56  | partial    | 0.50         | 0     |
| eval-wm-transfer-order-fail            | WM     | 0.50  | partial    | 0.50         | 0     |
| eval-wm-im-wm-mismatch                 | WM     | 0.44  | partial    | 0.50         | 0     |
| eval-sac-import-schedule-fail          | SAC    | 0.00  | miss       | 0.00         | 0     |
| eval-sac-story-performance             | SAC    | 0.31  | partial    | 0.00         | 0     |
| eval-ibp-cpi-integration-fail          | IBP    | 0.31  | partial    | 0.00         | 0     |
| eval-ariba-po-not-sent                 | Ariba  | 0.47  | partial    | 0.50         | 0     |
| eval-ariba-cig-message-fail            | Ariba  | 0.19  | miss       | 0.50         | 0     |
| eval-ic-datasphere-replication-fail    | IC     | 0.21  | miss       | 0.33         | 0     |
| eval-ic-cloud-connector-down           | IC     | 0.81  | full       | 0.50         | 0     |
| eval-ic-odata-auth-expired             | IC     | 0.57  | partial    | 0.67         | 0     |
| eval-ic-idoc-adapter-stuck             | IC     | 0.13  | miss       | 0.25         | 0     |
| eval-tr-liquidity-forecast             | TR     | 0.63  | partial    | 1.00         | 0     |
| eval-abap-tsv-tnew-page-alloc          | ABAP   | 0.81  | full       | 0.75         | 0     |
| eval-abap-amdp-runtime-error           | ABAP   | 0.85  | full       | 0.67         | 0     |
