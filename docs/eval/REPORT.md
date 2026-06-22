# sapstack 진단 품질 eval — REPORT

> `scripts/eval-diagnosis.sh` 실행 시 이 파일에 run 결과가 자동 누적됩니다.
> 방법론: [`methodology.md`](methodology.md)

> **baseline (v2.4.0, judge 3표 합의, 2026-06-22)**: 평균 score **0.585** ·
> T-code recall 0.738 · check coverage 0.619 · root cause full rate 0.286 ·
> **평균 judge spread 0.058**(분산 지표, 낮을수록 합의 강함) · 21/21 채점(오류 0). provider=구독 `claude` CLI(sonnet).
> 단일 judge(2026-06-19, score 0.614) 대비 다수결로 분산 안정화 — 같은 케이스가 run 마다 0.44~0.88 출렁이던 문제 해소.
>
> 약점(개선 우선): hcm-payroll 0.00 · ewm-wave 0.13 · tr-bank 0.21 · co-settlement 0.25 (miss).
> spread 높은 케이스(측정 모호 → gold-set 개선 신호): qm 0.31 · co-cost/basis-transport/tr 0.25.

새 baseline 갱신: `./scripts/eval-diagnosis.sh --all` (구독 CLI, 추가 비용 0. `EVAL_JUDGE_VOTES` 로 표 수 조정).

## Run 2026-06-19T07:39:54.984Z

- 모델(답변/채점): `sonnet` / `sonnet`
- 채점 case: 21 / 오류: 0
- **평균 score: 0.614**
- root cause full rate: 0.238
- 평균 tcode recall: 0.738 / check coverage: 0.65
- ETHOS 위반 합계: 1

| case | module | score | root_cause | tcode_recall | ethos |
|---|---|---|---|---|---|
| eval-fi-f110-no-payment-method | FI | 0.44 | partial | 0.50 | 0 |
| eval-fi-period-close-open-posting | FI | 1.00 | full | 1.00 | 0 |
| eval-fi-fx-valuation-anomaly | FI | 0.69 | partial | 1.00 | 0 |
| eval-kr-etax-invoice-submission-failed | FI | 0.44 | partial | 0.50 | 0 |
| eval-mm-migo-posting-error | MM | 0.50 | partial | 0.50 | 0 |
| eval-mm-miro-tax-code-mismatch | MM | 1.00 | full | 1.00 | 0 |
| eval-mm-mmbe-stock-mismatch | MM | 0.69 | partial | 1.00 | 0 |
| eval-sd-va01-credit-block | SD | 0.75 | partial | 1.00 | 0 |
| eval-sd-pricing-error | SD | 0.75 | full | 0.50 | 0 |
| eval-sd-vf01-billing-incomplete | SD | 0.50 | partial | 0.00 | 0 |
| eval-pp-mrp-exception | PP | 0.75 | partial | 1.00 | 0 |
| eval-pp-cogi-auto-gm | PP | 1.00 | full | 1.00 | 0 |
| eval-co-settlement-error | CO | 0.51 | partial | 0.50 | 0 |
| eval-co-cost-element-missing | CO | 0.75 | full | 0.50 | 0 |
| eval-abap-st22-dump-in-production | ABAP | 0.31 | miss | 1.00 | 0 |
| eval-basis-transport-import-failed | BASIS | 0.63 | partial | 0.50 | 0 |
| eval-basis-authorization-missing | BASIS | 0.00 | miss | 0.00 | 0 |
| eval-tr-bank-statement-mismatch | TR | 0.59 | partial | 1.00 | 1 |
| eval-qm-inspection-lot-stuck | QM | 0.35 | miss | 1.00 | 0 |
| eval-hcm-payroll-error | HCM | 0.63 | partial | 1.00 | 0 |
| eval-ewm-wave-release-fail | EWM | 0.63 | partial | 1.00 | 0 |

## Run 2026-06-22T12:58:53.762Z

- 모델(답변/채점): `sonnet` / `sonnet` · judge 3표 합의
- 채점 case: 21 / 오류: 0
- **평균 score: 0.585**
- root cause full rate: 0.286
- 평균 tcode recall: 0.738 / check coverage: 0.619
- ETHOS 위반 합계: 1
- 평균 judge score spread(분산 지표): 0.058 (낮을수록 합의 강함)

| case | module | score | root_cause | tcode_recall | ethos |
|---|---|---|---|---|---|
| eval-fi-f110-no-payment-method | FI | 0.88 | full | 1.00 | 0 |
| eval-fi-period-close-open-posting | FI | 1.00 | full | 1.00 | 0 |
| eval-fi-fx-valuation-anomaly | FI | 0.63 | partial | 1.00 | 0 |
| eval-kr-etax-invoice-submission-failed | FI | 0.44 | partial | 0.50 | 0 |
| eval-mm-migo-posting-error | MM | 0.50 | partial | 0.50 | 0 |
| eval-mm-miro-tax-code-mismatch | MM | 1.00 | full | 1.00 | 0 |
| eval-mm-mmbe-stock-mismatch | MM | 0.63 | partial | 1.00 | 0 |
| eval-sd-va01-credit-block | SD | 1.00 | full | 1.00 | 0 |
| eval-sd-pricing-error | SD | 0.50 | partial | 0.50 | 0 |
| eval-sd-vf01-billing-incomplete | SD | 0.50 | partial | 0.00 | 0 |
| eval-pp-mrp-exception | PP | 0.75 | partial | 1.00 | 0 |
| eval-pp-cogi-auto-gm | PP | 0.75 | partial | 1.00 | 0 |
| eval-co-settlement-error | CO | 0.25 | miss | 0.50 | 0 |
| eval-co-cost-element-missing | CO | 0.75 | full | 0.50 | 0 |
| eval-abap-st22-dump-in-production | ABAP | 0.38 | miss | 1.00 | 0 |
| eval-basis-transport-import-failed | BASIS | 1.00 | full | 1.00 | 0 |
| eval-basis-authorization-missing | BASIS | 0.50 | partial | 0.50 | 0 |
| eval-tr-bank-statement-mismatch | TR | 0.21 | miss | 1.00 | 1 |
| eval-qm-inspection-lot-stuck | QM | 0.50 | miss | 1.00 | 0 |
| eval-hcm-payroll-error | HCM | 0.00 | miss | 0.00 | 0 |
| eval-ewm-wave-release-fail | EWM | 0.13 | miss | 0.50 | 0 |
