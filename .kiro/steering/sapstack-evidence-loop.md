---
inclusion: fileMatch
fileMatchPattern: ".sapstack/sessions/**/*.{yaml,yml}"
---

# sapstack Evidence Loop — Turn-aware 모드

이 steering은 **`.sapstack/sessions/` 아래 YAML 파일을 편집할 때만** Kiro에
주입됩니다. 일반 개발 중에는 토큰 컨텍스트를 절약하기 위해 비활성.

활성화되면 Kiro는 "조언봇" 모드에서 **"Turn-aware 진단 파트너"** 모드로
전환됩니다.

## 원본 Evidence Loop 규약 (실시간 참조)

#[[file:plugins/sap-session/skills/sap-session/SKILL.md]]

## 원본 턴 포맷

#[[file:plugins/sap-session/skills/sap-session/references/turn-formats.md]]

## 원본 Follow-up 작성 기준

#[[file:plugins/sap-session/skills/sap-session/references/followup-authoring.md]]

## 이 steering이 주입되면 Kiro가 다음을 수행합니다

### 4턴 구조 인식
현재 편집 중인 파일이 어느 턴 상태인지 state.yaml의 `status`에서 읽어
적절한 포맷 적용:

| `state.status` | 활성 턴 | Kiro 행동 |
|---|---|---|
| `intake` | Turn 1 | 증상·환경 확인, Bundle 검증, 가설 제안 **금지** |
| `hypothesizing` | Turn 2 | 2-4개 가설 + 반증 조건 + Follow-up Request 생성 |
| `awaiting_evidence` | Turn 3 | 운영자 액션 턴, AI는 말하지 않음 |
| `verifying` | Turn 4 | 가설 판정 + Fix + **필수 Rollback** |
| `resolved` | - | 이미 완료 — reopen 필요 시 안내 |

### 강제 규칙
- **Falsifiability**: 모든 새 hypothesis에 `falsification_evidence` 최소 2개
- **Rollback-or-no-Fix**: confirmed 가설의 fix_plan에는 반드시 rollback_plan 페어
- **Read-only bias**: follow-up Request 체크는 언제나 read-only (스키마 `confirm_destructive: true` 금지)
- **Audit trail append-only**: 기존 엔트리 수정 금지

### Kiro Spec과의 매핑
Kiro에서 spec을 만들다가 SAP 관련 섹션이 나오면 Evidence Loop와 다음처럼 대응:

| Kiro Spec | Evidence Loop |
|---|---|
| `requirements.md` (EARS) | `initial_symptom` + Turn 1 INTAKE |
| `design.md` | `hypotheses[]` + `technical_chain` |
| `tasks.md` | `followup_requests[].checks` |
| 구현 단계 | Turn 3 COLLECT (운영자 수행) |
| 검증 | Turn 4 VERIFY + verdict + fix/rollback |

**Design-First 워크플로우** 선택을 권장 — sapstack의 "가설 다수 제안 → 증거로
검증" 방식과 가장 잘 맞습니다.

### EARS ↔ Falsification 변환
Kiro의 EARS 규칙 `WHEN [condition] THE SYSTEM SHALL [behavior]`는 Evidence
Loop의 falsification 조건과 거의 1:1 대응:

```
WHEN LFB1.ZWELS = 'T'
THE SYSTEM SHALL refute hypothesis h-001
```

↔

```yaml
hypothesis_id: h-001
falsification_evidence:
  - if_observed: "LFB1.ZWELS = 'T'"
    then: refute
```

## MCP 툴 사용 (sapstack-mcp에 연결된 경우)

이 steering이 활성화된 상태에서는 아래 MCP 툴을 적극 활용:

- `resolve_symptom` — 현재 세션의 initial_symptom을 매칭
- `list_sessions` — 관련 세션 탐색 (같은 증상·같은 운영자)
- `check_tcode` — Follow-up Request의 T-code 검증
- `resolve_sap_note` — SAP Note 인용 검증 (추정 금지 Universal Rule #7 준수)

쓰기 툴 (`start_session`, `add_evidence`, `next_turn`)은 v1.6.0 예정. v1.5.0
에서는 Claude Code CLI의 `/sap-session-*` 커맨드와 병행 사용.

## 관련 파일

- `plugins/sap-session/skills/sap-session/SKILL.md`
- `plugins/sap-session/skills/sap-session/references/turn-formats.md`
- `plugins/sap-session/skills/sap-session/references/session-state-lifecycle.md`
- `schemas/session-state.schema.yaml`
- `schemas/hypothesis.schema.yaml`
- `schemas/verdict.schema.yaml`
- `aidlc-docs/sapstack/f110-dog-food.md` — 전체 시나리오 예시
