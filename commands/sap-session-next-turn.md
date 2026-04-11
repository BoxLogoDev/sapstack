---
description: |
  Evidence Loop 세션의 다음 AI 턴을 실행합니다. 현재 상태에 따라 Turn 2(Hypothesis)
  또는 Turn 4(Verify)를 자동 선택합니다. 9개 SAP 컨설턴트 에이전트 오케스트레이션.
argument-hint: "<session_id> [--force-hypothesize] [--force-verify] [--consultant sap-fi-consultant,...]"
plugin: sap-session
---

# /sap-session-next-turn — 다음 AI 턴 실행

입력: `$ARGUMENTS`

Evidence Loop의 엔진입니다. 세션 상태를 읽고 **다음에 실행해야 할 정당한 턴**
을 자동으로 결정해 수행합니다. 운영자는 "다음 진행"만 요청하면 되고, AI가
Turn 2/4 구분과 출력 포맷 선택을 책임집니다.

## 🧭 턴 결정 로직

```
load state.yaml
switch state.status:
  case intake:
    → Turn 1 마무리 & Turn 2 시작 (Hypothesis)
  case hypothesizing:
    → Turn 2 (Hypothesis) 재실행 불가 — 이미 진행 중
    → 상태 이상이므로 운영자에게 알림
  case awaiting_evidence:
    → 새 Bundle이 없으면 거부
    → Bundle이 있으면 Turn 3 자동 처리 후 Turn 4 (Verify)
  case verifying:
    → Turn 4 (Verify) 실행
  case resolved:
    → 이미 완료 — reopen 권유
  case escalated:
    → 인계된 전문가에게 맡길 것을 상기
  case abandoned:
    → 재개할 수 없음. 새 세션 권유.
  case reopened:
    → Turn 2 재진입 (새 증거 바탕으로)
```

`--force-hypothesize`나 `--force-verify`는 **디버그용**입니다. 일반 운영에서
사용하지 마세요. 무결성이 깨질 수 있습니다.

## 🎛 Turn 2 (Hypothesis) 실행 상세

### 2-1. 증거 종합
- `state.bundles[]` 전부 로드
- 모든 `items[]`를 종류별로 그룹화
- 각 아이템의 `source`, `tags`, `interpretation` 힌트 수집

### 2-2. symptom-index 힌트 적용 (있으면)
- `state.initial_symptom.matched_symptom_index_entry`가 있으면 해당 엔트리의
  `first_check_tcodes`, `typical_causes`, `localized_checks`를 가설 생성의
  시드로 사용

### 2-3. 가설 생성 (2-4개)

`plugins/sap-session/skills/sap-session/references/turn-formats.md`의
Turn 2 섹션 규칙을 정확히 따름:

- 각 가설에 `falsification_evidence` 최소 2개 (필수)
- confidence 분포 다양화 (전부 0.8+ 금지)
- 최고 confidence 0.95 상한
- 최소 1개는 "컨트롤 가설" (재시도로 해결 같은 단순 경로)
- `consultant_agents_to_involve` 필수 지정

### 2-4. 컨설턴트 에이전트 소환 (선택적 — 이 단계에서도 가능)

가설 생성 단계에서 이미 관련 모듈의 컨설턴트를 호출하면 가설 품질이 올라갑니다.
단, 호출은 **병렬**로, 각 에이전트에게 현재 Bundle을 요약해서 전달.

**병렬 호출 파이프라인**:
```
for agent in hypothesis.consultant_agents_to_involve:
    spawn Agent(subagent=agent, context={bundles, symptom, country})
await all
```

소환 결과는 가설의 `technical_chain`을 풍부하게 하는 데 사용. 이 단계에서
에이전트가 "이 가설은 말이 안 된다"고 반론하면 가설 confidence 하향.

### 2-5. Follow-up Request 생성

`plugins/sap-session/skills/sap-session/references/followup-authoring.md`의
5가지 품질 기준(최소성·반증 중심성·비용 정직성·안전성·명확성)을 모두 준수.

### 2-6. 상태 전이
- `hypotheses/h-*.yaml`에 각 가설 저장
- `requests/flr-*.yaml`에 Follow-up Request 저장
- `state.hypotheses[]`, `state.followup_requests[]`에 append
- `turns[]`에 Turn 2 엔트리 (complete) + Turn 3 엔트리 (pending)
- `status: intake → awaiting_evidence` (Turn 2+3를 한 번에 셋업)
- `audit_trail`: `hypothesis_proposed`, `followup_requested`
- `current_turn_number: 3`

### 2-7. 출력

Turn 2 포맷(`turn-formats.md` 참조)을 그대로 따름.

## 🎛 Turn 4 (Verify) 실행 상세

### 4-1. 증거 검증
- 가장 최근 `bundles[-1]` 로드
- `pending_followup_request_id`의 체크와 실제 수집 아이템 매핑 (add-evidence에서
  이미 수행됨)

