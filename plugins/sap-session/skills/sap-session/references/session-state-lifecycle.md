# Session State Lifecycle — 상태 전이 규칙과 재개 규약

Evidence Loop 세션의 **9가지 상태**와 그들 사이의 **합법적인 전이**를
명확히 정의합니다. 이 문서가 없으면 "지금 이 세션이 어느 상태인지"를
두고 AI와 운영자가 혼란스러워집니다.

---

## 📊 상태 다이어그램

```
                      ┌──────────┐
                      │  intake  │  (세션 생성 직후)
                      └────┬─────┘
                           │ add first bundle
                           ▼
                  ┌────────────────┐
         ┌────────│ hypothesizing  │
         │        └────────┬───────┘
         │                 │ AI generates hypotheses
         │                 │  + follow-up request
         │                 ▼
         │        ┌──────────────────┐
         │        │ awaiting_evidence│◀──┐
         │        └────────┬─────────┘   │
         │                 │             │
         │                 │ add evidence│
         │                 ▼             │
         │        ┌────────────────┐     │
         │        │    verifying   │     │
         │        └───┬──────┬─────┘     │
         │            │      │           │
         │  resolved  │      │ needs     │
         │            │      │ next loop │
         │            ▼      └───────────┘
         │       ┌──────────┐
         │       │ resolved │
         │       └────┬─────┘
         │            │
         │            │ reopen
         │            ▼
         └─────▶┌──────────┐
                │ reopened │ ──▶ (re-enter hypothesizing)
                └──────────┘

        (any state) ──▶ [escalated]
        (any state) ──▶ [abandoned]
```

---

## 🏷 상태 정의

| 상태 | 의미 | 누가 전이 트리거 |
|---|---|---|
| `intake` | 세션은 만들어졌지만 아직 증거가 없음 | (자동) 세션 생성 |
| `hypothesizing` | AI가 현재 증거로 가설을 만드는 중 | `/sap-session-next-turn` |
| `awaiting_evidence` | Follow-up 요청이 운영자에게 나간 상태 | (자동) Turn 2 완료 시 |
| `verifying` | AI가 새 Bundle로 가설을 검증하는 중 | `/sap-session-next-turn` (Turn 3→4) |
| `resolved` | Verdict가 confirmed, Fix/Rollback 존재 | (자동) Turn 4에서 확정 시 |
| `escalated` | 인간 전문가에게 인수인계 필요 | AI 또는 운영자 |
| `abandoned` | 운영자가 해결 없이 종료 | 운영자 |
| `reopened` | 닫힌 세션을 다시 연 상태 | 운영자 |
| `handoff_pending` (가상) | 표면 간 이동 중 | 자동, 매우 짧음 |

---

## ⚙️ 합법적 전이표

| from → to | 트리거 | AI가 수행할 작업 |
|---|---|---|
| `intake` → `hypothesizing` | 첫 Bundle 업로드 + next-turn 호출 | (Turn 1 INTAKE 출력) |
| `hypothesizing` → `awaiting_evidence` | Turn 2 완료 | Follow-up Request 생성, `pending_followup_request_id` 설정 |
| `awaiting_evidence` → `verifying` | 새 Bundle + next-turn 호출 | (Turn 3 COLLECT 자동 검증) |
| `verifying` → `resolved` | Verdict.overall_state == resolved | Fix/Rollback 출력, `audit_trail`에 verdict_issued 기록 |
| `verifying` → `hypothesizing` | Verdict.overall_state == needs_next_loop | 새 가설 시드 생성, Turn 2 재진입 |
| `verifying` → `escalated` | Verdict.overall_state == escalated | 외부 전문가 지정 + 세션 요약 |
| `verifying` → `awaiting_evidence` | Verdict.overall_state == insufficient_evidence | 추가 Follow-up Request |
| `resolved` → `reopened` | 운영자 reopen | (사유 기록 필수) |
| `reopened` → `hypothesizing` | 추가 증거 제출 | 기존 가설 유지, 새 증거로 재평가 |
| 모든 상태 → `abandoned` | 운영자 종료 | 기록만 남기고 변경 없음 |
| 모든 상태 → `escalated` | 수동 에스컬레이션 | 대상 전문가 명시 |

**금지된 전이**:
- `resolved → hypothesizing` (직접 불가, 반드시 `reopened` 경유)
- `abandoned → 어떤 상태` (영구 종료)
- `intake → verifying` (Bundle 없이 Verify 불가)

---

## 💾 파일 시스템 레이아웃

```
.sapstack/
├── sessions/
│   ├── sess-20260411-m2p9xt/
│   │   ├── state.yaml                    # 스키마: session-state
│   │   ├── bundles/*.yaml                # 스키마: evidence-bundle
│   │   ├── hypotheses/*.yaml             # 스키마: hypothesis
│   │   ├── requests/*.yaml               # 스키마: followup-request
│   │   ├── verdicts/*.yaml               # 스키마: verdict
│   │   └── files/                        # 실제 바이너리
│   └── sess-20260411-another/
│       └── ...
└── config.yaml                            # 기존 사용자 환경 프로필
```

