# Follow-up Authoring — AI가 Follow-up Request를 쓸 때의 품질 기준

이 문서는 **AI가 Turn 2 말미에 Follow-up Request를 작성할 때 지켜야 할
품질 원칙**을 정의합니다. 운영자의 시간을 가장 귀한 자원으로 취급합니다.

---

## 🎯 Follow-up Request의 목적

이건 **AI가 운영자에게 내리는 지시서가 아닙니다**. AI가 "내가 지금 어느
가설을 확정/기각하고 싶은지"를 운영자에게 설명하고, 그걸 위해 필요한
최소한의 증거를 정중하게 요청하는 **협력 요청서**입니다.

따라서 각 체크에는 반드시 **"왜 필요한지(purpose)"**가 적혀 있어야 하고,
그 이유가 운영자에게도 납득이 가야 합니다.

---

## 📏 다섯 가지 품질 기준

### 기준 1: 최소성 (Minimality)

> **목표: 가설 N개를 구별하는 데 딱 필요한 만큼만**

좋은 Follow-up은 체크가 많지 않습니다. 가설이 3개면 체크도 3-6개 범위가
이상적이에요. 체크 8개를 넘으면 스스로 의심해야 합니다 — "내가 전수조사
하고 있지 않나?"

**나쁜 예**: "벤더 마스터의 모든 필드를 다 확인해주세요"
**좋은 예**: "ZWELS와 ZAHLS 두 필드만 확인해주세요 (H1 검증용)"

### 기준 2: 반증 중심성 (Falsification-centric)

> **목표: 각 체크는 어느 가설을 기각하거나 확정할 수 있어야 함**

체크의 `hypothesis_ids`는 빈 배열일 수 없습니다. 어떤 가설과도 연결되지
않는 체크는 **정보 수집을 위한 정보 수집**이고, 시간 낭비입니다.

체크를 쓰기 전에 자문:
- "이 체크의 결과가 어느 가설의 판정에 영향을 주는가?"
- "결과가 무엇이든 가설 판정에 영향이 없으면, 이 체크는 빼야 한다."

### 기준 3: 비용 정직성 (Cost Honesty)

> **목표: 운영자의 시간을 정확히 예측**

`estimated_minutes`는 **숙련된 운영자 기준**으로 작성하세요. 과소 추정하면
운영자가 스트레스를 받고, 과대 추정하면 중요한 체크가 뒤로 밀립니다.

참고 기준값:

| 작업 | 숙련자 평균 시간 |
|---|---|
| SE16N 간단 조회 + 화면 캡처 | 2-3분 |
| SE16N 조회 + CSV 익스포트 | 3-5분 |
| FBZP/SPRO 설정 화면 탐색 + 스크린샷 3장 | 5-10분 |
| ST22 덤프 1건 텍스트 추출 | 2분 |
| SE80 코드 탐색 + 특정 INCLUDE 추출 | 10-15분 |
| F110 실제 재실행 (테스트 Run) | 15-30분 |
| SM50 스냅샷 (순간) | 1분 |

총 `estimated_total_minutes`가 30분을 넘으면 **체크 우선순위를 낮춰 일부만
필수로** 만드세요. 운영자는 다른 업무를 병행하고 있습니다.

### 기준 4: 안전성 (Safety)

> **목표: 프로덕션에 영향 없는 읽기 전용 체크만**

`confirm_destructive: true`는 **절대 사용하지 마세요**. 스키마가 거부합니다.

실수 방지를 위한 자가 점검:

- [ ] 체크가 테이블에 INSERT/UPDATE/DELETE를 유발하는가? → ❌
- [ ] 체크가 Transport 이동을 포함하는가? → ❌
- [ ] 체크가 Job 스케줄을 변경하는가? → ❌
- [ ] 체크가 SM04에서 세션을 강제 종료하는가? → ❌
- [ ] 체크가 Lock Entry를 해제하는가? → ❌ (단순 조회는 OK)

"테스트 Run" (F110의 proposal only, CK40N의 test run)은 허용되지만,
반드시 `description`에 "test/simulation only — no real posting"을 명시하세요.

### 기준 5: 명확성 (Clarity)

> **목표: 운영자가 한 번 읽고 바로 수행할 수 있어야 함**

체크 설명에 "확인해주세요"가 들어가 있으면 이미 애매합니다. 구체적으로:

**나쁜 예**:
```yaml
action:
  type: other
  description: "벤더 100234의 상태를 확인"
```

**좋은 예**:
```yaml
action:
  type: query_table
  tcode: SE16N
  table: LFB1
  parameters:
    LIFNR: "100234"
    BUKRS: "*"
  fields_of_interest: [LIFNR, BUKRS, ZWELS, ZAHLS, AKONT, ERDAT, LOEVM]
description: "LFB1에서 벤더 100234의 모든 회사코드 행을 조회하고 지정 필드만 CSV로 익스포트"
```

---

## 🧪 Follow-up Request 품질 점검 (AI 자가 평가)

Follow-up을 출력하기 전 AI 스스로 다음을 체크합니다:

```
품질 점수 = Σ(체크별 점수) / 체크 수

각 체크:
  +2 : hypothesis_ids가 비어있지 않음 (필수)
  +2 : purpose가 한 문장으로 명확함
  +2 : expected_outcome이 반증 조건과 일치
  +1 : priority와 estimated_minutes가 서로 정합 (priority=critical이면 ≤5분 권장)
  +1 : output_format이 명시됨
  -3 : destructive 동작 의심
  -2 : description이 "확인", "체크" 같은 모호한 동사만 포함
  -1 : hypothesis_ids가 3개 이상 (너무 많은 가설을 한 체크로 커버 — 정보량 부족)
```

