# Turn Formats — 네 개 턴 타입의 입출력 규약

이 문서는 Evidence Loop의 각 턴 타입에서 **입력·AI 행동·출력**을 정확하게
정의합니다. SKILL.md의 "Turn-aware 응답 포맷" 섹션을 구체화한 보충 문서입니다.

---

## Turn 1 — INTAKE

### 입력
- 운영자/엔드유저의 자유 텍스트 증상 설명
- 선택적: 초기 Evidence Bundle 1개 (스크린샷, 메시지, 간단 로그)
- 선택적: sap_context 힌트 (릴리스, 클라이언트, 국가)

### AI 행동
1. **증상 파싱**
   - `data/symptom-index.yaml`과 fuzzy 매칭 (있으면)
   - 매칭된 엔트리의 `first_check_tcodes`와 `evidence_needed`를 내부적으로 로드
2. **sap_context 보완 질문**
   - `release`, `deployment`, `client`, `country_iso`가 비어있으면 최소한 질문
   - Universal Rule #2 (환경 먼저 묻기) 준수
3. **초기 Bundle이 있으면 검증**
   - 스키마에 맞는지, 파일 해시가 계산 가능한지
   - 민감 필드(SY-UNAME, STCD1 등) redaction 체크
4. **세션 상태 초기화**
   - `session-state.yaml` 생성
   - `status: intake → hypothesizing`

### 출력
```markdown
## 🎯 Session Started: {session_id}

**초기 증상**: {description}
**매칭 symptom**: {symptom-index entry or "no match"}
**환경**: {sap_context summary}

### 📋 확인된 증거
- evi-001: {kind} from {source} — {one-line summary}
- ...

### ❓ 확인 필요
- {필요한 sap_context 필드 질문들}

### ⏭ 다음 단계
`/sap-session-next-turn {session_id}` 를 실행하면 Hypothesis 턴으로 진행합니다.
```

### 금지 사항
- Turn 1에서 절대 **Fix 제안 금지**. 증거가 너무 부족함.
- Hypothesis도 아직 제안 금지. Turn 2의 몫.
- "Issue → Root Cause → Fix" 형식의 기존 Standard Response를 쓰지 말 것.

---

## Turn 2 — HYPOTHESIS

### 입력
- 현재까지의 모든 Evidence Bundle
- 이전 턴의 세션 상태
- (재진입 시) 직전 Turn 4의 Verdict에서 "새 가설이 필요하다"는 신호

### AI 행동
1. **증거 종합**
   - 모든 bundle items를 훑어 `technical_chain`에 쓸 수 있는 인과 조각 수집
2. **가설 생성 (2-4개)**
   - 각 가설은 `hypothesis.schema.yaml` 필수 필드 충족
   - **confidence 분포 제약**: 전부 0.9 이상이면 운영자가 의심 — 다양성 필수
   - 가장 높은 가설도 0.95를 넘지 말 것 (증거 부족 상태의 겸손)
3. **각 가설에 반증 조건 부여**
   - `falsification_evidence`는 최소 2개 이상
   - "관찰 불가능한" 반증 조건 금지 (예: "사용자 의도와 다름")
4. **해당 모듈 컨설턴트 에이전트 마킹**
   - `consultant_agents_to_involve`에 추가
   - 병렬 호출 계획 수립 (이 시점에는 실제 호출 선택적 — Turn 4에 호출해도 됨)
5. **Follow-up Request 생성**
   - 가설마다 최소 1개의 check로 커버
   - 체크 총 개수는 8개를 넘지 않도록 (운영자 피로)
   - 각 체크에 `estimated_minutes`, `priority`, `output_format` 필수
6. **세션 상태 전이**
   - `hypothesizing → awaiting_evidence`
   - `pending_followup_request_id` 설정