`state.yaml`은 **세션의 진실의 원천**입니다. 다른 파일은 `state.yaml`에서
참조되는 한 살아있고, 참조되지 않으면 고아(orphan)입니다. 일관성을 깨는
수동 편집은 금지입니다.

---

## 🔄 재개(Resume) 규약

다른 머신에서, 다른 운영자가, 며칠 뒤에 세션을 이어받을 때:

1. **세션 디렉토리 복제**
   - `.sapstack/sessions/sess-*`를 그대로 복사하거나 git 리포지토리로 공유
   - Git 사용 권장 — `audit_trail`이 커밋 히스토리로도 복제됨
2. **재개 명령**
   ```bash
   /sap-session-resume sess-20260411-m2p9xt
   ```
3. **AI의 복원 행위**
   - `state.yaml` 로드
   - 현재 상태에 따라 다음 정당한 턴을 결정
   - `audit_trail`의 마지막 100개 이벤트를 요약하여 운영자에게 컨텍스트 제공
   - `pending_followup_request_id`가 있으면 그 요청부터 운영자에게 재제시
4. **핸드오프 기록**
   - `handoff_history`에 새 운영자 정보 append
   - 이전 운영자의 마지막 메모는 세션에 남아 있어야 함

---

## 🧾 Audit Trail 규칙

`audit_trail`은 **append-only**입니다. 기존 엔트리를 **수정하거나 삭제할 수
없습니다**. 이 규칙은 감사 요구사항이며, 스킬 구현은 이를 강제해야 합니다.

### 자동 기록되어야 하는 이벤트

- `session_created`
- `bundle_added` (bundle_id 포함)
- `hypothesis_proposed` (hypothesis_id 포함)
- `followup_requested` (request_id 포함)
- `evidence_collected` (bundle_id + 이전 followup_request_id)
- `hypothesis_confirmed` / `hypothesis_refuted`
- `verdict_issued` (verdict_id 포함)
- `fix_applied` (운영자의 수동 기록)
- `rollback_applied` (운영자의 수동 기록)
- `escalated` (대상 전문가·사유)
- `closed` / `reopened`
- `handoff` (from/to surface·role)

### 스키마

```yaml
- at: 2026-04-11T09:22:15+09:00
  action: bundle_added
  actor:
    role: operator
    handle: ops-kim
    surface: cli
  ref_id: evb-20260411-a7k3qz
  note: "초기 F110 실행 로그 + LFB1 dump"
```

---

## 🛑 어그레시브 종료(Escalation/Abandon) 가이드

### 언제 escalated로 전환할 것인가

- Turn 2 → Turn 4 루프가 **3회 이상 반복되고도 resolved 상태에 못 도달**
- 새 증거 수집이 운영자 권한 범위를 넘음 (Basis 전용 T-code 필요)
- 가설 신뢰도가 **전부 medium 이하**로 떨어짐
- 운영자가 명시적으로 요청 (`/sap-session-escalate`)

### 에스컬레이션 시 남겨야 할 것

1. 지금까지의 모든 가설과 판정 요약 (Turn별 1줄씩)
2. 현재까지 수집된 증거 목록 (bundle → item 수)
3. 다음 전문가에게 제안하는 **첫 한 가지 확인 사항**
4. 로컬라이제이션 주의사항 (해당 국가의 특수 요구사항)

### 언제 abandoned로 전환할 것인가

- 운영자가 "이 문제는 다른 방식으로 해결됐다"라고 판단
- 증상이 자연 치유됨 (재시도로 해결)
- 오진이었음 (실제 문제가 다른 영역이었음 → 새 세션 생성 권장)

`abandoned`는 **실패의 낙인이 아닙니다**. 조직의 학습 자산으로 남습니다.

---

## 📦 세션 아카이브

`resolved`, `escalated`, `abandoned` 상태의 세션은 **6개월 후 아카이브 권장**:

```
.sapstack/archive/
└── 2026/
    └── Q1/
        ├── sess-20260103-xyz.tar.gz
        └── sess-20260211-abc.tar.gz
```

아카이브된 세션은 `reopened`가 필요하면 압축 해제 후 정상 경로로 복구합니다.
아카이브는 `data/symptom-index.yaml`의 학습 입력으로도 사용됩니다 — 빈번한
패턴을 감지해 symptom 엔트리를 자동 강화할 수 있어요 (Slice 6+에서 고려).

---

## 🧭 빠른 참조: "이 상태에서 뭘 할 수 있지?"

| 현재 상태 | 운영자가 할 수 있는 것 | AI가 할 일 |
|---|---|---|
| `intake` | add-evidence로 첫 Bundle 업로드 | 아직 할 일 없음 |
| `hypothesizing` | (자동 턴, 기다림) | Turn 2 수행 |
| `awaiting_evidence` | 체크 수행 + add-evidence | 기다림 |
| `verifying` | (자동 턴, 기다림) | Turn 4 수행 |
| `resolved` | Fix 실행, apply-fix 기록, close, reopen | 기다림 |
| `escalated` | 전문가 인수인계, reopen | 기다림 |
| `abandoned` | reopen만 가능 | 아무것도 |
| `reopened` | 새 Bundle 추가 | Turn 2 재진입 |