점수가 6점 미만인 체크는 다시 쓰세요.

---

## 🌍 로컬라이제이션 주의점

같은 문제라도 국가에 따라 체크 경로가 다릅니다. `sap_context.country_iso`를
항상 참고하세요:

### 🇰🇷 한국
- 지급방법 코드: 'T'(이체), 'C'(수표) — 'S'(SEPA)는 무관
- 은행 키는 IBAN이 아닌 한국 은행 코드 (004, 088, 020, ...)
- 전자세금계산서: EDOC_KR 관련 T-code
- LFBK 대신 LFBK_KR 커스텀 뷰가 있는 회사도 있음

### 🇩🇪 독일
- SEPA 필수 — IBAN/BIC 검증 체크 포함
- DATEV 연동이면 DATEV 포맷 로그도 확인
- USt-VA (부가세 사전신고) 관련 체크 별도

### 🇺🇸 미국
- Payment Method 'W'(Wire), 'A'(ACH)
- 1099 벤더 분류 체크 (Form 1099-MISC/NEC)
- SOX 관련 감사 로그 포함

### 🇯🇵 일본
- 源泉徴収 (원천징수) 설정 체크 경로 다름
- 전자장부보존법 관련 T-code
- 인감 (Hanko) 프로세스 맥락 고려

국가별 특화 체크는 해당 국가 컨설턴트 에이전트를 함께 소환해 검증받는 것이
안전합니다. `data/symptom-index.yaml`의 `localized_checks` 섹션도 참조하세요.

---

## 📝 Follow-up Request 작성 템플릿

AI는 다음 순서로 작성합니다:

1. **Summary** — "왜 이 요청인지" 한 문장
2. **가설-체크 매핑 표** — 각 가설이 어느 체크로 커버되는지
3. **체크 리스트** — 우선순위 내림차순으로 정렬
4. **에스컬레이션 힌트** — 운영자가 할 수 없는 체크가 있으면 누구에게

```yaml
request_id: flr-{date}-{rand}
session_id: sess-{date}-{rand}
turn_number: 2
created_at: {iso}
summary: |
  {왜 이 요청인지 1-3문장}
estimated_total_minutes: {합산}
checks:
  - check_id: chk-001
    purpose: "..."
    hypothesis_ids: [h-001]
    action:
      type: ...
    expected_outcome: "..."
    priority: critical
    estimated_minutes: 3
    output_format: csv_export
  # ... 체크 계속
escalation_hint:
  to_role: basis  # 또는 none
  reason: "SM50 스냅샷은 운영자 권한 없으면 Basis 팀 필요"
```

---

## 🎓 좋은 Follow-up의 세 가지 예

### 예 1 — 마스터 데이터 가설

**상황**: F110 Proposal 실패, H1(LFB1.ZWELS 공란) 의심

```yaml
- check_id: chk-001
  purpose: "H1 핵심 검증 — 벤더 100234의 지급방법 필드 값"
  hypothesis_ids: [h-001]
  action:
    type: query_table
    tcode: SE16N
    table: LFB1
    parameters: { LIFNR: "100234" }
    fields_of_interest: [LIFNR, BUKRS, ZWELS, ZAHLS]
  expected_outcome: "ZWELS가 공란이면 H1 확정. 'T' 등 값이 있으면 H1 기각."
  priority: critical
  estimated_minutes: 3
  output_format: csv_export
```

### 예 2 — 설정 가설 (스크린샷)

```yaml
- check_id: chk-002
  purpose: "H2 검증 — FBZP Bank Determination에 해당 지급방법이 매핑되어 있는가"
  hypothesis_ids: [h-002]
  action:
    type: capture_screenshot
    tcode: FBZP
    description: "FBZP → Bank determination → Ranking order + Accounts 두 화면 캡처 (회사코드 1000)"
  expected_outcome: "'T' 지급방법이 Ranking order에 없거나 Accounts에 House Bank 매핑이 없으면 H2 확정"
  priority: high
  estimated_minutes: 7
  output_format: screenshot_png
```

### 예 3 — 덤프 가설

```yaml
- check_id: chk-003
  purpose: "H3 검증 — ST22에 F110 관련 ABAP 덤프 여부"
  hypothesis_ids: [h-003]
  action:
    type: read_dump
    tcode: ST22
    description: "지난 24시간 내 'F110' 또는 'SAPLFPAYH' 포함 덤프 검색"
  expected_outcome: "덤프가 있으면 H3 확정 + 덤프 텍스트를 inline으로 첨부"
  priority: medium
  estimated_minutes: 4
  output_format: text_paste
```

---

## 🚫 안티 패턴

| 안티 패턴 | 문제 |
|---|---|
| 체크 15개 일괄 요청 | 운영자 피로 · 우선순위 불명 |
| "전체 설정을 덤프해주세요" | 가설 없는 전수조사 |
| "음... 한번 돌려봐주시겠어요" | 운영자 부담 떠넘기기 |
| destructive: true | 스키마 거부 · 원칙 위반 |
| hypothesis_ids 비어있음 | 정보 수집을 위한 정보 수집 |
| estimated_minutes 모든 체크에 동일 | 정직하지 않음 |
| 여러 가설을 한 체크로 커버 (ids 4개+) | 구별력 부족 |
| 한국어 환경에 SEPA IBAN 체크 요청 | 컨텍스트 무시 |