### 4-2. 가설별 판정

열린 가설(`status: proposed`) 각각에 대해:

1. `falsification_evidence[]` 순회
2. 각 "if_observed" 조건이 새 Bundle에서 실제로 관찰되는지 평가
3. 평가 결과를 `interpretation`으로 기록
4. 판정:
   - 모든 refute 조건 참 → `refuted`
   - 최소 1개 confirm 조건 참 + refute 조건 전부 거짓 → `confirmed`
   - 일부만 참 → `partial`
   - 평가 불가 → `inconclusive`

### 4-3. 컨설턴트 에이전트 병렬 소환 — 확정 가설만

```
for h in hypotheses where status == confirmed:
    for agent in h.consultant_agents_to_involve:
        spawn Agent(agent, context={hypothesis, bundles, sap_context})
await all
collect fix_plans
```

각 에이전트는 자기 모듈 관점에서:
- Fix 단계 (T-code + 메뉴 경로, Universal Rule #7)
- 시뮬레이션 필요 여부 (Rule #5)
- Transport 필요 여부 (Rule #4)
- Rollback 제안 (필수)
- Prevention 아이디어

### 4-4. Cross-module 종합

여러 에이전트의 Fix Plan이 충돌하면 (드물지만):
1. AI가 충돌 지점을 명시
2. 운영자에게 양쪽 옵션 제시
3. 더 보수적인(rollback이 쉬운) 옵션을 기본으로 추천

### 4-5. Rollback Plan 강제

각 `confirmed` 가설의 `verdict.resolutions[i]`에 `rollback_plan`이 없으면
**스키마 검증 실패**. AI는 반드시 채워야 하며, 생각할 수 없으면 해당 가설을
`partial`로 다운그레이드.

### 4-6. Localization Sign-off

`state.sap_context.country_iso`가 있으면 해당 국가 컨설턴트의 sign-off 필드를
`verdict.localization_signoffs[]`에 추가:

```yaml
- country_iso: kr
  role: sap-fi-consultant
  status: signed_off
  notes: "한국 은행 이체 'T' 설정 적절"
```

### 4-7. overall_state 결정

- 1개 이상 confirmed + fix/rollback 완성 → `resolved`
- 전부 refuted → `needs_next_loop` (새 가설 생성 → Turn 2 재진입)
- 증거 부족 → `insufficient_evidence` (추가 Follow-up Request)
- 3회 이상 루프 반복 → `escalated`

### 4-8. 상태 전이
- `verdicts/vdc-*.yaml` 저장
- `state.verdicts[]` append
- `turns[]`에 Turn 4 엔트리
- `status`: `verifying → resolved` (또는 다음 상태)
- `audit_trail`: 가설별 `hypothesis_confirmed`/`hypothesis_refuted`, `verdict_issued`

### 4-9. 출력

Turn 4 포맷 그대로. `resolved` 상태면 Fix + Rollback을 운영자가 바로 실행
가능한 형태로 표시.

## ⚠️ 품질 게이트

다음 조건에서 턴 실행을 거부:

| 조건 | 거부 이유 |
|---|---|
| `status == intake`이고 bundles 비어있음 | 증거 없이 가설 불가 |
| `status == hypothesizing` | 이미 진행 중 — 경쟁 조건 가능 |
| `status == awaiting_evidence`이고 새 Bundle 없음 | Follow-up 응답 필요 |
| `status == resolved` | `/sap-session-reopen` 필요 |
| `state.sap_context` 필수 필드 누락 | Universal Rule #2 위반 |

## 🧪 예시

### 예 1 — 일반 진행
```bash
/sap-session-next-turn sess-20260412-m2p9xt
```
현재 상태에 따라 자동으로 Turn 2 돌릴지 Turn 4 돌릴지 결정.

### 예 2 — 특정 컨설턴트만 소환
```bash
/sap-session-next-turn sess-20260412-m2p9xt \
  --consultant sap-fi-consultant,sap-integration-advisor
```
가설에 관계없이 지정한 에이전트만 호출. 운영자가 "한번 FI 관점만 보고 싶다"는
경우 사용.

### 예 3 — 강제 재가설화
```bash
/sap-session-next-turn sess-20260412-m2p9xt --force-hypothesize
```
디버그용. 현재 상태를 무시하고 Turn 2 강제 실행. `audit_trail`에 경고 기록.

## 📚 참조

- `plugins/sap-session/skills/sap-session/references/turn-formats.md`
- `plugins/sap-session/skills/sap-session/references/followup-authoring.md`
- `plugins/sap-session/skills/sap-session/references/session-state-lifecycle.md`
- `agents/sap-fi-consultant.md` 외 8개 — 소환 대상
- `schemas/hypothesis.schema.yaml`, `verdict.schema.yaml`