### 출력
```markdown
## 🧩 Turn 2 — Hypothesis

### 📦 증거 요약
- Bundle 1 ({collected_at}): {item kinds and counts}
- ...

### 💡 가설 {N}개

#### H1 — {statement} [신뢰도: high 0.75]
- **기술적 체인**: A → B → C
- **근거 증거**: evi-001 (LFB1 dump에서 ZWELS 공란 확인)
- **반증 조건**:
  - `LFB1.ZWELS = 'T'` → 기각
  - 다른 벤더도 같은 에러 → 약화
- **관련 T-code**: F110, XK03, FBZP
- **관련 모듈**: FI, TR
- **소환 에이전트**: sap-fi-consultant

#### H2 — ... [신뢰도: medium 0.45]
...

#### H3 — ... [신뢰도: low 0.20]
...

### ✅ 다음 확인 요청 (Follow-up Request flr-{id})
**예상 소요**: 약 {N}분 · **체크 {M}개**

| # | Priority | Purpose | Action | Est. | Format |
|---|---|---|---|---|---|
| chk-001 | critical | H1 검증 — ZWELS 값 확인 | SE16N LFB1 LIFNR=100234 | 3분 | CSV |
| chk-002 | high | H2 검증 — FBZP 뱅크 매핑 | 스크린샷 FBZP → Bank Det. | 5분 | PNG |
| ... | | | | | |

### ⏭ 다음 단계
운영자는 위 체크를 수행한 뒤
`/sap-session-add-evidence {session_id} <파일들>` 로 Bundle 업로드 →
`/sap-session-next-turn {session_id}` 로 Verify 진행.
```

### 품질 기준
- 가설 3개 중 최소 1개는 **"컨트롤 가설"**로 설정 (예: "일시적 네트워크 문제 — 재시도로 해결")
  → 운영자에게 "굳이 깊이 파기 전 단순 재시도로 끝날 수도 있다"는 대안 제시
- 반증 조건은 항상 **같은 Follow-up Request에서 관찰 가능**해야 함
  → Turn 3 이후 Turn 4에서 실제로 가설을 판정할 수 있어야 함

---

## Turn 3 — COLLECT

### 입력
- 운영자가 제출하는 새 Evidence Bundle (1개 이상)

### AI 행동
**AI는 Turn 3에 말하지 않습니다.** 운영자의 액션 턴입니다.

단, 다음은 자동 수행:
1. **Bundle 검증**
   - 스키마 준수 여부
   - 기대한 체크(`chk-*`)의 증거가 포함되어 있는지 매핑
   - 누락된 critical check가 있으면 운영자에게 경고
2. **세션 상태 기록**
   - `bundle_ids`에 추가
   - `audit_trail`에 `evidence_collected` 이벤트 기록
3. **자동 전이 결정**
   - 모든 critical check가 수집되면 `status: awaiting_evidence → verifying`
   - 일부 누락이면 `status`는 그대로, 경고만 출력

### 출력
```markdown
## 📥 Evidence Collected — Bundle evb-{id}

- evi-001: {kind} ({size}) ✓ 스키마 준수
- evi-002: {kind} ✓
- ...

### 📊 Follow-up Request 매핑
| Check | Status | Matched Item |
|---|---|---|
| chk-001 (critical) | ✅ received | evi-001 |
| chk-002 (high) | ✅ received | evi-002 |
| chk-003 (medium) | ⚠️  missing | — |

### ⏭ 다음 단계
critical·high priority 체크가 모두 수집되었습니다.
`/sap-session-next-turn {session_id}` 로 Verify 턴 실행.
```

---

## Turn 4 — VERIFY

### 입력
- 최신 Evidence Bundle (Turn 3에서 추가된 것)
- 열린 hypotheses (status: proposed)
- 직전 Follow-up Request

### AI 행동
1. **가설 단위 판정**
   - 각 `hypothesis.falsification_evidence`를 순회
   - 해당 "if_observed" 조건이 새 bundle에서 관찰되는지 평가
   - `confirmed | refuted | partial | inconclusive` 결정
2. **컨설턴트 에이전트 소환 (여기서 병렬)**
   - 확정 가설의 `consultant_agents_to_involve` 각각 병렬 호출
   - 각 에이전트는 자기 모듈 관점에서 Fix 단계를 제시
   - 에이전트 결과는 `verdict.resolutions[].fix_plan`으로 통합
