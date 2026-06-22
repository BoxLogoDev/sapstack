# sapstack 진단 품질 eval — 방법론

> "112개 노트 보유"를 **"진단 정확도 X%"** 로 바꾸는 측정 기반.
> gstack 의 qa/canary/devex-boomerang 규율을 SAP 진단 도메인으로 번역한 것.
> 갭 분석 [`gstack-gap-analysis.md`](../gstack-gap-analysis.md) G4 구현.

## 왜 필요한가

sapstack 은 정적 게이트 14종으로 *형식*(링크·frontmatter·T-code 오탈자·하드코딩)을
검증해 왔지만, **진단이 실제로 맞는지**는 측정하지 못했다. ETHOS 원칙
①Ground-truth over plausibility, ②Evidence over confidence 를 *측정 가능*하게
만드는 것이 이 하니스의 목적이다.

## 구성

| 파일 | 역할 |
|---|---|
| [`../../data/eval/gold-set.yaml`](../../data/eval/gold-set.yaml) | 정답셋. symptom-index 참조 + 채점용 expected |
| [`../../schemas/eval-gold-set.schema.yaml`](../../schemas/eval-gold-set.schema.yaml) | gold-set 구조 계약 |
| [`../../scripts/check-eval-goldset.sh`](../../scripts/check-eval-goldset.sh) | **무료 게이트** — 참조 무결성(CI 편입) |
| [`../../scripts/eval-diagnosis.sh`](../../scripts/eval-diagnosis.sh) | 오케스트레이터 |
| [`../../scripts/eval/run.mjs`](../../scripts/eval/run.mjs) | LLM-judge 러너 |
| `REPORT.md` | 실행 결과 누적 |

## 비용 경계 (로컬 전용) — 3단계

- **무료/CI**: `check-eval-goldset.sh` — LLM 호출 0. 참조 무결성 회귀를 CI 에서 차단.
- **추가비용 0/로컬**: `eval-diagnosis.sh` 가 **구독 `claude` CLI 를 백엔드로** 사용(provider `claude-cli`).
  별도 API 키 불필요 — 이미 가진 Claude Code 플랜 사용량으로 채점. **OSS 사용자 기본 경로.**
- **유료/로컬(선택)**: `ANTHROPIC_API_KEY` 가 있으면 Anthropic REST API 직접 호출(provider `api`).

Provider 자동 선택: `ANTHROPIC_API_KEY` 있으면 `api`, 없고 `claude` CLI 있으면 `claude-cli`,
둘 다 없으면 dry-run. `EVAL_PROVIDER=claude-cli|api` 로 강제 가능.

> 설계 결정: 비용 드는 부분(LLM-judge)과 안 드는 부분(정합성)을 분리 → 회귀는 막되 CI 비용 0.
> + 구독 CLI 백엔드로 **유료 API 없이도** baseline 측정 가능.

## 채점 모델

각 case 는 **모듈에 해당하는 실제 에이전트(`agents/*.md`) 본문을 system 프롬프트로** 사용해
답변을 생성한다(운영 동작 충실 재현). 그 답변을 judge 모델이 `expected` 대비 채점:

| 지표 | 정의 |
|---|---|
| `root_cause_match` | GOLD primary_root_cause 를 맞혔는가 — full / partial / miss |
| `tcode_recall` | GOLD must_tcodes 중 답변에 등장한 비율 (0..1) |
| `check_coverage` | GOLD must_checks 중 답변이 다룬 비율 (0..1) |
| `ethos_violations` | case 의 `ethos_flags` 위반(하드코딩·ECC/S4 혼동 등) |

**종합 score** = `0.5 × rootCause(full=1/partial=0.5/miss=0) + 0.25 × tcode_recall + 0.25 × check_coverage`
− `0.1 × ethos_violation 수` (최저 0).

## judge 다수결 (분산 감소)

LLM-judge 는 같은 답변을 run 마다 다르게 채점하는 분산이 있다(초기 baseline 에서 F110 이
0.44~0.88 출렁임). 이를 줄이기 위해 **답변은 1회만 생성하고 judge 만 N회 호출해 합의**한다
(`EVAL_JUDGE_VOTES`, 기본 3). 분산의 주범은 judge 쪽이고 답변 생성이 비싸므로 비용 대비 효과가 크다.

합의 집계는 **score 를 평균내지 않는다**(공식과 어긋남). 구성요소별로:
- `root_cause_match`: 최빈값(mode). 동률이면 **보수적(낮은)** 쪽 — 과대평가 방지(ETHOS).
- `tcode_recall` · `check_coverage`: 중앙값(median).
- `ethos_violations`: **과반** judge 가 든 위반만 채택.
- 그 뒤 동일 공식으로 score 재계산.

`score_spread`(judge 들의 최고−최저 score)를 함께 기록한다. **spread 가 큰 케이스는
"측정이 모호한 케이스"** — gold-set 기준이 애매하거나 답변이 경계선이라는 신호이며 gold-set
개선 우선순위를 알려준다.

## ground-truth 출처

`expected.primary_root_cause` 는 `symptom-index.yaml` 의 `typical_causes` 첫 항목
("제일 흔함")에서 파생한다. **추측 정답을 새로 만들지 않는다** (ETHOS ①). 증상 본문도
복제하지 않고 `symptom_ref` 로 참조한다(단일출처).

## 한계 (정직하게)

- **LLM-judge 의 분산**: judge 자체가 모델이라 ±변동이 있다. **다수결(3표)로 크게 완화**
  (avg spread 0.058)했으나 0 은 아니다. 추세(여러 run)로 해석하고 단일 run 절대값을 과신하지 않는다.
- **샘플 편향**: 현재 21건은 대표 모듈 커버용 시드. 90개 symptom 전수가 아니다.
  → 확장은 [`../../data/eval/README.md`](../../data/eval/README.md).
- **단일 정답 가정**: 실무 진단은 다중 원인이 흔하다. gold 는 *가장 흔한* 1차 원인만 본다.
  부분 일치(partial)로 다중 원인 답변을 일부 인정한다.
- **실 시스템 미연결**: 라이브 SAP 에 붙지 않으므로 "이론적 정확도"다.

## 실행

```bash
# 1. 무료 — 참조 무결성 (CI 에서도 자동)
./scripts/check-eval-goldset.sh --strict

# 2. 계획만 (LLM 불필요)
./scripts/eval-diagnosis.sh --dry-run

# 3a. 실제 채점 — 구독 claude CLI (추가 비용 0, 권장. judge 기본 3표 합의)
./scripts/eval-diagnosis.sh --module FI          # FI 만
./scripts/eval-diagnosis.sh --all                # 전체 baseline
EVAL_JUDGE_VOTES=1 ./scripts/eval-diagnosis.sh --all   # 빠르게(단일 judge, 분산 큼)

# 3b. (선택) 유료 API 키로 채점
export ANTHROPIC_API_KEY=sk-...
EVAL_PROVIDER=api ./scripts/eval-diagnosis.sh --all
```
