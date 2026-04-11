# Escalation Flow — 세 표면 간 세션 이동 규약

**문서 상태**: design document (v1.5.0)
**작성일**: 2026-04-12
**범위**: Surface A(운영자 CLI) · Surface B(운영자 IDE) · Surface C(엔드유저 Web) 간 세션 핸드오프

---

## 🎯 에스컬레이션이 필요한 이유

sapstack은 단일 사용자·단일 표면에서 작동하지 않습니다. 하나의 이슈는 보통
여러 사람을 거칩니다:

1. **엔드유저**가 처음 증상을 발견 (SAP 화면에 빨간 메시지)
2. 셀프 트리아지로 해결 시도 → 실패
3. **운영자**가 이어받아 깊은 진단 수행
4. 필요 시 **전문 컨설턴트**에게 넘겨 cross-module 분석
5. 해결 후 **감사 기록**으로 보존

이 흐름에서 **세션이 끊기면 맥락이 전부 사라집니다**. 엔드유저가 설명한
초기 증상, 지금까지 확인한 것, 시도한 가설이 사라지면 운영자는 처음부터
다시 시작해야 해요. 에스컬레이션 플로우는 이 비용을 0으로 만드는
설계입니다.

---

## 🌐 세 표면의 역할

| Surface | 대상 | 도구 | 역할 |
|---|---|---|---|
| **A — CLI** | 운영자 | Claude Code `/sap-session-*` 커맨드 | 진단의 주 엔진 |
| **B — IDE** | 운영자 | VS Code Extension (v1.6+ 실장 예정) | Bundle 드래그앤드롭·세션 트리 뷰 |
| **C — Web** | 엔드유저 | `web/triage.html` + `web/session.html` | 셀프 트리아지 + 읽기 전용 뷰어 |

세 표면은 **같은 세션 디렉토리**를 공유합니다. `state.yaml`이 진실의
원천이며, 어느 표면에서든 읽고 쓸 수 있어야 합니다.

---

## 🔄 전형적인 에스컬레이션 시나리오 6종

### 시나리오 1 — Web → CLI (엔드유저 초기 신고)

가장 흔한 경로. 엔드유저가 화면에서 문제를 만나고, Surface C의 triage로
스스로 해결 시도 → 실패 → 운영자에게 인계.

```
[1] 엔드유저 @ web/triage.html
    ├─ 증상 입력 + country/lang 선택
    ├─ 증상 인덱스 매칭 결과 확인
    └─ "운영자 에스컬레이션" 버튼 클릭
        → Markdown 페이로드 자동 생성
        → 클립보드 복사 or .md 파일 다운로드

[2] 엔드유저 → 운영자 전달
    ├─ 이메일/Slack/Teams 등 사내 커뮤니케이션
    └─ 내용: Markdown 페이로드 (증상·매칭·권장 CLI 커맨드)

[3] 운영자 @ Claude Code CLI
    ├─ 페이로드에서 /sap-session-start 커맨드 추출
    ├─ 실행 → 새 세션 생성 (originating_surface: cli)
    ├─ state.yaml의 handoff_history에 수동 엔트리 추가:
    │   { from_surface: web_triage, to_surface: cli,
    │     from_role: end_user, to_role: operator,
    │     reason: "initial report escalation" }
    └─ Turn 1 INTAKE 수행

[4] (선택) 운영자 → Web 역방향 공유
    ├─ 운영자가 state.yaml을 엔드유저에게 전달
    └─ 엔드유저는 web/session.html에서 읽기 전용으로 진행 상황 확인
```

**키 포인트**:
- 페이로드에는 `originating_surface: web_triage`가 명시되어 감사 추적
- 매칭된 symptom-index 엔트리 ID가 포함되어 운영자가 바로 관련 T-code 파악
- 엔드유저의 **원문**이 첫 `initial_symptom.description`에 그대로 보존

---

### 시나리오 2 — CLI → CLI (운영자 간 인수인계)

24/7 운영에서는 교대 시간에 세션이 다른 운영자에게 넘어갑니다.

