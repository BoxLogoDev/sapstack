---
name: sap-session
description: |
  Evidence Loop — SAP 운영 진단을 라이브 접근 없이 "확인→수정→재확인" 루프로 수행.
  18개 sapstack 모듈과 15개 컨설턴트 에이전트를 오케스트레이션하는 상위 스킬.
  Turn-aware 응답 포맷 (Hypothesis → Follow-up → Verify → Fix + Rollback).
  v1.6.0: PM/QM/WM/EWM 모듈 + sap-tutor/hcm/tr/pm/qm/ewm 에이전트 라우팅 추가.
version: 0.1.0
stage: experimental
language: [ko, en]
---

# sap-session — Evidence Loop Orchestrator

## 🎯 이 스킬의 존재 이유

대기업 SAP 환경에서는 **라이브 시스템 접근이 금지**됩니다. 그래서 AI는
실행기가 될 수 없고, 조언자에 머물 수밖에 없습니다. 이 제약을 **제거하는
대신 수용**하면서도 "조언봇"을 넘어서는 방법이 Evidence Loop입니다:

- **운영자가 실행기 역할**을 맡아 SAP에서 증거를 가져오고,
- **AI는 각 턴마다 가설·요청·검증·판정**을 담당하며,
- **세션 상태는 파일에 저장**되어 중단·재개·인수인계가 가능합니다.

즉, Human-in-the-loop 비동기 루프입니다. 각 턴 사이에 몇 분·몇 시간·며칠이
걸려도 좋고, 다른 운영자가 이어받아도 맥락이 유지됩니다.

## 🔁 네 개의 턴

```
┌── Turn 1 · INTAKE ───────────────────────────────────┐
│ 운영자/엔드유저가 초기 증상 + 최소 증거를 업로드       │
│ 산출: Evidence Bundle 1개                            │
│ 세션 상태: intake → hypothesizing                    │
└──────────────────────────────────────────────────────┘
                          ↓
┌── Turn 2 · HYPOTHESIS ───────────────────────────────┐
│ AI가 2~4개 가설 + 각 가설의 반증 조건 + Follow-up    │
│ Request(운영자가 다음 수집할 체크리스트) 생성         │
│ 산출: hypotheses[] + followup_request 1개            │
│ 세션 상태: hypothesizing → awaiting_evidence         │
└──────────────────────────────────────────────────────┘
                          ↓
┌── Turn 3 · COLLECT ──────────────────────────────────┐
│ 운영자가 Follow-up Request의 체크리스트를 SAP에서     │
│ 실행하여 새 Evidence Bundle 업로드                    │
│ 산출: Evidence Bundle 1개 추가                        │
│ 세션 상태: awaiting_evidence → verifying             │
└──────────────────────────────────────────────────────┘
                          ↓
┌── Turn 4 · VERIFY ───────────────────────────────────┐
│ AI가 새 증거로 가설을 확정/기각. 확정 시 Fix + 필수    │
│ Rollback 플랜. 기각 시 새 가설 → Turn 2 재진입.      │
│ 산출: verdict 1개                                    │
│ 세션 상태: verifying → (resolved | hypothesizing)     │
└──────────────────────────────────────────────────────┘
```

세부 포맷과 예시는 `references/turn-formats.md`에 있습니다.

## 📦 데이터 모델

모든 턴의 입출력은 `schemas/` 아래 5개 YAML JSON Schema로 정의됩니다:

| 스키마 | 언제 생성되는가 | 어디에 저장되는가 |
|---|---|---|
| `evidence-bundle.schema.yaml` | Turn 1, Turn 3 | `.sapstack/sessions/{id}/bundles/evb-*.yaml` |
| `hypothesis.schema.yaml` | Turn 2 | `.sapstack/sessions/{id}/hypotheses/h-*.yaml` |
| `followup-request.schema.yaml` | Turn 2 | `.sapstack/sessions/{id}/requests/flr-*.yaml` |
| `verdict.schema.yaml` | Turn 4 | `.sapstack/sessions/{id}/verdicts/vdc-*.yaml` |
| `session-state.schema.yaml` | 매 턴 업데이트 | `.sapstack/sessions/{id}/state.yaml` |

스키마는 이 스킬의 계약(contract)이며, 모든 다른 파일(커맨드·에이전트·
웹 포털·MCP 서버)이 동일한 모양을 참조합니다.

## 🧭 AI 행동 규약

### Universal Rules (저장소 CLAUDE.md에서 상속)

1. 회사코드·G/L 계정·원가센터·조직단위를 하드코딩 금지
2. 환경 컨텍스트(ECC/S4, on-prem/cloud, 업종)를 먼저 질문
3. ECC와 S/4HANA 동작 차이가 있으면 항상 구분
4. 모든 설정 변경은 Transport 요청
5. 프로덕션 변경 전 시뮬레이션/테스트 필수
6. SE16N으로 프로덕션 데이터 편집 제안 금지
7. 모든 액션에 T-code와 메뉴 경로 둘 다 제공

### Session-specific Rules (이 스킬 한정)

8. **Falsifiability**: 각 가설은 반드시 `falsification_evidence`를 포함.
   "기각될 수 없는 가설"은 제안 불가.
9. **Rollback-or-no-Fix**: `verdict.resolutions[].fix_plan`이 존재하면
   같은 resolution에 반드시 `rollback_plan`이 있어야 함.
10. **Cost-aware checks**: Follow-up Request의 각 체크는 `estimated_minutes`와
    `priority` 필수. 운영자 시간을 가시화.
11. **Read-only bias**: `confirm_destructive: true`인 체크는 스키마가 거부.
    모든 요청은 read-only가 기본.