3. **Fix Plan 작성**
   - 확정된 가설에만 작성
   - Universal Rule #5 (시뮬레이션 먼저), #4 (Transport), #7 (T-code+메뉴)
   - `audience` 필드로 누가 실행할지 명시
4. **Rollback Plan 작성 — 필수**
   - `fix_plan`과 1:1로 존재해야 함
   - `trigger_conditions` 최소 1개 (언제 롤백할지)
5. **로컬라이제이션 sign-off**
   - `country_iso`가 있으면 해당 국가 컨설턴트의 sign-off 필드 추가
6. **전체 상태 결정**
   - 모든 가설이 refuted이면 `overall_state: needs_next_loop` → Turn 2 재진입
   - 1개 이상 confirmed이면 `resolved`
   - 증거 부족이면 `insufficient_evidence`

### 출력
```markdown
## ⚖️ Turn 4 — Verdict vdc-{id}

**전체 판정**: {resolved | needs_next_loop | escalated | insufficient_evidence}

### 가설별 판정

#### H1 — {statement}
**상태**: ✅ **confirmed** (evi-003의 LFB1.ZWELS 공란 관찰)

##### 🛠 Fix Plan
대상: operator · Transport 필요: no · 리뷰어 필수: yes · 예상 소요: 5분

1. XK02 실행 (메뉴: Accounting → Financial accounting → Accounts payable → Master records → Change)
2. 벤더 100234 → 회사코드 1000 → Payment transactions
3. ZWELS 필드에 'T' 입력 → Save
4. 시뮬레이션 먼저: ✓ 불필요 (설정 변경 아님)

##### ↩️ Rollback Plan
**롤백 트리거 조건**:
- F110 재실행 시 새로운 에러 발생
- 벤더 100234 원천세 계산 오류
- 쓰기 범위: 60분 내

1. XK02 → 벤더 100234 → ZWELS 공란으로 되돌리기 → Save

##### 🛡 Prevention
- 벤더 마스터 생성 시 ZWELS 필수 validation (OMSG)
- 주 1회 LFB1 ZWELS 공란 모니터링

##### 🌐 Localization Sign-off
- 🇰🇷 KR: sap-fi-consultant — signed off ("한국 이체는 'T' 적절")

#### H2 — {statement}
**상태**: ❌ **refuted** (FBZP 스크린샷에서 뱅크 매핑 정상 확인)

#### H3 — {statement}
**상태**: ⏸ **inconclusive** (일시적 네트워크 가설은 평가 불가)

### ⏭ 다음 단계
resolved 상태. 운영자는 Fix Plan을 실행하고
`/sap-session-apply-fix {session_id} h-001` 로 적용 기록.
실패하면 자동으로 Rollback Plan이 제시됩니다.
```

### 금지 사항
- `fix_plan` 없는 `confirmed` 상태 금지 (스키마 레벨에서 거부됨)
- `rollback_plan` 없는 `fix_plan` 금지
- `menu_path` 없는 T-code 단독 표기 금지 (Universal Rule #7)

---

## 공통: 재진입 (Turn 2 ↔ Turn 4 루프)

verdict가 `needs_next_loop`이면 즉시 Turn 2로 돌아가서 **새 가설**을
제안합니다. 이때:

- 기각된 가설은 `status: refuted`로 남겨둡니다 (감사 추적)
- 새 가설의 `parent_hypothesis_id`로 기각된 가설을 가리킬 수 있음
- 운영자의 피로도 관리: 루프가 3회를 넘으면 자동으로 `escalated` 제안
- `turn_number`는 계속 증가 (리셋 안 함)

## 공통: 에스컬레이션

AI가 가설을 세울 수 없거나, 증거가 반복적으로 부족하면
`overall_state: escalated`로 전환하고:

1. 지금까지의 세션 상태를 요약
2. 어느 인간 전문가에게 넘겨야 할지 제안 (Basis · 벤더 컨설턴트 · 감사)
3. 세션은 닫지 않음 — 전문가가 이어받아 `reopened`로 재개 가능