```
[1] 오전 운영자 A @ Claude Code CLI
    └─ 세션 sess-20260412-m2p9xt 진행 중 (awaiting_evidence 상태)
    
[2] A → B 인수인계
    ├─ 세션 디렉토리 통째로 git commit → push
    ├─ B에게 session_id 전달
    └─ A의 마지막 메모는 state.yaml의 notes에 기록

[3] 오후 운영자 B @ Claude Code CLI
    ├─ git pull로 세션 디렉토리 동기화
    ├─ /sap-session-resume sess-20260412-m2p9xt
    ├─ AI가 audit_trail 마지막 100개 이벤트 요약 제시
    ├─ pending_followup_request_id 확인
    └─ 이어서 체크 수행 후 /sap-session-add-evidence
```

**키 포인트**:
- Git이 없는 환경에선 `.sapstack/sessions/{id}`를 zip으로 압축해 전달
- B는 반드시 `state.handoff_history`에 자신의 인수인계를 기록
- Bundle 파일의 해시가 유효한지 자동 검증

---

### 시나리오 3 — CLI → Consultant (외부 전문가 위임)

운영자가 원인을 좁혔지만 모듈 전문가의 판단이 필요한 경우.

```
[1] 운영자 @ CLI
    ├─ 3번 루프 후에도 가설이 low confidence만 남음
    └─ /sap-session-escalate sess-... --to sap-fi-consultant --reason "BP 전환 복잡성"

[2] AI (at escalation moment)
    ├─ 현재 세션을 요약 (지금까지 가설 4개, 기각 3개, 확정 0개)
    ├─ 다음 전문가에게 제안하는 첫 확인 사항 작성
    └─ state.status = escalated
        localization_signoffs에 pending 엔트리 추가

[3] 전문가 수동 개입
    ├─ 전문가는 sapstack 사용자가 아닐 수 있음 (외부 컨설턴트)
    ├─ 운영자가 session state YAML을 열어 증거 제시
    └─ 전문가 의견을 state.notes에 append (수동)

[4] 운영자 복귀
    ├─ /sap-session-reopen sess-...
    └─ 전문가 의견을 새 증거로 Bundle 추가 → Turn 2 재진입
```

**키 포인트**:
- 외부 컨설턴트는 **Surface에 속하지 않음** — 사람이 수동으로 중개
- `escalated` 상태는 종료가 아니라 일시 정지
- `localization_signoffs`의 pending 엔트리가 복귀 시점을 추적

---

### 시나리오 4 — CLI → Auditor (감사 추적)

법적/내부 감사가 이슈 해결 과정을 확인해야 할 때.

```
[1] 감사자 @ web/session.html
    ├─ 운영자가 전달한 state.yaml 파일을 드래그앤드롭
    ├─ Timeline·Hypothesis·Verdict·Audit Trail 전체 열람
    └─ 세션 자체는 변경 불가 (read-only viewer)

[2] 감사자가 의문점 제기
    └─ 운영자에게 "이 가설은 왜 기각했나요?" 같은 질문

[3] 운영자 @ CLI
    └─ /sap-session-annotate sess-... --note "감사자 Q&A 응답" (추가 메모)
```

**키 포인트**:
- `audit_trail`은 append-only — 감사자가 볼 때도 보장됨
- `web/session.html`은 **수정 UI를 의도적으로 제공하지 않음**
- 감사자는 sapstack 설치가 필요 없음 — 브라우저만 있으면 됨

---

### 시나리오 5 — Web Triage → Web Triage (엔드유저 간 공유)

드문 경우지만, 엔드유저끼리 "같은 문제가 있는데 어떻게 풀었어?"를 공유.

```
[1] 엔드유저 A가 triage로 증상 입력 → 매칭 결과 확인
    └─ 에스컬레이션 없이 스스로 해결 (예: symptom 힌트로 충분)

[2] 엔드유저 B가 유사 증상 발생
    ├─ A가 URL 파라미터로 증상을 공유할 수 있으면 좋음
    │   예: triage.html?q=F110+payment+method&country=kr
    └─ B는 같은 triage 결과를 즉시 봄
```

**v1.5.0에는 URL 파라미터 공유 미구현**. Slice 6+에서 고려.

---

### 시나리오 6 — CLI → CLI (동일 운영자, 관련 이슈)

같은 운영자가 "이 세션과 비슷한 이슈를 또 만났네" 하는 경우.

```
[1] 운영자가 과거 resolved 세션을 참조
    └─ /sap-session-search "F110 no payment method" --status resolved
        → 과거 sess-20260312-... 발견

[2] 새 세션 시작 시 관련 링크
    └─ /sap-session-start "오늘 또 F110 실패" \
         --related sess-20260312-...
    → state.related_sessions에 기록
```