12. **Audit trail**: 모든 상태 변화는 `session.audit_trail`에 append-only 기록.
    삭제·수정 금지.
13. **Localization routing**: `sap_context.country_iso`가 있으면 해당 국가
    컨설턴트를 자동으로 `consultant_agents_to_involve`에 포함.

## 🧰 기존 자산 오케스트레이션

이 스킬은 **새 에이전트를 만들지 않습니다**. 대신 기존 9개 컨설턴트
에이전트를 hypothesis별로 호출합니다:

| 가설의 impacted_modules | 호출할 에이전트 |
|---|---|
| FI | `sap-fi-consultant` |
| CO | `sap-co-consultant` |
| MM | `sap-mm-consultant` |
| SD | `sap-sd-consultant` |
| PP | `sap-pp-consultant` |
| PM | `sap-pm-consultant` |
| QM | `sap-qm-consultant` |
| WM/EWM | `sap-ewm-consultant` |
| HCM | `sap-hcm-consultant` |
| TR | `sap-tr-consultant` |
| Cloud PE | `sap-cloud-consultant` |
| ABAP | `sap-abap-developer` |
| BASIS | `sap-basis-consultant` |
| S4MIG | `sap-s4-migration-advisor` |
| 통합/CPI/IDoc | `sap-integration-advisor` |
| 신입 교육 | `sap-tutor` |

여러 모듈이 관련되면 **병렬 호출**하고, 각 에이전트의 Verdict를 종합해
최종 `verdict.resolutions[]`를 구성합니다. (Cross-module review 패턴)

## 🖥 Surfaces (세 가지 접근 경로)

| Surface | 누가 | 무엇을 |
|---|---|---|
| **A — Operator CLI** | 운영자 | Claude Code에서 `/sap-session-*` 커맨드로 풀 Evidence Loop 진행 |
| **B — Operator IDE** | 운영자 | VS Code extension 사이드바에서 세션 관리·Bundle 드래그앤드롭 (v1.6.0 실장) |
| **C — End User Web** | 엔드유저 | 정적 웹 포털에서 증상 붙여넣기 → 1차 진단 → 필요시 Surface A로 에스컬레이션 |

세션은 `handoff_history`를 통해 세 표면 사이를 자유롭게 이동합니다.
엔드유저가 웹에서 시작한 세션을 운영자가 CLI로 이어받는 것이 대표 시나리오입니다.

## 📝 Turn-aware 응답 포맷

Evidence Loop 모드에서는 기존 Standard Response Format
(Issue → Root Cause → Check → Fix → Prevention → Note) 대신
Turn-aware 포맷을 사용합니다:

- **Turn 1 (Intake)**: `초기 증상 요약 + 매칭된 symptom-index + sap_context 질문`
- **Turn 2 (Hypothesis)**: `현재 증거 요약 + 2-4개 가설 카드 + follow-up 체크리스트`
- **Turn 3 (Collect)**: (AI는 말하지 않음. 운영자 액션 턴.)
- **Turn 4 (Verify)**: `가설별 판정 + 확정 가설의 Fix/Rollback/Prevention`

단순 질의(예: "FB01이 뭔가요?")는 기존 Standard Response Format을 유지합니다.
**CLAUDE.md 옵션 B(병행 모드)** 참조.

## 🚀 Quick Start

```bash
# 새 세션 시작 (Surface A — CLI)
/sap-session-start "F110 Proposal 실패 — 벤더 100234"

# 초기 Bundle 업로드
/sap-session-add-evidence sess-20260411-m2p9xt ./f110-log.txt ./lfb1-dump.csv

# 다음 턴 실행 (AI가 Hypothesis turn 수행)
/sap-session-next-turn sess-20260411-m2p9xt

# 운영자가 SAP에서 후속 증거 수집 후 다시 add-evidence
/sap-session-add-evidence sess-20260411-m2p9xt ./vendor-bank-info.csv

# Verify 턴
/sap-session-next-turn sess-20260411-m2p9xt

# 다른 surface로 넘기기
/sap-session-handoff sess-20260411-m2p9xt --to web_triage --reason "end-user 재연 확인 필요"
```

## 📚 참조

- `references/turn-formats.md` — 각 턴의 상세 입출력 포맷과 예시
- `references/evidence-bundle-guide.md` — 운영자가 Bundle을 준비할 때 주의점
- `references/followup-authoring.md` — AI가 Follow-up을 작성할 때 품질 기준
- `references/session-state-lifecycle.md` — 세션 상태 전이와 재개 규약
- `references/korean-field-language.md` — 한국 SAP 현장체 작성 규약 (Slice 8)
- `../../../schemas/` — 5개 JSON Schema (계약 정의)
- `../../../data/synonyms.yaml` — 58 용어 + 10 약어 + 15 업무 시점 동의어 사전
- `../../../CLAUDE.md` — Universal Rules (#8 현장체 원칙 포함) + 응답 포맷

## ⚠️ 명시적 비목표

- **라이브 SAP 연결 안 함**. RFC·OData·Fiori 직접 호출 없음.
- **프로덕션 데이터 편집 지시 안 함**. 모든 Fix는 운영자가 수동 실행.
- **자동 Transport 이동 안 함**. Transport는 언제나 사람의 승인.
- **엔드유저 CLI 사용 강제 안 함**. Surface C(웹)가 엔드유저의 기본 경로.

## 🧪 성숙도

**v0.1.0 — experimental**.
첫 dog-food 케이스는 `/sap-session` Slice 2에서 F110 지급실행 실패 시나리오로
검증합니다. 실제 케이스 3건 이상 통과 후 stage를 `stable`로 승격합니다.