**이점**: 조직의 장기 학습 — 반복 이슈를 탐지하고, 재발 방지 조치가
효과적이었는지 측정 가능.

---

## 🔐 보안·프라이버시 원칙

### 엔드유저 Surface C의 특수 정책

- **PII 자동 스캔**: 주민번호/카드번호 패턴 감지 시 복사 차단
- **로컬 스토리지 금지**: triage 결과를 브라우저에 저장하지 않음
- **네트워크 경계**: 엔드유저 증상 텍스트를 외부 서버로 전송하지 않음
  (symptom-index는 raw.githubusercontent.com에서 일방향 fetch만)
- **Redaction 기본값**: `collected_by.role: end_user`일 때 추가 마스킹 적용

### 운영자 Surface A/B의 정책

- 운영자는 일반적으로 더 높은 신뢰 — PII 스캔은 경고 수준
- 세션 디렉토리 공유 시 `.sapstack/sessions/{id}/files/` 안의 대용량
  파일이 포함되는지 확인 (용량 민감)
- Transport 번호·회사코드는 중간 민감도 (조직 내 공유 OK, 외부 금지)

### 감사 요구사항

- `audit_trail`은 **절대 삭제/수정 불가**
- `handoff_history`로 모든 surface 이동 추적
- 해시 체인은 아직 미구현 — v2.0+ 고려 (blockchain-style append-only)

---

## 🧭 설계 원칙 요약

1. **세션은 이동 가능해야 한다** — 한 표면에 묶이면 조직적 활용 불가
2. **페이로드는 사람이 읽을 수 있어야 한다** — Markdown이 JSON보다 나음
3. **수동 중개를 허용하라** — 사람 간 인수인계를 자동화하려 하지 말 것
4. **감사 추적은 기본** — 에스컬레이션 자체가 audit 이벤트
5. **Web Surface는 절대 SAP에 연결되지 않는다** — 오직 표시·입력·파일 드롭만

---

## 📂 구현 상태 (v1.5.0)

| 시나리오 | Surface 조합 | 구현 상태 |
|---|---|---|
| #1 Web → CLI 에스컬레이션 | C → A | ✅ 구현 (triage.html + handoff payload) |
| #2 CLI → CLI 인수인계 | A → A | 🟡 부분 (state.yaml 공유는 됨, resume 커맨드는 Slice 5+) |
| #3 CLI → Consultant 위임 | A → 외부 | 🟡 문서만 (실제 커맨드는 Slice 6) |
| #4 CLI → Auditor 읽기 | A → C | ✅ 구현 (session.html 읽기 전용 뷰어) |
| #5 Web → Web 공유 | C → C | ❌ v1.6 예정 |
| #6 관련 세션 링크 | A → A | ❌ v1.6 예정 (/sap-session-search) |

---

## 🧪 검증 케이스 (수동 테스트 체크리스트)

v1.5.0 릴리스 전 최소한의 수동 검증:

- [ ] web/triage.html에서 F110 증상 입력 → 매칭 1건 이상
- [ ] 에스컬레이션 버튼 → 페이로드가 클립보드 복사됨
- [ ] 페이로드에 `/sap-session-start` 커맨드 포함 확인
- [ ] PII 패턴(`123456-1234567`) 입력 → 경고 표시
- [ ] web/session.html에서 DEMO 버튼 → F110 dog-food 전체 타임라인 표시
- [ ] 실제 state.yaml 파일 드래그앤드롭 → 파싱 성공
- [ ] 읽기 전용 확인 — DOM에 수정 UI 없음
- [ ] 모바일 뷰 — 전체 카드가 세로로 쌓임

---

## 📚 참조

- `schemas/session-state.schema.yaml` — `handoff_history` 필드
- `plugins/sap-session/skills/sap-session/references/session-state-lifecycle.md` — 상태 전이
- `web/triage.html` + `web/triage.js` — Surface C 엔트리
- `web/session.html` + `web/session.js` — Surface C 읽기 전용 뷰
- `commands/sap-session-start.md` — Surface A 엔트리
- `aidlc-docs/sapstack/f110-dog-food.md` — 시나리오 #1의 구체 예시
